/**
 * API Client - Fetch wrapper with interceptors and error handling
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export interface ApiError {
  message: string;
  status?: number;
  error?: string;
}

export class HttpError extends Error {
  status: number;
  error?: string;

  constructor(message: string, status: number, error?: string) {
    super(message);
    this.status = status;
    this.error = error;
    this.name = 'HttpError';
  }
}

interface RequestConfig extends RequestInit {
  skipAuth?: boolean;
}

/**
 * Token management
 */
let accessToken: string | null = null;
let tokenRefreshCallback: (() => Promise<string | null>) | null = null;

export const setAccessToken = (token: string | null) => {
  accessToken = token;
};

export const getAccessToken = () => accessToken;

export const setTokenRefreshCallback = (callback: () => Promise<string | null>) => {
  tokenRefreshCallback = callback;
};

/**
 * Make an authenticated API request
 */
export async function apiRequest<T>(
  endpoint: string,
  config: RequestConfig = {}
): Promise<T> {
  const { skipAuth = false, ...fetchConfig } = config;

  // Build full URL
  const url = `${API_BASE_URL}${endpoint}`;

  // Set up headers
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...fetchConfig.headers,
  };

  // Add auth token if available and not skipped
  if (!skipAuth && accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  // Make request with credentials to include cookies (for refresh token)
  const response = await fetch(url, {
    ...fetchConfig,
    headers,
    credentials: 'include', // Important for cookies
  });

  // Handle non-OK responses
  if (!response.ok) {
    // Try to parse error response
    let errorData: any;
    try {
      errorData = await response.json();
    } catch {
      errorData = { message: response.statusText };
    }

    const errorMessage = errorData.message || errorData.error || 'Request failed';

    // Handle 401 Unauthorized - attempt token refresh
    if (response.status === 401 && !skipAuth && tokenRefreshCallback) {
      try {
        // Attempt to refresh the token
        const newToken = await tokenRefreshCallback();
        
        if (newToken) {
          // Retry the original request with new token
          headers['Authorization'] = `Bearer ${newToken}`;
          const retryResponse = await fetch(url, {
            ...fetchConfig,
            headers,
            credentials: 'include',
          });

          if (retryResponse.ok) {
            return retryResponse.json();
          }
        }
      } catch (refreshError) {
        // Refresh failed, throw original error
        throw new HttpError(errorMessage, response.status, errorData.error);
      }
    }

    throw new HttpError(errorMessage, response.status, errorData.error);
  }

  // Handle successful response
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    return response.json();
  }

  // For non-JSON responses, return empty object
  return {} as T;
}

/**
 * Convenience methods for common HTTP verbs
 */
export const api = {
  get: <T>(endpoint: string, config?: RequestConfig) =>
    apiRequest<T>(endpoint, { ...config, method: 'GET' }),

  post: <T>(endpoint: string, data?: any, config?: RequestConfig) =>
    apiRequest<T>(endpoint, {
      ...config,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    }),

  put: <T>(endpoint: string, data?: any, config?: RequestConfig) =>
    apiRequest<T>(endpoint, {
      ...config,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    }),

  patch: <T>(endpoint: string, data?: any, config?: RequestConfig) =>
    apiRequest<T>(endpoint, {
      ...config,
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    }),

  delete: <T>(endpoint: string, config?: RequestConfig) =>
    apiRequest<T>(endpoint, { ...config, method: 'DELETE' }),
};
