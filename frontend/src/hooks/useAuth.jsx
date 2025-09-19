/**
 * useAuth Hook - Authentication state management for BOCAI Chat MVP
 */
import { useState, useEffect, useCallback, createContext, useContext } from 'react';
import { authAPI, tokenManager } from '../utils/api';

// Auth Context
const AuthContext = createContext({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
  login: async () => {},
  register: async () => {},
  logout: async () => {},
  forgotPassword: async () => {},
  resetPassword: async () => {},
  changePassword: async () => {},
  clearError: () => {},
  refreshUserInfo: async () => {}
});

/**
 * Auth Provider Component
 */
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const isAuthenticated = !!user;

  // Clear error message
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Initialize auth state from localStorage
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        setIsLoading(true);
        
        // Check if user is logged in from localStorage
        const storedUser = tokenManager.getUserInfo();
        const isStoredAuthenticated = tokenManager.isAuthenticated();
        
        if (isStoredAuthenticated && storedUser) {
          // Verify token with backend
          const result = await authAPI.getCurrentUser();
          if (result.success) {
            setUser(result.data);
          } else {
            // Token is invalid, clear storage
            tokenManager.clearTokens();
            setUser(null);
          }
        }
      } catch (err) {
        console.error('Auth initialization error:', err);
        tokenManager.clearTokens();
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Login function
  const login = useCallback(async (credentials) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const result = await authAPI.login(credentials);
      
      if (result.success) {
        setUser(result.data.user);
        return { success: true };
      } else {
        setError(result.error);
        return { success: false, error: result.error };
      }
    } catch (err) {
      const errorMsg = '登录失败，请重试';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Register function
  const register = useCallback(async (userData) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const result = await authAPI.register(userData);
      
      if (result.success) {
        return { success: true, message: result.data.message };
      } else {
        setError(result.error);
        return { success: false, error: result.error };
      }
    } catch (err) {
      const errorMsg = '注册失败，请重试';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Logout function
  const logout = useCallback(async () => {
    try {
      setIsLoading(true);
      await authAPI.logout();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setUser(null);
      setError(null);
      setIsLoading(false);
    }
  }, []);

  // Forgot password function
  const forgotPassword = useCallback(async (email) => {
    try {
      setError(null);
      
      const result = await authAPI.forgotPassword(email);
      
      if (result.success) {
        return { success: true, message: result.data.message };
      } else {
        setError(result.error);
        return { success: false, error: result.error };
      }
    } catch (err) {
      const errorMsg = '密码重置请求失败，请重试';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    }
  }, []);

  // Reset password function
  const resetPassword = useCallback(async (token, password, confirmPassword) => {
    try {
      setError(null);
      
      const result = await authAPI.resetPassword(token, password, confirmPassword);
      
      if (result.success) {
        return { success: true, message: result.data.message };
      } else {
        setError(result.error);
        return { success: false, error: result.error };
      }
    } catch (err) {
      const errorMsg = '密码重置失败，请重试';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    }
  }, []);

  // Change password function
  const changePassword = useCallback(async (currentPassword, newPassword, confirmPassword) => {
    try {
      setError(null);
      
      const result = await authAPI.changePassword(currentPassword, newPassword, confirmPassword);
      
      if (result.success) {
        return { success: true, message: result.data.message };
      } else {
        setError(result.error);
        return { success: false, error: result.error };
      }
    } catch (err) {
      const errorMsg = '密码修改失败，请重试';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    }
  }, []);

  // Refresh user info
  const refreshUserInfo = useCallback(async () => {
    try {
      const result = await authAPI.getCurrentUser();
      
      if (result.success) {
        setUser(result.data);
        return { success: true };
      } else {
        return { success: false, error: result.error };
      }
    } catch (err) {
      return { success: false, error: '获取用户信息失败' };
    }
  }, []);

  const value = {
    user,
    isAuthenticated,
    isLoading,
    error,
    login,
    register,
    logout,
    forgotPassword,
    resetPassword,
    changePassword,
    clearError,
    refreshUserInfo
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * useAuth Hook
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};

export default useAuth;
