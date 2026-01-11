import faiss
import numpy as np
import pickle
import os
import logging

logger = logging.getLogger(__name__)

class FAISSIndex:
    def __init__(self, dimension: int = 512):
        self.dimension = dimension
        self.index = faiss.IndexFlatIP(dimension)  # Inner product for cosine similarity
        self.image_ids = []  # Map index position to image_id
        self.index_path = "ml/faiss_index.pkl"
        self.load_index()
    
    def load_index(self):
        """Load FAISS index from disk if exists"""
        if os.path.exists(self.index_path):
            try:
                with open(self.index_path, 'rb') as f:
                    data = pickle.load(f)
                    self.index = data['index']
                    self.image_ids = data['image_ids']
                logger.info(f"Loaded FAISS index with {len(self.image_ids)} vectors")
            except Exception as e:
                logger.warning(f"Error loading index, creating new: {e}")
                self.index = faiss.IndexFlatIP(self.dimension)
                self.image_ids = []
        else:
            logger.info("Creating new FAISS index")
    
    def save_index(self):
        """Save FAISS index to disk"""
        try:
            os.makedirs("ml", exist_ok=True)
            with open(self.index_path, 'wb') as f:
                pickle.dump({
                    'index': self.index,
                    'image_ids': self.image_ids
                }, f)
            logger.info(f"Saved FAISS index with {len(self.image_ids)} vectors")
        except Exception as e:
            logger.error(f"Error saving index: {e}")
    
    def add_vector(self, embedding: np.ndarray, image_id: int):
        """Add embedding vector to index"""
        if embedding.shape[0] != self.dimension:
            raise ValueError(f"Embedding dimension {embedding.shape[0]} != {self.dimension}")
        
        embedding = embedding.reshape(1, -1).astype('float32')
        self.index.add(embedding)
        self.image_ids.append(image_id)
        self.save_index()
    
    def search(self, query_embedding: np.ndarray, top_k: int = 5) -> list[tuple[int, float]]:
        """
        Search for similar vectors
        Returns: list of (image_id, similarity_score) tuples
        """
        if len(self.image_ids) == 0:
            return []
        
        query_embedding = query_embedding.reshape(1, -1).astype('float32')
        distances, indices = self.index.search(query_embedding, min(top_k, len(self.image_ids)))
        
        results = []
        for i, idx in enumerate(indices[0]):
            if idx < len(self.image_ids):
                image_id = self.image_ids[idx]
                similarity = float(distances[0][i])
                results.append((image_id, similarity))
        
        return results
    
    def remove_vector(self, image_id: int):
        """Remove vector from index (rebuild index)"""
        if image_id not in self.image_ids:
            return
        
        # FAISS doesn't support deletion, so we rebuild
        idx = self.image_ids.index(image_id)
        # Note: This is a simplified version. For production, consider using
        # a different approach or accept that deletions require rebuilding
        logger.warning("FAISS index removal not fully implemented - requires rebuild")

# Global FAISS index instance
faiss_index = None

def get_faiss_index():
    global faiss_index
    if faiss_index is None:
        faiss_index = FAISSIndex()
    return faiss_index
