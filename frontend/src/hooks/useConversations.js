import { useState, useEffect } from 'react';

/**
 * 会话管理 Hook
 * 管理会话列表、当前会话、新建会话和本地存储
 */
const useConversations = () => {
  // 初始会话数据
  const initialConversations = [
    { 
      id: '1', 
      title: '新对话 1', 
      messages: [{ 
        id: 1, 
        text: "您好！我是中国银行江西省分行的大语言模型BOCAI，很高兴为您服务！有什么可以帮助您的吗？", 
        sender: 'ai', 
        timestamp: new Date().toISOString() 
      }] 
    },
    { 
      id: '2', 
      title: '新对话 2', 
      messages: [] 
    },
  ];

  const [conversations, setConversations] = useState(initialConversations);
  const [currentConversationId, setCurrentConversationId] = useState('1');

  // 从本地存储加载会话历史
  useEffect(() => {
    const savedConversations = localStorage.getItem('chatConversations');
    if (savedConversations) {
      try {
        const parsedConversations = JSON.parse(savedConversations);
        setConversations(parsedConversations);
      } catch (e) {
        console.error("Failed to parse saved conversations", e);
      }
    }
  }, []);

  // 保存会话历史到本地存储
  useEffect(() => {
    localStorage.setItem('chatConversations', JSON.stringify(conversations));
  }, [conversations]);

  // 获取当前会话
  const currentConversation = conversations.find(c => c.id === currentConversationId) || conversations[0];

  // 新建会话
  const handleNewConversation = () => {
    const newId = Date.now().toString();
    const newConversation = {
      id: newId,
      title: '新对话',
      messages: [{ 
        id: 1, 
        text: "您好！我是中国银行江西省分行的大语言模型BOCAI，很高兴为您服务！有什么可以帮助您的吗？", 
        sender: 'ai', 
        timestamp: new Date().toISOString() 
      }]
    };
    setConversations(prev => [newConversation, ...prev]);
    setCurrentConversationId(newId);
    return newId;
  };

  // 选择会话
  const handleSelectConversation = (id) => {
    setCurrentConversationId(id);
  };

  // 更新会话消息
  const updateConversationMessages = (conversationId, updater) => {
    setConversations(prevConvs => 
      prevConvs.map(conv => {
        if (conv.id === conversationId) {
          return updater(conv);
        }
        return conv;
      })
    );
  };

  // 添加消息到当前会话
  const addMessageToCurrentConversation = (message) => {
    updateConversationMessages(currentConversationId, (conv) => ({
      ...conv,
      messages: [...conv.messages, message]
    }));
  };

  // 更新会话标题（基于第一条用户消息）
  const updateConversationTitle = (conversationId, userMessage) => {
    updateConversationMessages(conversationId, (conv) => {
      let newTitle = conv.title;
      if (conv.title === '新对话' && conv.messages.length === 1) {
        // 取前15个字符作为标题，避免过长
        newTitle = userMessage.length > 15 ? userMessage.substring(0, 15) + '...' : userMessage;
      }
      return { ...conv, title: newTitle };
    });
  };

  return {
    conversations,
    currentConversation,
    currentConversationId,
    setConversations,
    handleNewConversation,
    handleSelectConversation,
    updateConversationMessages,
    addMessageToCurrentConversation,
    updateConversationTitle
  };
};

export default useConversations;