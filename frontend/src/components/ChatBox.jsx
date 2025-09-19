import React, { useState, useRef, useEffect } from 'react';
import MessageBubble from './MessageBubble';

const ChatBox = ({ messages, messagesEndRef }) => {
  // 滚动到底部的函数
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // 当消息更新时滚动到底部
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className="h-full flex flex-col">
      {/* 聊天消息容器 - Apple/Notion 风格 */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-5xl mx-auto space-y-6">
          {messages.map((message) => (
            <MessageBubble key={message.id} message={message} />
          ))}
          <div ref={messagesEndRef} /> {/* 用于滚动定位的空 div */}
        </div>
      </div>
    </div>
  );
};

export default ChatBox;
