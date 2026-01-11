import torch
import clip
from PIL import Image
import numpy as np
import os
import logging

logger = logging.getLogger(__name__)

class CLIPModel:
    def __init__(self):
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        self.model = None
        self.preprocess = None
        self.load_model()
    
    def load_model(self):
        """Load CLIP model"""
        try:
            self.model, self.preprocess = clip.load("ViT-B/32", device=self.device)
            self.model.eval()
            logger.info(f"CLIP model loaded on device: {self.device}")
        except Exception as e:
            logger.error(f"Error loading CLIP model: {e}")
            raise
    
    def encode_image(self, image_path: str) -> np.ndarray:
        """Encode image to embedding vector"""
        try:
            image = Image.open(image_path).convert('RGB')
            image_tensor = self.preprocess(image).unsqueeze(0).to(self.device)
            
            with torch.no_grad():
                image_features = self.model.encode_image(image_tensor)
                image_features = image_features / image_features.norm(dim=-1, keepdim=True)
            
            return image_features.cpu().numpy().flatten().astype('float32')
        except Exception as e:
            logger.error(f"Error encoding image: {e}")
            raise
    
    def encode_text(self, text: str) -> np.ndarray:
        """Encode text to embedding vector"""
        try:
            text_tokens = clip.tokenize([text]).to(self.device)
            
            with torch.no_grad():
                text_features = self.model.encode_text(text_tokens)
                text_features = text_features / text_features.norm(dim=-1, keepdim=True)
            
            return text_features.cpu().numpy().flatten().astype('float32')
        except Exception as e:
            logger.error(f"Error encoding text: {e}")
            raise

# Global CLIP model instance
clip_model = None

def get_clip_model():
    global clip_model
    if clip_model is None:
        clip_model = CLIPModel()
    return clip_model
