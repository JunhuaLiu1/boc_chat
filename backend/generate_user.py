import bcrypt
import uuid

def hash_password(password):
    # Hash a password using bcrypt
    # 生成盐值
    salt = bcrypt.gensalt()
    # 哈希密码
    hashed = bcrypt.hashpw(password.encode('utf-8'), salt)
    return hashed.decode('utf-8')

def main():
    # 使用已知密码生成哈希
    password = "password123"
    hashed = hash_password(password)
    
    print("Password: " + password)
    print("Generated hash: " + hashed)
    
    # 生成用户ID
    user_id = str(uuid.uuid4())
    
    print("\nSQL to insert user:")
    print("INSERT INTO public.users (id, email, password_hash, name) VALUES ('" + user_id + "', 'test@example.com', '" + hashed + "', 'Test User');")
    
    # 验证生成的哈希是否正确
    result = bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))
    print("\nVerification result: " + ("SUCCESS" if result else "FAILED"))

if __name__ == "__main__":
    main()