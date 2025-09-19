﻿/**
 * UserMenu - 用户菜单组件
 */
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, LogOut, Settings, ChevronDown } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { cn } from '../utils/appleTheme';

const UserMenu = ({ className = '' }) => {
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

  // 点击外部关闭菜单
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // 处理登出
  const handleLogout = async () => {
    setIsOpen(false);
    await logout();
  };

  if (!user) {
    return null;
  }

  // 获取用户头像（使用姓名首字母作为默认头像）
  const getAvatarText = () => {
    if (user.name) {
      return user.name.charAt(0).toUpperCase();
    }
    return user.email.charAt(0).toUpperCase();
  };

  return (
    <div className={cn('relative', className)} ref={menuRef}>
      {/* 用户信息触发按钮 */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-3 p-2 rounded-apple hover:bg-apple-gray-100 dark:hover:bg-apple-gray-700 transition-colors"
      >
        {/* 头像 */}
        <div className="w-8 h-8 bg-apple-blue rounded-full flex items-center justify-center text-white text-sm font-apple-medium">
          {user.avatar_url ? (
            <img 
              src={user.avatar_url} 
              alt={user.name} 
              className="w-full h-full rounded-full object-cover"
            />
          ) : (
            getAvatarText()
          )}
        </div>
        
        {/* 用户名称 */}
        <div className="hidden sm:block text-left">
          <p className="text-apple-sm font-apple-medium text-apple-gray-900 dark:text-apple-gray-100">
            {user.name}
          </p>
          <p className="text-apple-xs text-apple-gray-500 truncate max-w-32">
            {user.email}
          </p>
        </div>
        
        {/* 下拉箭头 */}
        <ChevronDown 
          className={cn(
            'w-4 h-4 text-apple-gray-500 transition-transform duration-200',
            isOpen && 'transform rotate-180'
          )} 
        />
      </button>

      {/* 下拉菜单 */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-apple-gray-800 border border-apple-gray-200 dark:border-apple-gray-700 rounded-apple-lg shadow-apple-lg z-50"
          >
            {/* 用户信息头部 */}
            <div className="p-4 border-b border-apple-gray-200 dark:border-apple-gray-700">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-apple-blue rounded-full flex items-center justify-center text-white font-apple-medium">
                  {user.avatar_url ? (
                    <img 
                      src={user.avatar_url} 
                      alt={user.name} 
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    getAvatarText()
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-apple-base font-apple-medium text-apple-gray-900 dark:text-apple-gray-100 truncate">
                    {user.name}
                  </p>
                  <p className="text-apple-sm text-apple-gray-500 truncate">
                    {user.email}
                  </p>
                </div>
              </div>
            </div>

            {/* 菜单选项 */}
            <div className="py-2">
              {/* 个人资料 */}
              <button className="w-full flex items-center space-x-3 px-4 py-2 text-left hover:bg-apple-gray-50 dark:hover:bg-apple-gray-700 transition-colors">
                <User className="w-4 h-4 text-apple-gray-500" />
                <span className="text-apple-sm text-apple-gray-700 dark:text-apple-gray-300">
                  个人资料
                </span>
              </button>

              {/* 设置 */}
              <button className="w-full flex items-center space-x-3 px-4 py-2 text-left hover:bg-apple-gray-50 dark:hover:bg-apple-gray-700 transition-colors">
                <Settings className="w-4 h-4 text-apple-gray-500" />
                <span className="text-apple-sm text-apple-gray-700 dark:text-apple-gray-300">
                  设置
                </span>
              </button>

              {/* 分隔线 */}
              <div className="border-t border-apple-gray-200 dark:border-apple-gray-700 my-2" />

              {/* 登出 */}
              <button 
                onClick={handleLogout}
                className="w-full flex items-center space-x-3 px-4 py-2 text-left hover:bg-apple-red/10 transition-colors group"
              >
                <LogOut className="w-4 h-4 text-apple-gray-500 group-hover:text-apple-red" />
                <span className="text-apple-sm text-apple-gray-700 dark:text-apple-gray-300 group-hover:text-apple-red">
                  登出
                </span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default UserMenu;