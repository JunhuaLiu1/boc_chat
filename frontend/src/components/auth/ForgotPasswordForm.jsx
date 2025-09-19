/**
 * ForgotPasswordForm - 忘记密码表单组件
 */
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, ArrowLeft } from 'lucide-react';
import FormInput from './FormInput';
import SubmitButton from './SubmitButton';
import { useForgotPasswordForm } from '../../hooks/useForm';
import { useAuth } from '../../hooks/useAuth';
import { cn } from '../../utils/appleTheme';

const ForgotPasswordForm = ({
  onSwitchToLogin,
  className = ''
}) => {
  const { forgotPassword, isLoading, error, clearError } = useAuth();
  const [emailSent, setEmailSent] = useState(false);
  const {
    formData,
    errors,
    touched,
    updateField,
    handleBlur,
    handleSubmit,
    isValid
  } = useForgotPasswordForm();

  // 处理表单提交
  const handleFormSubmit = async (data) => {
    const result = await forgotPassword(data.email);

    if (result.success) {
      setEmailSent(true);
    }
  };

  // 清除认证错误
  const handleInputChange = (field, value) => {
    updateField(field, value);
    if (error) {
      clearError();
    }
  };

  // 重新发送邮件
  const handleResendEmail = () => {
    setEmailSent(false);
    clearError();
  };

  // 如果邮件已发送，显示成功消息
  if (emailSent) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center space-y-6"
      >
        <div className="w-20 h-20 bg-apple-blue/10 rounded-full flex items-center justify-center mx-auto">
          <Mail className="w-10 h-10 text-apple-blue" />
        </div>
        
        <div>
          <h3 className="text-apple-xl font-apple-semibold text-apple-heading mb-2">
            邮件已发送
          </h3>
          <p className="text-apple-body mb-4">
            我们已向 <strong>{formData.email}</strong> 发送密码重置链接
          </p>
          <p className="text-apple-sm text-apple-gray-500">
            请检查您的邮箱（包括垃圾邮件文件夹），并点击邮件中的链接来重置密码
          </p>
        </div>
        
        <div className="space-y-3">
          <button
            onClick={handleResendEmail}
            className="w-full btn-apple-secondary"
          >
            重新发送邮件
          </button>
          
          <button
            onClick={onSwitchToLogin}
            className="flex items-center justify-center space-x-2 text-apple-blue hover:text-apple-blue-dark font-apple-medium transition-colors mx-auto"
          >
            <ArrowLeft size={16} />
            <span>返回登录</span>
          </button>
        </div>
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
      {/* 返回登录按钮 */}
      <button
        onClick={onSwitchToLogin}
        className="flex items-center space-x-2 text-apple-gray-600 hover:text-apple-gray-800 dark:text-apple-gray-400 dark:hover:text-apple-gray-200 transition-colors mb-4"
      >
        <ArrowLeft size={16} />
        <span className="text-apple-sm">返回登录</span>
      </button>

      <div className="text-center mb-6">
        <h2 className="text-apple-xl font-apple-semibold text-apple-heading mb-2">
          忘记密码
        </h2>
        <p className="text-apple-body">
          输入您的邮箱地址，我们将向您发送密码重置链接
        </p>
      </div>

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

        {/* 发送邮件按钮 */}
        <SubmitButton
          type="submit"
          loading={isLoading}
          disabled={!isValid || isLoading}
          className="mt-6"
        >
          发送重置链接
        </SubmitButton>
      </form>

      {/* 帮助信息 */}
      <div className="text-center">
        <p className="text-apple-sm text-apple-gray-500">
          记起密码了？
          <button
            onClick={onSwitchToLogin}
            className="text-apple-blue hover:text-apple-blue-dark font-apple-medium ml-1 transition-colors"
          >
            立即登录
          </button>
        </p>
      </div>

      {/* 额外帮助信息 */}
      <div className="bg-apple-gray-50 dark:bg-apple-gray-800 rounded-apple p-4">
        <h4 className="text-apple-sm font-apple-medium text-apple-heading mb-2">
          重置说明
        </h4>
        <ul className="text-apple-xs text-apple-gray-600 dark:text-apple-gray-400 space-y-1">
          <li>重置链接将在24小时后过期</li>
          <li>如果没有收到邮件，请检查垃圾邮件文件夹</li>
          <li>每个重置链接只能使用一次</li>
        </ul>
      </div>
    </motion.div>
  );
};

export default ForgotPasswordForm;