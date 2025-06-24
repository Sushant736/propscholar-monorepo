import { httpClient, TokenManager, ApiError } from './http-client';
import { routes } from './routes';

// Types for authentication
export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  isEmailVerified?: boolean;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginResponse {
  user: User;
  tokens: AuthTokens;
}

export interface SendOtpRequest {
  email: string;
}

export interface VerifyOtpRequest {
  email: string;
  otp: string;
  name?: string; // Required for new users
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface LogoutRequest {
  refreshToken: string;
}

// Authentication Service
export class AuthService {
  /**
   * Send OTP to email - Always works regardless of user existence
   * Step 1: User enters email → Frontend calls this
   */
  static async sendOtp(request: SendOtpRequest): Promise<{ message: string }> {
    try {
      const response = await httpClient.post(routes.auth.sendOtp, request, true);
      
      if (!response.success) {
        throw new Error(response.message || 'Failed to send OTP');
      }

      return {
        message: response.message || 'OTP sent successfully',
      };
    } catch (error) {
      if (error instanceof ApiError) {
        throw new Error(error.message);
      }
      throw new Error('Failed to send OTP. Please try again.');
    }
  }

  /**
   * Verify OTP and handle user authentication
   * Step 2a: Existing user → Returns tokens directly
   * Step 2b: New user without name → Returns error with requiresSignup: true
   * Step 3: New user with name → Creates user and returns tokens
   */
  static async verifyOtp(request: VerifyOtpRequest): Promise<LoginResponse> {
    try {
      const response = await httpClient.post(routes.auth.verifyOtp, request, true);
      
      if (!response.success || !response.data) {
        throw new Error(response.message || 'OTP verification failed');
      }

      const { user, accessToken, refreshToken } = response.data;
      
      // Store tokens
      TokenManager.setTokens(accessToken, refreshToken);
      
      return {
        user,
        tokens: { accessToken, refreshToken },
      };
    } catch (error) {
      if (error instanceof ApiError) {
        // Check if this is a new user requiring signup
        if (error.requiresSignup) {
          throw new ApiError({
            message: error.message,
            status: error.status,
            requiresSignup: true,
          });
        }
        throw new Error(error.message);
      }
      throw new Error('OTP verification failed. Please try again.');
    }
  }

  /**
   * Refresh access token using refresh token
   */
  static async refreshToken(): Promise<AuthTokens> {
    const refreshToken = TokenManager.getRefreshToken();
    
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    try {
      const response = await httpClient.post(
        routes.auth.refreshToken,
        { refreshToken },
        true
      );
      
      if (!response.success || !response.data) {
        throw new Error('Token refresh failed');
      }

      const { accessToken, refreshToken: newRefreshToken } = response.data;
      
      // Update stored tokens
      TokenManager.setTokens(accessToken, newRefreshToken);
      
      return {
        accessToken,
        refreshToken: newRefreshToken,
      };
    } catch (error) {
      // Clear tokens on refresh failure
      TokenManager.clearTokens();
      
      if (error instanceof ApiError) {
        throw new Error(error.message);
      }
      throw new Error('Session expired. Please login again.');
    }
  }

  /**
   * Get current user profile (protected route)
   */
  static async getProfile(): Promise<User> {
    try {
      const response = await httpClient.get(routes.auth.profile);
      
      if (!response.success || !response.data) {
        throw new Error('Failed to get user profile');
      }

      return response.data.user;
    } catch (error) {
      if (error instanceof ApiError) {
        throw new Error(error.message);
      }
      throw new Error('Failed to get user profile');
    }
  }

  /**
   * Logout user (protected route)
   */
  static async logout(): Promise<void> {
    const refreshToken = TokenManager.getRefreshToken();
    
    try {
      if (refreshToken) {
        await httpClient.post(routes.auth.logout, { refreshToken });
      }
    } catch (error) {
      // Ignore logout errors, but still clear local tokens
      console.warn('Logout request failed:', error);
    } finally {
      // Always clear local tokens
      TokenManager.clearTokens();
    }
  }

  /**
   * Logout from all devices (protected route)
   */
  static async logoutAll(): Promise<void> {
    try {
      await httpClient.post(routes.auth.logoutAll);
    } catch (error) {
      // Ignore logout errors, but still clear local tokens
      console.warn('Logout all request failed:', error);
    } finally {
      // Always clear local tokens
      TokenManager.clearTokens();
    }
  }

  /**
   * Check if user is currently authenticated
   */
  static isAuthenticated(): boolean {
    return TokenManager.hasValidTokens();
  }

  /**
   * Clear all authentication data
   */
  static clearAuth(): void {
    TokenManager.clearTokens();
  }

  /**
   * Get current access token
   */
  static getAccessToken(): string | null {
    return TokenManager.getAccessToken();
  }

  /**
   * Get current refresh token
   */
  static getRefreshToken(): string | null {
    return TokenManager.getRefreshToken();
  }
}

// Utility functions for form validation
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validateOtp = (otp: string): boolean => {
  return /^\d{6}$/.test(otp);
};

export const validateName = (name: string): boolean => {
  return /^[a-zA-Z\s]{2,50}$/.test(name.trim());
};

// Export error class for external use
export { ApiError }; 