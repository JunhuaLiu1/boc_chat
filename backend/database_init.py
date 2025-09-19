"""
Database initialization script for BOCAI Chat MVP
Creates tables and security policies in Supabase PostgreSQL
"""

SUPABASE_SQL_SCHEMA = """
-- ===================================
-- BOCAI Chat MVP Database Schema
-- ===================================

-- 删除已存在的表（如果需要重建）
-- DROP TABLE IF EXISTS public.password_reset_tokens CASCADE;
-- DROP TABLE IF EXISTS public.user_sessions CASCADE;
-- DROP TABLE IF EXISTS public.users CASCADE;

-- 创建用户表
CREATE TABLE IF NOT EXISTS public.users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(100) NOT NULL,
  avatar_url VARCHAR(500),
  email_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_login_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT TRUE
);

-- 创建用户会话表
CREATE TABLE IF NOT EXISTS public.user_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  token_hash VARCHAR(255) NOT NULL,
  refresh_token_hash VARCHAR(255),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ip_address INET,
  user_agent TEXT
);

-- 创建密码重置令牌表
CREATE TABLE IF NOT EXISTS public.password_reset_tokens (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  token_hash VARCHAR(255) NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  used BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建更新时间触发器函数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- 为用户表添加更新时间触发器
DROP TRIGGER IF EXISTS update_users_updated_at ON public.users;
CREATE TRIGGER update_users_updated_at 
  BEFORE UPDATE ON public.users 
  FOR EACH ROW 
  EXECUTE PROCEDURE update_updated_at_column();

-- 创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_is_active ON public.users(is_active);
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON public.user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_expires_at ON public.user_sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_user_id ON public.password_reset_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_token_hash ON public.password_reset_tokens(token_hash);
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_expires_at ON public.password_reset_tokens(expires_at);

-- ===================================
-- 行级安全策略 (Row Level Security)
-- ===================================

-- 启用行级安全策略
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.password_reset_tokens ENABLE ROW LEVEL SECURITY;

-- 用户表安全策略
-- 注意：这些策略假设您使用的是 Supabase Auth 或类似的认证系统
-- 如果使用自定义认证，可能需要调整这些策略

-- 允许用户查看自己的信息
CREATE POLICY IF NOT EXISTS "Users can view own profile" ON public.users
  FOR SELECT 
  USING (auth.uid()::text = id::text);

-- 允许用户更新自己的信息
CREATE POLICY IF NOT EXISTS "Users can update own profile" ON public.users
  FOR UPDATE 
  USING (auth.uid()::text = id::text);

-- 允许注册新用户（如果需要公开注册）
CREATE POLICY IF NOT EXISTS "Enable insert for authenticated users only" ON public.users
  FOR INSERT 
  WITH CHECK (auth.role() = 'authenticated');

-- 用户会话表安全策略
CREATE POLICY IF NOT EXISTS "Users can view own sessions" ON public.user_sessions
  FOR SELECT 
  USING (auth.uid()::text = user_id::text);

CREATE POLICY IF NOT EXISTS "Users can insert own sessions" ON public.user_sessions
  FOR INSERT 
  WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY IF NOT EXISTS "Users can delete own sessions" ON public.user_sessions
  FOR DELETE 
  USING (auth.uid()::text = user_id::text);

-- 密码重置令牌表安全策略（仅服务端访问）
CREATE POLICY IF NOT EXISTS "Service role can manage reset tokens" ON public.password_reset_tokens
  FOR ALL 
  USING (auth.role() = 'service_role');

-- ===================================
-- 插入测试数据（可选）
-- ===================================

-- 如果需要测试数据，可以取消注释以下代码
-- 注意：这里的密码是 "password123" 的 bcrypt 哈希值
/*
INSERT INTO public.users (email, password_hash, name, email_verified, is_active)
VALUES 
  ('test@example.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RK.PmSsxG', '测试用户', true, true),
  ('admin@bocai.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RK.PmSsxG', 'BOCAI 管理员', true, true)
ON CONFLICT (email) DO NOTHING;
*/

-- ===================================
-- 完成设置
-- ===================================

-- 验证表是否创建成功
DO $$
BEGIN
  RAISE NOTICE 'Database schema setup completed successfully!';
  RAISE NOTICE 'Tables created:';
  RAISE NOTICE '  - public.users';
  RAISE NOTICE '  - public.user_sessions';
  RAISE NOTICE '  - public.password_reset_tokens';
  RAISE NOTICE 'Row Level Security policies enabled.';
END $$;
"""

if __name__ == "__main__":
    print("Supabase SQL Schema:")
    print("=" * 50)
    print(SUPABASE_SQL_SCHEMA)
    print("=" * 50)
    print("\nInstructions:")
    print("1. Copy the SQL above")
    print("2. Go to your Supabase Dashboard > SQL Editor")
    print("3. Paste and run the SQL")
    print("4. Verify tables are created successfully")
    print("\nNote: You may need to adjust RLS policies based on your authentication setup.")