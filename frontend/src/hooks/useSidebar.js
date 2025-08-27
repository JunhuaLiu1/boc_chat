import { useState } from 'react';

/**
 * 侧边栏状态管理 Hook
 * 管理侧边栏的折叠/展开状态
 */
const useSidebar = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // 切换侧边栏折叠状态
  const toggleSidebarCollapse = () => {
    setIsSidebarCollapsed(prev => !prev);
  };

  // 展开侧边栏
  const expandSidebar = () => {
    setIsSidebarCollapsed(false);
  };

  // 折叠侧边栏
  const collapseSidebar = () => {
    setIsSidebarCollapsed(true);
  };

  return {
    isSidebarCollapsed,
    toggleSidebarCollapse,
    expandSidebar,
    collapseSidebar
  };
};

export default useSidebar;