# BOCAI - 中国银行江西省分行大语言模型

基于阿里云通义千问的智能对话系统，为中国银行江西省分行提供专业的AI对话服务。

## 主要特性

- 实时对话：WebSocket 流式响应，支持打字机效果
- 多会话管理：支持创建、切换和管理多个对话会话
- 现代化UI：Apple/Notion 风格设计，支持暗黑主题
- 响应式设计：完美适配桌面端和移动端
- 安全配置：环境变量管理 API 密钥
- Markdown 支持：完整支持 Markdown 渲染和代码高亮
- 容器化部署：Docker + Nginx 生产级部署方案

## 项目架构

```
chat-mvp/
├── backend/          # FastAPI 后端服务
├── frontend/         # React 前端应用
├── nginx/            # Nginx 反向代理
└── docker-compose.yml # 容器编排配置
```

## 快速开始

### 环境要求

- Python 3.9+
- Node.js 16+
- Docker (生产部署)

### API密钥配置

1. 获取阿里云通义千问 API 密钥：[DashScope控制台](https://dashscope.aliyuncs.com/)
2. 在 backend 目录下创建 .env 文件：
   ```bash
   cd backend
   echo "API_KEY=your_actual_api_key_here" > .env
   ```

### Docker部署（推荐）

```bash
# 1. 克隆项目
git clone <repository-url>
cd chat-mvp

# 2. 设置API密钥环境变量
export API_KEY=your_actual_api_key_here

# 3. 启动所有服务
docker-compose up --build

# 4. 访问应用
# 前端: http://localhost:3000
# 后端API: http://localhost:8000
```

### 本地开发部署

#### 后端服务

```bash
# 1. 激活Conda环境
conda activate bank-rag-mvp

# 2. 进入后端目录
cd backend

# 3. 安装依赖
pip install -r requirements.txt

# 4. 启动服务
uvicorn app:app --host 0.0.0.0 --port 800
```

#### 前端服务

```bash
# 1. 进入前端目录
cd frontend

# 2. 安装依赖
npm install

# 3. 启动开发服务器
npm run dev

# 4. 访问应用: http://localhost:3000
```

## 技术栈

- 后端：FastAPI + WebSocket + 阿里云通义千问API
- 前端：React 18 + Vite + Tailwind CSS
- 部署：Docker + Nginx

## 安全说明

请参考 `API_SECURITY_GUIDE.md` 了解 API 密钥安全配置方法。

## 许可证

本项目为中国银行江西省分行专有项目，仅供内部使用。