"""
Authentication models module for BOCAI Chat MVP
"""
from pydantic import BaseModel, EmailStr, validator, Field
from typing import Optional
from datetime import datetime
import re


class UserBase(BaseModel):
    """Base user model with common fields"""
    email: EmailStr
    name: str = Field(..., min_length=2, max_length=50)


class UserCreate(UserBase):
    """User creation model with password"""
    password: str = Field(..., min_length=8)
    confirm_password: str
    
    @validator('password')
    def validate_password(cls, v):
        """Validate password strength"""
        if len(v) < 8:
            raise ValueError('密码至少8位')
        if not re.search(r'[a-z]', v):
            raise ValueError('密码必须包含小写字母')
        if not re.search(r'[A-Z]', v):
            raise ValueError('密码必须包含大写字母') 
        if not re.search(r'\d', v):
            raise ValueError('密码必须包含数字')
        return v
    
    @validator('confirm_password')
    def passwords_match(cls, v, values):
        """Ensure passwords match"""
        if 'password' in values and v != values['password']:
            raise ValueError('密码不一致')
        return v


class UserLogin(BaseModel):
    """User login model"""
    email: EmailStr
    password: str
    remember_me: bool = False


class UserResponse(UserBase):
    """User response model (safe for API responses)"""
    id: str
    avatar_url: Optional[str] = None
    email_verified: bool = False
    created_at: datetime
    last_login_at: Optional[datetime] = None
    is_active: bool = True

    class Config:
        from_attributes = True


class AuthResponse(BaseModel):
    """Authentication response model"""
    user: UserResponse
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class TokenData(BaseModel):
    """Token payload data"""
    sub: str  # user id
    email: str
    exp: datetime
    token_type: str = "access"  # access or refresh


class ForgotPasswordRequest(BaseModel):
    """Password reset request model"""
    email: EmailStr


class ResetPasswordRequest(BaseModel):
    """Password reset model"""
    token: str
    password: str = Field(..., min_length=8)
    confirm_password: str
    
    @validator('password')
    def validate_password(cls, v):
        """Validate password strength"""
        if len(v) < 8:
            raise ValueError('密码至少8位')
        if not re.search(r'[a-z]', v):
            raise ValueError('密码必须包含小写字母')
        if not re.search(r'[A-Z]', v):
            raise ValueError('密码必须包含大写字母') 
        if not re.search(r'\d', v):
            raise ValueError('密码必须包含数字')
        return v
    
    @validator('confirm_password')
    def passwords_match(cls, v, values):
        """Ensure passwords match"""
        if 'password' in values and v != values['password']:
            raise ValueError('密码不一致')
        return v


class ChangePasswordRequest(BaseModel):
    """Change password model"""
    current_password: str
    new_password: str = Field(..., min_length=8)
    confirm_password: str
    
    @validator('new_password')
    def validate_password(cls, v):
        """Validate password strength"""
        if len(v) < 8:
            raise ValueError('密码至少8位')
        if not re.search(r'[a-z]', v):
            raise ValueError('密码必须包含小写字母')
        if not re.search(r'[A-Z]', v):
            raise ValueError('密码必须包含大写字母') 
        if not re.search(r'\d', v):
            raise ValueError('密码必须包含数字')
        return v
    
    @validator('confirm_password')
    def passwords_match(cls, v, values):
        """Ensure passwords match"""
        if 'new_password' in values and v != values['new_password']:
            raise ValueError('密码不一致')
        return v