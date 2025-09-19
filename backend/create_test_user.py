#!/usr/bin/env python3
"""
Create a test user with known password
"""
import asyncio
import sys
from pathlib import Path

# Add current directory to Python path
sys.path.insert(0, str(Path(__file__).parent))

from auth_utils import PasswordManager
from database import get_supabase_client
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

async def create_test_user():
    """Create a test user with known credentials"""
    print("Creating test user with known credentials...")
    
    # User credentials
    email = "testuser@example.com"
    password = "password123"  # Known password
    name = "Test User New"
    
    # Get services
    supabase = get_supabase_client()
    password_manager = PasswordManager()
    
    # Check if user already exists
    existing_user = await supabase.get_user_by_email(email)
    if existing_user:
        print(f"User {email} already exists. Let's test login with this user.")
        
        # Test login
        password_valid = password_manager.verify_password(password, existing_user['password_hash'])
        if password_valid:
            print(f"✅ Password '{password}' works for {email}")
            return email, password
        else:
            print(f"❌ Password '{password}' doesn't work for {email}")
            print("Deleting existing user to recreate...")
            # For SQLite, let's delete and recreate
            from database import get_db_session
            from sqlalchemy import text
            session = get_db_session()
            try:
                session.execute(text("DELETE FROM users WHERE email = :email"), {"email": email})
                session.commit()
                print(f"✅ Deleted existing user {email}")
            except Exception as e:
                print(f"❌ Error deleting user: {e}")
                session.rollback()
            finally:
                session.close()
    
    # Create new user
    print(f"Creating new user: {email}")
    
    # Hash password
    password_hash = password_manager.hash_password(password)
    print(f"Password hash: {password_hash}")
    
    # Create user data
    user_data = {
        "email": email,
        "name": name,
        "password_hash": password_hash
    }
    
    try:
        new_user = await supabase.create_user(user_data)
        if new_user:
            print(f"✅ User created successfully!")
            print(f"User ID: {new_user['id']}")
            print(f"Email: {new_user['email']}")
            print(f"Name: {new_user['name']}")
            
            # Test login immediately
            print(f"\nTesting login...")
            password_valid = password_manager.verify_password(password, new_user['password_hash'])
            if password_valid:
                print(f"✅ Login test successful!")
                return email, password
            else:
                print(f"❌ Login test failed!")
                return None, None
        else:
            print(f"❌ Failed to create user")
            return None, None
    except Exception as e:
        print(f"❌ Error creating user: {e}")
        return None, None

async def main():
    print("Setting up test user for login testing...\n")
    
    email, password = await create_test_user()
    
    if email and password:
        print(f"\n" + "="*50)
        print("✅ Test User Setup Complete!")
        print("="*50)
        print(f"Email: {email}")
        print(f"Password: {password}")
        print("You can now test login with these credentials.")
        print("="*50)
    else:
        print(f"\n" + "="*50)
        print("❌ Test User Setup Failed!")
        print("="*50)

if __name__ == "__main__":
    asyncio.run(main())