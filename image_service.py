import os
import shutil
from pathlib import Path
from sqlalchemy.orm import Session
import logging

from models import Image

logger = logging.getLogger(__name__)

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

def save_uploaded_file(file_content: bytes, filename: str, user_id: int) -> str:
    """Save uploaded file and return filepath"""
    user_upload_dir = os.path.join(UPLOAD_DIR, str(user_id))
    os.makedirs(user_upload_dir, exist_ok=True)
    
    # Generate unique filename
    filepath = os.path.join(user_upload_dir, filename)
    
    with open(filepath, "wb") as f:
        f.write(file_content)
    
    return filepath

def get_image_path(image_id: int, db: Session) -> str:
    """Get filepath for an image"""
    image = db.query(Image).filter(Image.id == image_id).first()
    if not image:
        raise ValueError(f"Image {image_id} not found")
    return image.filepath

def delete_image_file(filepath: str):
    """Delete image file from filesystem"""
    try:
        if os.path.exists(filepath):
            os.remove(filepath)
            logger.info(f"Deleted image file: {filepath}")
    except Exception as e:
        logger.error(f"Error deleting image file: {e}")
