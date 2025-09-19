/**
 * RegisterForm - 注册表单组件
 */
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle } from 'lucide-react';
import FormInput from './FormInput';
import SubmitButton from './SubmitButton';
import { useRegisterForm } from '../../hooks/useForm';
import { useAuth } from '../../hooks/useAuth';
import { cn } from '../../utils/appleTheme';

const RegisterForm = ({
  onSwitchToLogin,
  onSuccess,
  className = ''
}) => {
  const { register, isLoading, error, clearError } = useAuth();
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const {
    formData,
    errors,
    touched,
    updateField,
    handleBlur,
    handleSubmit,
    isValid
  } = useRegisterForm();

  // 处理表单提交
  const handleFormSubmit = async (data) => {
    const result = await register({
      name: data.name,
      email: data.email,
      password: data.password,
      confirm_password: data.confirmPassword
    });

    if (result.success) {
      setRegistrationSuccess(true);
      if (onSuccess) {
        setTimeout(onSuccess, 2000); // 2秒后跳转到登录页
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

  // 如果注册成功，显示成功消息
  if (registrationSuccess) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center space-y-6"
      >
        <div className="w-20 h-20 bg-apple-green/10 rounded-full flex items-center justify-center mx-auto">
          <CheckCircle className="w-10 h-10 text-apple-green" />
        </div>
        
        <div>
          <h3 className="text-apple-xl font-apple-semibold text-apple-heading mb-2">
            注册成功
          </h3>
          <p className="text-apple-body">
            您的账户已创建完成，正在跳转到登录页...
          </p>
        </div>
        
        <button
          onClick={onSwitchToLogin}
          className="text-apple-blue hover:text-apple-blue-dark font-apple-medium transition-colors"
        >
          立即登录
        </button>
      </motion.div>
    );
  }

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
        {/* 姓名输入 */}
        <FormInput
          type="text"
          label="姓名"
          placeholder="请输入您的姓名"
          value={formData.name}
          onChange={(value) => handleInputChange('name', value)}
          onBlur={() => handleBlur('name')}
          error={touched.name ? errors.name : null}
          required
        />

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
          placeholder="请设置您的密码"
          value={formData.password}
          onChange={(value) => handleInputChange('password', value)}
          onBlur={() => handleBlur('password')}
          error={touched.password ? errors.password : null}
          showPasswordToggle
          required
        />

        {/* 确认密码输入 */}
        <FormInput
          type="password"
          label="确认密码"
          placeholder="请再次输入密码"
          value={formData.confirmPassword}
          onChange={(value) => handleInputChange('confirmPassword', value)}
          onBlur={() => handleBlur('confirmPassword')}
          error={touched.confirmPassword ? errors.confirmPassword : null}
          showPasswordToggle
          required
        />

        {/* 密码强度提示 */}
        {formData.password && (
          <div className="space-y-2">
            <p className="text-apple-sm text-apple-body">密码要求：</p>
            <div className="space-y-1 text-apple-xs">
              <div className={cn(
                'flex items-center space-x-2',
                formData.password.length >= 8 ? 'text-apple-green' : 'text-apple-gray-500'
              )}>
                <div className={cn(
                  'w-2 h-2 rounded-full',
                  formData.password.length >= 8 ? 'bg-apple-green' : 'bg-apple-gray-300'
                )} />
                <span>至少8个字符</span>
              </div>
              <div className={cn(
                'flex items-center space-x-2',
                /[a-z]/.test(formData.password) ? 'text-apple-green' : 'text-apple-gray-500'
              )}>
                <div className={cn(
                  'w-2 h-2 rounded-full',
                  /[a-z]/.test(formData.password) ? 'bg-apple-green' : 'bg-apple-gray-300'
                )} />
                <span>包含小写字母</span>
              </div>
              <div className={cn(
                'flex items-center space-x-2',
                /[A-Z]/.test(formData.password) ? 'text-apple-green' : 'text-apple-gray-500'
              )}>
                <div className={cn(
                  'w-2 h-2 rounded-full',
                  /[A-Z]/.test(formData.password) ? 'bg-apple-green' : 'bg-apple-gray-300'
                )} />
                <span>包含大写字母</span>
              </div>
              <div className={cn(
                'flex items-center space-x-2',
                /\d/.test(formData.password) ? 'text-apple-green' : 'text-apple-gray-500'
              )}>
                <div className={cn(
                  'w-2 h-2 rounded-full',
                  /\d/.test(formData.password) ? 'bg-apple-green' : 'bg-apple-gray-300'
                )} />
                <span>包含数字</span>
              </div>
            </div>
          </div>
        )}

        {/* 注册按钮 */}
        <SubmitButton
          type="submit"
          loading={isLoading}
          disabled={!isValid || isLoading}
          className="mt-6"
        >
          注册账户
        </SubmitButton>
      </form>

      {/* 登录链接 */}
      <div className="text-center mt-6">
        <span className="text-apple-body">已有账户?</span>
        {' '}
        <button
          type="button"
          onClick={onSwitchToLogin}
          className="text-apple-blue hover:text-apple-blue-dark font-apple-medium transition-colors"
        >
          立即登录
        </button>
      </div>

      {/* 使用条款（可选） */}
      <div className="text-center">
        <p className="text-apple-xs text-apple-gray-500">
          注册即表示您同意我们的
          <button className="text-apple-blue hover:text-apple-blue-dark ml-1">
            服务条款
          </button>
          和
          <button className="text-apple-blue hover:text-apple-blue-dark ml-1">
            隐私政策
          </button>
        </p>
      </div>
    </motion.div>
  );
};

export default RegisterForm;