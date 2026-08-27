import axios from 'axios';
import {
  getAccessToken,
  getRefreshToken,
  saveTokens,
  clearTokens,
} from '../utils/tokenStorage';

const API_BASE_URL = 'http://127.0.0.1:7070';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// ============================================================
// REQUEST INTERCEPTOR
// Automatically attach access token
// ============================================================

apiClient.interceptors.request.use(
  async config => {
    const accessToken = await getAccessToken();

    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }

    return config;
  },
  error => Promise.reject(error),
);

// ============================================================
// RESPONSE INTERCEPTOR
// Access token expired -> refresh automatically
// ============================================================

let isRefreshing = false;
let refreshSubscribers = [];

const subscribeTokenRefresh = callback => {
  refreshSubscribers.push(callback);
};

const onRefreshed = newToken => {
  refreshSubscribers.forEach(callback => {
    callback(newToken);
  });

  refreshSubscribers = [];
};

apiClient.interceptors.response.use(
  response => response,

  async error => {
    const originalRequest = error.config;

    // Only handle 401
    if (
      error.response?.status !== 401 ||
      originalRequest?._retry
    ) {
      return Promise.reject(error);
    }

    // Never try refreshing the refresh endpoint itself
    if (originalRequest.url?.includes('/auth/refresh')) {
      await clearTokens();
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    // --------------------------------------------------------
    // Another request is already refreshing
    // --------------------------------------------------------

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        subscribeTokenRefresh(token => {
          if (!token) {
            reject(error);
            return;
          }

          originalRequest.headers.Authorization =
            `Bearer ${token}`;

          resolve(apiClient(originalRequest));
        });
      });
    }

    isRefreshing = true;

    try {
      const refreshToken = await getRefreshToken();

      if (!refreshToken) {
        await clearTokens();
        return Promise.reject(error);
      }

      // IMPORTANT:
      // Use plain axios here so this request does not
      // trigger the interceptor again.

      const refreshResponse = await axios.post(
        `${API_BASE_URL}/api/auth/refresh`,
        {
          refreshToken,
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
          timeout: 15000,
        },
      );

      const newAccessToken =
        refreshResponse.data?.tokens?.accessToken;

      const newRefreshToken =
        refreshResponse.data?.tokens?.refreshToken;

      if (!newAccessToken || !newRefreshToken) {
        throw new Error('Invalid refresh response');
      }

      // Save rotated tokens
      await saveTokens({
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      });

      onRefreshed(newAccessToken);

      originalRequest.headers.Authorization =
        `Bearer ${newAccessToken}`;

      return apiClient(originalRequest);
    } catch (refreshError) {
      await clearTokens();

      onRefreshed(null);

      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  },
);

export default apiClient;