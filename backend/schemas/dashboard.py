from pydantic import BaseModel

class DashboardStats(BaseModel):
    total_products: int
    total_categories: int
    total_stock_value: float
    low_stock_count: int  # products with stock < 25
