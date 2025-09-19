"""
Database client module for BOCAI Chat MVP
Handles Supabase connections and database operations
"""
from supabase import create_client, Client
from typing import Optional, Dict, Any, List
import os
import logging
from datetime import datetime, timedelta
import json
import sqlalchemy
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import uuid
from dotenv import load_dotenv

logger = logging.getLogger(__name__)

# 加载环境变量
load_dotenv()

# SQLAlchemy setup for direct PostgreSQL connection
Base = declarative_base()
engine = None
SessionLocal = None

def get_db_engine():
    """Get SQLAlchemy database engine"""
    global engine
    if engine is None:
        # 优先使用环境变量中的 DATABASE_URL，如果没有则使用默认的 SQLite 数据库
        database_url = os.getenv("DATABASE_URL", "sqlite:///./chat_app.db")
        engine = sqlalchemy.create_engine(database_url, connect_args={"check_same_thread": False} if "sqlite" in database_url else {})
    return engine

def get_db_session():
    """Get SQLAlchemy database session"""
    engine = get_db_engine()
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    return SessionLocal()


class SupabaseClient:
    """Supabase client wrapper for database operations"""
    
    def __init__(self):
        """Initialize Supabase client"""
        # 初始化SQLAlchemy引擎
        self.db_engine = get_db_engine()
        logger.info("PostgreSQL database engine initialized successfully")
        
        # 完全禁用Supabase客户端，仅使用直接PostgreSQL连接
        self.client = None
        self.admin_client = None
        logger.info("Using direct PostgreSQL connection only")
    
    async def get_user_by_email(self, email: str) -> Optional[Dict[str, Any]]:
        """Get user by email address"""
        try:
            # 使用直接PostgreSQL连接
            session = get_db_session()
            try:
                result = session.execute(
                    sqlalchemy.text("SELECT * FROM users WHERE email = :email"),
                    {"email": email}
                ).fetchone()
                if result:
                    # 安全地将Row对象转换为字典
                    user_data = dict(result._mapping) if hasattr(result, '_mapping') else dict(result)
                    # Convert any UUID objects to strings
                    for key, value in user_data.items():
                        if isinstance(value, uuid.UUID):
                            user_data[key] = str(value)
                        # 处理 SQLite 数据库中的整数 ID
                        elif key == 'id' and isinstance(value, int):
                            user_data[key] = str(value)
                    return user_data
                return None
            finally:
                session.close()
        except Exception as e:
            logger.error(f"Error getting user by email {email}: {e}")
            return None
    
    async def get_user_by_id(self, user_id: str) -> Optional[Dict[str, Any]]:
        """Get user by ID"""
        try:
            # 使用直接PostgreSQL连接
            session = get_db_session()
            try:
                result = session.execute(
                    sqlalchemy.text("SELECT * FROM users WHERE id = :user_id"),
                    {"user_id": user_id}
                ).fetchone()
                if result:
                    # 安全地将Row对象转换为字典
                    user_data = dict(result._mapping) if hasattr(result, '_mapping') else dict(result)
                    # Convert any UUID objects to strings
                    for key, value in user_data.items():
                        if isinstance(value, uuid.UUID):
                            user_data[key] = str(value)
                        # 处理 SQLite 数据库中的整数 ID
                        elif key == 'id' and isinstance(value, int):
                            user_data[key] = str(value)
                    return user_data
                return None
            finally:
                session.close()
        except Exception as e:
            logger.error(f"Error getting user by ID {user_id}: {e}")
            return None
    
    async def create_user(self, user_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Create a new user"""
        try:
            # Prepare user data for insertion
            db_user = {
                'email': user_data['email'],
                'name': user_data['name'],
                'password_hash': user_data['password_hash'],
                'email_verified': False,
                'is_active': True,
                'created_at': datetime.utcnow().isoformat(),
                'updated_at': datetime.utcnow().isoformat()
            }
            
            # 首先检查用户是否已存在
            existing_user = await self.get_user_by_email(user_data['email'])
            if existing_user:
                logger.warning(f"User already exists: {user_data['email']}")
                return None  # 返回None表示用户已存在
            
            # 使用直接PostgreSQL连接
            session = get_db_session()
            try:
                # 使用SQLAlchemy执行插入操作
                result = session.execute(
                    sqlalchemy.text("""
                        INSERT INTO users (email, name, password_hash, email_verified, is_active, created_at, updated_at)
                        VALUES (:email, :name, :password_hash, :email_verified, :is_active, :created_at, :updated_at)
                        RETURNING *
                    """),
                    db_user
                )
                user_record = result.fetchone()
                session.commit()
                user_record = result.fetchone()
                if user_record:
                    logger.info(f"User created successfully with direct PostgreSQL: {user_data['email']}")
                    # 安全地将Row对象转换为字典并处理UUID对象
                    user_data = dict(user_record._mapping) if hasattr(user_record, '_mapping') else dict(user_record)
                    for key, value in user_data.items():
                        if isinstance(value, uuid.UUID):
                            user_data[key] = str(value)
                        # 处理 SQLite 数据库中的整数 ID
                        elif key == 'id' and isinstance(value, int):
                            user_data[key] = str(value)
                    return user_data
            except Exception as sql_error:
                session.rollback()
                logger.error(f"SQL insertion error: {sql_error}")
                raise
            finally:
                session.close()
            
            # 如果所有方法都失败，抛出异常
            logger.error(f"Failed to create user {user_data['email']} with all methods")
            raise Exception(f"Unable to create user: {user_data['email']}")
            
        except Exception as e:
            logger.error(f"Error creating user {user_data.get('email')}: {e}")
            raise
    
    async def update_user(self, user_id: str, update_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Update user information"""
        try:
            update_data['updated_at'] = datetime.utcnow().isoformat()
            # 使用直接PostgreSQL连接
            session = get_db_session()
            try:
                # 构建更新语句
                set_clause = ", ".join([f"{key} = :{key}" for key in update_data.keys()])
                result = session.execute(
                    sqlalchemy.text(f"""
                        UPDATE users
                        SET {set_clause}
                        WHERE id = :user_id
                        RETURNING *
                    """),
                    {**update_data, "user_id": user_id}
                )
                user_record = result.fetchone()
                session.commit()
                user_record = result.fetchone()
                if user_record:
                    # 安全地将Row对象转换为字典并处理UUID对象
                    user_data = dict(user_record._mapping) if hasattr(user_record, '_mapping') else dict(user_record)
                    for key, value in user_data.items():
                        if isinstance(value, uuid.UUID):
                            user_data[key] = str(value)
                        # 处理 SQLite 数据库中的整数 ID
                        elif key == 'id' and isinstance(value, int):
                            user_data[key] = str(value)
                    return user_data
                return None
            finally:
                session.close()
        except Exception as e:
            logger.error(f"Error updating user {user_id}: {e}")
            return None
    
    async def update_last_login(self, user_id: str) -> bool:
        """Update user's last login timestamp"""
        try:
            # 使用直接PostgreSQL连接
            session = get_db_session()
            try:
                result = session.execute(
                    sqlalchemy.text("""
                        UPDATE users
                        SET last_login_at = :last_login_at, updated_at = :updated_at
                        WHERE id = :user_id
                        RETURNING id
                    """),
                    {
                        "last_login_at": datetime.utcnow().isoformat(),
                        "updated_at": datetime.utcnow().isoformat(),
                        "user_id": user_id
                    }
                )
                user_record = result.fetchone()
                session.commit()
                return result.fetchone() is not None
            finally:
                session.close()
        except Exception as e:
            logger.error(f"Error updating last login for user {user_id}: {e}")
            return False
    
    async def deactivate_user(self, user_id: str) -> bool:
        """Deactivate a user account"""
        try:
            # 使用直接PostgreSQL连接
            session = get_db_session()
            try:
                result = session.execute(
                    sqlalchemy.text("""
                        UPDATE users
                        SET is_active = false, updated_at = :updated_at
                        WHERE id = :user_id
                        RETURNING id
                    """),
                    {
                        "updated_at": datetime.utcnow().isoformat(),
                        "user_id": user_id
                    }
                )
                user_record = result.fetchone()
                session.commit()
                return result.fetchone() is not None
            finally:
                session.close()
        except Exception as e:
            logger.error(f"Error deactivating user {user_id}: {e}")
            return False
    
    async def save_user_session(self, session_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Save user session data"""
        try:
            # 使用直接PostgreSQL连接
            session = get_db_session()
            try:
                result = session.execute(
                    sqlalchemy.text("""
                        INSERT INTO user_sessions (user_id, session_token, expires_at, created_at, updated_at)
                        VALUES (:user_id, :session_token, :expires_at, :created_at, :updated_at)
                        RETURNING *
                    """),
                    session_data
                )
                session_record = result.fetchone()
                session.commit()
                session_record = result.fetchone()
                if session_record:
                    # 安全地将Row对象转换为字典并处理UUID对象
                    session_data = dict(session_record._mapping) if hasattr(session_record, '_mapping') else dict(session_record)
                    for key, value in session_data.items():
                        if isinstance(value, uuid.UUID):
                            session_data[key] = str(value)
                        # 处理 SQLite 数据库中的整数 ID
                        elif key == 'id' and isinstance(value, int):
                            session_data[key] = str(value)
                    return session_data
                return None
            finally:
                session.close()
        except Exception as e:
            logger.error(f"Error saving user session: {e}")
            return None
    
    async def get_user_sessions(self, user_id: str) -> List[Dict[str, Any]]:
        """Get all active sessions for a user"""
        try:
            # 使用直接PostgreSQL连接
            session = get_db_session()
            try:
                result = session.execute(
                    sqlalchemy.text("""
                        SELECT * FROM user_sessions 
                        WHERE user_id = :user_id 
                        AND expires_at >= :now
                    """),
                    {"user_id": user_id, "now": datetime.utcnow().isoformat()}
                )
                sessions = result.fetchall()
                # 处理 SQLite 数据库中的结果
                processed_sessions = []
                for s in sessions:
                    session_dict = dict(s)
                    # 处理 SQLite 数据库中的整数 ID
                    for key, value in session_dict.items():
                        if isinstance(value, uuid.UUID):
                            session_dict[key] = str(value)
                        elif key == 'id' and isinstance(value, int):
                            session_dict[key] = str(value)
                        elif key == 'user_id' and isinstance(value, int):
                            session_dict[key] = str(value)
                    processed_sessions.append(session_dict)
                return processed_sessions
            finally:
                session.close()
        except Exception as e:
            logger.error(f"Error getting user sessions for {user_id}: {e}")
            return []
    
    async def delete_user_session(self, session_id: str) -> bool:
        """Delete a user session"""
        try:
            # 使用直接PostgreSQL连接
            session = get_db_session()
            try:
                result = session.execute(
                    sqlalchemy.text("DELETE FROM user_sessions WHERE id = :session_id RETURNING id"),
                    {"session_id": session_id}
                )
                session_record = result.fetchone()
                session.commit()
                return result.fetchone() is not None
            finally:
                session.close()
        except Exception as e:
            logger.error(f"Error deleting session {session_id}: {e}")
            return False
    
    async def save_reset_token(self, user_id: str, token_hash: str, expires_at: datetime) -> Optional[Dict[str, Any]]:
        """Save password reset token"""
        try:
            token_data = {
                'user_id': user_id,
                'token_hash': token_hash,
                'expires_at': expires_at.isoformat(),
                'used': False,
                'created_at': datetime.utcnow().isoformat()
            }
            # 使用直接PostgreSQL连接
            session = get_db_session()
            try:
                result = session.execute(
                    sqlalchemy.text("""
                        INSERT INTO password_reset_tokens (user_id, token_hash, expires_at, used, created_at)
                        VALUES (:user_id, :token_hash, :expires_at, :used, :created_at)
                        RETURNING *
                    """),
                    token_data
                )
                token_record = result.fetchone()
                session.commit()
                token_record = result.fetchone()
                if token_record:
                    # Convert any UUID objects to strings
                    token_data = dict(token_record)
                    for key, value in token_data.items():
                        if isinstance(value, uuid.UUID):
                            token_data[key] = str(value)
                        # 处理 SQLite 数据库中的整数 ID
                        elif key == 'id' and isinstance(value, int):
                            token_data[key] = str(value)
                    return token_data
                return None
            finally:
                session.close()
        except Exception as e:
            logger.error(f"Error saving reset token for user {user_id}: {e}")
            return None
    
    async def get_reset_token(self, token_hash: str) -> Optional[Dict[str, Any]]:
        """Get password reset token"""
        try:
            # 使用直接PostgreSQL连接
            session = get_db_session()
            try:
                result = session.execute(
                    sqlalchemy.text("""
                        SELECT * FROM password_reset_tokens 
                        WHERE token_hash = :token_hash 
                        AND used = false 
                        AND expires_at >= :now
                    """),
                    {"token_hash": token_hash, "now": datetime.utcnow().isoformat()}
                )
                token_record = result.fetchone()
                if token_record:
                    token_dict = dict(token_record)
                    # 处理 SQLite 数据库中的整数 ID
                    for key, value in token_dict.items():
                        if isinstance(value, uuid.UUID):
                            token_dict[key] = str(value)
                        elif key == 'id' and isinstance(value, int):
                            token_dict[key] = str(value)
                        elif key == 'user_id' and isinstance(value, int):
                            token_dict[key] = str(value)
                    return token_dict
                return None
            finally:
                session.close()
        except Exception as e:
            logger.error(f"Error getting reset token: {e}")
            return None
    
    async def mark_reset_token_used(self, token_id: str) -> bool:
        """Mark password reset token as used"""
        try:
            # 使用直接PostgreSQL连接
            session = get_db_session()
            try:
                result = session.execute(
                    sqlalchemy.text("UPDATE password_reset_tokens SET used = true WHERE id = :token_id RETURNING id"),
                    {"token_id": token_id}
                )
                session_record = result.fetchone()
                session.commit()
                return result.fetchone() is not None
            finally:
                session.close()
        except Exception as e:
            logger.error(f"Error marking reset token as used {token_id}: {e}")
            return False


# Global instance
_supabase_client: Optional[SupabaseClient] = None


def get_supabase_client() -> SupabaseClient:
    """Get or create Supabase client instance"""
    global _supabase_client
    if _supabase_client is None:
        _supabase_client = SupabaseClient()
    return _supabase_client