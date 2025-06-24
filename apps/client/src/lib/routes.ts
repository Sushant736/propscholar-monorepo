import { env } from './env';

export const routes = {
  // Base API URL
  BASE_URL: env.API_BASE_URL,
  
  // Authentication endpoints
  auth: {
    sendOtp: `${env.API_BASE_URL}/auth/send-otp`,
    verifyOtp: `${env.API_BASE_URL}/auth/verify-otp`,
    refreshToken: `${env.API_BASE_URL}/auth/refresh-token`,
    profile: `${env.API_BASE_URL}/auth/profile`,
    logout: `${env.API_BASE_URL}/auth/logout`,
    logoutAll: `${env.API_BASE_URL}/auth/logout-all`,
  },
  
  // User endpoints
  users: {
    signup: `${env.API_BASE_URL}/users/signup`,
    signin: `${env.API_BASE_URL}/users/signin`,
    requestOtp: `${env.API_BASE_URL}/users/request-otp`,
    profile: `${env.API_BASE_URL}/users/profile`,
    updateProfile: `${env.API_BASE_URL}/users/profile`,
    cart: `${env.API_BASE_URL}/users/cart`,
    cartAdd: `${env.API_BASE_URL}/users/cart/add`,
    cartUpdate: `${env.API_BASE_URL}/users/cart/update`,
    cartRemove: `${env.API_BASE_URL}/users/cart/remove`,
    cartClear: `${env.API_BASE_URL}/users/cart/clear`,
  },
  
  // Category endpoints
  categories: {
    getAll: `${env.API_BASE_URL}/categories`,
    getById: (id: string) => `${env.API_BASE_URL}/categories/${id}`,
    create: `${env.API_BASE_URL}/categories`,
    update: (id: string) => `${env.API_BASE_URL}/categories/${id}`,
    toggleActive: (id: string) => `${env.API_BASE_URL}/categories/${id}/toggle-active`,
    delete: (id: string) => `${env.API_BASE_URL}/categories/${id}`,
  },
  
  // Product endpoints
  products: {
    getAll: `${env.API_BASE_URL}/products`,
    getById: (id: string) => `${env.API_BASE_URL}/products/${id}`,
    create: `${env.API_BASE_URL}/products`,
    update: (id: string) => `${env.API_BASE_URL}/products/${id}`,
    toggleActive: (id: string) => `${env.API_BASE_URL}/products/${id}/toggle-active`,
    toggleFeatured: (id: string) => `${env.API_BASE_URL}/products/${id}/toggle-featured`,
    delete: (id: string) => `${env.API_BASE_URL}/products/${id}`,
  },
  
  // Variant endpoints
  variants: {
    getAll: `${env.API_BASE_URL}/variants`,
    getById: (id: string) => `${env.API_BASE_URL}/variants/${id}`,
    create: `${env.API_BASE_URL}/variants`,
    update: (id: string) => `${env.API_BASE_URL}/variants/${id}`,
    toggleActive: (id: string) => `${env.API_BASE_URL}/variants/${id}/toggle-active`,
    updateStock: (id: string) => `${env.API_BASE_URL}/variants/${id}/stock`,
    delete: (id: string) => `${env.API_BASE_URL}/variants/${id}`,
  },
  
  // Order endpoints
  orders: {
    getAll: `${env.API_BASE_URL}/orders`,
    getStats: `${env.API_BASE_URL}/orders/stats`,
    getById: (id: string) => `${env.API_BASE_URL}/orders/${id}`,
    create: `${env.API_BASE_URL}/orders`,
    cancel: (id: string) => `${env.API_BASE_URL}/orders/${id}/cancel`,
    updateStatus: (id: string) => `${env.API_BASE_URL}/orders/${id}/status`,
  },
  
  // Health check
  health: `${env.API_BASE_URL}/health`,
} as const; 