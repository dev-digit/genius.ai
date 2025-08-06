from fastapi import APIRouter, HTTPException, status, Depends, Query
from datetime import datetime, timedelta
from typing import Optional
from bson import ObjectId

from models import HistoryFilter, HistoryResponse, ChatHistory, ImageHistory
from auth import get_current_user
from database import get_database

router = APIRouter()

@router.get("/", response_model=HistoryResponse)
async def get_history(
    type: Optional[str] = Query(None, regex="^(chat|image)$"),
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    limit: int = Query(20, le=100),
    offset: int = Query(0, ge=0),
    current_user: dict = Depends(get_current_user)
):
    """Get user's chat and image history"""
    db = get_database()
    user_id = str(current_user["_id"])
    
    # Build date filter
    date_filter = {}
    if start_date:
        date_filter["$gte"] = start_date
    if end_date:
        date_filter["$lte"] = end_date
    
    query = {"user_id": user_id}
    if date_filter:
        query["created_at"] = date_filter
    
    chat_history = []
    image_history = []
    total_count = 0
    
    # Get chat history
    if not type or type == "chat":
        chat_cursor = db.chat_history.find(query).sort("created_at", -1).skip(offset).limit(limit)
        chat_docs = await chat_cursor.to_list(length=limit)
        
        for doc in chat_docs:
            chat_history.append({
                "id": str(doc["_id"]),
                "user_id": doc["user_id"],
                "session_id": doc["session_id"],
                "messages": doc["messages"],
                "created_at": doc["created_at"],
                "updated_at": doc["updated_at"]
            })
        
        chat_count = await db.chat_history.count_documents(query)
        total_count += chat_count
    
    # Get image history
    if not type or type == "image":
        image_cursor = db.image_history.find(query).sort("created_at", -1).skip(offset).limit(limit)
        image_docs = await image_cursor.to_list(length=limit)
        
        for doc in image_docs:
            image_history.append({
                "id": str(doc["_id"]),
                "user_id": doc["user_id"],
                "prompt": doc["prompt"],
                "negative_prompt": doc.get("negative_prompt"),
                "style": doc["style"],
                "size": doc["size"],
                "image_urls": doc["image_urls"],
                "parameters": doc["parameters"],
                "created_at": doc["created_at"],
                "is_favorite": doc.get("is_favorite", False)
            })
        
        image_count = await db.image_history.count_documents(query)
        total_count += image_count
    
    # Check if there are more items
    has_more = (offset + limit) < total_count
    
    return HistoryResponse(
        chat_history=chat_history,
        image_history=image_history,
        total_count=total_count,
        has_more=has_more
    )

