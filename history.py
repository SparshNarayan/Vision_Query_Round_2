from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
import logging

from database import get_db
from models import User, SearchHistory
from schemas import SearchHistoryItem
from auth.jwt import get_current_user

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api", tags=["history"])

@router.get("/history/{user_id}", response_model=List[SearchHistoryItem])
def get_search_history(
    user_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get search history for a user"""
    # Verify user can access this history
    if user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to view this history"
        )
    
    try:
        history = db.query(SearchHistory).filter(
            SearchHistory.user_id == user_id
        ).order_by(SearchHistory.searched_at.desc()).all()
        
        return history
    except Exception as e:
        logger.error(f"Error fetching search history: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching search history: {str(e)}"
        )
