from fastapi import APIRouter, Depends
from db.session import get_db
from models import Product, Category
from schemas import DashboardStats
from sqlalchemy import func
from sqlalchemy.orm import Session

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


@router.get("/", response_model=DashboardStats)
def get_dashboard_stats(db: Session = Depends(get_db)):
    """Get dashboard summary statistics."""
    total_products = db.query(func.count(Product.product_id)).scalar() or 0
    total_categories = db.query(func.count(Category.category_id)).scalar() or 0
    
    # SUM(Price * StockQuantity)
    total_stock_value = db.query(func.sum(Product.price * Product.stock_quantity)).scalar() or 0
    total_stock_value = float(total_stock_value)
    
    low_stock_count = db.query(func.count(Product.product_id)).filter(Product.stock_quantity < 25).scalar() or 0

    return DashboardStats(
        total_products=total_products,
        total_categories=total_categories,
        total_stock_value=total_stock_value,
        low_stock_count=low_stock_count,
    )
