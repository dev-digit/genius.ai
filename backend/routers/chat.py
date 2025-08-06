from fastapi import APIRouter, HTTPException, status, Depends
from fastapi.responses import StreamingResponse
from datetime import datetime
from bson import ObjectId
import openai
import json
import os
import uuid
from typing import AsyncGenerator

from models import ChatRequest, ChatResponse, ChatMessage, ChatHistory
from auth import get_current_user
from database import get_database

router = APIRouter()

# Configure OpenAI
openai.api_key = os.getenv("OPENAI_API_KEY")

@router.post("/", response_model=ChatResponse)
async def chat(
    request: ChatRequest,
    current_user: dict = Depends(get_current_user)
):
    """Send a message to the AI chatbot"""
    if not openai.api_key:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="OpenAI API key not configured"
        )
    
    db = get_database()
    user_id = str(current_user["_id"])
    session_id = request.session_id or str(uuid.uuid4())
    
    # Get chat history for context
    chat_history = await db.chat_history.find_one({
        "user_id": user_id,
        "session_id": session_id
    })
    
    messages = []
    if chat_history:
        messages = [{"role": msg["role"], "content": msg["content"]} 
                   for msg in chat_history["messages"]]
    
    # Add system prompt if provided
    if request.system_prompt and not any(msg["role"] == "system" for msg in messages):
        messages.insert(0, {"role": "system", "content": request.system_prompt})
    
    # Add user message
    messages.append({"role": "user", "content": request.message})
    
    try:
        # Call OpenAI API
        response = await openai.ChatCompletion.acreate(
            model="gpt-4o-mini",
            messages=messages,
            max_tokens=request.max_tokens,
            temperature=request.temperature,
            stream=False
        )
        
        assistant_message = response.choices[0].message.content
        tokens_used = response.usage.total_tokens
        
        # Save to database
        user_msg = ChatMessage(
            role="user",
            content=request.message,
            timestamp=datetime.utcnow()
        )
        
        assistant_msg = ChatMessage(
            role="assistant",
            content=assistant_message,
            timestamp=datetime.utcnow()
        )
        
        if chat_history:
            # Update existing chat
            await db.chat_history.update_one(
                {"user_id": user_id, "session_id": session_id},
                {
                    "$push": {
                        "messages": {
                            "$each": [user_msg.dict(), assistant_msg.dict()]
                        }
                    },
                    "$set": {"updated_at": datetime.utcnow()}
                }
            )
        else:
            # Create new chat
            new_chat = {
                "_id": str(ObjectId()),
                "user_id": user_id,
                "session_id": session_id,
                "messages": [user_msg.dict(), assistant_msg.dict()],
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow()
            }
            await db.chat_history.insert_one(new_chat)
        
        return ChatResponse(
            message=assistant_message,
            session_id=session_id,
            tokens_used=tokens_used,
            model="gpt-4o-mini"
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error generating response: {str(e)}"
        )

@router.post("/stream")
async def chat_stream(
    request: ChatRequest,
    current_user: dict = Depends(get_current_user)
):
    """Stream chat response from AI"""
    if not openai.api_key:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="OpenAI API key not configured"
        )
    
    async def generate_stream() -> AsyncGenerator[str, None]:
        db = get_database()
        user_id = str(current_user["_id"])
        session_id = request.session_id or str(uuid.uuid4())
        
        # Get chat history
        chat_history = await db.chat_history.find_one({
            "user_id": user_id,
            "session_id": session_id
        })
        
        messages = []
        if chat_history:
            messages = [{"role": msg["role"], "content": msg["content"]} 
                       for msg in chat_history["messages"]]
        
        # Add system prompt if provided
        if request.system_prompt and not any(msg["role"] == "system" for msg in messages):
            messages.insert(0, {"role": "system", "content": request.system_prompt})
        
        # Add user message
        messages.append({"role": "user", "content": request.message})
        
        try:
            # Stream response from OpenAI
            response = await openai.ChatCompletion.acreate(
                model="gpt-4o-mini",
                messages=messages,
                max_tokens=request.max_tokens,
                temperature=request.temperature,
                stream=True
            )
            
            full_response = ""
            async for chunk in response:
                if chunk.choices[0].delta.get("content"):
                    content = chunk.choices[0].delta.content
                    full_response += content
                    
                    # Send chunk to client
                    yield f"data: {json.dumps({'content': content, 'session_id': session_id})}\n\n"
            
            # Save complete conversation to database
            user_msg = ChatMessage(
                role="user",
                content=request.message,
                timestamp=datetime.utcnow()
            )
            
            assistant_msg = ChatMessage(
                role="assistant",
                content=full_response,
                timestamp=datetime.utcnow()
            )
            
            if chat_history:
                await db.chat_history.update_one(
                    {"user_id": user_id, "session_id": session_id},
                    {
                        "$push": {
                            "messages": {
                                "$each": [user_msg.dict(), assistant_msg.dict()]
                            }
                        },
                        "$set": {"updated_at": datetime.utcnow()}
                    }
                )
            else:
                new_chat = {
                    "_id": str(ObjectId()),
                    "user_id": user_id,
                    "session_id": session_id,
                    "messages": [user_msg.dict(), assistant_msg.dict()],
                    "created_at": datetime.utcnow(),
                    "updated_at": datetime.utcnow()
                }
                await db.chat_history.insert_one(new_chat)
            
            # Send completion signal
            yield f"data: {json.dumps({'done': True, 'session_id': session_id})}\n\n"
            
        except Exception as e:
            yield f"data: {json.dumps({'error': str(e)})}\n\n"
    
    return StreamingResponse(
        generate_stream(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Headers": "*",
        }
    )

@router.get("/sessions")
async def get_chat_sessions(current_user: dict = Depends(get_current_user)):
    """Get all chat sessions for the current user"""
    db = get_database()
    user_id = str(current_user["_id"])
    
    sessions = await db.chat_history.find(
        {"user_id": user_id},
        {"session_id": 1, "created_at": 1, "updated_at": 1, "messages": {"$slice": 1}}
    ).sort("updated_at", -1).to_list(length=50)
    
    # Format sessions with first message as title
    formatted_sessions = []
    for session in sessions:
        title = "New Chat"
        if session.get("messages") and len(session["messages"]) > 0:
            first_message = session["messages"][0]["content"]
            title = first_message[:50] + "..." if len(first_message) > 50 else first_message
        
        formatted_sessions.append({
            "session_id": session["session_id"],
            "title": title,
            "created_at": session["created_at"],
            "updated_at": session["updated_at"]
        })
    
    return {"sessions": formatted_sessions}

@router.get("/sessions/{session_id}")
async def get_chat_session(
    session_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Get specific chat session"""
    db = get_database()
    user_id = str(current_user["_id"])
    
    session = await db.chat_history.find_one({
        "user_id": user_id,
        "session_id": session_id
    })
    
    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Chat session not found"
        )
    
    return {
        "session_id": session["session_id"],
        "messages": session["messages"],
        "created_at": session["created_at"],
        "updated_at": session["updated_at"]
    }

@router.delete("/sessions/{session_id}")
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