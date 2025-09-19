import React from 'react';

const BocaiIcon = ({ size = 18, className = "" }) => {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* 外圈 - 代表银行的稳定?*/}
      <circle 
        cx="12" 
        cy="12" 
        r="10" 
        stroke="currentColor" 
        strokeWidth="2" 
        fill="none"
      />
      
      {/* 内部B字母设计 - 代表Bank和BOCAI */}
      <path 
        d="M8 7h4c1.5 0 2.5 1 2.5 2.2c0 0.8-0.4 1.5-1 1.8c0.8 0.3 1.5 1.1 1.5 2c0 1.5-1.2 2.5-2.8 2.5H8V7z M10 9v2h2c0.6 0 1-0.4 1-1s-0.4-1-1-1h-2z M10 13v2h2.2c0.7 0 1.3-0.6 1.3-1.3s-0.6-1.2-1.3-1.2H10z" 
        fill="currentColor"
      />
      
      {/* 装饰性元?- 代表智能和创?*/}
      <circle cx="17" cy="7" r="1.5" fill="currentColor" opacity="0.6" />
      <circle cx="7" cy="17" r="1" fill="currentColor" opacity="0.4" />
    </svg>
  );
};

export default BocaiIcon;


