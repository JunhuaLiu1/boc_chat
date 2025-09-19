/**
 * MessageBubble - 消息气泡组件，支持 Markdown 和代码高亮
 */
import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Copy } from 'lucide-react';
import remarkGfm from 'remark-gfm';

// 自定义代码块组件
const CodeBlock = ({ children, className, node, ...rest }) => {
  const [copied, setCopied] = useState(false);
  const match = /language-(\w+)/.exec(className || '');
  
  const handleCopy = () => {
    navigator.clipboard.writeText(String(children).replace(/\n$/, ''));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group">
      <div className="flex items-center justify-between bg-gray-800 text-gray-200 px-4 py-2 text-sm rounded-t-lg border-b border-gray-600">
        <span>{match[1]}</span>
        <button
          onClick={handleCopy}
          className="flex items-center hover:text-blue-400 transition-all duration-200 px-2 py-1 rounded-lg hover:bg-gray-800/50"
          aria-label={copied ? "已复制" : "复制代码"}
        >
          <Copy size={14} className="mr-1" />
          {copied ? '已复制' : '复制代码'}
        </button>
      </div>
      <SyntaxHighlighter
        style={oneDark}
        language={match[1]}
        PreTag="div"
        showLineNumbers
        wrapLines
        {...rest}
      >
        {String(children).replace(/\n$/, '')}
      </SyntaxHighlighter>
    </div>
  );
};

const MessageBubble = ({ message }) => {
  const isUser = message.sender === 'user';

  return (
    <div className={`flex mb-6 ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`group relative ${isUser ? 'ml-8 max-w-[70%]' : 'mr-8 max-w-full w-full'}`}>
        {/* 虹化透明边缘效果 */}
        <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-white/10 to-transparent backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-300 -m-1"></div>
        
        <div
          className={`relative w-full rounded-3xl px-6 py-4 transition-all duration-200 shadow-sm hover:shadow-lg ${
            isUser
              ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white border border-blue-400/20 backdrop-blur-sm'
              : 'bg-white/80 dark:bg-gray-800/80 text-gray-800 dark:text-gray-100 border border-gray-200/50 dark:border-gray-700/50 backdrop-blur-sm'
          }`}
        >
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            code: CodeBlock,
            // 可以添加更多自定义组件，例如链接在新窗口打开
            a: ({node, ...props}) => <a target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline" {...props} />,
            // 添加其他 Markdown 元素的自定义样式
            h1: ({node, ...props}) => <h1 className="text-2xl font-bold my-2" {...props} />,
            h2: ({node, ...props}) => <h2 className="text-xl font-bold my-2" {...props} />,
            h3: ({node, ...props}) => <h3 className="text-lg font-bold my-2" {...props} />,
            p: ({node, children, ...props}) => {
              // 如果段落只包含简单文本，不添加额外的margin
              const isSimpleText = React.Children.count(children) === 1 && typeof children === 'string';
              return <p className={isSimpleText ? "leading-relaxed" : "my-2 leading-relaxed"} {...props}>{children}</p>;
            },
            ul: ({node, ...props}) => <ul className="list-disc pl-5 my-1" {...props} />,
            ol: ({node, ...props}) => <ol className="list-decimal pl-5 my-1" {...props} />,
          }}
        >
          {message.text}
        </ReactMarkdown>
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;
