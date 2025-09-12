# BOCAI - 中国银行江西省分行大语言模型

基于 BOCAI 大语言模型的智能对话系统，为中国银行江西省分行提供专业的AI对话服务。本项目采用现代化的前后端分离架构，支持实时通信、多会话管理和响应式设计。

## ✨ 主要特性

- 🚀 **实时对话**：基于 WebSocket 的流式响应，支持打字机效果
- 💬 **多会话管理**：支持创建、切换和管理多个对话会话
- 🎨 **现代化UI**：采用 Apple/Notion 风格设计，支持暗黑主题切换
- 📱 **响应式设计**：完美适配桌面端和移动端
- 🔧 **组件化架构**：高度模块化的前端组件系统，7个核心UI组件 + 4个自定义Hooks
- 🔒 **安全配置**：环境变量管理API密钥，完整的安全使用指南
- 📝 **Markdown支持**：完整支持 Markdown 渲染和代码高亮
- 🔌 **智能连接管理**：WebSocket 自动重连、连接状态监控
- 🎯 **品牌定制**：BOCAI 品牌定制化界面，企业级UI设计
- 🐳 **容器化部署**：Docker + Nginx 生产级部署方案

## 🏗️ 项目架构

```
chat-mvp/
├── backend/                 # FastAPI 后端服务
│   ├── app.py              # 主应用程序，WebSocket端点
│   ├── llm_client.py       # LLM API客户端
│   ├── requirements.txt    # Python依赖
│   └── Dockerfile         # 后端容器化配置
├── frontend/               # React 前端应用
│   ├── public/
│   │   ├── index.html     # 主页面模板
│   │   └── test-websocket.html  # WebSocket测试页面
│   ├── src/
│   │   ├── App.jsx        # 根组件
│   │   ├── components/    # UI组件目录
│   │   │   ├── BocaiIcon.jsx      # BOCAI品牌图标
│   │   │   ├── ChatBox.jsx        # 聊天窗口组件
│   │   │   ├── ConnectionStatus.jsx # 连接状态显示
│   │   │   ├── Header.jsx         # 顶部标题栏
│   │   │   ├── InputBar.jsx       # 消息输入框
│   │   │   ├── MessageBubble.jsx  # 消息气泡组件
│   │   │   └── Sidebar.jsx        # 侧边栏组件
│   │   ├── hooks/         # 自定义Hooks
│   │   │   ├── useConversations.js # 会话管理
│   │   │   ├── useSidebar.js      # 侧边栏状态
│   │   │   ├── useTheme.js        # 主题切换
│   │   │   └── useWebSocket.js    # WebSocket连接管理
│   │   ├── utils/         # 工具函数
│   │   │   └── localStorageManager.js # 本地存储管理
│   │   ├── index.css      # 全局样式
│   │   ├── index.js       # 应用入口
│   │   └── main.jsx       # Vite入口文件
│   ├── package.json       # 前端依赖配置
│   ├── vite.config.js     # Vite构建配置
│   ├── tailwind.config.js # Tailwind CSS配置
│   ├── postcss.config.js  # PostCSS配置
│   └── Dockerfile         # 前端容器化配置
├── nginx/                  # Nginx反向代理
│   └── nginx.conf         # Nginx配置文件
├── docker-compose.yml      # 容器编排配置
├── API_SECURITY_GUIDE.md   # API安全使用指南
├── ui_design.md           # UI设计规范文档
└── README.md              # 项目说明文档
```

## 🚀 快速开始

### 📋 环境要求

**开发环境：**
- Python 3.9+
- Node.js 16+
- Conda (推荐用于Python环境管理)

**生产部署：**
- Docker
- Docker Compose

### 🔑 API密钥配置

