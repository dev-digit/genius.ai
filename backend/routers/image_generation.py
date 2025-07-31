from fastapi import APIRouter, HTTPException, status, Depends, BackgroundTasks
from fastapi.responses import StreamingResponse
from datetime import datetime
from bson import ObjectId
import torch
from diffusers import StableDiffusionXLPipeline, DPMSolverMultistepScheduler
from PIL import Image
import io
import os
import uuid
import asyncio
import json
import time
from typing import Dict, Any

from models import ImageGenerationRequest, ImageGenerationResponse, GenerationProgress
from auth import get_current_user
from database import get_database

router = APIRouter()

# Global pipeline cache
pipeline_cache: Dict[str, Any] = {}
generation_status: Dict[str, GenerationProgress] = {}

def get_pipeline(model_version: str = "stable-diffusion-xl-base-1.0"):
    """Get or create Stable Diffusion pipeline"""
    if model_version not in pipeline_cache:
        try:
            # Load pipeline with optimizations
            pipe = StableDiffusionXLPipeline.from_pretrained(
                "stabilityai/stable-diffusion-xl-base-1.0",
                torch_dtype=torch.float16,
                use_safetensors=True,
                variant="fp16"
            )
            
            # Optimize for memory and speed
            pipe.scheduler = DPMSolverMultistepScheduler.from_config(pipe.scheduler.config)
            pipe = pipe.to("cuda" if torch.cuda.is_available() else "cpu")
            
            # Enable memory efficient attention
            if torch.cuda.is_available():
                pipe.enable_memory_efficient_attention()
                pipe.enable_vae_slicing()
                pipe.enable_vae_tiling()
            
            pipeline_cache[model_version] = pipe
            print(f"Loaded {model_version} pipeline")
        except Exception as e:
            print(f"Error loading pipeline: {e}")
            return None
    
    return pipeline_cache[model_version]

def save_image(image: Image.Image, filename: str) -> str:
    """Save generated image and return URL"""
    os.makedirs("generated_images", exist_ok=True)
    filepath = os.path.join("generated_images", filename)
    image.save(filepath, "PNG")
    return f"/generated-images/{filename}"

async def generate_image_task(
    request: ImageGenerationRequest,
    user_id: str,
    generation_id: str
):
    """Background task for image generation"""
    try:
        # Update status to processing
        generation_status[generation_id] = GenerationProgress(
            status="processing",
            progress=10.0,
            message="Loading model...",
            estimated_time=30
        )
        
        # Get pipeline
        pipe = get_pipeline(request.model_version)
        if not pipe:
            generation_status[generation_id] = GenerationProgress(
                status="failed",
                progress=0.0,
                message="Failed to load model"
            )
            return
        
        generation_status[generation_id].progress = 30.0
        generation_status[generation_id].message = "Generating image..."
        
        # Prepare prompt
        style_prompts = {
            "realistic": "photorealistic, highly detailed, 8k resolution",
            "artistic": "artistic, painterly, creative composition",
            "anime": "anime style, manga, cel shading",
            "cartoon": "cartoon style, vibrant colors, stylized",
            "abstract": "abstract art, geometric, non-representational",
            "photographic": "professional photography, studio lighting",
            "digital_art": "digital art, concept art, detailed illustration",
            "concept_art": "concept art, matte painting, cinematic"
        }
        
        enhanced_prompt = f"{request.prompt}, {style_prompts.get(request.style.value, '')}"
        
        # Generate image
        start_time = time.time()
        
        with torch.inference_mode():
            images = pipe(
                prompt=enhanced_prompt,
                negative_prompt=request.negative_prompt or "blurry, low quality, distorted",
                num_inference_steps=request.steps,
                guidance_scale=request.guidance_scale,
                width=int(request.size.value.split('x')[0]),
                height=int(request.size.value.split('x')[1]),
                num_images_per_prompt=request.num_images,
                generator=torch.Generator().manual_seed(request.seed) if request.seed else None
            ).images
        
        processing_time = time.time() - start_time
        
        generation_status[generation_id].progress = 80.0
        generation_status[generation_id].message = "Saving images..."
        
        # Save images
        image_urls = []
        for i, image in enumerate(images):
            filename = f"{generation_id}_{i}.png"
            url = save_image(image, filename)
            image_urls.append(url)
        
        # Save to database
        db = get_database()
        image_record = {
            "_id": generation_id,
            "user_id": user_id,
            "prompt": request.prompt,
            "negative_prompt": request.negative_prompt,
            "style": request.style.value,
            "size": request.size.value,
            "image_urls": image_urls,
            "parameters": {
                "steps": request.steps,
                "guidance_scale": request.guidance_scale,
                "seed": request.seed,
                "model_version": request.model_version,
                "num_images": request.num_images
            },
            "created_at": datetime.utcnow(),
            "processing_time": processing_time,
            "is_favorite": False
        }
        
        await db.image_history.insert_one(image_record)
        
        # Update status to completed
        generation_status[generation_id] = GenerationProgress(
            status="completed",
            progress=100.0,
            message="Generation completed!",
            estimated_time=0
        )
        
    except Exception as e:
        print(f"Error in image generation: {e}")
        generation_status[generation_id] = GenerationProgress(
            status="failed",
            progress=0.0,
            message=f"Generation failed: {str(e)}"
        )

