/**
 * API client for BOCAI Chat MVP authentication
 */
import axios from 'axios';

// API Base URL
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://your-production-domain.com'
  : 'http://localhost:8000';

// Create axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Token management
const TOKEN_KEYS = {
  ACCESS: 'bocai_access_token',
  REFRESH: 'bocai_refresh_token',
  USER: 'bocai_user_info'
};

/**
 * Token management utilities
 */
export const tokenManager = {
  getAccessToken: () => localStorage.getItem(TOKEN_KEYS.ACCESS),
  getRefreshToken: () => localStorage.getItem(TOKEN_KEYS.REFRESH),
  getUserInfo: () => {
    const userStr = localStorage.getItem(TOKEN_KEYS.USER);
    return userStr ? JSON.parse(userStr) : null;
  },
  
  setTokens: (accessToken, refreshToken, userInfo) => {
    localStorage.setItem(TOKEN_KEYS.ACCESS, accessToken);
    localStorage.setItem(TOKEN_KEYS.REFRESH, refreshToken);
    localStorage.setItem(TOKEN_KEYS.USER, JSON.stringify(userInfo));
  },
  
  clearTokens: () => {
    localStorage.removeItem(TOKEN_KEYS.ACCESS);
    localStorage.removeItem(TOKEN_KEYS.REFRESH);
    localStorage.removeItem(TOKEN_KEYS.USER);
  },
  
  isAuthenticated: () => {
    const token = localStorage.getItem(TOKEN_KEYS.ACCESS);
    const user = localStorage.getItem(TOKEN_KEYS.USER);
    return !!(token && user);
  }
};

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = tokenManager.getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  
  failedQueue = [];
};

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(token => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return apiClient(originalRequest);
        }).catch(err => {
          return Promise.reject(err);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = tokenManager.getRefreshToken();
        if (refreshToken) {
          const response = await axios.post(`${API_BASE_URL}/api/auth/refresh`, {
            refresh_token: refreshToken
          });
          
          const { access_token, refresh_token: newRefreshToken } = response.data;
          const userInfo = tokenManager.getUserInfo();
          
          tokenManager.setTokens(access_token, newRefreshToken, userInfo);
          processQueue(null, access_token);
          
          originalRequest.headers.Authorization = `Bearer ${access_token}`;
          return apiClient(originalRequest);
        }
      } catch (refreshError) {
        processQueue(refreshError, null);
        tokenManager.clearTokens();
        // Redirect to login page
        window.location.href = '/login';
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

/**
 * Authentication API functions
 */
export const authAPI = {
  // User registration
  register: async (userData) => {
    try {
      const response = await apiClient.post('/api/auth/register', userData);
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.detail || '注册失败' 
      };
    }
  },

  // User login
  login: async (credentials) => {
    try {
      const response = await apiClient.post('/api/auth/login', credentials);
      const { user, access_token, refresh_token } = response.data;
      
      tokenManager.setTokens(access_token, refresh_token, user);
      
      return { success: true, data: { user, access_token, refresh_token } };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.detail || '登录失败' 
      };
    }
  },

  // User logout
  logout: async () => {
    try {
      await apiClient.post('/api/auth/logout');
    } catch (error) {
      console.warn('Logout API call failed:', error);
    } finally {
      tokenManager.clearTokens();
    }
  },

  // Get current user info
  getCurrentUser: async () => {
    try {
      const response = await apiClient.get('/api/auth/me');
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.detail || '获取用户信息失败' 
      };
    }
  },

  // Request password reset
  forgotPassword: async (email) => {
    try {
      const response = await apiClient.post('/api/auth/forgot-password', { email });
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.detail || '密码重置请求失败' 
      };
    }
  },

  // Reset password with token
  resetPassword: async (token, password, confirmPassword) => {
    try {
      const response = await apiClient.post('/api/auth/reset-password', {
        token,
        password,
        confirm_password: confirmPassword
      });
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.detail || '密码重置失败' 
      };
    }
  },

  // Change password
  changePassword: async (currentPassword, newPassword, confirmPassword) => {
    try {
      const response = await apiClient.post('/api/auth/change-password', {
        current_password: currentPassword,
        new_password: newPassword,
        confirm_password: confirmPassword
      });
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.detail || '密码修改失败' 
      };
    }
  },

  // Refresh token
  refreshToken: async () => {
    try {
      const refreshToken = tokenManager.getRefreshToken();
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await apiClient.post('/api/auth/refresh', {
        refresh_token: refreshToken
      });
      
      const { access_token, refresh_token: newRefreshToken } = response.data;
      const userInfo = tokenManager.getUserInfo();
      
      tokenManager.setTokens(access_token, newRefreshToken, userInfo);
      
      return { success: true, data: response.data };
    } catch (error) {
      tokenManager.clearTokens();
      return { 
        success: false, 
        error: error.response?.data?.detail || 'Token刷新失败' 
      };
    }
  }
};

export default apiClient;