#!/usr/bin/env python3
"""
Update existing user password to a known password
"""
import asyncio
import sys
from pathlib import Path

# Add current directory to Python path
sys.path.insert(0, str(Path(__file__).parent))

from auth_utils import PasswordManager
from database import get_db_session
from sqlalchemy import text
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

async def update_user_password():
    """Update test@example.com password to a known password"""
    print("Updating test@example.com password to a known password...")
    
    email = "test@example.com"
    new_password = "password123"  # Known password
    
    password_manager = PasswordManager()
    
    # Hash the new password
    password_hash = password_manager.hash_password(new_password)
    print(f"New password hash: {password_hash}")
    
    # Update in database
    session = get_db_session()
    try:
        # Update password
        result = session.execute(
            text("UPDATE users SET password_hash = :password_hash WHERE email = :email RETURNING email"),
            {"password_hash": password_hash, "email": email}
        )
        updated_user = result.fetchone()
        session.commit()
        
        if updated_user:
            print(f"✅ Password updated successfully for {email}")
            
            # Test the new password
            result = session.execute(
                text("SELECT password_hash FROM users WHERE email = :email"),
                {"email": email}
            )
            user_record = result.fetchone()
            
            if user_record:
                test_verify = password_manager.verify_password(new_password, user_record.password_hash)
                if test_verify:
                    print(f"✅ Password verification successful!")
                    print(f"Email: {email}")
                    print(f"Password: {new_password}")
                    return True
                else:
                    print(f"❌ Password verification failed")
                    return False
        else:
            print(f"❌ User {email} not found")
            return False
    except Exception as e:
        print(f"❌ Error updating password: {e}")
        session.rollback()
        return False
    finally:
        session.close()

async def main():
    print("Updating user password...\n")
    
    success = await update_user_password()
    
    if success:
        print(f"\n" + "="*50)
        print("✅ Password Update Complete!")
        print("="*50)
        print("Email: test@example.com")
        print("Password: password123")
        print("You can now test login with these credentials.")
        print("="*50)
    else:
        print(f"\n" + "="*50)
        print("❌ Password Update Failed!")
        print("="*50)

if __name__ == "__main__":
    asyncio.run(main())