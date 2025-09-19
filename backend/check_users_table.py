#!/usr/bin/env python3
"""
Script to check if the 'users' table exists in the PostgreSQL database 
and verify its structure.
"""

import os
import sys
from dotenv import load_dotenv
import sqlalchemy
from sqlalchemy import text

# Add the backend directory to the path so we can import our modules
sys.path.append(os.path.join(os.path.dirname(__file__)))

# Load environment variables
load_dotenv()

def check_database_connection(database_url):
    """Test database connection"""
    try:
        engine = sqlalchemy.create_engine(database_url)
        with engine.connect() as connection:
            result = connection.execute(text("SELECT 1"))
            print("[OK] Database connection successful")
            return True
    except Exception as e:
        print(f"[ERROR] Database connection failed: {e}")
        return False

def check_users_table_exists(database_url):
    """Check if the users table exists"""
    try:
        engine = sqlalchemy.create_engine(database_url)
        with engine.connect() as connection:
            # Check if table exists
            result = connection.execute(text("""
                SELECT EXISTS (
                    SELECT FROM information_schema.tables 
                    WHERE table_schema = 'public' 
                    AND table_name = 'users'
                );
            """))
            exists = result.fetchone()[0]
            
            if exists:
                print("[OK] Users table exists")
                return True
            else:
                print("[ERROR] Users table does not exist")
                return False
    except Exception as e:
        print(f"[ERROR] Error checking users table existence: {e}")
        return False

def get_table_structure(database_url):
    """Get the structure of the users table"""
    try:
        engine = sqlalchemy.create_engine(database_url)
        with engine.connect() as connection:
            # Get column information
            result = connection.execute(text("""
                SELECT column_name, data_type, is_nullable, column_default
                FROM information_schema.columns
                WHERE table_schema = 'public' AND table_name = 'users'
                ORDER BY ordinal_position;
            """))
            
            columns = result.fetchall()
            
            if columns:
                print("\n[INFO] Users table structure:")
                print("-" * 80)
                print(f"{'Column Name':<20} {'Data Type':<15} {'Nullable':<10} {'Default':<20}")
                print("-" * 80)
                
                for column in columns:
                    col_name, data_type, is_nullable, col_default = column
                    print(f"{col_name:<20} {data_type:<15} {is_nullable:<10} {str(col_default):<20}")
                
                return True
            else:
                print("[ERROR] No columns found for users table")
                return False
                
    except Exception as e:
        print(f"[ERROR] Error getting table structure: {e}")
        return False

def get_table_constraints(database_url):
    """Get primary key and other constraints for the users table"""
    try:
        engine = sqlalchemy.create_engine(database_url)
        with engine.connect() as connection:
            # Get primary key information
            result = connection.execute(text("""
                SELECT tc.constraint_name, tc.constraint_type, kcu.column_name
                FROM information_schema.table_constraints AS tc
                JOIN information_schema.key_column_usage AS kcu
                  ON tc.constraint_name = kcu.constraint_name
                  AND tc.table_schema = kcu.table_schema
                WHERE tc.table_schema = 'public' 
                  AND tc.table_name = 'users'
                  AND tc.constraint_type = 'PRIMARY KEY';
            """))
            
            constraints = result.fetchall()
            
            if constraints:
                print("\n[INFO] Primary Key:")
                for constraint in constraints:
                    print(f"  Constraint: {constraint[0]}, Column: {constraint[2]}")
            
            # Get unique constraints
            result = connection.execute(text("""
                SELECT tc.constraint_name, kcu.column_name
                FROM information_schema.table_constraints AS tc
                JOIN information_schema.key_column_usage AS kcu
                  ON tc.constraint_name = kcu.constraint_name
                  AND tc.table_schema = kcu.table_schema
                WHERE tc.table_schema = 'public' 
                  AND tc.table_name = 'users'
                  AND tc.constraint_type = 'UNIQUE';
            """))
            
            unique_constraints = result.fetchall()
            
            if unique_constraints:
                print("\n[INFO] Unique Constraints:")
                for constraint in unique_constraints:
                    print(f"  Constraint: {constraint[0]}, Column: {constraint[1]}")
            
            return True
            
    except Exception as e:
        print(f"[ERROR] Error getting table constraints: {e}")
        return False

def count_users(database_url):
    """Count the number of users in the table"""
    try:
        engine = sqlalchemy.create_engine(database_url)
        with engine.connect() as connection:
            result = connection.execute(text("SELECT COUNT(*) FROM users;"))
            count = result.fetchone()[0]
            print(f"\n[INFO] Number of users in the table: {count}")
            return True
    except Exception as e:
        print(f"[ERROR] Error counting users: {e}")
        return False

def main():
    """Main function to check users table"""
    print("Checking users table in PostgreSQL database...\n")
    
    # Get database URL from environment
    database_url = os.getenv("DATABASE_URL")
    
    if not database_url:
        print("[ERROR] DATABASE_URL not found in environment variables")
        print("Please check your .env file")
        return
    
    print(f"Database URL: {database_url.split('@')[0]}@*****")  # Hide sensitive info
    
    # Test database connection
    if not check_database_connection(database_url):
        return
    
    # Check if users table exists
    if not check_users_table_exists(database_url):
        return
    
    # Get table structure
    if not get_table_structure(database_url):
        return
    
    # Get table constraints
    get_table_constraints(database_url)
    
    # Count users
    count_users(database_url)
    
    print("\nDatabase check completed!")

if __name__ == "__main__":
    main()