@router.get("/chat", response_model=dict)
async def get_chat_history(
    limit: int = Query(20, le=100),
    offset: int = Query(0, ge=0),
    session_id: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    """Get chat history with optional session filter"""
    db = get_database()
    user_id = str(current_user["_id"])
    
    query = {"user_id": user_id}
    if session_id:
        query["session_id"] = session_id
    
    cursor = db.chat_history.find(query).sort("created_at", -1).skip(offset).limit(limit)
    docs = await cursor.to_list(length=limit)
    
    chat_history = []
    for doc in docs:
        chat_history.append({
            "id": str(doc["_id"]),
            "user_id": doc["user_id"],
            "session_id": doc["session_id"],
            "messages": doc["messages"],
            "created_at": doc["created_at"],
            "updated_at": doc["updated_at"]
        })
    
    total_count = await db.chat_history.count_documents(query)
    has_more = (offset + limit) < total_count
    
    return {
        "chat_history": chat_history,
        "total_count": total_count,
        "has_more": has_more
    }

@router.get("/images", response_model=dict)
async def get_image_history(
    limit: int = Query(20, le=100),
    offset: int = Query(0, ge=0),
    favorites_only: bool = Query(False),
    current_user: dict = Depends(get_current_user)
):
    """Get image generation history"""
    db = get_database()
    user_id = str(current_user["_id"])
    
    query = {"user_id": user_id}
    if favorites_only:
        query["is_favorite"] = True
    
    cursor = db.image_history.find(query).sort("created_at", -1).skip(offset).limit(limit)
    docs = await cursor.to_list(length=limit)
    
    image_history = []
    for doc in docs:
        image_history.append({
            "id": str(doc["_id"]),
            "user_id": doc["user_id"],
            "prompt": doc["prompt"],
            "negative_prompt": doc.get("negative_prompt"),
            "style": doc["style"],
            "size": doc["size"],
            "image_urls": doc["image_urls"],
            "parameters": doc["parameters"],
            "created_at": doc["created_at"],
            "processing_time": doc.get("processing_time"),
            "is_favorite": doc.get("is_favorite", False)
        })
    
    total_count = await db.image_history.count_documents(query)
    has_more = (offset + limit) < total_count
    
    return {
        "image_history": image_history,
        "total_count": total_count,
        "has_more": has_more
    }

@router.post("/images/{image_id}/favorite")
async def toggle_image_favorite(
    image_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Toggle favorite status of an image"""
    db = get_database()
    user_id = str(current_user["_id"])
    
    # Find the image
    image = await db.image_history.find_one({
        "_id": image_id,
        "user_id": user_id
    })
    
    if not image:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Image not found"
        )
    
    # Toggle favorite status
    new_favorite_status = not image.get("is_favorite", False)
    
    await db.image_history.update_one(
        {"_id": image_id, "user_id": user_id},
        {"$set": {"is_favorite": new_favorite_status}}
    )
    
    return {
        "message": f"Image {'added to' if new_favorite_status else 'removed from'} favorites",
        "is_favorite": new_favorite_status
    }

@router.delete("/images/{image_id}")
async def delete_image(
    image_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Delete an image from history"""
    db = get_database()
    user_id = str(current_user["_id"])
    
    result = await db.image_history.delete_one({
        "_id": image_id,
        "user_id": user_id
    })
    
    if result.deleted_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Image not found"
        )
    
    # TODO: Also delete the actual image files from storage
    
    return {"message": "Image deleted successfully"}

@router.delete("/chat/{session_id}")
async def delete_chat_session(
    session_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Delete a chat session"""
    db = get_database()
    user_id = str(current_user["_id"])
    
    result = await db.chat_history.delete_one({
        "user_id": user_id,
        "session_id": session_id
    })
    
    if result.deleted_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Chat session not found"
        )
    
    return {"message": "Chat session deleted successfully"}

@router.delete("/clear")
async def clear_history(
    type: Optional[str] = Query(None, regex="^(chat|image)$"),
    current_user: dict = Depends(get_current_user)
):
    """Clear user's history"""
    db = get_database()
    user_id = str(current_user["_id"])
    
    deleted_count = 0
    
    if not type or type == "chat":
        result = await db.chat_history.delete_many({"user_id": user_id})
        deleted_count += result.deleted_count
    
    if not type or type == "image":
        result = await db.image_history.delete_many({"user_id": user_id})
        deleted_count += result.deleted_count
    
    return {
        "message": f"Cleared {deleted_count} items from history",
        "deleted_count": deleted_count
    }

@router.get("/stats")
async def get_history_stats(current_user: dict = Depends(get_current_user)):
    """Get user's history statistics"""
    db = get_database()
    user_id = str(current_user["_id"])
    
    # Count documents
    chat_count = await db.chat_history.count_documents({"user_id": user_id})
    image_count = await db.image_history.count_documents({"user_id": user_id})
    favorite_images = await db.image_history.count_documents({
        "user_id": user_id,
        "is_favorite": True
    })
    
    # Get date ranges
    chat_pipeline = [
        {"$match": {"user_id": user_id}},
        {"$group": {
            "_id": None,
            "oldest": {"$min": "$created_at"},
            "newest": {"$max": "$created_at"}
        }}
    ]
    
    image_pipeline = [
        {"$match": {"user_id": user_id}},
        {"$group": {
            "_id": None,
            "oldest": {"$min": "$created_at"},
            "newest": {"$max": "$created_at"}
        }}
    ]
    
    chat_dates = await db.chat_history.aggregate(chat_pipeline).to_list(length=1)
    image_dates = await db.image_history.aggregate(image_pipeline).to_list(length=1)
    
    return {
        "total_chats": chat_count,
        "total_images": image_count,
        "favorite_images": favorite_images,
        "chat_date_range": chat_dates[0] if chat_dates else None,
        "image_date_range": image_dates[0] if image_dates else None,
        "total_items": chat_count + image_count
    }