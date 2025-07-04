// Environment configuration
export const env = {
  API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000/api',
} as const;

// Type-safe environment validation
if (typeof window !== 'undefined') {
  if (!env.API_BASE_URL) {
    throw new Error('NEXT_PUBLIC_API_BASE_URL is not configured');
  }
} 