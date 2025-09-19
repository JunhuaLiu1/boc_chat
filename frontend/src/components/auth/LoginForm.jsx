/**
 * LoginForm - 登录表单组件
 */
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import FormInput from './FormInput';
import SubmitButton from './SubmitButton';
import { useLoginForm } from '../../hooks/useForm';
import { useAuth } from '../../hooks/useAuth';
import { cn } from '../../utils/appleTheme';

const LoginForm = ({
  onSwitchToRegister,
  onSwitchToForgotPassword,
  onSuccess,
  className = ''
}) => {
  const { login, isLoading, error, clearError } = useAuth();
  const {
    formData,
    errors,
    touched,
    updateField,
    handleBlur,
    handleSubmit,
    isValid
  } = useLoginForm();

  // 处理表单提交
  const handleFormSubmit = async (data) => {
    const result = await login({
      email: data.email,
      password: data.password,
      remember_me: data.rememberMe
    });

    if (result.success) {
      if (onSuccess) {
        onSuccess();
      }
    }
  };

  // 清除认证错误
  const handleInputChange = (field, value) => {
    updateField(field, value);
    if (error) {
      clearError();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className={cn('space-y-6', className)}
    >
      {/* 错误提示 */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-apple-red/10 border border-apple-red/20 rounded-apple text-apple-red text-center"
        >
          {error}
        </motion.div>
      )}

      <form onSubmit={(e) => {
        e.preventDefault();
        handleSubmit(handleFormSubmit);
      }} className="space-y-4">
        {/* 邮箱输入 */}
        <FormInput
          type="email"
          label="邮箱地址"
          placeholder="请输入您的邮箱"
          value={formData.email}
          onChange={(value) => handleInputChange('email', value)}
          onBlur={() => handleBlur('email')}
          error={touched.email ? errors.email : null}
          required
        />

        {/* 密码输入 */}
        <FormInput
          type="password"
          label="密码"
          placeholder="请输入您的密码"
          value={formData.password}
          onChange={(value) => handleInputChange('password', value)}
          onBlur={() => handleBlur('password')}
          error={touched.password ? errors.password : null}
          showPasswordToggle
          required
        />

        {/* 记住我/忘记密码 */}
        <div className="flex items-center justify-between">
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.rememberMe}
              onChange={(e) => updateField('rememberMe', e.target.checked)}
              className="w-4 h-4 text-apple-blue bg-apple-gray-100 border-apple-gray-300 rounded focus:ring-apple-blue focus:ring-2 dark:bg-apple-gray-700 dark:border-apple-gray-600"
            />
            <span className="text-apple-sm text-apple-body">记住我</span>
          </label>

          <button
            type="button"
            onClick={onSwitchToForgotPassword}
            className="text-apple-sm text-apple-blue hover:text-apple-blue-dark transition-colors"
          >
            忘记密码?
          </button>
        </div>

        {/* 登录按钮 */}
        <SubmitButton
          type="submit"
          loading={isLoading}
          disabled={!isValid || isLoading}
          className="mt-6"
        >
          登录
        </SubmitButton>
      </form>

      {/* 注册链接 */}
      <div className="text-center mt-6">
        <span className="text-apple-body">还没有账户？</span>
        {' '}
        <button
          type="button"
          onClick={onSwitchToRegister}
          className="text-apple-blue hover:text-apple-blue-dark font-apple-medium transition-colors"
        >
          立即注册
        </button>
      </div>

      {/* 分割线和社交登录（可选） */}
      {/* 
      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-apple-gray-200 dark:border-apple-gray-700" />
        </div>
        <div className="relative flex justify-center text-apple-sm">
          <span className="px-2 bg-white dark:bg-apple-gray-800 text-apple-gray-500">或</span>
        </div>
      </div>
      
      <div className="space-y-3">
        <button className="w-full btn-apple-secondary">
          <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">...</svg>
          使用微信登录
        </button>
      </div>
      */}
    </motion.div>
  );
};

export default LoginForm;