/**
 * LoginPage - 主要的认证页面组件
 */
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import AuthLayout from './AuthLayout';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';
import ForgotPasswordForm from './ForgotPasswordForm';

const AUTH_MODES = {
  LOGIN: 'login',
  REGISTER: 'register',
  FORGOT_PASSWORD: 'forgot-password'
};

const LoginPage = ({ onAuthSuccess }) => {
  const [authMode, setAuthMode] = useState(AUTH_MODES.LOGIN);

  // 获取当前模式的标题和副标题
  const getPageInfo = () => {
    switch (authMode) {
      case AUTH_MODES.LOGIN:
        return {
          title: '欢迎回来',
          subtitle: '请登录您的账户以继续使用 BOCAI'
        };
      case AUTH_MODES.REGISTER:
        return {
          title: '创建账户',
          subtitle: '注册 BOCAI 账户，开始您的智能对话体验'
        };
      case AUTH_MODES.FORGOT_PASSWORD:
        return {
          title: '',
          subtitle: ''
        };
      default:
        return {
          title: '',
          subtitle: ''
        };
    }
  };

  const { title, subtitle } = getPageInfo();

  // 页面切换动画配置
  const pageVariants = {
    initial: { opacity: 0, x: 20 },
    in: { opacity: 1, x: 0 },
    out: { opacity: 0, x: -20 }
  };

  const pageTransition = {
    type: 'tween',
    ease: 'anticipate',
    duration: 0.3
  };

  // 处理认证成功
  const handleAuthSuccess = () => {
    if (onAuthSuccess) {
      onAuthSuccess();
    }
  };

  // 渲染当前认证表单
  const renderAuthForm = () => {
    switch (authMode) {
      case AUTH_MODES.LOGIN:
        return (
          <LoginForm
            onSwitchToRegister={() => setAuthMode(AUTH_MODES.REGISTER)}
            onSwitchToForgotPassword={() => setAuthMode(AUTH_MODES.FORGOT_PASSWORD)}
            onSuccess={handleAuthSuccess}
          />
        );
      case AUTH_MODES.REGISTER:
        return (
          <RegisterForm
            onSwitchToLogin={() => setAuthMode(AUTH_MODES.LOGIN)}
            onSuccess={() => setAuthMode(AUTH_MODES.LOGIN)}
          />
        );
      case AUTH_MODES.FORGOT_PASSWORD:
        return (
          <ForgotPasswordForm
            onSwitchToLogin={() => setAuthMode(AUTH_MODES.LOGIN)}
          />
        );
      default:
        return null;
    }
  };

  return (
    <AuthLayout 
      title={title} 
      subtitle={subtitle}
      showLogo={authMode !== AUTH_MODES.FORGOT_PASSWORD}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={authMode}
          initial="initial"
          animate="in"
          exit="out"
          variants={pageVariants}
          transition={pageTransition}
        >
          {renderAuthForm()}
        </motion.div>
      </AnimatePresence>
    </AuthLayout>
  );
};

export default LoginPage;