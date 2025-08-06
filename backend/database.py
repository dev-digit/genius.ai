from motor.motor_asyncio import AsyncIOMotorClient
from pymongo import MongoClient
import os
from dotenv import load_dotenv

load_dotenv()

MONGODB_URL = os.getenv("MONGODB_URL", "mongodb://localhost:27017/ai_studio")

class Database:
    client: AsyncIOMotorClient = None
    database = None

# Database instance
db = Database()

async def connect_to_mongo():
    """Create database connection"""
    db.client = AsyncIOMotorClient(MONGODB_URL)
    db.database = db.client.get_default_database()
    
    # Create indexes for better performance
    await create_indexes()
    print("Connected to MongoDB")

async def close_mongo_connection():
    """Close database connection"""
    if db.client:
        db.client.close()
        print("Disconnected from MongoDB")

async def create_indexes():
    """Create database indexes for better performance"""
    # Users collection indexes
    await db.database.users.create_index("email", unique=True)
    await db.database.users.create_index("username", unique=True)
    
    # Chat history indexes
    await db.database.chat_history.create_index([("user_id", 1), ("created_at", -1)])
    await db.database.chat_history.create_index("session_id")
    
    # Image history indexes
    await db.database.image_history.create_index([("user_id", 1), ("created_at", -1)])
    await db.database.image_history.create_index("prompt")
    
    print("Database indexes created successfully")

def get_database():
    """Get database instance"""
    return db.database