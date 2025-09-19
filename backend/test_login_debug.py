#!/usr/bin/env python3
"""
Debug script to test login functionality
"""
import asyncio
import sys
import os
from pathlib import Path

# Add current directory to Python path
sys.path.insert(0, str(Path(__file__).parent))

from dotenv import load_dotenv
load_dotenv()

from database import get_supabase_client
from auth_utils import PasswordManager
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

async def test_login():
    """Test login functionality"""
    print("=" * 50)
    print("Testing Login Functionality")
    print("=" * 50)
    
    # Test email and password
    test_email = "test@example.com"
    test_password = "123456"  # 根据你的数据库数据
    
    print(f"Testing login for: {test_email}")
    
    # Get database client
    supabase = get_supabase_client()
    password_manager = PasswordManager()
    
    # Step 1: Get user by email
    print("\nStep 1: Getting user by email...")
    user = await supabase.get_user_by_email(test_email)
    if not user:
        print(f"❌ User not found for email: {test_email}")
        return False
    
    print(f"✅ User found: {user['name']} ({user['email']})")
    print(f"User ID: {user['id']}")
    print(f"Is Active: {user.get('is_active', False)}")
    print(f"Password Hash: {user['password_hash'][:20]}...")
    
    # Step 2: Verify password
    print(f"\nStep 2: Verifying password...")
    password_valid = password_manager.verify_password(test_password, user['password_hash'])
    if not password_valid:
        print(f"❌ Password verification failed")
        print(f"Entered password: {test_password}")
        
        # Let's test if we can generate a hash for the same password
        test_hash = password_manager.hash_password(test_password)
        print(f"Test hash: {test_hash}")
        
        # Test different possible passwords
        test_passwords = ["123456", "password", "test123", "testuser"]
        for pwd in test_passwords:
            if password_manager.verify_password(pwd, user['password_hash']):
                print(f"✅ Found working password: {pwd}")
                return True
        
        return False
    
    print(f"✅ Password verification successful")
    
    # Step 3: Check if user is active
    print(f"\nStep 3: Checking user status...")
    if not user.get('is_active', False):
        print(f"❌ User account is disabled")
        return False
    
    print(f"✅ User account is active")
    
    print(f"\n✅ Login test completed successfully!")
    return True

async def test_database_connection():
    """Test database connection"""
    print("=" * 50)
    print("Testing Database Connection")
    print("=" * 50)
    
    try:
        from database import get_db_engine
        engine = get_db_engine()
        print(f"✅ Database engine created: {engine.url}")
        
        # Test connection
        from sqlalchemy import text
        with engine.connect() as conn:
            result = conn.execute(text("SELECT COUNT(*) FROM users"))
            count = result.scalar()
            print(f"✅ Database connection successful, users count: {count}")
            
            # Get all users
            result = conn.execute(text("SELECT id, email, name, is_active FROM users"))
            users = result.fetchall()
            print(f"\nUsers in database:")
            for user in users:
                print(f"  - {user.email} ({user.name}) - Active: {user.is_active}")
        
        return True
    except Exception as e:
        print(f"❌ Database connection failed: {e}")
        return False

async def test_password_hashing():
    """Test password hashing functionality"""
    print("=" * 50)
    print("Testing Password Hashing")
    print("=" * 50)
    
    password_manager = PasswordManager()
    test_password = "123456"
    
    print(f"Testing password: {test_password}")
    
    # Generate hash
    hash1 = password_manager.hash_password(test_password)
    print(f"Generated hash 1: {hash1}")
    
    # Generate another hash
    hash2 = password_manager.hash_password(test_password)
    print(f"Generated hash 2: {hash2}")
    
    # Test verification
    verify1 = password_manager.verify_password(test_password, hash1)
    verify2 = password_manager.verify_password(test_password, hash2)
    
    print(f"Verification 1: {verify1}")
    print(f"Verification 2: {verify2}")
    
    # Test with wrong password
    wrong_verify = password_manager.verify_password("wrongpassword", hash1)
    print(f"Wrong password verification: {wrong_verify}")
    
    if verify1 and verify2 and not wrong_verify:
        print("✅ Password hashing works correctly")
        return True
    else:
        print("❌ Password hashing has issues")
        return False

async def main():
    """Main test function"""
    print("Starting login debug tests...\n")
    
    # Test 1: Database connection
    db_ok = await test_database_connection()
    if not db_ok:
        print("Database connection failed, stopping tests")
        return
    
    print("\n")
    
    # Test 2: Password hashing
    hash_ok = await test_password_hashing()
    if not hash_ok:
        print("Password hashing failed, stopping tests")
        return
    
    print("\n")
    
    # Test 3: Login functionality
    login_ok = await test_login()
    
    print(f"\n" + "=" * 50)
    print("Test Summary:")
    print(f"Database Connection: {'✅' if db_ok else '❌'}")
    print(f"Password Hashing: {'✅' if hash_ok else '❌'}")
    print(f"Login Functionality: {'✅' if login_ok else '❌'}")
    print("=" * 50)

if __name__ == "__main__":
    asyncio.run(main())