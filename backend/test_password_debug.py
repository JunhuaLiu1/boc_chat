#!/usr/bin/env python3
"""
Debug script to find the correct password
"""
import asyncio
import sys
import os
from pathlib import Path

# Add current directory to Python path
sys.path.insert(0, str(Path(__file__).parent))

from auth_utils import PasswordManager
from database import get_db_session
from sqlalchemy import text

async def test_passwords():
    """Test various passwords against the stored hash"""
    print("Testing various passwords against stored hash...")
    
    # Get the stored password hash
    session = get_db_session()
    result = session.execute(text('SELECT email, password_hash FROM users WHERE email = "test@example.com"'))
    user = result.fetchone()
    session.close()
    
    if not user:
        print("User not found!")
        return
    
    stored_hash = user.password_hash
    print(f"Stored hash: {stored_hash}")
    
    # Test various common passwords
    test_passwords = [
        "123456",
        "password",
        "test123",
        "testuser",
        "admin",
        "123123",
        "test@example.com",
        "Test User",
        "testpassword",
        "",  # empty password
        "password123",
        "123456789",
        "qwerty",
        "abc123",
        "test",
        "user123",
        "admin123"
    ]
    
    password_manager = PasswordManager()
    
    print(f"\nTesting {len(test_passwords)} possible passwords...")
    for i, pwd in enumerate(test_passwords, 1):
        try:
            is_valid = password_manager.verify_password(pwd, stored_hash)
            print(f"{i:2d}. '{pwd}' -> {'✅ MATCH!' if is_valid else '❌'}")
            if is_valid:
                print(f"\n🎉 Found the correct password: '{pwd}'")
                return pwd
        except Exception as e:
            print(f"{i:2d}. '{pwd}' -> Error: {e}")
    
    print("\n❌ No matching password found among common passwords")
    
    # Let's see if we can reverse engineer from your database data
    print("\nTrying passwords based on your database info...")
    
    # From your data, the hash is: $2b$12$N4JQ1iigRZHsPrOJOPu3tOqHx1psIRW6Vlx42fRpky5BqpFRmDHhm
    # But in our SQLite it shows: $2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RK.PmSsxG
    # This means they're different users or different passwords
    
    # Let's test if our current system works by creating a new user with known password
    test_password = "testpass123"
    new_hash = password_manager.hash_password(test_password)
    verify_test = password_manager.verify_password(test_password, new_hash)
    
    print(f"\nVerification test:")
    print(f"Password: {test_password}")
    print(f"Generated hash: {new_hash}")
    print(f"Verification: {'✅' if verify_test else '❌'}")
    
    return None

if __name__ == "__main__":
    asyncio.run(test_passwords())