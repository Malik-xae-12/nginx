from .categories import router as categories_router
from .products import router as products_router
from .dashboard import router as dashboard_router

__all__ = ["categories_router", "products_router", "dashboard_router"]
