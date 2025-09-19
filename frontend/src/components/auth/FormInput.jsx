/**
 * FormInput - Apple风格的表单输入组? */
import React, { useState } from 'react';
import { Eye, EyeOff, Mail, Lock, User } from 'lucide-react';
import { cn } from '../../utils/appleTheme';

const FormInput = ({
  type = 'text',
  placeholder,
  value,
  onChange,
  onBlur,
  error,
  label,
  icon: Icon,
  showPasswordToggle = false,
  disabled = false,
  required = false,
  className = '',
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const handleTogglePassword = () => {
    setShowPassword(!showPassword);
  };

  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleBlur = (e) => {
    setIsFocused(false);
    if (onBlur) {
      onBlur(e);
    }
  };

  const inputType = showPasswordToggle && type === 'password' 
    ? (showPassword ? 'text' : 'password') 
    : type;

  // 获取默认图标
  const getDefaultIcon = () => {
    switch (type) {
      case 'email':
        return Mail;
      case 'password':
        return Lock;
      case 'text':
        return User;
      default:
        return null;
    }
  };

  const DefaultIcon = Icon || getDefaultIcon();

  return (
    <div className="form-apple-group">
      {label && (
        <label className="form-apple-label">
          {label}
          {required && <span className="text-apple-red ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        {/* 左侧图标 */}
        {DefaultIcon && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-apple-gray-500">
            <DefaultIcon size={20} />
          </div>
        )}
        
        {/* 输入?*/}
        <input
          type={inputType}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange && onChange(e.target.value)}
          onFocus={handleFocus}
          onBlur={handleBlur}
          disabled={disabled}
          className={cn(
            'input-apple',
            DefaultIcon && 'pl-10',
            showPasswordToggle && 'pr-10',
            error && 'input-apple-error',
            isFocused && 'border-apple-blue ring-2 ring-apple-blue/30',
            disabled && 'opacity-50 cursor-not-allowed',
            className
          )}
          {...props}
        />
        
        {/* 密码显示切换按钮 */}
        {showPasswordToggle && (
          <button
            type="button"
            onClick={handleTogglePassword}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-apple-gray-500 hover:text-apple-gray-700 dark:hover:text-apple-gray-300 transition-colors"
            tabIndex={-1}
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        )}
      </div>
      
      {/* 错误信息 */}
      {error && (
        <p className="text-apple-error mt-1 animate-apple-fade-in">
          {error}
        </p>
      )}
    </div>
  );
};

export default FormInput;


