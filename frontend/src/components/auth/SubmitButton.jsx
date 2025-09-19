/**
 * SubmitButton - Apple风格的提交按钮组? */
import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '../../utils/appleTheme';

const SubmitButton = ({
  children,
  loading = false,
  disabled = false,
  variant = 'primary',
  size = 'default',
  onClick,
  className = '',
  type = 'button',
  ...props
}) => {
  const isDisabled = disabled || loading;

  const getVariantClasses = () => {
    switch (variant) {
      case 'primary':
        return 'btn-apple-primary';
      case 'secondary':
        return 'btn-apple-secondary';
      case 'ghost':
        return 'btn-apple-ghost';
      default:
        return 'btn-apple-primary';
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'small':
        return 'px-3 py-2 text-apple-sm h-10';
      case 'large':
        return 'px-6 py-4 text-apple-lg h-14';
      default:
        return 'px-4 py-3 text-apple-base h-input';
    }
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={isDisabled}
      className={cn(
        'btn-apple',
        getVariantClasses(),
        getSizeClasses(),
        'w-full flex items-center justify-center space-x-2',
        'transform active:scale-95 transition-transform duration-100',
        isDisabled && 'opacity-50 cursor-not-allowed',
        className
      )}
      {...props}
    >
      {loading && (
        <Loader2 className="animate-spin" size={20} />
      )}
      <span>{children}</span>
    </button>
  );
};

export default SubmitButton;


