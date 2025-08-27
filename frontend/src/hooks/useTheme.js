import { useState, useEffect } from 'react';

/**
 * 主题管理 Hook
 * 管理暗黑模式状态、切换功能和本地存储
 */
const useTheme = () => {
  const [darkMode, setDarkMode] = useState(false);

  // 初始化主题设置
  useEffect(() => {
    // 检查本地存储或系统偏好设置来初始化暗黑模式
    const isDark = localStorage.getItem('darkMode') === 'true' ||
      (window.matchMedia('(prefers-color-scheme: dark)').matches && localStorage.getItem('darkMode') !== 'false');
    setDarkMode(isDark);
  }, []);

  // 应用主题变化
  useEffect(() => {
    // 应用暗黑模式类到根元素
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    // 保存用户偏好到本地存储
    localStorage.setItem('darkMode', darkMode);
  }, [darkMode]);

  // 切换主题函数
  const toggleDarkMode = () => {
    setDarkMode(prevMode => !prevMode);
  };

  return {
    darkMode,
    toggleDarkMode
  };
};

export default useTheme;