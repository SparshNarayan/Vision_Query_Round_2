from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.orm import Session
import logging

from database import get_db
from models import User, Image
from schemas import ImageResponse
from auth.jwt import get_current_user
from services.image_service import save_uploaded_file
from services.search_service import add_image_to_search_index

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api", tags=["upload"])

@router.post("/upload", response_model=ImageResponse, status_code=status.HTTP_201_CREATED)
async def upload_image(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Upload an image file"""
    try:
        # Validate file type
        if not file.content_type or not file.content_type.startswith('image/'):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="File must be an image"
            )
        
        # Read file content
        file_content = await file.read()
        
        # Save file
        filepath = save_uploaded_file(file_content, file.filename, current_user.id)
        
        # Create database record
        new_image = Image(
            filename=file.filename,
            filepath=filepath,
            user_id=current_user.id
        )
        db.add(new_image)
        db.commit()
        db.refresh(new_image)
        
        # Add to search index (async in background if needed)
        try:
            add_image_to_search_index(new_image.id, filepath, db)
        except Exception as e:
            logger.warning(f"Failed to add image to search index: {e}")
        
        return new_image
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error uploading image: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error uploading image: {str(e)}"
        )
