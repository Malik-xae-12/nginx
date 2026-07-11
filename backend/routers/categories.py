from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from db.session import get_db
from models import Category, Product
from schemas import CategoryCreate, CategoryUpdate, CategoryResponse
from typing import List
from sqlalchemy import func

router = APIRouter(prefix="/categories", tags=["Categories"])


@router.get("/", response_model=List[CategoryResponse])
def get_all_categories(db: Session = Depends(get_db)):
    """Get all categories with product count."""
    results = (
        db.query(
            Category,
            func.count(Product.product_id).label("product_count")
        )
        .outerjoin(Product, Category.category_id == Product.category_id)
        .group_by(Category.category_id, Category.category_name, Category.description, Category.created_date, Category.modified_date)
        .order_by(Category.category_id)
        .all()
    )
    return [
        CategoryResponse(
            category_id=category.category_id,
            category_name=category.category_name,
            description=category.description,
            created_date=category.created_date,
            modified_date=category.modified_date,
            product_count=product_count,
        )
        for category, product_count in results
    ]


@router.get("/{category_id}", response_model=CategoryResponse)
def get_category(category_id: int, db: Session = Depends(get_db)):
    """Get a single category by ID."""
    result = (
        db.query(
            Category,
            func.count(Product.product_id).label("product_count")
        )
        .outerjoin(Product, Category.category_id == Product.category_id)
        .filter(Category.category_id == category_id)
        .group_by(Category.category_id, Category.category_name, Category.description, Category.created_date, Category.modified_date)
        .first()
    )
    if not result:
        raise HTTPException(status_code=404, detail="Category not found")
    
    category, product_count = result
    return CategoryResponse(
        category_id=category.category_id,
        category_name=category.category_name,
        description=category.description,
        created_date=category.created_date,
        modified_date=category.modified_date,
        product_count=product_count,
    )


@router.post("/", response_model=CategoryResponse, status_code=201)
def create_category(category: CategoryCreate, db: Session = Depends(get_db)):
    """Create a new category."""
    db_category = Category(
        category_name=category.category_name,
        description=category.description
    )
    db.add(db_category)
    db.commit()
    db.refresh(db_category)
    return CategoryResponse(
        category_id=db_category.category_id,
        category_name=db_category.category_name,
        description=db_category.description,
        created_date=db_category.created_date,
        modified_date=db_category.modified_date,
        product_count=0,
    )


@router.put("/{category_id}", response_model=CategoryResponse)
def update_category(category_id: int, category: CategoryUpdate, db: Session = Depends(get_db)):
    """Update an existing category."""
    db_category = db.query(Category).filter(Category.category_id == category_id).first()
    if not db_category:
        raise HTTPException(status_code=404, detail="Category not found")

    if category.category_name is not None:
        db_category.category_name = category.category_name
    if category.description is not None:
        db_category.description = category.description

    db_category.modified_date = func.getdate()
    db.commit()
    
    # Calculate product count
    product_count = db.query(func.count(Product.product_id)).filter(Product.category_id == category_id).scalar() or 0
    
    return CategoryResponse(
        category_id=db_category.category_id,
        category_name=db_category.category_name,
        description=db_category.description,
        created_date=db_category.created_date,
        modified_date=db_category.modified_date,
        product_count=product_count,
    )


@router.delete("/{category_id}", status_code=204)
def delete_category(category_id: int, db: Session = Depends(get_db)):
    """Delete a category (will fail if products reference it)."""
    db_category = db.query(Category).filter(Category.category_id == category_id).first()
    if not db_category:
        raise HTTPException(status_code=404, detail="Category not found")

    # Check for referencing products
    count = db.query(func.count(Product.product_id)).filter(Product.category_id == category_id).scalar() or 0
    if count > 0:
        raise HTTPException(
            status_code=400,
            detail=f"Cannot delete: {count} product(s) reference this category. Remove them first.",
        )

    db.delete(db_category)
    db.commit()
    return None
