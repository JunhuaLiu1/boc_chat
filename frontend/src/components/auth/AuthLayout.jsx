/**
 * AuthLayout - 认证页面的布局组件
 */
import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../utils/appleTheme';

const AuthLayout = ({
  children,
  title,
  subtitle,
  showLogo = true,
  className = ''
}) => {
  return (
    <div className="auth-container">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className={cn('auth-card', className)}
      >
        {/* Logo区域 */}
        {showLogo && (
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="flex justify-center mb-4"
            >
              <div className="w-16 h-16 bg-white rounded-apple-xl flex items-center justify-center shadow-apple-lg p-2">
                <img 
                  src="/images/logo1.png" 
                  alt="BOCAI Logo" 
                  className="w-full h-full object-contain"
                />
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.2 }}
            >
              <h1 className="text-apple-2xl font-apple-bold text-apple-heading mb-2">
                BOCAI
              </h1>
              <p className="text-apple-caption">
                中国银行江西省分行大语言模型
              </p>
            </motion.div>
          </div>
        )}
        
        {/* 标题区域 */}
        {title && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.3 }}
            className="text-center mb-8"
          >
            <h2 className="text-apple-xl font-apple-semibold text-apple-heading mb-2">
              {title}
            </h2>
            {subtitle && (
              <p className="text-apple-body">
                {subtitle}
              </p>
            )}
          </motion.div>
        )}
        
        {/* 内容区域 */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.4 }}
        >
          {children}
        </motion.div>
      </motion.div>
    </div>
  );
};

export default AuthLayout;