本应用使用阿里云通义千问(Qwen) API。请先获取API密钥：[DashScope控制台](https://dashscope.aliyuncs.com/)

**⚠️ 重要安全提醒：**
- 永远不要将API密钥硬编码到源代码中
- 请参考 `API_SECURITY_GUIDE.md` 了解安全配置方法
- 使用环境变量或.env文件管理敏感配置

#### 本地开发配置

1. **创建环境变量文件**
   ```bash
   # 在backend目录下创建.env文件
   cd backend
   echo "API_KEY=your_actual_api_key_here" > .env
   ```

#### Docker部署配置

1. **设置环境变量**
   ```bash
   # Linux/macOS
   export API_KEY=your_actual_api_key_here
   
   # Windows
   set API_KEY=your_actual_api_key_here
   ```

### 🐳 Docker部署（推荐）

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
# Nginx代理: http://localhost
```

### 💻 本地开发部署

#### 后端服务启动

```bash
# 1. 激活Conda环境
conda activate bank-rag-mvp

# 2. 进入后端目录
cd backend

# 3. 安装Python依赖
pip install -r requirements.txt

# 4. 配置API密钥（创建.env文件）
echo "API_KEY=your_actual_api_key_here" > .env

# 5. 启动后端服务
uvicorn app:app --host 0.0.0.0 --port 8000
```

#### 前端服务启动

```bash
# 1. 新开终端，进入前端目录
cd frontend

# 2. 安装Node.js依赖
npm install

# 3. 启动开发服务器
npm run dev

# 4. 访问应用: http://localhost:3000
```

#### 🔍 连接测试

1. **访问主应用**: `http://localhost:3000`
2. **WebSocket测试页面**: `http://localhost:3000/test-websocket.html`
3. **开发者工具测试**:
   ```javascript
   // 在浏览器控制台执行
   const ws = new WebSocket('ws://localhost:8000/chat');
   ws.onopen = () => { console.log('✅ 连接成功'); ws.send('Hello BOCAI!'); };
   ws.onmessage = (e) => console.log('📨 收到消息:', e.data);
   ws.onerror = (e) => console.error('❌ 连接错误:', e);
   ```

## 🔧 技术架构详解

### 🐍 后端服务 (Backend)

**技术栈**: FastAPI + WebSocket + 阿里云通义千问API

- **`app.py`**: FastAPI主应用，提供WebSocket端点 `/chat`
- **`llm_client.py`**: 封装阿里云DashScope API调用逻辑
- **流式响应**: 支持实时流式输出，提供打字机效果
- **错误处理**: 完整的异常处理和日志记录

### ⚛️ 前端服务 (Frontend)

**技术栈**: React 18 + Vite + Tailwind CSS + Lucide Icons

**核心组件**:
- **BocaiIcon**: BOCAI品牌定制图标
- **Sidebar**: 会话管理侧边栏，支持折叠展开
- **ChatBox**: 聊天窗口，支持Markdown渲染
- **InputBar**: 消息输入框，支持多行输入
- **MessageBubble**: 消息气泡，区分用户和AI消息
- **Header**: 顶部标题栏，包含主题切换
- **ConnectionStatus**: WebSocket连接状态指示器

**自定义Hooks**:
- **useWebSocket**: WebSocket连接管理，自动重连机制
- **useConversations**: 多会话状态管理，localStorage持久化
- **useTheme**: 暗黑/浅色主题切换
- **useSidebar**: 侧边栏状态管理

**UI设计特色**:
- Apple/Notion风格设计语言
- 响应式布局，支持移动端
- 流畅的动画过渡效果
- 企业级品牌定制界面

### 🌐 反向代理 (Nginx)

- **静态文件服务**: 高效提供前端构建产物
- **WebSocket代理**: 将 `/chat` 路径代理到后端
- **负载均衡**: 支持生产环境多实例部署

### 🐳 容器化部署

**服务编排**: 使用Docker Compose管理多容器服务
- **backend**: 后端API服务 (端口8000)
- **frontend**: 前端开发服务器 (端口3000)
- **nginx**: 反向代理服务器 (端口80)

**依赖管理**: 确保服务启动顺序，避免连接失败

## 📚 开发指南

### 🛠️ 开发工具配置

**VS Code 推荐插件**:
- ES7+ React/Redux/React-Native snippets
- Tailwind CSS IntelliSense
- Python
- Docker

**代码格式化**:
- 前端: Prettier + ESLint
- 后端: Black + isort

### 🧪 测试说明

**单元测试**:
```bash
# 前端测试
cd frontend
npm test

# 后端测试
cd backend
python -m pytest
```

**集成测试**:
- WebSocket连接测试
- API端点测试
- UI组件交互测试

### 📝 代码规范

**前端规范**:
- 组件文件使用PascalCase命名
- Hook文件使用camelCase，以use开头
- 样式使用Tailwind CSS类名
- 保持组件单一职责，超过300行考虑拆分

**后端规范**:
- 遵循PEP 8 Python编码规范
- 使用类型注解
- 异步函数优先使用async/await

### 🔒 安全最佳实践

1. **API密钥管理**: 详见 `API_SECURITY_GUIDE.md`
2. **环境变量**: 使用.env文件，确保.gitignore包含敏感文件
3. **输入验证**: 后端进行数据验证和清理
4. **错误处理**: 不暴露敏感的系统信息

## 📖 相关文档

- [API安全使用指南](./API_SECURITY_GUIDE.md)
- [UI设计规范](./ui_design.md)
- [前端组件文档](./frontend/src/components/)
- [自定义Hooks文档](./frontend/src/hooks/)

## 🤝 贡献指南

1. Fork 项目仓库
2. 创建功能分支: `git checkout -b feature/amazing-feature`
3. 提交更改: `git commit -m 'Add some amazing feature'`
4. 推送到分支: `git push origin feature/amazing-feature`
5. 提交Pull Request

## 📄 许可证

本项目为中国银行江西省分行专有项目，仅供内部使用。

## 🆘 故障排除

**常见问题**:

1. **WebSocket连接失败**
   - 检查后端服务是否启动 (端口8000)
   - 确认防火墙设置
   - 查看浏览器控制台错误信息

2. **API密钥错误**
   - 验证.env文件配置
   - 检查DashScope控制台密钥状态
   - 确认环境变量正确设置

3. **前端构建失败**
   - 清除node_modules: `rm -rf node_modules && npm install`
   - 检查Node.js版本兼容性
   - 查看构建日志详细错误

4. **Docker部署问题**
   - 检查Docker Compose版本
   - 确认端口未被占用
   - 查看容器日志: `docker-compose logs`

**获取帮助**:
- 查看项目Issue页面
- 联系项目维护团队
- 参考相关技术文档