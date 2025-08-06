from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List, Dict, Any
from datetime import datetime
from enum import Enum

# User Models
class UserCreate(BaseModel):
    username: str = Field(..., min_length=3, max_length=50)
    email: EmailStr
    password: str = Field(..., min_length=8)
    full_name: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: str
    username: str
    email: str
    full_name: Optional[str] = None
    created_at: datetime
    is_active: bool = True

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in: int

# Chat Models
class ChatMessage(BaseModel):
    role: str = Field(..., regex="^(user|assistant|system)$")
    content: str
    timestamp: Optional[datetime] = None

class ChatRequest(BaseModel):
    message: str
    session_id: Optional[str] = None
    system_prompt: Optional[str] = None
    max_tokens: Optional[int] = Field(default=2000, le=4000)
    temperature: Optional[float] = Field(default=0.7, ge=0.0, le=2.0)
    stream: Optional[bool] = True

class ChatResponse(BaseModel):
    message: str
    session_id: str
    tokens_used: Optional[int] = None
    model: str = "gpt-4o-mini"

class ChatHistory(BaseModel):
    id: str
    user_id: str
    session_id: str
    messages: List[ChatMessage]
    created_at: datetime
    updated_at: datetime

# Image Generation Models
class ImageStyle(str, Enum):
    REALISTIC = "realistic"
    ARTISTIC = "artistic"
    ANIME = "anime"
    CARTOON = "cartoon"
    ABSTRACT = "abstract"
    PHOTOGRAPHIC = "photographic"
    DIGITAL_ART = "digital_art"
    CONCEPT_ART = "concept_art"

class ImageSize(str, Enum):
    SQUARE_512 = "512x512"
    SQUARE_768 = "768x768"
    SQUARE_1024 = "1024x1024"
    PORTRAIT_512 = "512x768"
    PORTRAIT_768 = "768x1024"
    LANDSCAPE_768 = "768x512"
    LANDSCAPE_1024 = "1024x768"

class ImageGenerationRequest(BaseModel):
    prompt: str = Field(..., min_length=1, max_length=1000)
    negative_prompt: Optional[str] = Field(default="", max_length=500)
    style: Optional[ImageStyle] = ImageStyle.REALISTIC
    size: Optional[ImageSize] = ImageSize.SQUARE_1024
    steps: Optional[int] = Field(default=20, ge=10, le=50)
    guidance_scale: Optional[float] = Field(default=7.5, ge=1.0, le=20.0)
    seed: Optional[int] = None
    num_images: Optional[int] = Field(default=1, ge=1, le=4)
    model_version: Optional[str] = "stable-diffusion-xl-base-1.0"

class ImageGenerationResponse(BaseModel):
    id: str
    prompt: str
    negative_prompt: Optional[str] = None
    style: str
    size: str
    image_urls: List[str]
    parameters: Dict[str, Any]
    created_at: datetime
    processing_time: Optional[float] = None

class ImageHistory(BaseModel):
    id: str
    user_id: str
    prompt: str
    negative_prompt: Optional[str] = None
    style: str
    size: str
    image_urls: List[str]
    parameters: Dict[str, Any]
    created_at: datetime
    is_favorite: bool = False

# History Models
class HistoryFilter(BaseModel):
    type: Optional[str] = Field(None, regex="^(chat|image)$")
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    limit: Optional[int] = Field(default=20, le=100)
    offset: Optional[int] = Field(default=0, ge=0)

class HistoryResponse(BaseModel):
    chat_history: List[ChatHistory] = []
    image_history: List[ImageHistory] = []
    total_count: int
    has_more: bool

# Error Models
class ErrorResponse(BaseModel):
    error: str
    message: str
    details: Optional[Dict[str, Any]] = None

# Progress Models (for streaming)
class GenerationProgress(BaseModel):
    status: str = Field(..., regex="^(queued|processing|completed|failed)$")
    progress: float = Field(..., ge=0.0, le=100.0)
    message: Optional[str] = None
    estimated_time: Optional[int] = None  # seconds

# Settings Models
class UserSettings(BaseModel):
    theme: Optional[str] = "dark"
    default_image_style: Optional[ImageStyle] = ImageStyle.REALISTIC
    default_image_size: Optional[ImageSize] = ImageSize.SQUARE_1024
    chat_model: Optional[str] = "gpt-4o-mini"
    auto_save_history: Optional[bool] = True
    notifications_enabled: Optional[bool] = True