import React, { useState, useRef, useEffect } from 'react';
import { Send } from 'lucide-react';

const InputBar = ({ onSend, disabled }) => {
  const [input, setInput] = useState('');
  const textareaRef = useRef(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (input.trim()) {
      onSend(input);
      setInput('');
      resetTextareaHeight();
    }
  };

  const handleKeyDown = (e) => {
    // 如果按下 Enter 键且没有按下 Shift 键，则发送消息
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  // 自动调整高度
  const adjustHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      const scrollHeight = Math.min(textarea.scrollHeight, 200); // 最大高度限制为200px
      textarea.style.height = scrollHeight + 'px';
    }
  };

  // 重置高度
  const resetTextareaHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
    }
  };

  // 处理输入变化
  const handleInputChange = (e) => {
    setInput(e.target.value);
    adjustHeight();
  };

  useEffect(() => {
    adjustHeight();
  }, []);

  return (
    <div className="px-6 py-3">
      <div className="max-w-5xl mx-auto">
        <form onSubmit={handleSubmit} className="relative">
        <div className="flex items-end bg-gray-50 dark:bg-gray-800 rounded-3xl border border-gray-200 dark:border-gray-600 p-4 gap-3 transition-all duration-200 hover:border-gray-300 dark:hover:border-gray-500 focus-within:border-blue-400 dark:focus-within:border-blue-500 focus-within:bg-white dark:focus-within:bg-gray-700 shadow-sm hover:shadow-md focus-within:shadow-md">
          {/* 输入框 */}
          <textarea
            ref={textareaRef}
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            className="flex-1 resize-none border-none outline-none bg-transparent text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 text-base leading-6 min-h-[24px] max-h-[200px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-slate-600"
            placeholder="请输入您的问题，我将为您提供专业的金融服务咨询..."
            disabled={disabled}
            rows={1}
            style={{ lineHeight: '24px' }}
          />

          {/* 发送按钮 */}
          <button
            type="submit"
            disabled={disabled || !input.trim()}
            className="p-3 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 dark:disabled:bg-gray-600 text-white rounded-2xl disabled:cursor-not-allowed transition-all duration-200 flex-shrink-0 shadow-sm hover:shadow-md transform hover:scale-105 disabled:transform-none"
            aria-label="发送消息"
          >
            <Send size={18} />
          </button>
        </div>
        </form>
      </div>
    </div>
  );
};

export default InputBar;