/**
 * Sidebar - 侧边栏组件
 */
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, MessageSquare, ChevronLeft, ChevronRight, FileText } from 'lucide-react';
import DocumentUpload from './DocumentUpload';

const Sidebar = ({ 
  conversations, 
  currentConversationId, 
  onNewConversation, 
  onSelectConversation, 
  isCollapsed, 
  onToggleCollapse,
  ragMode,
  onRagModeChange
}) => {
  const [showUploadPanel, setShowUploadPanel] = useState(false);

  return (
    <div className={`${isCollapsed ? 'w-16' : 'w-80'} flex flex-col bg-gradient-to-b from-gray-50/80 via-gray-50/60 to-gray-100/60 dark:from-gray-900 dark:via-gray-900/90 dark:to-gray-800 border-r border-gray-200/50 dark:border-gray-800/60 transition-all duration-300 ease-out backdrop-blur-sm`}>
      {/* 顶部区域 */}
      <div className="flex-shrink-0 p-4">
        <div className="flex items-center justify-between mb-4">
          <div className={`transition-all duration-300 ${isCollapsed ? 'opacity-0 w-0' : 'opacity-100 w-auto'} overflow-hidden`}>
            {!isCollapsed && (
              <div className="space-y-1">
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
        
        {/* 折叠状态下的新建按钮*/}
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
                
                {/* 对话内容 - 只在非折叠状态显示*/}
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
      
      {/* 底部功能区*/}
      {!isCollapsed && (
        <div className="p-4 border-t border-gray-200/50 dark:border-gray-800/60 space-y-3">
          {/* 文档上传按钮 */}
          <button
            onClick={() => setShowUploadPanel(!showUploadPanel)}
            className={`w-full flex items-center justify-center py-2.5 px-4 rounded-xl text-sm font-medium transition-all duration-200 ${
              showUploadPanel
                ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            <FileText size={16} className="mr-2" />
            文档管理
          </button>
          
          {/* 文档上传面板 */}
          {showUploadPanel && (
            <div className="max-h-96 overflow-y-auto bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-3">
              <DocumentUpload 
                ragMode={ragMode}
                onRagModeChange={onRagModeChange}
                onFilesUploaded={(files) => {
                  console.log('Files uploaded:', files);
                }}
              />
            </div>
          )}
          
          <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
            共{conversations.length} 个对话
          </div>
        </div>
      )}
    </div>
  );
};

export default Sidebar;
