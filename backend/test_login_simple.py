"""
Test login functionality for BOCAI Chat MVP
"""
import sys
from pathlib import Path
import os

# Add backend directory to Python path
backend_dir = Path(__file__).parent
sys.path.append(str(backend_dir))

from database import get_supabase_client
from auth_utils import get_password_manager, get_token_manager

def test_login():
    """Test login functionality"""
    try:
        # Get database client
        db_client = get_supabase_client()
        print("[SUCCESS] Database client initialized successfully")
        
        # Get password manager
        password_manager = get_password_manager()
        print("[SUCCESS] Password manager initialized successfully")
        
        # Get token manager
        token_manager = get_token_manager()
        print("[SUCCESS] Token manager initialized successfully")
        
        # Test creating a user
        test_user = {
            "email": "test@example.com",
            "name": "Test User",
            "password_hash": password_manager.hash_password("password123")
        }
        
        print("[INFO] Creating test user...")
        result = db_client.create_user(test_user)
        if result:
            print("[SUCCESS] Test user created successfully")
            user_id = result['id']
            
            # Test login
            print("[INFO] Testing login...")
            
            # 测试密码验证
            print("[INFO] Testing password verification...")
            if password_manager.verify_password("password123", result['password_hash']):
                print("[SUCCESS] Password verification successful")
            else:
                print("[ERROR] Password verification failed")
                
            # 测试 JWT token 创建
            print("[INFO] Testing JWT token creation...")
            token_data = {"sub": user_id, "email": "test@example.com"}
            access_token = token_manager.create_access_token(data=token_data)
            refresh_token = token_manager.create_refresh_token(data=token_data)
            
            if access_token and refresh_token:
                print("[SUCCESS] JWT tokens created successfully")
                
                # 测试 token 验证
                print("[INFO] Testing token verification...")
                verified_data = token_manager.verify_token(access_token, "access")
                if verified_data:
                    print("[SUCCESS] Token verification successful")
                else:
                    print("[ERROR] Token verification failed")
            else:
                print("[ERROR] JWT token creation failed")
        else:
            print("[ERROR] Failed to create test user")
            
    except Exception as e:
        print(f"[ERROR] Login test failed: {e}")
        import traceback
        traceback.print_exc()
        return False
    
    print("All login tests completed!")
    return True

if __name__ == "__main__":
    test_login()