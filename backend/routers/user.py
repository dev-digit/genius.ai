from fastapi import APIRouter, HTTPException, status, Depends
from datetime import datetime
from typing import Optional

from models import UserSettings, UserResponse
from auth import get_current_user, get_password_hash, verify_password
from database import get_database

router = APIRouter()

@router.get("/profile", response_model=UserResponse)
async def get_user_profile(current_user: dict = Depends(get_current_user)):
    """Get user profile information"""
    return {
        "id": str(current_user["_id"]),
        "username": current_user["username"],
        "email": current_user["email"],
        "full_name": current_user.get("full_name"),
        "created_at": current_user["created_at"],
        "is_active": current_user.get("is_active", True)
    }

@router.put("/profile")
async def update_user_profile(
    full_name: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    """Update user profile information"""
    db = get_database()
    user_id = str(current_user["_id"])
    
    update_data = {"updated_at": datetime.utcnow()}
    
    if full_name is not None:
        update_data["full_name"] = full_name
    
    await db.users.update_one(
        {"_id": user_id},
        {"$set": update_data}
    )
    
    return {"message": "Profile updated successfully"}

@router.get("/settings")
async def get_user_settings(current_user: dict = Depends(get_current_user)):
    """Get user settings"""
    return current_user.get("settings", {
        "theme": "dark",
        "default_image_style": "realistic",
        "default_image_size": "1024x1024",
        "chat_model": "gpt-4o-mini",
        "auto_save_history": True,
        "notifications_enabled": True
    })

@router.put("/settings")
async def update_user_settings(
    settings: UserSettings,
    current_user: dict = Depends(get_current_user)
):
    """Update user settings"""
    db = get_database()
    user_id = str(current_user["_id"])
    
    # Convert settings to dict, excluding None values
    settings_dict = {}
    for key, value in settings.dict().items():
        if value is not None:
            settings_dict[key] = value
    
    await db.users.update_one(
        {"_id": user_id},
        {
            "$set": {
                "settings": settings_dict,
                "updated_at": datetime.utcnow()
            }
        }
    )
    
    return {"message": "Settings updated successfully"}

@router.post("/change-password")
async def change_password(
    current_password: str,
    new_password: str,
    current_user: dict = Depends(get_current_user)
):
    """Change user password"""
    db = get_database()
    user_id = str(current_user["_id"])
    
    # Verify current password
    if not verify_password(current_password, current_user["hashed_password"]):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Current password is incorrect"
        )
    
    # Validate new password
    if len(new_password) < 8:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="New password must be at least 8 characters long"
        )
    
    # Hash new password
    new_hashed_password = get_password_hash(new_password)
    
    # Update password in database
    await db.users.update_one(
        {"_id": user_id},
        {
            "$set": {
                "hashed_password": new_hashed_password,
                "updated_at": datetime.utcnow()
            }
        }
    )
    
    return {"message": "Password changed successfully"}

@router.get("/usage-stats")
async def get_usage_stats(current_user: dict = Depends(get_current_user)):
    """Get user's usage statistics"""
    db = get_database()
    user_id = str(current_user["_id"])
    
    # Count total chats and images
    total_chats = await db.chat_history.count_documents({"user_id": user_id})
    total_images = await db.image_history.count_documents({"user_id": user_id})
    
    # Get recent activity (last 30 days)
    from datetime import timedelta
    thirty_days_ago = datetime.utcnow() - timedelta(days=30)
    
    recent_chats = await db.chat_history.count_documents({
        "user_id": user_id,
        "created_at": {"$gte": thirty_days_ago}
    })
    
    recent_images = await db.image_history.count_documents({
        "user_id": user_id,
        "created_at": {"$gte": thirty_days_ago}
    })
    
    # Get favorite images count
    favorite_images = await db.image_history.count_documents({
        "user_id": user_id,
        "is_favorite": True
    })
    
    # Calculate total messages in chats
    pipeline = [
        {"$match": {"user_id": user_id}},
        {"$project": {"message_count": {"$size": "$messages"}}},
        {"$group": {"_id": None, "total_messages": {"$sum": "$message_count"}}}
    ]
    
    message_stats = await db.chat_history.aggregate(pipeline).to_list(length=1)
    total_messages = message_stats[0]["total_messages"] if message_stats else 0
    
    return {
        "total_chats": total_chats,
        "total_images": total_images,
        "total_messages": total_messages,
        "favorite_images": favorite_images,
        "recent_activity": {
            "chats_last_30_days": recent_chats,
            "images_last_30_days": recent_images
        },
        "account_created": current_user["created_at"],
        "last_active": current_user.get("updated_at", current_user["created_at"])
    }

@router.post("/export-data")
async def export_user_data(current_user: dict = Depends(get_current_user)):
    """Export all user data"""
    db = get_database()
    user_id = str(current_user["_id"])
    
    # Get all user data
    chat_history = await db.chat_history.find({"user_id": user_id}).to_list(length=None)
    image_history = await db.image_history.find({"user_id": user_id}).to_list(length=None)
    
    # Clean up data (remove internal fields)
    for chat in chat_history:
        chat["_id"] = str(chat["_id"])
    
    for image in image_history:
        image["_id"] = str(image["_id"])
    
    export_data = {
        "user_profile": {
            "id": str(current_user["_id"]),
            "username": current_user["username"],
            "email": current_user["email"],
            "full_name": current_user.get("full_name"),
            "created_at": current_user["created_at"],
            "settings": current_user.get("settings", {})
        },
        "chat_history": chat_history,
        "image_history": image_history,
        "export_date": datetime.utcnow()
    }
    
    return export_data

@router.delete("/deactivate")
async def deactivate_account(current_user: dict = Depends(get_current_user)):
    """Deactivate user account (soft delete)"""
    db = get_database()
    user_id = str(current_user["_id"])
    
    await db.users.update_one(
        {"_id": user_id},
        {
            "$set": {
                "is_active": False,
                "deactivated_at": datetime.utcnow(),
                "updated_at": datetime.utcnow()
            }
        }
    )
    
    return {"message": "Account deactivated successfully"}

@router.post("/reactivate")
async def reactivate_account(
    email: str,
    password: str
):
    """Reactivate a deactivated account"""
    db = get_database()
    
    # Find deactivated user
    user = await db.users.find_one({
        "email": email,
        "is_active": False
    })
    
    if not user or not verify_password(password, user["hashed_password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials or account not found"
        )
    
    # Reactivate account
    await db.users.update_one(
        {"_id": user["_id"]},
        {
            "$set": {
                "is_active": True,
                "updated_at": datetime.utcnow()
            },
            "$unset": {"deactivated_at": ""}
        }
    )
    
    return {"message": "Account reactivated successfully"}