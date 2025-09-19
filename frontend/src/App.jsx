import React, { useRef, useEffect, useState } from 'react';
import Sidebar from './components/Sidebar';
import ChatBox from './components/ChatBox';
import InputBar from './components/InputBar';
import Header from './components/Header';
import ConnectionStatus from './components/ConnectionStatus';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './hooks/useAuth';
import useTheme from './hooks/useTheme';
import useConversations from './hooks/useConversations';
import useWebSocket from './hooks/useWebSocket';
import useSidebar from './hooks/useSidebar';

const App = () => {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
};

const MainApp = () => {
  const messagesEndRef = useRef(null);
  const [ragMode, setRagMode] = useState(false); // RAG模式状态
  
  // 使用自定义Hooks 管理不同的功能模块
  const { darkMode, toggleDarkMode } = useTheme();
  const {
    conversations,
    currentConversation,
    currentConversationId,
    setConversations,
    handleNewConversation,
    handleSelectConversation,
    updateConversationMessages,
    updateConversationTitle
  } = useConversations();
  const { isSidebarCollapsed, toggleSidebarCollapse, expandSidebar } = useSidebar();
  const {
    isConnecting,
    isTyping,
    getConnectionStatus,
    handleReconnect,
    sendMessage,
    setMessageHandlers
  } = useWebSocket();

  const messages = currentConversation.messages;

  // 设置 WebSocket 消息处理函数
  useEffect(() => {
    const handleWebSocketMessage = (chunk, activeConversationId) => {
      // 添加收到的内容到指定的会话
      updateConversationMessages(activeConversationId, (conv) => {
        const lastMessage = conv.messages[conv.messages.length - 1];
        if (lastMessage && lastMessage.sender === 'ai' && lastMessage.isStreaming) {
          // 更新正在流式传输的消息
          const updatedMessages = [...conv.messages];
          updatedMessages[updatedMessages.length - 1] = {
            ...lastMessage,
            text: lastMessage.text + chunk
          };
          return { ...conv, messages: updatedMessages };
        }
        return conv;
      });
    };

    const handleStreamEnd = (activeConversationId) => {
      updateConversationMessages(activeConversationId, (conv) => {
        const updatedMessages = [...conv.messages];
        const lastMessage = updatedMessages[updatedMessages.length - 1];
        if (lastMessage && lastMessage.sender === 'ai' && lastMessage.isStreaming) {
          updatedMessages[updatedMessages.length - 1] = {
            ...lastMessage,
            isStreaming: false
          };
          return { ...conv, messages: updatedMessages };
        }
        return conv;
      });
    };

    setMessageHandlers(handleWebSocketMessage, handleStreamEnd);
  }, [updateConversationMessages, setMessageHandlers]);

  // 处理新建会话时展开侧边栏
  const handleNewConversationWithSidebar = () => {
    const newId = handleNewConversation();
    // 在创建新会话时展开侧边栏
    if (isSidebarCollapsed) {
      expandSidebar();
    }
    return newId;
  };

  const handleSendMessage = (text) => {
    if (!text.trim()) {
      return;
    }

    const newUserMessage = {
      id: Date.now(),
      text: text,
      sender: 'user',
      timestamp: new Date().toISOString()
    };

    // 创建一个空的AI 消息用于流式响应
    const aiMessage = {
      id: Date.now() + 1,
      text: '',
      sender: 'ai',
      timestamp: new Date().toISOString(),
      isStreaming: true
    };

    // 更新当前会话的消息和标题
    updateConversationMessages(currentConversationId, (conv) => {
      return { 
        ...conv, 
        messages: [...conv.messages, newUserMessage, aiMessage] 
      };
    });

    // 如果是新对话且标题为默认值，则根据第一条用户消息设置标题
    if (currentConversation.title === '新对话' && currentConversation.messages.length === 1) {
      updateConversationTitle(currentConversationId, text);
    }
    
    // 发送消息到 WebSocket（根据RAG模式决定是否使用知识库）
    sendMessage(text, currentConversationId, ragMode);
  };

  return (
    <ProtectedRoute>
      <div className="flex h-screen bg-white dark:bg-gray-900">
        {/* 侧边栏*/}
        <Sidebar
          conversations={conversations}
          currentConversationId={currentConversationId}
          onNewConversation={handleNewConversationWithSidebar}
          onSelectConversation={handleSelectConversation}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={toggleSidebarCollapse}
          ragMode={ragMode}
          onRagModeChange={setRagMode}
        />

        {/* 主内容区域*/}
        <div className="flex flex-col flex-1 min-w-0">
          {/* 顶部导航栏*/}
          <Header 
            currentConversationTitle={currentConversation?.title}
            darkMode={darkMode}
            onToggleDarkMode={toggleDarkMode}
          />

          {/* 聊天区域 - 占满全部空间 */}
          <main className="flex-1 overflow-hidden bg-gray-50/50 dark:bg-gray-900/50 backdrop-blur-sm flex flex-col">
            {/* 消息区域 */}
            <div className="flex-1 overflow-hidden p-6">
              <ChatBox messages={messages} messagesEndRef={messagesEndRef} />
            </div>
            
            {/* 输入框区域*/}
            <div style={{ transform: 'translateY(-32px)' }}>
              <InputBar 
                onSend={handleSendMessage} 
                disabled={isConnecting || getConnectionStatus() !== 'connected'}
                ragMode={ragMode}
              />
              <ConnectionStatus 
                isConnecting={isConnecting}
                connectionStatus={getConnectionStatus()}
                onReconnect={handleReconnect}
              />
            </div>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default App;