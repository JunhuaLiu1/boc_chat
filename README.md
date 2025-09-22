# BOCAI - 智能对话系统

基于 FastAPI + React 的现代化AI对话系统，支持基础聊天和文档问答功能。

## ✨ 主要功能

- **智能对话**: 基于阿里云Qwen-Turbo的自然语言对话
- **文档问答**: 支持PDF/Word/Excel文档上传和智能检索
- **实时通信**: WebSocket流式响应
- **多会话管理**: 支持创建和管理多个对话会话

## 🛠️ 技术栈

**后端**: FastAPI + WebSocket + Qwen-Turbo + FAISS + SQLite  
**前端**: React 18 + Vite + Tailwind CSS  
**文档处理**: PDFPlumber + python-docx + openpyxl

## 🚀 快速开始

### 环境要求
- Python 3.9+
- Node.js 16+
- 阿里云DashScope API密钥

### 1. 环境配置
在 `backend/` 目录下创建 `.env` 文件：
```env
API_KEY=your_qwen_api_key_here
MAX_FILE_SIZE_BYTES=20971520
```

### 2. 后端启动
```bash
cd backend
pip install -r requirements.txt
python init_sqlite_db.py  # 初始化数据库
uvicorn app:app --host 0.0.0.0 --port 8000 --reload
```

### 3. 前端启动
```bash
cd frontend
npm install
npm run dev
```

### 4. 访问应用
- 前端界面: http://localhost:3000
- 后端API: http://localhost:8000
- API文档: http://localhost:8000/docs

## 🏗️ 项目结构

```
chat-mvp/
├── backend/          # FastAPI后端
│   ├── services/     # 核心服务（向量化、文档解析）
│   ├── models/       # 数据模型
│   ├── routes/       # API路由
│   └── app.py        # 主程序
├── frontend/         # React前端
│   └── src/
│       ├── components/  # UI组件
│       ├── hooks/       # 自定义Hooks
│       └── utils/       # 工具函数
└── docker-compose.yml # Docker部署
```

## 🔔 主要接口

- **WebSocket**: `ws://localhost:8000/chat` - 实时聊天
- **文件上传**: `POST /files` - 上传文档
- **文件管理**: `GET/DELETE /files` - 查看/删除文档
- **语义搜索**: `POST /search` - 文档检索
- **API文档**: http://localhost:8000/docs

## 🎨 特性

- 现代化设计（Apple/Notion风格）
- 响应式布局 + 暗黑模式
- 流式输出 + Markdown渲染
- 智能文档管理

## ⚠️ 注意事项

1. 需要有效的阿里云DashScope API密钥
2. 支持文件格式：PDF/Word/Excel，单文件最大20MB
3. 推荐使用现代浏览器（Chrome/Firefox/Safari）