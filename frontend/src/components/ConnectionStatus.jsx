import React from 'react';

/**
 * 连接状态显示组件
 * 显示WebSocket连接状态和重连按钮
 */
const ConnectionStatus = ({ isConnecting, connectionStatus, onReconnect }) => {
  // 如果连接正常，不显示任何状态信息
  if (connectionStatus === 'connected' && !isConnecting) {
    return null;
  }

  return (
    <div className="text-center text-sm pb-4">
      {isConnecting && (
        <div className="text-gray-500">
          正在连接服务器...
        </div>
      )}
      {connectionStatus !== 'connected' && !isConnecting && (
        <div className="text-red-500">
          连接已断开，
          <button 
            onClick={onReconnect}
            className="text-blue-600 hover:text-blue-800 underline ml-1"
          >
            点击重试
          </button>
        </div>
      )}
    </div>
  );
};

export default ConnectionStatus;