"""
Authentication utilities for BOCAI Chat MVP
"""
import bcrypt
import jwt
import os
import hashlib
import secrets
from datetime import datetime, timedelta
from typing import Optional, Dict, Any
from jose import JWTError, jwt as jose_jwt
import logging

logger = logging.getLogger(__name__)

# JWT Configuration
JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "your-secret-key-change-in-production")
JWT_ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_HOURS = 1
REFRESH_TOKEN_EXPIRE_DAYS = 30
RESET_TOKEN_EXPIRE_HOURS = 24


class PasswordManager:
    """Password hashing and verification utilities"""
    
    @staticmethod
    def hash_password(password: str) -> str:
        """Hash a password using bcrypt"""
        return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
    
    @staticmethod
    def verify_password(password: str, hashed: str) -> bool:
        """Verify a password against its hash"""
        try:
            return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))
        except Exception as e:
            logger.error(f"Password verification error: {e}")
            return False


class TokenManager:
    """JWT token creation and verification utilities"""
    
    @staticmethod
    def create_access_token(data: Dict[str, Any], expires_delta: Optional[timedelta] = None) -> str:
        """Create an access token"""
        to_encode = data.copy()
        if expires_delta:
            expire = datetime.utcnow() + expires_delta
        else:
            expire = datetime.utcnow() + timedelta(hours=ACCESS_TOKEN_EXPIRE_HOURS)
        
        to_encode.update({
            "exp": expire,
            "type": "access",
            "iat": datetime.utcnow()
        })
        
        return jose_jwt.encode(to_encode, JWT_SECRET_KEY, algorithm=JWT_ALGORITHM)
    
    @staticmethod
    def create_refresh_token(data: Dict[str, Any]) -> str:
        """Create a refresh token"""
        to_encode = data.copy()
        expire = datetime.utcnow() + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
        
        to_encode.update({
            "exp": expire,
            "type": "refresh",
            "iat": datetime.utcnow()
        })
        
        return jose_jwt.encode(to_encode, JWT_SECRET_KEY, algorithm=JWT_ALGORITHM)
    
    @staticmethod
    def create_reset_token(user_id: str) -> str:
        """Create a password reset token"""
        to_encode = {
            "sub": user_id,
            "type": "reset",
            "exp": datetime.utcnow() + timedelta(hours=RESET_TOKEN_EXPIRE_HOURS),
            "iat": datetime.utcnow(),
            "jti": secrets.token_urlsafe(32)  # Unique token ID
        }
        
        return jose_jwt.encode(to_encode, JWT_SECRET_KEY, algorithm=JWT_ALGORITHM)
    
    @staticmethod
    def verify_token(token: str, token_type: str = "access") -> Optional[Dict[str, Any]]:
        """Verify and decode a JWT token"""
        try:
            payload = jose_jwt.decode(token, JWT_SECRET_KEY, algorithms=[JWT_ALGORITHM])
            
            # Check token type
            if payload.get("type") != token_type:
                logger.warning(f"Invalid token type: expected {token_type}, got {payload.get('type')}")
                return None
            
            # Check expiration
            exp = payload.get("exp")
            if exp and datetime.fromtimestamp(exp) < datetime.utcnow():
                logger.warning("Token has expired")
                return None
            
            return payload
        except JWTError as e:
            logger.error(f"Token verification error: {e}")
            return None
        except Exception as e:
            logger.error(f"Unexpected token verification error: {e}")
            return None
    
    @staticmethod
    def extract_user_id(token: str) -> Optional[str]:
        """Extract user ID from token"""
        payload = TokenManager.verify_token(token)
        return payload.get("sub") if payload else None


class SecurityUtils:
    """Security utility functions"""
    
    @staticmethod
    def generate_secure_token() -> str:
        """Generate a secure random token"""
        return secrets.token_urlsafe(32)
    
    @staticmethod
    def hash_token(token: str) -> str:
        """Hash a token using SHA-256"""
        return hashlib.sha256(token.encode()).hexdigest()
    
    @staticmethod
    def validate_email_format(email: str) -> bool:
        """Basic email format validation"""
        import re
        pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        return bool(re.match(pattern, email))
    
    @staticmethod
    def sanitize_filename(filename: str) -> str:
        """Sanitize filename for safe storage"""
        import re
        # Remove dangerous characters
        sanitized = re.sub(r'[<>:"/\\|?*]', '_', filename)
        # Limit length
        return sanitized[:255] if len(sanitized) > 255 else sanitized


def get_password_manager() -> PasswordManager:
    """Get password manager instance"""
    return PasswordManager()


def get_token_manager() -> TokenManager:
    """Get token manager instance"""
    return TokenManager()


def get_security_utils() -> SecurityUtils:
    """Get security utils instance"""
    return SecurityUtils()