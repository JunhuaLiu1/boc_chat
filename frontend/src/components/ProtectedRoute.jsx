﻿/**
 * ProtectedRoute - 路由保护组件
 */
import React from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import { LoginPage } from './auth';
import { Loader2 } from 'lucide-react';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  // 显示加载状态
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center space-y-4"
        >
          <div className="w-16 h-16 bg-apple-blue rounded-apple-xl flex items-center justify-center mx-auto shadow-apple-lg">
            <Loader2 className="w-8 h-8 text-white animate-spin" />
          </div>
          <p className="text-apple-body">正在验证身份...</p>
        </motion.div>
      </div>
    );
  }

  // 如果未认证，显示登录页面
  if (!isAuthenticated) {
    return <LoginPage />;
  }

  // 如果已复制代码认证，显示受保护的内容
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {children}
    </motion.div>
  );
};

export default ProtectedRoute;