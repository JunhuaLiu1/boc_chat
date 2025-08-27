# 🔒 API 密钥安全使用指南

## 问题说明

**⚠️ 安全警告：永远不要将 API 密钥直接写在源代码中！**

这是一个严重的安全风险，可能导致：
- API 密钥泄露到 Git 仓库
- 恶意用户获取您的 API 访问权限
- 产生意外的 API 费用
- 违反服务提供商的安全政策

## ✅ 正确的做法

### 1. 使用环境变量

#### 步骤 1：创建 .env 文件
```bash
# 在项目根目录创建 .env 文件
cp .env.example .env
```

#### 步骤 2：设置真实的 API 密钥
编辑 `.env` 文件：
```bash
# 将 your_actual_api_key_here 替换为您的真实 API 密钥
API_KEY=sk-your-real-api-key-here
```

#### 步骤 3：确保 .env 文件被 Git 忽略
`.env` 文件已经在 `.gitignore` 中被忽略，确保不会被提交到版本控制。

### 2. 系统环境变量设置

#### Windows
```cmd
# 临时设置（当前命令行会话）
set API_KEY=sk-your-real-api-key-here

# 永久设置
setx API_KEY "sk-your-real-api-key-here"
```

#### Linux/macOS
```bash
# 临时设置（当前终端会话）
export API_KEY=sk-your-real-api-key-here

# 永久设置（添加到 ~/.bashrc 或 ~/.zshrc）
echo 'export API_KEY=sk-your-real-api-key-here' >> ~/.bashrc
source ~/.bashrc
```

### 3. Docker 环境设置

#### 方法 1：使用 .env 文件（推荐）
Docker Compose 会自动读取 `.env` 文件：
```yaml
# docker-compose.yml
services:
  backend:
    environment:
      - API_KEY=${API_KEY}
```

#### 方法 2：运行时传递
```bash
docker run -e API_KEY=sk-your-real-api-key-here your-app
```

## 🚫 错误做法示例

```python
# ❌ 错误：硬编码 API 密钥
API_KEY = "sk-152b60636b8d4e9ebecd87f7f3e1473c"

# ❌ 错误：在配置文件中明文存储
config = {
    "api_key": "sk-152b60636b8d4e9ebecd87f7f3e1473c"
}

# ❌ 错误：在注释中暴露
# API_KEY = "sk-152b60636b8d4e9ebecd87f7f3e1473c"  # 我的 API 密钥
```

## ✅ 正确做法示例

```python
# ✅ 正确：从环境变量读取
import os
API_KEY = os.getenv("API_KEY")

# ✅ 正确：验证密钥是否存在
if not API_KEY:
    raise ValueError("API_KEY environment variable is required")

# ✅ 正确：使用 python-dotenv
from dotenv import load_dotenv
load_dotenv()
API_KEY = os.getenv("API_KEY")
```

## 🔍 验证配置

启动应用时，如果 API 密钥未正确设置，您会看到类似错误：
```
ValueError: API_KEY environment variable is required. 
Please set your API key in environment variables or .env file. 
Example: export API_KEY=your_actual_api_key_here
```

## 📝 最佳实践清单

- [ ] ✅ 创建 `.env.example` 文件作为模板
- [ ] ✅ 将 `.env` 添加到 `.gitignore`
- [ ] ✅ 在代码中验证环境变量是否存在
- [ ] ✅ 在文档中说明如何设置环境变量
- [ ] ✅ 定期轮换 API 密钥
- [ ] ✅ 监控 API 密钥使用情况
- [ ] ✅ 在生产环境使用密钥管理服务

## 🆘 如果 API 密钥已经泄露

1. **立即撤销**：登录 API 提供商控制台，撤销泄露的密钥
2. **生成新密钥**：创建新的 API 密钥
3. **更新配置**：在所有环境中更新新密钥
4. **检查使用记录**：查看是否有异常 API 调用
5. **更新代码**：确保新代码正确使用环境变量

## 📞 获取 API 密钥

请访问 [阿里云 DashScope](https://dashscope.aliyun.com/) 获取您的 API 密钥。