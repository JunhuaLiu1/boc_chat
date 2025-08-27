import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * WebSocket 管理 Hook
 * 管理WebSocket连接、重连、消息处理和连接状态
 */
const useWebSocket = () => {
  const [isConnecting, setIsConnecting] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const websocketRef = useRef(null);
  const activeConversationRef = useRef(null); // 使用 ref 跟踪活跃会话

  // WebSocket 连接管理
  const connectWebSocket = useCallback(() => {
    // 防止重复连接
    if (websocketRef.current && websocketRef.current.readyState === WebSocket.OPEN) {
      console.log('WebSocket 已经连接，跳过');
      return;
    }
    
    // 防止在连接中时重复调用
    if (websocketRef.current && websocketRef.current.readyState === WebSocket.CONNECTING) {
      console.log('WebSocket 正在连接中，跳过');
      return;
    }

    // 清理之前的连接
    if (websocketRef.current) {
      websocketRef.current.close();
      websocketRef.current = null;
    }

    setIsConnecting(true);
    console.log('开始连接 WebSocket...');
    
    try {
      const ws = new WebSocket('ws://localhost:8000/chat');
      websocketRef.current = ws;

      ws.onopen = () => {
        console.log('WebSocket 连接成功');
        setIsConnecting(false);
      };

      ws.onmessage = (event) => {
        const chunk = event.data;
        const currentActiveId = activeConversationRef.current;
        console.log('收到消息块:', chunk, '目标会话:', currentActiveId);
        
        // 只在有活跃会话时处理消息
        if (!currentActiveId) {
          console.warn('没有活跃的会话，忽略消息');
          return;
        }
        
        // 这里需要外部传入消息处理函数
        if (window.handleWebSocketMessage) {
          window.handleWebSocketMessage(chunk, currentActiveId);
        }
        
        // 如果是空消息或特定结束标记，标记流式传输结束
        if (!chunk || chunk.trim() === '') {
          setIsTyping(false);
          activeConversationRef.current = null; // 清空活跃会话 ID
          if (window.handleStreamEnd) {
            window.handleStreamEnd(currentActiveId);
          }
        }
      };

      ws.onclose = (event) => {
        console.log('WebSocket 连接关闭', event.code, event.reason);
        setIsConnecting(false);
        setIsTyping(false);
        activeConversationRef.current = null;
      };

      ws.onerror = (error) => {
        console.error('WebSocket 错误:', error);
        setIsConnecting(false);
        setIsTyping(false);
        activeConversationRef.current = null;
      };
    } catch (error) {
      console.error('创建WebSocket连接失败:', error);
      setIsConnecting(false);
    }
  }, []);

  // 在组件挂载时连接 WebSocket
  useEffect(() => {
    // 初始连接
    connectWebSocket();
    
    // 设置定时检查连接状态
    const connectionChecker = setInterval(() => {
      // 直接检查 WebSocket 状态
      if (!websocketRef.current || websocketRef.current.readyState === WebSocket.CLOSED) {
        console.log('检测到连接断开，自动重连...');
        connectWebSocket();
      }
    }, 2000); // 每2秒检查一次
    
    // 监听页面可见性变化
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        // 页面变为可见时，检查连接状态
        if (!websocketRef.current || websocketRef.current.readyState === WebSocket.CLOSED) {
          console.log('页面变为可见，重新连接 WebSocket');
          connectWebSocket();
        }
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      clearInterval(connectionChecker);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (websocketRef.current) {
        websocketRef.current.close();
        websocketRef.current = null;
      }
    };
  }, [connectWebSocket]);

  // 检查连接状态
  const getConnectionStatus = () => {
    if (!websocketRef.current) {
      // 如果正在连接中，返回connecting状态
      return isConnecting ? 'connecting' : 'disconnected';
    }
    const state = websocketRef.current.readyState;
    switch (state) {
      case WebSocket.CONNECTING: return 'connecting';
      case WebSocket.OPEN: return 'connected';
      case WebSocket.CLOSING: return 'closing';
      case WebSocket.CLOSED: return 'disconnected';
      default: return 'unknown';
    }
  };

  // 手动重连
  const handleReconnect = () => {
    console.log('手动重连 WebSocket...');
    if (websocketRef.current) {
      websocketRef.current.close();
      websocketRef.current = null;
    }
    // 稍微延迟后重连，确保之前的连接完全关闭
    setTimeout(() => {
      connectWebSocket();
    }, 100);
  };

  // 发送消息
  const sendMessage = (message, conversationId) => {
    const connectionStatus = getConnectionStatus();
    if (!message.trim() || connectionStatus !== 'connected') {
      if (connectionStatus !== 'connected') {
        console.log('WebSocket 未连接，尝试重新连接...');
        handleReconnect();
      }
      return false;
    }

    // 设置当前活跃的会话 ID
    activeConversationRef.current = conversationId;
    setIsTyping(true);
    
    // 发送消息到 WebSocket
    websocketRef.current.send(message);
    return true;
  };

  // 设置消息处理函数
  const setMessageHandlers = (messageHandler, streamEndHandler) => {
    window.handleWebSocketMessage = messageHandler;
    window.handleStreamEnd = streamEndHandler;
  };

  return {
    isConnecting,
    isTyping,
    getConnectionStatus,
    handleReconnect,
    sendMessage,
    setMessageHandlers,
    activeConversationRef
  };
};

export default useWebSocket;