from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List
import logging

from database import get_db
from models import User, SearchHistory
from schemas import SearchResponse, SearchResult
from auth.jwt import get_current_user
from services.search_service import search_images

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api", tags=["search"])

@router.get("/search", response_model=SearchResponse)
def search_images_by_text(
    q: str = Query(..., description="Search query text"),
    top_k: int = Query(5, ge=1, le=20, description="Number of results to return"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Perform semantic text-to-image search"""
    try:
        # Perform search
        results = search_images(q, top_k, current_user.id, db)
        
        # Build response
        search_results = [
            SearchResult(
                image_id=image.id,
                filename=image.filename,
                filepath=image.filepath,
                similarity_score=similarity
            )
            for image, similarity in results
        ]
        
        # Save search history
        search_history = SearchHistory(
            user_id=current_user.id,
            query_text=q,
            results_count=len(search_results)
        )
        db.add(search_history)
        db.commit()
        
        return SearchResponse(
            query=q,
            results=search_results,
            total_results=len(search_results)
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error searching images: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error searching images: {str(e)}"
        )
