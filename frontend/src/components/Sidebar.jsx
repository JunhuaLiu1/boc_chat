import React from 'react';
import { Plus, MessageSquare, ChevronLeft, ChevronRight } from 'lucide-react';

const Sidebar = ({ conversations, currentConversationId, onNewConversation, onSelectConversation, isCollapsed, onToggleCollapse }) => {
  return (
    <div className={`${isCollapsed ? 'w-16' : 'w-72'} bg-gray-50/80 dark:bg-gray-900/95 backdrop-blur-sm h-full flex flex-col flex-shrink-0 border-r border-gray-200/60 dark:border-gray-700/50 transition-all duration-300 ease-in-out shadow-lg`}>
      {/* 顶部 Logo 和功能区 */}
      <div className="p-4 border-b border-gray-200/50 dark:border-gray-800/60">
        <div className="flex items-center justify-between">
          {/* Logo 区域 */}
          <div className={`flex items-center ${isCollapsed ? 'justify-center w-full' : 'space-x-4'}`}>
            <div className="w-10 h-10 bg-white dark:bg-gray-800 rounded-xl flex items-center justify-center shadow-lg border border-gray-200/50 dark:border-gray-700/50 overflow-hidden hover:shadow-xl transition-all duration-200 hover:scale-105">
              <img src="/images/logo1.png" alt="BOCAI Logo" className="w-8 h-8 object-contain" />
            </div>
            {!isCollapsed && (
              <div className="flex-1">
                <h1 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">BOCAI</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">中国银行江西省分行</p>
              </div>
            )}
          </div>
          
          {/* 折叠按钮 */}
          <button
            onClick={onToggleCollapse}
            className="p-1.5 rounded-xl hover:bg-white/60 dark:hover:bg-gray-800/60 transition-all duration-200 shadow-sm hover:shadow-md"
            aria-label={isCollapsed ? "展开侧边栏" : "折叠侧边栏"}
          >
            {isCollapsed ? <ChevronRight size={16} className="text-gray-600 dark:text-gray-400" /> : <ChevronLeft size={16} className="text-gray-600 dark:text-gray-400" />}
          </button>
        </div>
        
        {/* 模型名称显示 */}
        {!isCollapsed && (
          <div className="mt-4 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800/60 dark:to-gray-700/60 rounded-2xl shadow-sm border border-blue-100/50 dark:border-gray-700/40">
            <div className="flex items-center space-x-3 text-sm">
              <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse"></div>
              <div className="flex-1">
                <span className="text-gray-800 dark:text-gray-200 font-semibold">BOCAI-Turbo</span>
                <span className="text-green-600 dark:text-green-400 text-xs ml-2 font-medium">在线</span>
              </div>
            </div>
          </div>
        )}
        
        {/* 新建对话按钮 */}
        {!isCollapsed && (
          <button
            onClick={onNewConversation}
            className="w-full mt-4 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white py-3 px-4 rounded-xl flex items-center justify-center transition-all duration-200 text-sm font-semibold shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98]"
          >
            <Plus size={16} className="mr-2" />
            新建对话
          </button>
        )}
        
        {/* 折叠状态下的新建按钮 */}
        {isCollapsed && (
          <button
            onClick={onNewConversation}
            className="w-full mt-4 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 p-3 rounded-xl flex items-center justify-center transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98]"
            aria-label="新建对话"
          >
            <Plus size={16} className="text-white" />
          </button>
        )}
      </div>
      
      {/* 对话列表 */}
      <div className="flex-1 overflow-y-auto px-2 py-3">
        {!isCollapsed && (
          <div className="text-xs font-medium text-gray-500 dark:text-gray-400 px-3 mb-2">
            最近对话
          </div>
        )}
        
        <div className="space-y-1">
          {conversations.map((conversation) => (
            <div
              key={conversation.id}
              onClick={() => onSelectConversation(conversation.id)}
              className={`group relative p-3 rounded-xl cursor-pointer transition-all duration-200 ${
                conversation.id === currentConversationId
                  ? 'bg-blue-50/80 dark:bg-blue-900/30 border border-blue-200/60 dark:border-blue-800/60 shadow-sm'
                  : 'hover:bg-white/50 dark:hover:bg-gray-800/50 hover:shadow-sm'
              } ${isCollapsed ? 'mx-1' : ''}`}
            >
              <div className={`flex items-start ${isCollapsed ? 'justify-center' : 'space-x-3'}`}>
                {/* 消息图标 */}
                <div className="flex-shrink-0 mt-0.5">
                  <MessageSquare 
                    size={16} 
                    className={`${
                      conversation.id === currentConversationId
                        ? 'text-blue-600 dark:text-blue-400'
                        : 'text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300'
                    }`} 
                  />
                </div>
                
                {/* 对话内容 - 只在非折叠状态显示 */}
                {!isCollapsed && (
                  <div className="flex-1 min-w-0">
                    <div className={`font-medium text-sm truncate ${
                      conversation.id === currentConversationId
                        ? 'text-blue-900 dark:text-blue-100'
                        : 'text-gray-900 dark:text-gray-100 group-hover:text-gray-900 dark:group-hover:text-white'
                    }`}>
                      {conversation.title || '新对话'}
                    </div>
                    {conversation.messages.length > 1 && (
                      <div className={`text-xs mt-1 truncate ${
                        conversation.id === currentConversationId
                          ? 'text-blue-600 dark:text-blue-300'
                          : 'text-gray-500 dark:text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300'
                      }`}>
                        {conversation.messages[conversation.messages.length - 1]?.text.substring(0, 40)}...
                      </div>
                    )}
                    <div className={`text-xs mt-1 ${
                      conversation.id === currentConversationId
                        ? 'text-blue-500 dark:text-blue-400'
                        : 'text-gray-400 dark:text-gray-500'
                    }`}>
                      {conversation.messages.length} 条消息
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* 底部信息 */}
      {!isCollapsed && (
        <div className="p-4 border-t border-gray-200/50 dark:border-gray-800/60">
          <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
            共 {conversations.length} 个对话
          </div>
        </div>
      )}
    </div>
  );
};

export default Sidebar;