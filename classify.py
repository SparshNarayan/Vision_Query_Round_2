from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
import logging

from database import get_db
from models import User, Image
from schemas import ClassificationResponse
from auth.jwt import get_current_user
from ml.classifier import get_classifier

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api", tags=["classify"])

@router.get("/classify", response_model=ClassificationResponse)
def classify_image(
    image_id: int = Query(..., description="Image ID to classify"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Classify an image as Animal or Person"""
    try:
        # Get image
        image = db.query(Image).filter(
            Image.id == image_id,
            Image.user_id == current_user.id
        ).first()
        
        if not image:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Image not found"
            )
        
        # Classify if not already classified
        if image.classification is None:
            classifier = get_classifier()
            classification, confidence = classifier.classify(image.filepath)
            
            # Update database
            image.classification = classification
            image.confidence = confidence
            db.commit()
            db.refresh(image)
        else:
            classification = image.classification
            confidence = image.confidence
        
        return ClassificationResponse(
            image_id=image.id,
            classification=classification,
            confidence=confidence
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error classifying image: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error classifying image: {str(e)}"
        )
