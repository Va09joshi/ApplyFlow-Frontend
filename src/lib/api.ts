import axios, { AxiosHeaders, type InternalAxiosRequestConfig } from 'axios';
import { useAuthStore } from '@/store/useAuthStore';

type AuthRequestConfig = InternalAxiosRequestConfig & {
  skipAuth?: boolean;
  _retry?: boolean;
  _retryNoAuth?: boolean;
  _retryCount?: number;
};

// Use the in-app proxy for client-side calls to avoid CORS during development.
// On the server (SSR), prefer an explicit environment variable or fallback host.
const baseURL = typeof window === 'undefined'
  ? (process.env.NEXT_PUBLIC_BACKEND_URL?.replace(/\/$/, '') || 'https://backend.applyflow.live')
  : '/api/backend';

export const api = axios.create({
  baseURL,
  timeout: 15000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add the access token to headers
api.interceptors.request.use(
  (config: AuthRequestConfig) => {
    const requestConfig = config;

    if (requestConfig.skipAuth) {
      return requestConfig;
    }

    const accessToken = useAuthStore.getState().accessToken;
    if (accessToken) {
      requestConfig.headers = AxiosHeaders.from(requestConfig.headers);
      requestConfig.headers.set('Authorization', `Bearer ${accessToken}`);
    }
    return requestConfig;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle rate limiting and token refreshing
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config as AuthRequestConfig;

    // Handle 429 Too Many Requests with retry + backoff
    if (error.response?.status === 429) {
      const retryCount = originalRequest._retryCount || 0;
      if (retryCount < 3) {
        originalRequest._retryCount = retryCount + 1;
        const retryAfter = error.response.headers['retry-after'];
        const delay = retryAfter
          ? parseInt(retryAfter, 10) * 1000
          : Math.min(1000 * Math.pow(2, retryCount), 8000);
        await new Promise((resolve) => setTimeout(resolve, delay));
        return api(originalRequest);
      }
    }

    // If the error is a 401 and we have a refresh token, try to refresh once.
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = useAuthStore.getState().refreshToken;
        if (!refreshToken) {
          useAuthStore.getState().logout();
          if (typeof window !== 'undefined') {
            window.location.href = '/login';
          }
          return Promise.reject(error);
        }

        // Request a new token
        const res = await axios.post(`${api.defaults.baseURL}/api/v1/auth/refresh`, {
          refreshToken,
        });

        const newAccessToken = res.data?.data?.accessToken || res.data?.accessToken;
        const newRefreshToken = res.data?.data?.refreshToken || res.data?.refreshToken;
        
        if (newAccessToken) {
          useAuthStore.getState().setAuth(newAccessToken, newRefreshToken || refreshToken);
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        // If refresh fails, log out the user only when token-based auth was in use.
        useAuthStore.getState().logout();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);
