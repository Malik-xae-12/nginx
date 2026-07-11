from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class ProductCreate(BaseModel):
    product_name: str = Field(..., min_length=1, max_length=200)
    category_id: int
    price: float = Field(..., gt=0)
    stock_quantity: int = Field(0, ge=0)
    sku: Optional[str] = Field(None, max_length=50)
    description: Optional[str] = Field(None, max_length=500)


class ProductUpdate(BaseModel):
    product_name: Optional[str] = Field(None, min_length=1, max_length=200)
    category_id: Optional[int] = None
    price: Optional[float] = Field(None, gt=0)
    stock_quantity: Optional[int] = Field(None, ge=0)
    sku: Optional[str] = Field(None, max_length=50)
    description: Optional[str] = Field(None, max_length=500)


class ProductResponse(BaseModel):
    product_id: int
    product_name: str
    category_id: int
    category_name: Optional[str] = None
    price: float
    stock_quantity: int
    sku: Optional[str] = None
    description: Optional[str] = None
    created_date: Optional[datetime] = None
    modified_date: Optional[datetime] = None

    class Config:
        from_attributes = True
