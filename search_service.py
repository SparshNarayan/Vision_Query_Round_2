from sqlalchemy.orm import Session
import os
import numpy as np
import logging

from models import Image
from ml.clip_model import get_clip_model
from ml.faiss_index import get_faiss_index

logger = logging.getLogger(__name__)

def add_image_to_search_index(image_id: int, image_path: str, db: Session):
    """Generate CLIP embedding and add to FAISS index"""
    try:
        clip_model = get_clip_model()
        faiss_index = get_faiss_index()
        
        # Generate embedding
        embedding = clip_model.encode_image(image_path)
        
        # Add to FAISS index
        faiss_index.add_vector(embedding, image_id)
        
        logger.info(f"Added image {image_id} to search index")
    except Exception as e:
        logger.error(f"Error adding image to search index: {e}")
        raise

def search_images(query_text: str, top_k: int, user_id: int, db: Session) -> list:
    """
    Perform semantic search
    Returns list of (image, similarity_score) tuples
    """
    try:
        clip_model = get_clip_model()
        faiss_index = get_faiss_index()
        
        # Encode query text
        query_embedding = clip_model.encode_text(query_text)
        
        # Search FAISS index
        results = faiss_index.search(query_embedding, top_k)
        
        # Filter results to user's images and fetch image details
        search_results = []
        for image_id, similarity in results:
            image = db.query(Image).filter(
                Image.id == image_id,
                Image.user_id == user_id
            ).first()
            if image:
                search_results.append((image, similarity))
        
        return search_results
    except Exception as e:
        logger.error(f"Error searching images: {e}")
        raise
