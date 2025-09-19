﻿import React from 'react';
import { Moon, Sun } from 'lucide-react';
import UserMenu from './UserMenu';
import { useAuth } from '../hooks/useAuth';

/**
 * 顶部导航栏组?
 * 显示当前会话标题和主题切换按?
 */
const Header = ({ currentConversationTitle, darkMode, onToggleDarkMode }) => {
  const { isAuthenticated } = useAuth();

  return (
    <header className="bg-white dark:bg-gray-900 px-6 py-4 flex justify-between items-center">
      <div className="flex items-center space-x-3">
        <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
          {currentConversationTitle || '新对话'}
        </h1>
      </div>
      
      <div className="flex items-center space-x-3">
        {/* 主题切换按钮 */}
        <button
          onClick={onToggleDarkMode}
          className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          aria-label={darkMode ? "切换到浅色模式" : "切换到暗黑模式"}
        >
          {darkMode ? (
            <Sun size={20} className="text-gray-600 dark:text-gray-400" />
          ) : (
            <Moon size={20} className="text-gray-600 dark:text-gray-400" />
          )}
        </button>
        
        {/* 用户菜单（仅在已复制代码认证时显示） */}
        {isAuthenticated && (
          <UserMenu />
        )}
      </div>
    </header>
  );
};

export default Header;


