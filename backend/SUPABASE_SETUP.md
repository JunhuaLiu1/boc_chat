# Supabase 配置指南

## 环境变量配置

在项目根目录创建 `.env` 文件，并添加以下配置：

```bash
# Supabase 配置
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_KEY=your_supabase_service_key

# JWT 配置
JWT_SECRET_KEY=your-secret-key-change-in-production

# LLM 配置（可选）
DASHSCOPE_API_KEY=your_dashscope_api_key
```

## 获取 Supabase 配置信息

### 1. 创建 Supabase 项目
1. 访问 [Supabase](https://supabase.com)
2. 创建新项目
3. 等待项目初始化完成

### 2. 获取配置信息
在 Supabase 项目仪表板中：
- **Settings** → **API** → **Project URL** → 复制 `SUPABASE_URL`
- **Settings** → **API** → **Project API keys** → 复制 `anon public` 作为 `SUPABASE_ANON_KEY`
- **Settings** → **API** → **Project API keys** → 复制 `service_role secret` 作为 `SUPABASE_SERVICE_KEY`

## 数据库表结构

在 Supabase SQL 编辑器中执行以下 SQL 创建用户表：

```sql
-- 创建用户表
CREATE TABLE users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    email_verified BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_login_at TIMESTAMP WITH TIME ZONE
);

-- 创建用户会话表
CREATE TABLE user_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    token_hash VARCHAR(255) NOT NULL,
    refresh_token_hash VARCHAR(255),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建密码重置令牌表
CREATE TABLE password_reset_tokens (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    token_hash VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    used BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX idx_user_sessions_expires_at ON user_sessions(expires_at);
CREATE INDEX idx_password_reset_tokens_token_hash ON password_reset_tokens(token_hash);
CREATE INDEX idx_password_reset_tokens_expires_at ON password_reset_tokens(expires_at);

-- 启用行级安全策略 (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE password_reset_tokens ENABLE ROW LEVEL SECURITY;

-- 创建 RLS 策略
-- 用户只能访问自己的数据
CREATE POLICY "Users can view own profile" ON users FOR SELECT USING (auth.uid()::text = id::text);
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid()::text = id::text);

-- 会话管理策略
CREATE POLICY "Users can view own sessions" ON user_sessions FOR SELECT USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can insert own sessions" ON user_sessions FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);
CREATE POLICY "Users can delete own sessions" ON user_sessions FOR DELETE USING (auth.uid()::text = user_id::text);

-- 密码重置令牌策略
CREATE POLICY "Users can view own reset tokens" ON password_reset_tokens FOR SELECT USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can insert own reset tokens" ON password_reset_tokens FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);
CREATE POLICY "Users can update own reset tokens" ON password_reset_tokens FOR UPDATE USING (auth.uid()::text = user_id::text);
```

## 验证配置

启动应用后，检查日志中是否出现：
```
INFO:database:Supabase client initialized successfully
INFO:database:Supabase admin client initialized successfully
```

如果看到错误信息，请检查：
1. 环境变量是否正确设置
2. Supabase 项目是否正常运行
3. 网络连接是否正常

## 安全注意事项

1. **不要将 `.env` 文件提交到版本控制**
2. **在生产环境中使用强密钥**
3. **定期轮换 API 密钥**
4. **配置适当的 RLS 策略**
5. **监控 API 使用情况**

## 故障排除

### 常见错误

1. **"Missing SUPABASE_URL or SUPABASE_ANON_KEY"**
   - 检查 `.env` 文件是否存在且包含正确的环境变量

2. **"Failed to initialize Supabase client"**
   - 检查网络连接
   - 验证 Supabase 项目 URL 和密钥是否正确

3. **"Table 'users' doesn't exist"**
   - 确保已在 Supabase 中创建了必要的数据库表

4. **权限错误**
   - 检查 RLS 策略是否正确配置
   - 验证用户是否有适当的权限
