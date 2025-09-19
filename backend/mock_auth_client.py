"""
简化的认证模拟客户端，用于测试前端认证界面
"""
import json
import hashlib
import uuid
from datetime import datetime, timedelta
from typing import Optional, Dict, Any
import logging

logger = logging.getLogger(__name__)

class MockAuthClient:
    """模拟认证客户端，用于测试"""
    
    def __init__(self):
        # 模拟用户数据存储
        self.users = {
            "test@example.com": {
                "id": str(uuid.uuid4()),
                "email": "test@example.com",
                "password_hash": "$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RK.PmSsxG",  # password123
                "name": "测试用户",
                "avatar_url": None,
                "email_verified": True,
                "created_at": datetime.utcnow().isoformat(),
                "updated_at": datetime.utcnow().isoformat(),
                "last_login_at": None,
                "is_active": True
            },
            "admin@bocai.com": {
                "id": str(uuid.uuid4()),
                "email": "admin@bocai.com",
                "password_hash": "$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RK.PmSsxG",  # password123
                "name": "BOCAI 管理员",
                "avatar_url": None,
                "email_verified": True,
                "created_at": datetime.utcnow().isoformat(),
                "updated_at": datetime.utcnow().isoformat(),
                "last_login_at": None,
                "is_active": True
            }
        }
        
        self.sessions = {}
        self.reset_tokens = {}
    
    async def get_user_by_email(self, email: str) -> Optional[Dict[str, Any]]:
        """根据邮箱获取用户"""
        return self.users.get(email)
    
    async def get_user_by_id(self, user_id: str) -> Optional[Dict[str, Any]]:
        """根据ID获取用户"""
        for user in self.users.values():
            if user['id'] == user_id:
                return user
        return None
    
    async def create_user(self, user_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """创建新用户"""
        try:
            if user_data['email'] in self.users:
                return None  # 用户已存在
            
            new_user = {
                'id': str(uuid.uuid4()),
                'email': user_data['email'],
                'password_hash': user_data['password_hash'],
                'name': user_data['name'],
                'avatar_url': None,
                'email_verified': False,
                'created_at': datetime.utcnow().isoformat(),
                'updated_at': datetime.utcnow().isoformat(),
                'last_login_at': None,
                'is_active': True
            }
            
            self.users[user_data['email']] = new_user
            logger.info(f"Mock user created: {user_data['email']}")
            return new_user
            
        except Exception as e:
            logger.error(f"Error creating mock user: {e}")
            return None
    
    async def update_user(self, user_id: str, update_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """更新用户信息"""
        try:
            for email, user in self.users.items():
                if user['id'] == user_id:
                    user.update(update_data)
                    user['updated_at'] = datetime.utcnow().isoformat()
                    return user
            return None
        except Exception as e:
            logger.error(f"Error updating mock user: {e}")
            return None
    
    async def update_last_login(self, user_id: str) -> bool:
        """更新最后登录时间"""
        try:
            for email, user in self.users.items():
                if user['id'] == user_id:
                    user['last_login_at'] = datetime.utcnow().isoformat()
                    return True
            return False
        except Exception as e:
            logger.error(f"Error updating last login: {e}")
            return False
    
    async def save_user_session(self, session_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """保存用户会话"""
        try:
            session_id = str(uuid.uuid4())
            session_data['id'] = session_id
            self.sessions[session_id] = session_data
            return session_data
        except Exception as e:
            logger.error(f"Error saving mock session: {e}")
            return None
    
    async def get_user_sessions(self, user_id: str) -> list:
        """获取用户会话"""
        return [session for session in self.sessions.values() if session.get('user_id') == user_id]
    
    async def delete_user_session(self, session_id: str) -> bool:
        """删除用户会话"""
        return self.sessions.pop(session_id, None) is not None
    
    async def save_reset_token(self, user_id: str, token_hash: str, expires_at: datetime) -> Optional[Dict[str, Any]]:
        """保存密码重置令牌"""
        try:
            token_id = str(uuid.uuid4())
            token_data = {
                'id': token_id,
                'user_id': user_id,
                'token_hash': token_hash,
                'expires_at': expires_at.isoformat(),
                'used': False,
                'created_at': datetime.utcnow().isoformat()
            }
            self.reset_tokens[token_id] = token_data
            return token_data
        except Exception as e:
            logger.error(f"Error saving reset token: {e}")
            return None
    
    async def get_reset_token(self, token_hash: str) -> Optional[Dict[str, Any]]:
        """获取密码重置令牌"""
        for token in self.reset_tokens.values():
            if (token.get('token_hash') == token_hash and 
                not token.get('used', False) and 
                datetime.fromisoformat(token['expires_at']) > datetime.utcnow()):
                return token
        return None
    
    async def mark_reset_token_used(self, token_id: str) -> bool:
        """标记密码重置令牌为已使用"""
        if token_id in self.reset_tokens:
            self.reset_tokens[token_id]['used'] = True
            return True
        return False


# 全局模拟实例
_mock_auth_client: Optional[MockAuthClient] = None

def get_mock_auth_client() -> MockAuthClient:
    """获取模拟认证客户端实例"""
    global _mock_auth_client
    if _mock_auth_client is None:
        _mock_auth_client = MockAuthClient()
    return _mock_auth_client