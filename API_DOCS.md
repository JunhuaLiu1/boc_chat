# BOCAI API 接口文档

本文档描述了 BOCAI 聊天系统的 HTTP API 和 WebSocket 接口。

## 目录

- [基础信息](#基础信息)
- [HTTP API](#http-api)
  - [健康检查](#健康检查)
  - [文件管理](#文件管理)
  - [搜索接口](#搜索接口)
- [WebSocket API](#websocket-api)
- [错误处理](#错误处理)
- [使用示例](#使用示例)

## 基础信息

**Base URL**: `http://localhost:8000` (开发环境)  
**Content-Type**: `application/json`  
**WebSocket URL**: `ws://localhost:8000/chat`

## HTTP API

### 健康检查

检查服务器状态。

**请求**
```http
GET /health
```

**响应**
```json
{
  "ok": true
}
```

---

### 文件管理

#### 上传文件

上传一个或多个文档文件用于 RAG 检索。

**请求**
```http
POST /files
Content-Type: multipart/form-data

files: [文件1, 文件2, ...]
```

**支持的文件格式**:
- PDF (`.pdf`)
- Word 文档 (`.docx`)
- Excel 表格 (`.xlsx`, `.xls`)

**文件限制**:
- 单个文件最大 20MB
- 文件不能为空

**响应**
```json
{
  "files": [
    {
      "doc_id": "uuid-string",
      "filename": "document.pdf",
      "size": 1024000
    }
  ]
}
```

**错误响应**
```json
{
  "detail": "Unsupported file type: .txt"
}
```

#### 获取文件列表

获取已上传的所有文件信息。

**请求**
```http
GET /files
```

**响应**
```json
{
  "files": [
    {
      "doc_id": "uuid-string",
      "original_filename": "document.pdf",
      "stored_filename": "uuid.pdf",
      "size": 1024000,
      "ext": "pdf",
      "path": "storage/uuid.pdf"
    }
  ]
}
```

#### 删除文件

删除指定的文档文件及其相关的向量数据。

**请求**
```http
DELETE /files/{doc_id}
```

**路径参数**:
- `doc_id`: 文档唯一标识符

**响应**
```json
{
  "ok": true
}
```

**错误响应**
```json
{
  "detail": "Document not found"
}
```

---

### 搜索接口

#### 语义搜索

在已上传的文档中进行语义搜索。

**请求**
```http
POST /search
Content-Type: application/json

{
  "query": "搜索查询内容",
  "top_k": 6
}
```

**请求参数**:
- `query` (string, required): 搜索查询文本
- `top_k` (integer, optional): 返回结果数量，默认 6

**响应**
```json
{
  "results": [
    {
      "doc_id": "uuid-string",
      "chunk_id": "uuid_0",
      "text": "相关文档内容片段...",
      "source": "document.pdf"
    }
  ]
}
```

**说明**:
- 结果按相似度排序
- 文本长度超过 300 字符时会被截断
- 返回结果不包含向量数据

---

## WebSocket API

### 聊天接口

建立 WebSocket 连接进行实时对话。

**连接**
```javascript
const ws = new WebSocket('ws://localhost:8000/chat');
```

#### 发送消息

**格式**: 纯文本字符串

**示例**:
```javascript
ws.send('你好，请帮我分析一下上传的文档');
```

#### 接收消息

服务器以流式方式返回 AI 回复的文本片段。

**格式**: 纯文本字符串 (增量内容)

**示例接收过程**:
```javascript
ws.onmessage = function(event) {
    console.log('收到片段:', event.data);
    // 将片段追加到完整回复中
};
```

#### 心跳检测

**发送心跳**:
```javascript
ws.send(JSON.stringify({ type: 'ping' }));
```

**心跳响应**:
```
pong
```

#### 连接管理

**连接事件**:
```javascript
ws.onopen = function() {
    console.log('WebSocket 连接已建立');
};

ws.onclose = function(event) {
    console.log('WebSocket 连接已关闭', event.code, event.reason);
};

ws.onerror = function(error) {
    console.error('WebSocket 错误:', error);
};
```

---

## 错误处理

### HTTP 错误状态码

| 状态码 | 含义 | 说明 |
|--------|------|------|
| 400 | Bad Request | 请求参数错误或文件格式不支持 |
| 404 | Not Found | 请求的资源不存在 |
| 500 | Internal Server Error | 服务器内部错误 |

### 错误响应格式

```json
{
  "detail": "错误描述信息"
}
```

### WebSocket 错误

WebSocket 连接可能因以下原因断开：
- 网络问题
- 服务器重启
- API 密钥问题
- 内部错误

客户端应实现自动重连机制。

---

## 使用示例

### 完整的 RAG 对话流程

```javascript
// 1. 上传文档
const formData = new FormData();
formData.append('files', file);

const uploadResponse = await fetch('/files', {
    method: 'POST',
    body: formData
});

const uploadResult = await uploadResponse.json();
console.log('上传成功:', uploadResult.files);

// 2. 建立 WebSocket 连接
const ws = new WebSocket('ws://localhost:8000/chat');

ws.onopen = function() {
    console.log('连接建立');
    // 3. 发送查询消息
    ws.send('请总结一下刚上传的文档内容');
};

// 4. 接收流式回复
let fullResponse = '';
ws.onmessage = function(event) {
    fullResponse += event.data;
    console.log('当前回复:', fullResponse);
};
```

### 搜索文档示例

```javascript
// 搜索相关内容
const searchResponse = await fetch('/search', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({
        query: '银行业务流程',
        top_k: 5
    })
});

const searchResults = await searchResponse.json();
console.log('搜索结果:', searchResults.results);
```

### Python 客户端示例

```python
import requests
import websocket
import json

# 上传文件
with open('document.pdf', 'rb') as f:
    files = {'files': f}
    response = requests.post('http://localhost:8000/files', files=files)
    print('上传结果:', response.json())

# WebSocket 连接
def on_message(ws, message):
    print('收到消息:', message)

def on_open(ws):
    print('连接建立')
    ws.send('你好，BOCAI')

ws = websocket.WebSocketApp('ws://localhost:8000/chat',
                           on_message=on_message,
                           on_open=on_open)
ws.run_forever()
```

---

## 技术说明

### RAG (Retrieval-Augmented Generation) 工作流程

1. **文档上传**: 文件被解析为文本块
2. **向量化**: 使用 sentence-transformers 生成向量表示
3. **存储**: 向量存储在 FAISS 索引中
4. **检索**: 用户查询时搜索相关文档块
5. **生成**: 将检索到的上下文与查询一起发送给 LLM

### 性能考虑

- 文件上传后需要时间进行向量化处理
- 大文件可能需要更长的处理时间
- WebSocket 连接建议实现心跳机制
- 生产环境建议增加文件大小和数量限制

### 安全建议

- 在生产环境中限制文件上传的来源
- 实现用户认证和授权
- 定期清理无用的文件和向量数据
- 监控 API 使用量以防止滥用