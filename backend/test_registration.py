import asyncio
import sys
import os
import json
from dotenv import load_dotenv

# 加载环境变量
load_dotenv(override=True)

# 导入正确的类
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from database import SupabaseClient

async def test_create_user():
    # 初始化数据库连接
    db = SupabaseClient()
    
    # 准备测试用户数据
    test_user = {
        "email": "test_script@example.com",
        "name": "Test Script User",
        "password_hash": "$2b$12$testpasswordhash"  # 模拟哈希密码
    }
    
    print(f"Testing user creation with email: {test_user['email']}")
    
    try:
        # 尝试创建用户
        result = await db.create_user(test_user)
        
        if result:
            print(f"✅ User creation successful! Result: {json.dumps(result, indent=2)}")
        else:
            print("❌ User creation failed: no result returned")
    except Exception as e:
        print(f"❌ Exception during user creation: {str(e)}")
    finally:
        # 清理资源（如果有close方法的话）
        if hasattr(db, 'close'):
            await db.close()

if __name__ == "__main__":
    asyncio.run(test_create_user())