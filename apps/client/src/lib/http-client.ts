import { routes } from './routes';

// Types for API responses
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  requiresSignup?: boolean;
}

export interface ApiErrorData {
  message: string;
  status: number;
  requiresSignup?: boolean;
}

// Token management
class TokenManager {
  private static readonly ACCESS_TOKEN_KEY = 'propscholar_access_token';
  private static readonly REFRESH_TOKEN_KEY = 'propscholar_refresh_token';

  static getAccessToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(this.ACCESS_TOKEN_KEY);
  }

  static getRefreshToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(this.REFRESH_TOKEN_KEY);
  }

  static setTokens(accessToken: string, refreshToken: string): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(this.ACCESS_TOKEN_KEY, accessToken);
    localStorage.setItem(this.REFRESH_TOKEN_KEY, refreshToken);
  }

  static clearTokens(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(this.ACCESS_TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
  }

  static hasValidTokens(): boolean {
    return !!(this.getAccessToken() && this.getRefreshToken());
  }
}

// HTTP Client class
class HttpClient {
  private baseURL: string;
  private isRefreshing = false;
  private refreshPromise: Promise<string> | null = null;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private async refreshToken(): Promise<string> {
    if (this.isRefreshing && this.refreshPromise) {
      return this.refreshPromise;
    }

    this.isRefreshing = true;
    this.refreshPromise = this.performTokenRefresh();

    try {
      const newAccessToken = await this.refreshPromise;
      return newAccessToken;
    } finally {
      this.isRefreshing = false;
      this.refreshPromise = null;
    }
  }

  private async performTokenRefresh(): Promise<string> {
    const refreshToken = TokenManager.getRefreshToken();
    
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await fetch(routes.auth.refreshToken, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refreshToken }),
    });

    if (!response.ok) {
      TokenManager.clearTokens();
      throw new Error('Token refresh failed');
    }

    const data: ApiResponse<{ accessToken: string; refreshToken: string }> = await response.json();
    
    if (!data.success || !data.data) {
      TokenManager.clearTokens();
      throw new Error('Invalid token refresh response');
    }

    TokenManager.setTokens(data.data.accessToken, data.data.refreshToken);
    return data.data.accessToken;
  }

  private async makeRequest<T = any>(
    url: string,
    options: RequestInit = {},
    skipAuth = false
  ): Promise<ApiResponse<T>> {
    // Prepare headers
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    // Add authorization header if not skipping auth
    if (!skipAuth) {
      const accessToken = TokenManager.getAccessToken();
      if (accessToken) {
        headers['Authorization'] = `Bearer ${accessToken}`;
      }
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      // Handle 401 Unauthorized - attempt token refresh
      if (response.status === 401 && !skipAuth && TokenManager.hasValidTokens()) {
        try {
          const newAccessToken = await this.refreshToken();
          
          // Retry the original request with new token
          const retryHeaders = {
            ...headers,
            'Authorization': `Bearer ${newAccessToken}`,
          };

          const retryResponse = await fetch(url, {
            ...options,
            headers: retryHeaders,
          });

          return this.handleResponse<T>(retryResponse);
        } catch (refreshError) {
          // Refresh failed, clear tokens and throw error
          TokenManager.clearTokens();
          console.error('Token refresh failed:', refreshError);
          throw new ApiError({
            message: 'Session expired. Please login again.',
            status: 401,
          });
        }
      }

      return this.handleResponse<T>(response);
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }

      // Network or other errors
      throw new ApiError({
        message: error instanceof Error ? error.message : 'Network error occurred',
        status: 0,
      });
    }
  }

  private async handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
    let data: ApiResponse<T>;

    try {
      data = await response.json();
    } catch {
      throw new ApiError({
        message: 'Invalid response format',
        status: response.status,
      });
    }

    if (!response.ok) {
      throw new ApiError({
        message: data.message || data.error || `HTTP ${response.status}`,
        status: response.status,
        requiresSignup: data.requiresSignup,
      });
    }

    return data;
  }

  // Public HTTP methods
  async get<T = any>(url: string, skipAuth = false): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(url, { method: 'GET' }, skipAuth);
  }

  async post<T = any>(
    url: string,
    body?: any,
    skipAuth = false
  ): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(
      url,
      {
        method: 'POST',
        body: body ? JSON.stringify(body) : undefined,
      },
      skipAuth
    );
  }

  async put<T = any>(
    url: string,
    body?: any,
    skipAuth = false
  ): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(
      url,
      {
        method: 'PUT',
        body: body ? JSON.stringify(body) : undefined,
      },
      skipAuth
    );
  }

  async patch<T = any>(
    url: string,
    body?: any,
    skipAuth = false
  ): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(
      url,
      {
        method: 'PATCH',
        body: body ? JSON.stringify(body) : undefined,
      },
      skipAuth
    );
  }

  async delete<T = any>(url: string, body?: any, skipAuth = false): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(
      url,
      {
        method: 'DELETE',
        body: body ? JSON.stringify(body) : undefined,
      },
      skipAuth
    );
  }
}

// Create and export HTTP client instance
export const httpClient = new HttpClient(routes.BASE_URL);

// Export TokenManager for external use
export { TokenManager };

// Custom error class
export class ApiError extends Error {
  status: number;
  requiresSignup?: boolean;

  constructor({ message, status, requiresSignup }: ApiErrorData) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.requiresSignup = requiresSignup;
  }
} 