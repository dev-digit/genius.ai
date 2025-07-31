from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import uvicorn
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Import routers
from routers import auth, chat, image_generation, history, user

app = FastAPI(
    title="AI Studio API",
    description="Full-stack AI Studio with Image Generation and Chatbot",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://your-frontend-domain.vercel.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Static files for generated images
os.makedirs("generated_images", exist_ok=True)
app.mount("/generated-images", StaticFiles(directory="generated_images"), name="generated_images")

# Include routers
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(chat.router, prefix="/api/chat", tags=["Chat"])
app.include_router(image_generation.router, prefix="/api/generate", tags=["Image Generation"])
app.include_router(history.router, prefix="/api/history", tags=["History"])
app.include_router(user.router, prefix="/api/user", tags=["User"])

@app.get("/")
async def root():
    return {"message": "AI Studio API is running!", "version": "1.0.0"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "message": "API is running smoothly"}

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )