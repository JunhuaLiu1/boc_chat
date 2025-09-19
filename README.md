# BOCAI - 中国银行江西省分行智能对话系统

基于FastAPI + React的现代化对话AI系统，支持基础聊天和智能文档问答功能。

## 🚀 核心功能

### 1. 智能对话
- **基础聊天模式**: 使用阿里云Qwen-Turbo模型进行自然语言对话
- **实时流式响应**: WebSocket实现流式输出，提升用户体验
- **多会话管理**: 支持创建、切换和管理多个对话会话

### 2. 智能文档问答 (RAG)
- **文档上传**: 支持PDF、Word、Excel文档上传和解析
- **向量检索**: 基于语义相似度的智能文档检索
- **知识问答**: 基于上传文档内容进行专业问答
- **一键切换**: 便捷的RAG模式开关

## 🏗️ 技术架构

### 后端技术栈
- **FastAPI**: 高性能异步Web框架
- **WebSocket**: 实时双向通信
- **Qwen-Turbo**: 阿里云大语言模型
- **FAISS**: 高效向量相似度搜索
- **Sentence Transformers**: 文本向量化

### 前端技术栈
- **React 18**: 现代化前端框架
- **Vite**: 高速构建工具
- **Tailwind CSS**: 原子化CSS框架
- **Lucide React**: 现代图标库

### 文档处理
- **PDF解析**: PDFPlumber
- **Word文档**: python-docx
- **Excel表格**: openpyxl

## 📋 环境要求

- Python 3.9+
- Node.js 16+
- npm 或 yarn

## 🛠️ 快速开始

### 1. 后端启动

```bash
# 进入后端目录
cd backend

# 激活虚拟环境（如果使用conda）
conda activate bank-rag-mvp

# 安装依赖
pip install -r requirements.txt

# 设置环境变量（必须）
# 创建 .env 文件或设置环境变量
export API_KEY=your_qwen_api_key_here

# 启动后端服务
uvicorn app:app --host 0.0.0.0 --port 8000 --reload
```

### 3. 初始化数据库（首次运行时）

```bash
# 在 backend 目录下运行 SQLite 数据库初始化脚本
python init_sqlite_db.py
```

### 2. 前端启动

```bash
# 新建终端，进入前端目录
cd frontend

# 安装依赖
npm install

# 启动前端开发服务器
npm run dev
```

### 3. 访问应用

- 前端界面: http://localhost:3000 (或3001)
- 后端API: http://localhost:8000
- API文档: http://localhost:8000/docs

## 📝 使用指南

### 基础聊天模式
1. 打开应用后，默认进入普通聊天模式
2. 在输入框中输入问题，按Enter或点击发送
3. 系统将使用Qwen-Turbo模型生成回复

### 智能文档问答模式
1. 点击侧边栏的"文档管理"按钮
2. 上传PDF、Word或Excel文档
3. 启用"智能文档模式"开关
4. 基于上传的文档内容进行问答

### 文档上传
- 支持格式: PDF (.pdf), Word (.docx), Excel (.xlsx, .xls)
- 文件大小限制: 20MB
- 支持拖拽上传
- 支持批量上传

## 🔧 配置说明

### 环境变量

在backend目录下创建`.env`文件：

```env
# 阿里云DashScope API密钥（必须）
API_KEY=your_actual_api_key_here

# 可选配置
MAX_FILE_SIZE_BYTES=20971520  # 20MB
FAISS_INDEX_DIM=384
```

### API密钥获取
1. 访问 [阿里云DashScope](https://dashscope.aliyun.com/)
2. 注册并创建应用
3. 获取API密钥
4. 设置到环境变量中

## 🏗️ 项目结构

```
chat-mvp/
├── backend/                 # 后端代码
│   ├── services/           # 核心服务
│   │   ├── embeddings.py   # 文本向量化
│   │   ├── ingest.py       # 文档解析
│   │   └── vector_store.py # 向量存储
│   ├── app.py              # FastAPI主程序
│   ├── llm_client.py       # LLM客户端
│   └── requirements.txt    # Python依赖
├── frontend/               # 前端代码
│   ├── src/
│   │   ├── components/     # React组件
│   │   ├── hooks/          # 自定义Hooks
│   │   └── utils/          # 工具函数
│   ├── package.json        # Node.js依赖
│   └── vite.config.js      # Vite配置
└── docker-compose.yml      # Docker编排文件
```

## 🔍 API接口

### WebSocket接口
- `ws://localhost:8000/chat` - 实时聊天通信

### HTTP接口
- `GET /health` - 健康检查
- `POST /files` - 文档上传
- `GET /files` - 获取文档列表
- `DELETE /files/{doc_id}` - 删除文档
- `POST /search` - 文档检索

## 🎨 界面特性

- **现代化设计**: Apple/Notion风格的简洁界面
- **响应式布局**: 支持桌面和移动设备
- **暗黑模式**: 支持浅色/暗黑主题切换
- **流式输出**: 实时显示AI回复内容
- **文件管理**: 直观的文档上传和管理界面

## 🚨 注意事项

1. **API密钥安全**: 请勿将API密钥提交到版本控制系统
2. **文件大小**: 单个文件不超过20MB
3. **网络连接**: 需要稳定的网络连接访问Qwen API
4. **浏览器兼容**: 推荐使用Chrome、Firefox或Safari最新版本

## 🛠️ 开发调试

### 查看日志
```bash
# 后端日志
tail -f backend/logs/app.log

# 前端开发工具
# 在浏览器中按F12打开开发者工具
```

### 常见问题

1. **WebSocket连接失败**
   - 检查后端服务是否正常运行
   - 确认端口8000未被占用

2. **文档上传失败**
   - 检查文件格式和大小
   - 确认backend/storage目录权限

3. **API调用失败**
   - 检查API_KEY是否正确设置
   - 确认网络连接正常

## 📄 许可证

本项目仅供中国银行江西省分行内部使用。

## 👥 支持

如有问题或建议，请联系开发团队。