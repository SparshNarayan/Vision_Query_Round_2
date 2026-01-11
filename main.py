from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import logging
import os

from database import Base, engine
from auth.routes import router as auth_router
from routers.upload import router as upload_router
from routers.classify import router as classify_router
from routers.search import router as search_router
from routers.history import router as history_router

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Create database tables
Base.metadata.create_all(bind=engine)
logger.info("Database tables created")

# Create FastAPI app
app = FastAPI(
    title="VisionQuery API",
    description="AI-powered visual intelligence platform",
    version="1.0.0"
)

# CORS middleware - Allow all origins for local development/hackathon
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for static file serving
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Static file serving for uploaded images
uploads_dir = "uploads"
if os.path.exists(uploads_dir):
    app.mount("/uploads", StaticFiles(directory=uploads_dir), name="uploads")

# Include routers
app.include_router(auth_router)
app.include_router(upload_router)
app.include_router(classify_router)
app.include_router(search_router)
app.include_router(history_router)

@app.on_event("startup")
async def startup_event():
    """Initialize ML models on startup"""
    try:
        logger.info("Initializing ML models...")
        
        # Initialize classifier
        from ml.classifier import get_classifier
        classifier = get_classifier()
        logger.info("Classifier initialized")
        
        # Initialize CLIP model
        from ml.clip_model import get_clip_model
        clip_model = get_clip_model()
        logger.info("CLIP model initialized")
        
        # Initialize FAISS index
        from ml.faiss_index import get_faiss_index
        faiss_index = get_faiss_index()
        logger.info("FAISS index initialized")
        
        logger.info("All ML models initialized successfully")
    except Exception as e:
        logger.error(f"Error initializing ML models: {e}")
        # Continue anyway - models will load lazily

@app.get("/")
def root():
    return {
        "message": "VisionQuery API",
        "version": "1.0.0",
        "docs": "/docs"
    }

@app.get("/health")
def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)
