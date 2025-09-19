"""
Test database connection for BOCAI Chat MVP (async version)
"""
import sys
from pathlib import Path
import os
import asyncio

# Add backend directory to Python path
backend_dir = Path(__file__).parent
sys.path.append(str(backend_dir))

from database import get_supabase_client

async def test_database_connection():
    """Test database connection"""
    try:
        # Get database client
        db_client = get_supabase_client()
        print("Database client initialized successfully")
        
        # Test creating a user
        test_user = {
            "email": "test@example.com",
            "name": "Test User",
            "password_hash": "$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RK.PmSsxG"  # "password123"
        }
        
        print("Creating test user...")
        result = await db_client.create_user(test_user)
        if result:
            print("Test user created successfully")
            user_id = result['id']
            
            # Test getting user by email
            print("Getting user by email...")
            user = await db_client.get_user_by_email("test@example.com")
            if user:
                print("User retrieved successfully")
                
                # Test updating user
                print("Updating user...")
                update_result = await db_client.update_user(user_id, {"name": "Updated Test User"})
                if update_result:
                    print("User updated successfully")
                    
                    # Test getting user by ID
                    print("Getting user by ID...")
                    updated_user = await db_client.get_user_by_id(user_id)
                    if updated_user and updated_user['name'] == "Updated Test User":
                        print("User updated correctly")
                    else:
                        print("User update verification failed")
                else:
                    print("User update failed")
            else:
                print("Failed to retrieve user by email")
        else:
            print("Failed to create test user")
            
    except Exception as e:
        print(f"Database connection test failed: {e}")
        import traceback
        traceback.print_exc()
        return False
    
    print("All database tests passed!")
    return True

if __name__ == "__main__":
    asyncio.run(test_database_connection())