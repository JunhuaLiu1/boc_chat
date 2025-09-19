﻿import React, { useState, useRef, useEffect } from 'react';
import { Send, Upload, X, AlertCircle, CheckCircle, Clock, Paperclip, Brain } from 'lucide-react';

const InputBar = ({ onSend, disabled, ragMode }) => {
  const [input, setInput] = useState('');
  const [uploading, setUploading] = useState(false);
  const [files, setFiles] = useState([]);
  const [uploadQueue, setUploadQueue] = useState([]); // { id, name, size, progress, status, xhr?, error? }
  const [isDragOver, setIsDragOver] = useState(false);
  const textareaRef = useRef(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (input.trim()) {
      onSend(input);
      setInput('');
      resetTextareaHeight();
    }
  };

  // 文件验证函数
  const validateFile = (file) => {
    const maxSize = 20 * 1024 * 1024; // 20MB
    const allowedTypes = ['pdf', 'docx', 'xlsx', 'xls'];
    const fileExt = file.name.split('.').pop()?.toLowerCase();
    
    if (!fileExt || !allowedTypes.includes(fileExt)) {
      return { valid: false, error: `不支持的文件格式: .${fileExt}` };
    }
    
    if (file.size > maxSize) {
      return { valid: false, error: `文件过大: ${(file.size / 1024 / 1024).toFixed(1)}MB > 20MB` };
    }
    
    return { valid: true };
  };

  // 文件选择处理函数
  const handleFilesSelected = (selectedFiles) => {
    if (!selectedFiles || selectedFiles.length === 0) return;
    
    // 预验证所有文件
    const validatedFiles = [];
    for (const file of selectedFiles) {
      const validation = validateFile(file);
      const fileId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      if (validation.valid) {
        validatedFiles.push({ file, id: fileId });
      } else {
        // 添加错误状态的文件到队列，显示错误信息
        setUploadQueue(prev => [...prev, {
          id: fileId,
          name: file.name,
          size: file.size,
          progress: 0,
          status: 'error',
          error: validation.error
        }]);
        
        // 3秒后移除错误信息
        setTimeout(() => {
          setUploadQueue(prev => prev.filter(item => item.id !== fileId));
        }, 3000);
      }
    }
    
    if (!validatedFiles.length) return;
    
    setUploading(true);
    
    // 初始化有效文件的队列条目
    setUploadQueue(prev => ([
      ...prev,
      ...validatedFiles.map(({ file, id }) => ({
        id,
        name: file.name,
        size: file.size,
        progress: 0,
        status: 'preparing'
      }))
    ]));
    
    // 异步处理上传
    processUploads(validatedFiles);
  };
  
  // 处理批量上传
  const processUploads = async (validatedFiles) => {
    // 并发上传文件（最多3个同时上传）
    const concurrentLimit = 3;
    
    for (let i = 0; i < validatedFiles.length; i += concurrentLimit) {
      const batch = validatedFiles.slice(i, i + concurrentLimit);
      const batchPromises = batch.map(({ file, id }) => uploadFile(file, id));
      await Promise.allSettled(batchPromises);
    }
    
    setUploading(false);
  };

  const handleFileChange = (e) => {
    const selected = Array.from(e.target.files || []);
    handleFilesSelected(selected);
    e.target.value = '';
  };

  // 拖拽处理函数
  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (disabled || uploading) return;
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    // 只有当鼠标真正离开输入框区域时才设置为false
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setIsDragOver(false);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    
    if (disabled || uploading) return;
    
    const droppedFiles = Array.from(e.dataTransfer.files);
    if (droppedFiles.length > 0) {
      handleFilesSelected(droppedFiles);
    }
  };

  // 单个文件上传函数
  const uploadFile = (file, fileId) => {
    return new Promise((resolve) => {
      // 更新状态为上传
      setUploadQueue(prev => prev.map(item =>
        item.id === fileId ? { ...item, status: 'uploading', progress: 0 } : item
      ));
      
      const form = new FormData();
      form.append('files', file);
      const xhr = new XMLHttpRequest();
      
      // 设置超时
      xhr.timeout = 60000; // 60秒超时
      xhr.open('POST', 'http://localhost:8000/files');
      
      // 上传进度监听
      xhr.upload.onprogress = (evt) => {
        if (evt.lengthComputable) {
          // 上传进度占总进度的70%
          const uploadPercent = Math.round((evt.loaded / evt.total) * 70);
          setUploadQueue(prev => prev.map(item => 
            item.id === fileId ? { 
              ...item, 
              progress: uploadPercent,
              status: uploadPercent >= 70 ? 'processing' : 'uploading'
            } : item
          ));
        }
      };
      
      // xhr 存入队列，便于取用
      setUploadQueue(prev => prev.map(item =>
        item.id === fileId ? { ...item, xhr } : item
      ));
      
      xhr.onload = () => {
        try {
          if (xhr.status >= 200 && xhr.status < 300) {
            const data = JSON.parse(xhr.responseText || '{}');
            
            // 模拟处理进度
            let processingProgress = 70;
            const processingInterval = setInterval(() => {
              processingProgress += Math.random() * 5;
              if (processingProgress >= 95) {
                processingProgress = 95;
              }
              
              setUploadQueue(prev => prev.map(item => 
                item.id === fileId ? { 
                  ...item, 
                  progress: Math.round(processingProgress),
                  status: 'processing'
                } : item
              ));
            }, 200);
            
            // 完成处理
            setTimeout(() => {
              clearInterval(processingInterval);
              
              if (data && Array.isArray(data.files)) {
                setFiles(prev => [...prev, ...data.files]);
              }
              
              setUploadQueue(prev => prev.map(item => 
                item.id === fileId ? { 
                  ...item, 
                  progress: 100, 
                  status: 'done', 
                  xhr: undefined 
                } : item
              ));
              
              // 2秒后移除成功信息
              setTimeout(() => {
                setUploadQueue(prev => prev.filter(item => item.id !== fileId));
              }, 2000);
              
              resolve();
            }, 1000 + Math.random() * 2000); // 1-3秒的处理时间
            
          } else {
            throw new Error(`HTTP ${xhr.status}: ${xhr.responseText}`);
          }
        } catch (err) {
          console.error('Upload parse error', err);
          setUploadQueue(prev => prev.map(item => 
            item.id === fileId ? { 
              ...item, 
              status: 'error', 
              error: err.message || '上传失败',
              xhr: undefined 
            } : item
          ));
          
          // 5秒后移除错误信息
          setTimeout(() => {
            setUploadQueue(prev => prev.filter(item => item.id !== fileId));
          }, 5000);
          
          resolve();
        }
      };
      
      xhr.onerror = () => {
        console.error('Upload network error');
        setUploadQueue(prev => prev.map(item => 
          item.id === fileId ? { 
            ...item, 
            status: 'error', 
            error: '网络错误，请检查连接',
            xhr: undefined 
          } : item
        ));
        
        setTimeout(() => {
          setUploadQueue(prev => prev.filter(item => item.id !== fileId));
        }, 5000);
        
        resolve();
      };
      
      xhr.ontimeout = () => {
        console.error('Upload timeout');
        setUploadQueue(prev => prev.map(item => 
          item.id === fileId ? { 
            ...item, 
            status: 'error', 
            error: '上传超时，请重试',
            xhr: undefined 
          } : item
        ));
        
        setTimeout(() => {
          setUploadQueue(prev => prev.filter(item => item.id !== fileId));
        }, 5000);
        
        resolve();
      };
      
      xhr.send(form);
    });
  };

  const handleCancelUpload = (fileId) => {
    setUploadQueue(prev => {
      const item = prev.find(i => i.id === fileId);
      if (item && item.xhr && (item.status === 'uploading' || item.status === 'processing' || item.status === 'preparing')) {
        try { 
          item.xhr.abort(); 
        } catch (e) {
          console.warn('Failed to abort xhr:', e);
        }
      }
      return prev.map(i => i.id === fileId ? { ...i, status: 'cancelled', xhr: undefined } : i);
    });
    
    // 立即移除取消的项
    setTimeout(() => {
      setUploadQueue(prev => prev.filter(i => i.id !== fileId));
    }, 100);
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

  // load existing files on mount
  useEffect(() => {
    const loadFiles = async () => {
      try {
        const resp = await fetch('http://localhost:8000/files');
        if (!resp.ok) return;
        const data = await resp.json();
        setFiles(data.files || []);
      } catch (e) {
        console.warn('Failed to load files', e);
      }
    };
    loadFiles();
  }, []);

  const handleDeleteFile = async (docId) => {
    try {
      const resp = await fetch(`http://localhost:8000/files/${docId}`, { method: 'DELETE' });
      if (!resp.ok) throw new Error('Delete failed');
      setFiles(prev => prev.filter(f => (f.doc_id || f.id) !== docId));
    } catch (e) {
      console.error('Delete error', e);
      alert('删除失败');
    }
  };

  return (
    <div className="px-6 py-3">
      <div className="max-w-5xl mx-auto">
        <form onSubmit={handleSubmit} className="relative">
        <div 
          className={`flex items-end rounded-3xl border p-4 gap-3 transition-all duration-200 shadow-sm ${
            isDragOver 
              ? 'border-blue-400 bg-blue-50 dark:bg-blue-900/20 shadow-lg scale-[1.01]'
              : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 focus-within:border-blue-400 dark:focus-within:border-blue-500 focus-within:bg-white dark:focus-within:bg-gray-700 hover:shadow-md focus-within:shadow-md'
          }`}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          {/* 文件上传按钮 */}
          <label className={`flex-shrink-0 cursor-pointer p-2 rounded-xl text-sm transition-all duration-200 flex items-center justify-center ${
            uploading 
              ? 'bg-gray-200 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed' 
              : isDragOver
              ? 'bg-blue-100 dark:bg-blue-800 text-blue-600 dark:text-blue-400'
              : 'bg-transparent text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-800 dark:hover:text-gray-200'
          }`} title={isDragOver ? "释放文件上传" : "上传文档（PDF/Word/Excel）"}>
            <Paperclip size={18} />
            <input 
              type="file" 
              className="hidden" 
              multiple 
              accept=".pdf,.docx,.xlsx,.xls" 
              onChange={handleFileChange} 
              disabled={disabled || uploading} 
            />
          </label>
          {/* 输入框 */}
          <textarea
            ref={textareaRef}
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            className="flex-1 resize-none border-none outline-none bg-transparent text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 text-base leading-6 min-h-[24px] max-h-[200px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-slate-600"
            placeholder={isDragOver ? "📁 释放文件开始上传..." : ragMode ? "🧠 已启用智能文档模式，可基于上传的文档进行问答..." : "请输入您的问题，我将为您提供专业的金融服务咨询..."}
            disabled={disabled}
            rows={1}
            style={{ lineHeight: '24px' }}
          />

          {/* RAG模式指示器 */}
          {ragMode && (
            <div className="flex-shrink-0 flex items-center px-2 py-1 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-blue-700 dark:text-blue-300 text-xs font-medium">
              <Brain size={14} className="mr-1" />
              智能文档
            </div>
          )}

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
        {/* 上传进度与已复制代码上传文件 */}
        {(!!uploadQueue.length || !!files.length) && (
          <div className="mt-3 space-y-2">
            {/* 上传队列 */}
            {!!uploadQueue.length && (
              <div className="space-y-2">
                {uploadQueue.map(item => {
                  const isActive = ['preparing', 'uploading', 'processing'].includes(item.status);
                  const canCancel = ['preparing', 'uploading', 'processing'].includes(item.status);
                  
                  const getStatusInfo = () => {
                    switch (item.status) {
                      case 'preparing':
                        return { icon: <Clock size={12} className="text-blue-500" />, text: '准备中', color: 'text-blue-600' };
                      case 'uploading':
                        return { icon: <Upload size={12} className="text-blue-500" />, text: `${item.progress}%`, color: 'text-blue-600' };
                      case 'processing':
                        return { icon: <Clock size={12} className="text-orange-500 animate-spin" />, text: `${item.progress}%`, color: 'text-orange-600' };
                      case 'done':
                        return { icon: <CheckCircle size={12} className="text-green-500" />, text: '完成', color: 'text-green-600' };
                      case 'error':
                        return { icon: <AlertCircle size={12} className="text-red-500" />, text: '失败', color: 'text-red-600' };
                      case 'cancelled':
                        return { icon: <X size={12} className="text-gray-500" />, text: '取消', color: 'text-gray-600' };
                      default:
                        return { icon: null, text: item.status, color: 'text-gray-600' };
                    }
                  };
                  
                  const statusInfo = getStatusInfo();
                  const formatFileSize = (bytes) => {
                    if (bytes === 0) return '0B';
                    const k = 1024;
                    const sizes = ['B', 'KB', 'MB', 'GB'];
                    const i = Math.floor(Math.log(bytes) / Math.log(k));
                    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + sizes[i];
                  };
                  
                  return (
                    <div key={item.id} className={`rounded-lg p-2 border text-xs transition-all duration-200 ${
                      item.status === 'error' ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800' :
                      item.status === 'done' ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' :
                      'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700'
                    }`}>
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                          <span className="truncate font-medium text-gray-900 dark:text-white max-w-[140px]">
                            {item.name}
                          </span>
                          <span className="text-gray-500 dark:text-gray-400 text-xs flex-shrink-0">
                            {formatFileSize(item.size)}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <div className={`flex items-center gap-1 ${statusInfo.color}`}>
                            {statusInfo.icon}
                            <span className="text-xs">{statusInfo.text}</span>
                          </div>
                          
                          {canCancel && (
                            <button 
                              type="button" 
                              className="p-0.5 text-gray-400 hover:text-red-500 rounded transition-colors"
                              onClick={() => handleCancelUpload(item.id)}
                              title="取消"
                            >
                              <X size={12} />
                            </button>
                          )}
                        </div>
                      </div>
                      
                      {/* 紧凑进度条 */}
                      {isActive && (
                        <div className="w-full h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                          <div 
                            className={`h-1 transition-all duration-300 rounded-full ${
                              item.status === 'error' ? 'bg-red-500' :
                              item.status === 'processing' ? 'bg-orange-500' :
                              'bg-blue-500'
                            }`} 
                            style={{ width: `${Math.min(item.progress, 100)}%` }} 
                          />
                        </div>
                      )}
                      
                      {/* 错误信息 */}
                      {item.status === 'error' && item.error && (
                        <div className="mt-1 text-red-600 dark:text-red-400 text-xs">
                          {item.error}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
            
            {/* 已上传文件 */}
            {!!files.length && (
              <div className="flex flex-wrap gap-1">
                {files.map((f) => {
                  const id = f.doc_id || f.id;
                  const name = f.filename || f.original_filename;
                  return (
                    <span key={id} className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 rounded-md text-xs">
                      <span className="max-w-[120px] truncate">{name}</span>
                      {id && (
                        <button 
                          type="button" 
                          className="text-blue-500 hover:text-red-500 transition-colors" 
                          onClick={() => handleDeleteFile(id)}
                          title="删除文件"
                        >
                          <X size={12} />
                        </button>
                      )}
                    </span>
                  );
                })}
              </div>
            )}
          </div>
        )}
        </form>
      </div>
    </div>
  );
};

export default InputBar;