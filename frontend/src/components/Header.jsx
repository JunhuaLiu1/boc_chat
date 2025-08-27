import React from 'react';
import { Moon, Sun } from 'lucide-react';

/**
 * 顶部导航栏组件
 * 显示当前会话标题和主题切换按钮
 */
const Header = ({ currentConversationTitle, darkMode, onToggleDarkMode }) => {
  return (
    <header className="bg-white dark:bg-gray-900 px-6 py-4 flex justify-between items-center">
      <div className="flex items-center space-x-3">
        <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
          {currentConversationTitle || '新对话'}
        </h1>
      </div>
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
    </header>
  );
};

export default Header;