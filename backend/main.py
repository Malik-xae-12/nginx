from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import categories_router, products_router, dashboard_router
from db.session import engine
from models import Base

# Automatically create tables in the database if they don't exist
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="MalikLabs Inventory API",
    description="Product Inventory Management System",
    version="1.0.0",
)

# CORS — allow frontend origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount routers
app.include_router(categories_router, prefix="/api")
app.include_router(products_router, prefix="/api")
app.include_router(dashboard_router, prefix="/api")


@app.get("/api/health")
def health_check():
    """Health check endpoint."""
    return {"status": "healthy", "service": "MalikLabs Inventory API"}
