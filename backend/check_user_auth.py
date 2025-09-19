#!/usr/bin/env python3
"""
Script to check user authentication against PostgreSQL database
"""

import sys
import os
from pathlib import Path

# Add backend directory to Python path
backend_dir = Path(__file__).parent
sys.path.append(str(backend_dir))

from database import get_supabase_client
from auth_utils import get_password_manager
import asyncio

async def check_user_auth(email: str, password: str):
    """
    Check if a user with the given email exists and verify password hash
    """
    try:
        # Initialize database client
        db_client = get_supabase_client()
        print(f"[INFO] Database client initialized")
        
        # Initialize password manager
        password_manager = get_password_manager()
        print(f"[INFO] Password manager initialized")
        
        # Get user by email
        print(f"[INFO] Searching for user with email: {email}")
        user = await db_client.get_user_by_email(email)
        
        if not user:
            print(f"[INFO] User with email '{email}' not found")
            return {
                "user_exists": False,
                "password_correct": False,
                "message": f"User with email '{email}' does not exist"
            }
        
        print(f"[INFO] User found: {user['email']} (ID: {user['id']})")
        
        # Verify password hash
        print(f"[INFO] Verifying password for user: {email}")
        stored_password_hash = user.get('password_hash')
        
        if not stored_password_hash:
            print(f"[ERROR] No password hash found for user")
            return {
                "user_exists": True,
                "password_correct": False,
                "message": "No password hash stored for user"
            }
        
        password_match = password_manager.verify_password(password, stored_password_hash)
        
        if password_match:
            print(f"[SUCCESS] Password verification successful for user: {email}")
            return {
                "user_exists": True,
                "password_correct": True,
                "user_id": user['id'],
                "message": "User authenticated successfully"
            }
        else:
            print(f"[ERROR] Password verification failed for user: {email}")
            return {
                "user_exists": True,
                "password_correct": False,
                "user_id": user['id'],
                "message": "Password verification failed"
            }
            
    except Exception as e:
        print(f"[ERROR] Authentication check failed: {e}")
        import traceback
        traceback.print_exc()
        return {
            "user_exists": False,
            "password_correct": False,
            "message": f"Authentication check failed: {str(e)}"
        }

async def main():
    """Main function to run the authentication check"""
    # Default test values
    test_email = "test@example.com"
    test_password = "password123"
    
    # Allow command line arguments to override defaults
    if len(sys.argv) >= 3:
        test_email = sys.argv[1]
        test_password = sys.argv[2]
    elif len(sys.argv) == 2:
        test_email = sys.argv[1]
    
    print(f"Checking authentication for user: {test_email}")
    print("=" * 50)
    
    result = await check_user_auth(test_email, test_password)
    
    print("=" * 50)
    print("AUTHENTICATION RESULT:")
    print(f"  User exists: {result['user_exists']}")
    print(f"  Password correct: {result['password_correct']}")
    if 'user_id' in result:
        print(f"  User ID: {result['user_id']}")
    print(f"  Message: {result['message']}")
    
    return result['password_correct'] if result['user_exists'] else False

if __name__ == "__main__":
    success = asyncio.run(main())
    sys.exit(0 if success else 1)