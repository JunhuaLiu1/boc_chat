#!/usr/bin/env python3
"""
Simple script to connect to PostgreSQL database and check user authentication
"""

import os
import sys
from pathlib import Path

# Add backend directory to Python path
backend_dir = Path(__file__).parent
sys.path.append(str(backend_dir))

import psycopg2
from psycopg2.extras import RealDictCursor
import bcrypt

def connect_to_db():
    """
    Connect to PostgreSQL database using environment variables
    """
    try:
        # Database connection parameters from environment variables
        db_host = os.getenv('DB_HOST', 'localhost')
        db_port = os.getenv('DB_PORT', '5432')
        db_name = os.getenv('DB_NAME', 'chat_app')
        db_user = os.getenv('DB_USER', 'postgres')
        db_password = os.getenv('DB_PASSWORD', '')
        
        # Create connection
        conn = psycopg2.connect(
            host=db_host,
            port=db_port,
            database=db_name,
            user=db_user,
            password=db_password,
            cursor_factory=RealDictCursor
        )
        
        print(f"[INFO] Connected to PostgreSQL database: {db_name}")
        return conn
    except Exception as e:
        print(f"[ERROR] Failed to connect to database: {e}")
        return None

def get_user_by_email(conn, email):
    """
    Get user by email address
    
    Args:
        conn: Database connection
        email (str): Email to search for
        
    Returns:
        dict: User data or None if not found
    """
    try:
        with conn.cursor() as cursor:
            cursor.execute("SELECT * FROM users WHERE email = %s", (email,))
            user = cursor.fetchone()
            return dict(user) if user else None
    except Exception as e:
        print(f"[ERROR] Failed to query user: {e}")
        return None

def verify_password(password, hashed):
    """
    Verify a password against its hash
    
    Args:
        password (str): Plain text password
        hashed (str): Hashed password
        
    Returns:
        bool: True if password matches hash
    """
    try:
        return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))
    except Exception as e:
        print(f"[ERROR] Password verification error: {e}")
        return False

def check_user_auth(email, password):
    """
    Check if a user with the given email exists and verify password hash
    
    Args:
        email (str): Email to search for
        password (str): Password to verify
    
    Returns:
        dict: Result with user existence and password verification status
    """
    # Connect to database
    conn = connect_to_db()
    if not conn:
        return {
            "user_exists": False,
            "password_correct": False,
            "message": "Failed to connect to database"
        }
    
    try:
        # Get user by email
        print(f"[INFO] Searching for user with email: {email}")
        user = get_user_by_email(conn, email)
        
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
        
        password_match = verify_password(password, stored_password_hash)
        
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
        return {
            "user_exists": False,
            "password_correct": False,
            "message": f"Authentication check failed: {str(e)}"
        }
    finally:
        if conn:
            conn.close()
            print(f"[INFO] Database connection closed")

def main():
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
    
    result = check_user_auth(test_email, test_password)
    
    print("=" * 50)
    print("AUTHENTICATION RESULT:")
    print(f"  User exists: {result['user_exists']}")
    print(f"  Password correct: {result['password_correct']}")
    if 'user_id' in result:
        print(f"  User ID: {result['user_id']}")
    print(f"  Message: {result['message']}")
    
    return result['password_correct'] if result['user_exists'] else False

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)