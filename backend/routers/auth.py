from fastapi import APIRouter, HTTPException, status, Depends
from fastapi.security import HTTPBearer
from datetime import datetime, timedelta
from bson import ObjectId
import uuid

from models import UserCreate, UserLogin, UserResponse, Token
from auth import (
    get_password_hash, 
    authenticate_user, 
    create_access_token, 
    get_current_user,
    create_user_response,
    ACCESS_TOKEN_EXPIRE_MINUTES
)
from database import get_database

router = APIRouter()

@router.post("/signup", response_model=dict, status_code=status.HTTP_201_CREATED)
async def signup(user_data: UserCreate):
    """Register a new user"""
    db = get_database()
    
    # Check if user already exists
    existing_user = await db.users.find_one({
        "$or": [
            {"email": user_data.email},
            {"username": user_data.username}
        ]
    })
    
    if existing_user:
        if existing_user["email"] == user_data.email:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Username already taken"
            )
    
    # Create new user
    hashed_password = get_password_hash(user_data.password)
    user_doc = {
        "_id": str(ObjectId()),
        "username": user_data.username,
        "email": user_data.email,
        "full_name": user_data.full_name,
        "hashed_password": hashed_password,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow(),
        "is_active": True,
        "settings": {
            "theme": "dark",
            "default_image_style": "realistic",
            "default_image_size": "1024x1024",
            "chat_model": "gpt-4o-mini",
            "auto_save_history": True,
            "notifications_enabled": True
        }
    }
    
    await db.users.insert_one(user_doc)
    
    # Create access token
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user_doc["_id"]}, 
        expires_delta=access_token_expires
    )
    
    return {
        "message": "User created successfully",
        "user": create_user_response(user_doc),
        "access_token": access_token,
        "token_type": "bearer",
        "expires_in": ACCESS_TOKEN_EXPIRE_MINUTES * 60
    }

@router.post("/login", response_model=dict)
async def login(user_credentials: UserLogin):
    """Authenticate user and return access token"""
    user = await authenticate_user(user_credentials.email, user_credentials.password)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Create access token
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": str(user["_id"])}, 
        expires_delta=access_token_expires
    )
    
    return {
        "message": "Login successful",
        "user": create_user_response(user),
        "access_token": access_token,
        "token_type": "bearer",
        "expires_in": ACCESS_TOKEN_EXPIRE_MINUTES * 60
    }

@router.get("/me", response_model=UserResponse)
async def get_current_user_info(current_user: dict = Depends(get_current_user)):
    """Get current user information"""
    return create_user_response(current_user)

@router.post("/refresh", response_model=Token)
async def refresh_token(current_user: dict = Depends(get_current_user)):
    """Refresh access token"""
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": str(current_user["_id"])}, 
        expires_delta=access_token_expires
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "expires_in": ACCESS_TOKEN_EXPIRE_MINUTES * 60
    }

@router.post("/logout")
async def logout(current_user: dict = Depends(get_current_user)):
    """Logout user (client-side token removal)"""
    return {"message": "Logged out successfully"}

@router.delete("/account")
async def delete_account(current_user: dict = Depends(get_current_user)):
    """Delete user account and all associated data"""
    db = get_database()
    user_id = str(current_user["_id"])
    
    # Delete user data
    await db.users.delete_one({"_id": user_id})
    await db.chat_history.delete_many({"user_id": user_id})
    await db.image_history.delete_many({"user_id": user_id})
    
    return {"message": "Account deleted successfully"}