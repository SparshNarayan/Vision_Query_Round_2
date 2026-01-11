from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional, List

# Auth Schemas
class UserRegister(BaseModel):
    username: str
    email: EmailStr
    password: str

class UserLogin(BaseModel):
    username: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class UserResponse(BaseModel):
    id: int
    username: str
    email: str
    created_at: datetime
    
    class Config:
        from_attributes = True

# Image Schemas
class ImageUpload(BaseModel):
    filename: str

class ImageResponse(BaseModel):
    id: int
    filename: str
    filepath: str
    classification: Optional[str] = None
    confidence: Optional[float] = None
    uploaded_at: datetime
    
    class Config:
        from_attributes = True

class ClassificationResponse(BaseModel):
    image_id: int
    classification: str
    confidence: float

# Search Schemas
class SearchResult(BaseModel):
    image_id: int
    filename: str
    filepath: str
    similarity_score: float

class SearchResponse(BaseModel):
    query: str
    results: List[SearchResult]
    total_results: int

# History Schemas
class SearchHistoryItem(BaseModel):
    id: int
    query_text: str
    results_count: int
    searched_at: datetime
    
    class Config:
        from_attributes = True
