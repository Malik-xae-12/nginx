from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class CategoryCreate(BaseModel):
    category_name: str = Field(..., min_length=1, max_length=100)
    description: Optional[str] = Field(None, max_length=500)


class CategoryUpdate(BaseModel):
    category_name: Optional[str] = Field(None, min_length=1, max_length=100)
    description: Optional[str] = Field(None, max_length=500)


class CategoryResponse(BaseModel):
    category_id: int
    category_name: str
    description: Optional[str] = None
    created_date: Optional[datetime] = None
    modified_date: Optional[datetime] = None
    product_count: Optional[int] = 0

    class Config:
        from_attributes = True
