import bcrypt
import sys

def verify_password_and_hash(password, hashed):
    """Verify a password against its hash"""
    try:
        # 将密码和哈希转换为字节
        password_bytes = password.encode('utf-8')
        hashed_bytes = hashed.encode('utf-8')
        
        # 验证密码
        result = bcrypt.checkpw(password_bytes, hashed_bytes)
        return result
    except Exception as e:
        print(f"Error verifying password: {e}")
        return False

def main():
    if len(sys.argv) != 3:
        print("Usage: python verify_password.py <password> <hash>")
        sys.exit(1)
    
    password = sys.argv[1]
    hash_value = sys.argv[2]
    
    print(f"Password: {password}")
    print(f"Hash: {hash_value}")
    
    result = verify_password_and_hash(password, hash_value)
    
    if result:
        print("SUCCESS: Password verification successful!")
    else:
        print("ERROR: Password verification failed!")

if __name__ == "__main__":
    main()