@router.post("/image", response_model=dict)
async def generate_image(
    request: ImageGenerationRequest,
    background_tasks: BackgroundTasks,
    current_user: dict = Depends(get_current_user)
):
    """Generate image using Stable Diffusion XL"""
    user_id = str(current_user["_id"])
    generation_id = str(uuid.uuid4())
    
    # Initialize generation status
    generation_status[generation_id] = GenerationProgress(
        status="queued",
        progress=0.0,
        message="Request queued for processing",
        estimated_time=60
    )
    
    # Start background task
    background_tasks.add_task(
        generate_image_task,
        request,
        user_id,
        generation_id
    )
    
    return {
        "generation_id": generation_id,
        "status": "queued",
        "message": "Image generation started. Use the generation_id to check progress."
    }

@router.get("/image/{generation_id}/status")
async def get_generation_status(
    generation_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Get image generation status"""
    if generation_id not in generation_status:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Generation ID not found"
        )
    
    status_info = generation_status[generation_id]
    
    # If completed, get the result from database
    if status_info.status == "completed":
        db = get_database()
        result = await db.image_history.find_one({"_id": generation_id})
        if result:
            return {
                "status": status_info.status,
                "progress": status_info.progress,
                "message": status_info.message,
                "result": {
                    "id": result["_id"],
                    "prompt": result["prompt"],
                    "image_urls": result["image_urls"],
                    "parameters": result["parameters"],
                    "processing_time": result.get("processing_time")
                }
            }
    
    return {
        "status": status_info.status,
        "progress": status_info.progress,
        "message": status_info.message,
        "estimated_time": status_info.estimated_time
    }

@router.get("/image/{generation_id}/stream")
async def stream_generation_progress(
    generation_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Stream image generation progress"""
    async def generate_progress_stream():
        while generation_id in generation_status:
            status_info = generation_status[generation_id]
            
            data = {
                "status": status_info.status,
                "progress": status_info.progress,
                "message": status_info.message,
                "estimated_time": status_info.estimated_time
            }
            
            # If completed, include result
            if status_info.status == "completed":
                db = get_database()
                result = await db.image_history.find_one({"_id": generation_id})
                if result:
                    data["result"] = {
                        "id": result["_id"],
                        "prompt": result["prompt"],
                        "image_urls": result["image_urls"],
                        "parameters": result["parameters"],
                        "processing_time": result.get("processing_time")
                    }
            
            yield f"data: {json.dumps(data)}\n\n"
            
            # Break if completed or failed
            if status_info.status in ["completed", "failed"]:
                break
            
            await asyncio.sleep(1)  # Update every second
    
    return StreamingResponse(
        generate_progress_stream(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Headers": "*",
        }
    )

@router.get("/models")
async def get_available_models():
    """Get list of available image generation models"""
    return {
        "models": [
            {
                "id": "stable-diffusion-xl-base-1.0",
                "name": "Stable Diffusion XL Base 1.0",
                "description": "High-quality image generation with excellent prompt following",
                "type": "text-to-image",
                "max_resolution": "1024x1024"
            }
        ]
    }

@router.get("/styles")
async def get_available_styles():
    """Get list of available image styles"""
    return {
        "styles": [
            {"id": "realistic", "name": "Realistic", "description": "Photorealistic images"},
            {"id": "artistic", "name": "Artistic", "description": "Artistic and painterly style"},
            {"id": "anime", "name": "Anime", "description": "Anime and manga style"},
            {"id": "cartoon", "name": "Cartoon", "description": "Cartoon and stylized"},
            {"id": "abstract", "name": "Abstract", "description": "Abstract and geometric"},
            {"id": "photographic", "name": "Photographic", "description": "Professional photography"},
            {"id": "digital_art", "name": "Digital Art", "description": "Digital illustration"},
            {"id": "concept_art", "name": "Concept Art", "description": "Concept art and matte painting"}
        ]
    }

@router.delete("/image/{generation_id}")
async def cancel_generation(
    generation_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Cancel image generation"""
    if generation_id in generation_status:
        if generation_status[generation_id].status in ["queued", "processing"]:
            generation_status[generation_id] = GenerationProgress(
                status="failed",
                progress=0.0,
                message="Generation cancelled by user"
            )
            return {"message": "Generation cancelled"}
        else:
            return {"message": "Generation already completed or failed"}
    else:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Generation ID not found"
        )