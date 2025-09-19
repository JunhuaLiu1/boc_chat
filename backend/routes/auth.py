"""
Authentication routes for BOCAI Chat MVP
"""
from fastapi import APIRouter, HTTPException, status, Depends, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import Optional, Dict, Any
from datetime import datetime, timedelta
import logging

from models.auth import (
    UserCreate, UserLogin, UserResponse, AuthResponse, 
    ForgotPasswordRequest, ResetPasswordRequest, ChangePasswordRequest,
    TokenData
)
from database import get_supabase_client, SupabaseClient
from auth_utils import (
    PasswordManager, TokenManager, SecurityUtils,
    get_password_manager, get_token_manager, get_security_utils
)

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/auth", tags=["authentication"])
security = HTTPBearer()

# Dependency to get current user
async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    supabase: SupabaseClient = Depends(get_supabase_client),
    token_manager: TokenManager = Depends(get_token_manager)
) -> Dict[str, Any]:
    """Get current authenticated user"""
    try:
        token = credentials.credentials
        payload = token_manager.verify_token(token, "access")
        
        if not payload:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        user_id = payload.get("sub")
        if not user_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token payload",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        user = await supabase.get_user_by_id(user_id)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User not found",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        if not user.get("is_active", False):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="User account is disabled"
            )
        
        return user
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in get_current_user: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication failed",
            headers={"WWW-Authenticate": "Bearer"},
        )


@router.post("/register", response_model=Dict[str, Any])
async def register(
    request: UserCreate,
    supabase: SupabaseClient = Depends(get_supabase_client),
    password_manager: PasswordManager = Depends(get_password_manager),
    security_utils: SecurityUtils = Depends(get_security_utils)
):
    """User registration endpoint"""
    try:
        # Validate email format
        if not security_utils.validate_email_format(request.email):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="无效的邮箱格式"
            )
        
        # Check if user already exists
        existing_user = await supabase.get_user_by_email(request.email)
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="该邮箱已被注册"
            )
        
        # Hash password
        password_hash = password_manager.hash_password(request.password)
        
        # Create user data
        user_data = {
            "email": request.email,
            "name": request.name,
            "password_hash": password_hash
        }
        
        # Create user in database
        new_user = await supabase.create_user(user_data)
        if not new_user:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="用户创建失败"
            )
        
        logger.info(f"User registered successfully: {request.email}")
        return {
            "message": "注册成功，请登录",
            "user_id": new_user['id']
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Registration error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="注册失败"
        )


@router.post("/login", response_model=AuthResponse)
async def login(
    request: UserLogin,
    req: Request,
    supabase: SupabaseClient = Depends(get_supabase_client),
    password_manager: PasswordManager = Depends(get_password_manager),
    token_manager: TokenManager = Depends(get_token_manager)
):
    """User login endpoint"""
    try:
        # Get user by email
        user = await supabase.get_user_by_email(request.email)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="邮箱或密码错误"
            )
        
        # Verify password
        if not password_manager.verify_password(request.password, user['password_hash']):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="邮箱或密码错误"
            )
        
        # Check if user is active
        if not user.get('is_active', False):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="账户已被禁用"
            )
        
        # Generate tokens
        token_expires = timedelta(hours=24 if request.remember_me else 1)
        token_data = {"sub": user['id'], "email": user['email']}
        
        access_token = token_manager.create_access_token(
            data=token_data, 
            expires_delta=token_expires
        )
        refresh_token = token_manager.create_refresh_token(data=token_data)
        
        # Save session (optional)
        try:
            session_data = {
                "user_id": user['id'],
                "token_hash": SecurityUtils().hash_token(access_token),
                "refresh_token_hash": SecurityUtils().hash_token(refresh_token),
                "expires_at": (datetime.utcnow() + token_expires).isoformat(),
                "ip_address": req.client.host if req.client else None,
                "user_agent": req.headers.get("user-agent", "")
            }
            await supabase.save_user_session(session_data)
        except Exception as e:
            logger.warning(f"Failed to save session: {e}")
        
        # Update last login
        await supabase.update_last_login(user['id'])
        
        # Create response
        user_response = UserResponse(**user)
        auth_response = AuthResponse(
            user=user_response,
            access_token=access_token,
            refresh_token=refresh_token
        )
        
        logger.info(f"User logged in successfully: {request.email}")
        return auth_response
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Login error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="登录失败"
        )


@router.post("/refresh")
async def refresh_token(
    refresh_token: str,
    supabase: SupabaseClient = Depends(get_supabase_client),
    token_manager: TokenManager = Depends(get_token_manager)
):
    """Refresh access token using refresh token"""
    try:
        # Verify refresh token
        payload = token_manager.verify_token(refresh_token, "refresh")
        if not payload:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid refresh token"
            )
        
        user_id = payload.get("sub")
        email = payload.get("email")
        
        if not user_id or not email:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token payload"
            )
        
        # Verify user still exists and is active
        user = await supabase.get_user_by_id(user_id)
        if not user or not user.get('is_active', False):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User not found or inactive"
            )
        
        # Generate new tokens
        token_data = {"sub": user_id, "email": email}
        new_access_token = token_manager.create_access_token(data=token_data)
        new_refresh_token = token_manager.create_refresh_token(data=token_data)
        
        return {
            "access_token": new_access_token,
            "refresh_token": new_refresh_token,
            "token_type": "bearer"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Token refresh error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Token refresh failed"
        )


@router.post("/forgot-password")
async def forgot_password(
    request: ForgotPasswordRequest,
    supabase: SupabaseClient = Depends(get_supabase_client),
    token_manager: TokenManager = Depends(get_token_manager),
    security_utils: SecurityUtils = Depends(get_security_utils)
):
    """Request password reset"""
    try:
        user = await supabase.get_user_by_email(request.email)
        if not user:
            # For security, don't reveal if user exists
            return {"message": "如果该邮箱存在，将发送重置链接"}
        
        # Generate reset token
        reset_token = token_manager.create_reset_token(user['id'])
        token_hash = security_utils.hash_token(reset_token)
        expires_at = datetime.utcnow() + timedelta(hours=24)
        
        # Save reset token
        await supabase.save_reset_token(user['id'], token_hash, expires_at)
        
        # TODO: Send email with reset link
        # For now, just log the token (remove in production)
        logger.info(f"Password reset token for {request.email}: {reset_token}")
        
        return {"message": "密码重置链接已发送"}
        
    except Exception as e:
        logger.error(f"Forgot password error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="密码重置请求失败"
        )


@router.post("/reset-password")
async def reset_password(
    request: ResetPasswordRequest,
    supabase: SupabaseClient = Depends(get_supabase_client),
    token_manager: TokenManager = Depends(get_token_manager),
    password_manager: PasswordManager = Depends(get_password_manager),
    security_utils: SecurityUtils = Depends(get_security_utils)
):
    """Reset password using reset token"""
    try:
        # Verify reset token
        payload = token_manager.verify_token(request.token, "reset")
        if not payload:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="无效或已过期的重置链接"
            )
        
        user_id = payload.get("sub")
        if not user_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="无效的重置令牌"
            )
        
        # Check if token exists and is not used
        token_hash = security_utils.hash_token(request.token)
        reset_token_record = await supabase.get_reset_token(token_hash)
        if not reset_token_record:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="重置链接已失效"
            )
        
        # Get user
        user = await supabase.get_user_by_id(user_id)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="用户不存在"
            )
        
        # Hash new password
        new_password_hash = password_manager.hash_password(request.password)
        
        # Update user password
        update_result = await supabase.update_user(user_id, {
            "password_hash": new_password_hash
        })
        
        if not update_result:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="密码更新失败"
            )
        
        # Mark reset token as used
        await supabase.mark_reset_token_used(reset_token_record['id'])
        
        logger.info(f"Password reset successfully for user: {user['email']}")
        return {"message": "密码重置成功"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Reset password error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="密码重置失败"
        )


@router.get("/me", response_model=UserResponse)
async def get_current_user_info(
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """Get current user information"""
    return UserResponse(**current_user)


@router.post("/change-password")
async def change_password(
    request: ChangePasswordRequest,
    current_user: Dict[str, Any] = Depends(get_current_user),
    supabase: SupabaseClient = Depends(get_supabase_client),
    password_manager: PasswordManager = Depends(get_password_manager)
):
    """Change user password"""
    try:
        # Verify current password
        if not password_manager.verify_password(request.current_password, current_user['password_hash']):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="当前密码错误"
            )
        
        # Hash new password
        new_password_hash = password_manager.hash_password(request.new_password)
        
        # Update password
        update_result = await supabase.update_user(current_user['id'], {
            "password_hash": new_password_hash
        })
        
        if not update_result:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="密码更新失败"
            )
        
        logger.info(f"Password changed successfully for user: {current_user['email']}")
        return {"message": "密码修改成功"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Change password error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="密码修改失败"
        )


@router.post("/logout")
async def logout(
    current_user: Dict[str, Any] = Depends(get_current_user),
    credentials: HTTPAuthorizationCredentials = Depends(security),
    supabase: SupabaseClient = Depends(get_supabase_client),
    security_utils: SecurityUtils = Depends(get_security_utils)
):
    """Logout user and invalidate session"""
    try:
        # Get sessions and try to delete current session
        sessions = await supabase.get_user_sessions(current_user['id'])
        token_hash = security_utils.hash_token(credentials.credentials)
        
        for session in sessions:
            if session.get('token_hash') == token_hash:
                await supabase.delete_user_session(session['id'])
                break
        
        logger.info(f"User logged out: {current_user['email']}")
        return {"message": "登出成功"}
        
    except Exception as e:
        logger.error(f"Logout error: {e}")
        # Even if session deletion fails, consider logout successful
        return {"message": "登出成功"}


# Health check for auth routes
@router.get("/health")
async def auth_health():
    """Auth service health check"""
    return {"status": "healthy", "service": "authentication"}