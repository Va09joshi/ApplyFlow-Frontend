import axios from 'axios';
import { useAuthStore } from '@/store/useAuthStore';

const baseURL =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  '';

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
  (config) => {
    const accessToken = useAuthStore.getState().accessToken;
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle rate limiting and token refreshing
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

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

    // If the error is a 401 and we haven't already tried to refresh the token
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = useAuthStore.getState().refreshToken;
        if (!refreshToken) throw new Error('No refresh token');

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
        // If refresh fails, log out the user
        useAuthStore.getState().logout();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);
