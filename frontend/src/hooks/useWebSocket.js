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
  const heartbeatTimerRef = useRef(null);
  const reconnectTimerRef = useRef(null);
  const reconnectAttemptRef = useRef(0);

  const clearHeartbeat = () => {
    if (heartbeatTimerRef.current) {
      clearInterval(heartbeatTimerRef.current);
      heartbeatTimerRef.current = null;
    }
  };

  const startHeartbeat = () => {
    clearHeartbeat();
    heartbeatTimerRef.current = setInterval(() => {
      const ws = websocketRef.current;
      if (ws && ws.readyState === WebSocket.OPEN) {
        try {
          ws.send(JSON.stringify({ type: 'ping', t: Date.now() }));
        } catch (e) {
          // ignore
        }
      }
    }, 20000); // 20s 心跳
  };

  const scheduleReconnect = useCallback(() => {
    if (reconnectTimerRef.current) return;
    const attempt = reconnectAttemptRef.current + 1;
    reconnectAttemptRef.current = attempt;
    const delay = Math.min(1000 * Math.pow(2, attempt - 1), 15000); // 指数退避，最大15s
    reconnectTimerRef.current = setTimeout(() => {
      reconnectTimerRef.current = null;
      connectWebSocket();
    }, delay);
  }, []);

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
      try { websocketRef.current.close(); } catch {}
      websocketRef.current = null;
    }
    clearHeartbeat();

    setIsConnecting(true);
    console.log('开始连接 WebSocket...');
    
    try {
      const ws = new WebSocket('ws://localhost:8000/chat');
      websocketRef.current = ws;

      ws.onopen = () => {
        console.log('WebSocket 连接成功');
        setIsConnecting(false);
        reconnectAttemptRef.current = 0;
        startHeartbeat();
      };

      ws.onmessage = (event) => {
        const chunk = event.data;
        if (chunk === 'pong') {
          // 心跳响应
          return;
        }
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
        clearHeartbeat();
        scheduleReconnect();
      };

      ws.onerror = (error) => {
        console.error('WebSocket 错误:', error);
        setIsConnecting(false);
        setIsTyping(false);
        activeConversationRef.current = null;
        try { ws.close(); } catch {}
        clearHeartbeat();
        scheduleReconnect();
      };
    } catch (error) {
      console.error('创建WebSocket连接失败:', error);
      setIsConnecting(false);
      scheduleReconnect();
    }
  }, [scheduleReconnect]);

  // 在组件挂载时连接 WebSocket
  useEffect(() => {
    // 初始连接
    connectWebSocket();
    
    // 设置定时检查连接状态（兜底）
    const connectionChecker = setInterval(() => {
      // 直接检查 WebSocket 状态
      if (!websocketRef.current || websocketRef.current.readyState === WebSocket.CLOSED) {
        console.log('检测到连接断开，自动重连...');
        connectWebSocket();
      }
    }, 20000); // 放宽到20秒，避免与心跳冲突
    
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
      clearHeartbeat();
      if (reconnectTimerRef.current) {
        clearTimeout(reconnectTimerRef.current);
        reconnectTimerRef.current = null;
      }
      if (websocketRef.current) {
        try { websocketRef.current.close(); } catch {}
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
      try { websocketRef.current.close(); } catch {}
      websocketRef.current = null;
    }
    reconnectAttemptRef.current = 0;
    setTimeout(() => {
      connectWebSocket();
    }, 100);
  };

  // 发送消息
  const sendMessage = (message, conversationId, useRag = false) => {
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
    
    // 构造消息对象，包含RAG控制标志
    const messageData = {
      message: message,
      use_rag: useRag
    };
    
    console.log('发送消息:', messageData);
    
    // 发送JSON格式的消息到 WebSocket
    websocketRef.current.send(JSON.stringify(messageData));
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