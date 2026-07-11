from fastapi import APIRouter, HTTPException, Query, Depends
from sqlalchemy.orm import Session, joinedload
from db.session import get_db
from models import Product, Category
from schemas import ProductCreate, ProductUpdate, ProductResponse
from typing import List, Optional
from sqlalchemy import func
from sqlalchemy.orm import joinedload

router = APIRouter(prefix="/products", tags=["Products"])


@router.get("/", response_model=List[ProductResponse])
def get_all_products(category_id: Optional[int] = Query(None), db: Session = Depends(get_db)):
    """Get all products with category name. Optionally filter by category."""
    query = db.query(Product).options(joinedload(Product.category))
    if category_id is not None:
        query = query.filter(Product.category_id == category_id)
    products = query.order_by(Product.product_id).all()
    
    return [
        ProductResponse(
            product_id=p.product_id,
            product_name=p.product_name,
            category_id=p.category_id,
            category_name=p.category.category_name if p.category else None,
            price=float(p.price),
            stock_quantity=p.stock_quantity,
            sku=p.sku,
            description=p.description,
            created_date=p.created_date,
            modified_date=p.modified_date,
        )
        for p in products
    ]


@router.get("/{product_id}", response_model=ProductResponse)
def get_product(product_id: int, db: Session = Depends(get_db)):
    """Get a single product by ID."""
    p = db.query(Product).options(joinedload(Product.category)).filter(Product.product_id == product_id).first()
    if not p:
        raise HTTPException(status_code=404, detail="Product not found")
    return ProductResponse(
        product_id=p.product_id,
        product_name=p.product_name,
        category_id=p.category_id,
        category_name=p.category.category_name if p.category else None,
        price=float(p.price),
        stock_quantity=p.stock_quantity,
        sku=p.sku,
        description=p.description,
        created_date=p.created_date,
        modified_date=p.modified_date,
    )


@router.post("/", response_model=ProductResponse, status_code=201)
def create_product(product: ProductCreate, db: Session = Depends(get_db)):
    """Create a new product."""
    # Validate category exists
    category_exists = db.query(Category.category_id).filter(Category.category_id == product.category_id).first()
    if not category_exists:
        raise HTTPException(status_code=400, detail="Category not found")

    db_product = Product(
        product_name=product.product_name,
        category_id=product.category_id,
        price=product.price,
        stock_quantity=product.stock_quantity,
        sku=product.sku,
        description=product.description,
    )
    db.add(db_product)
    db.commit()
    db.refresh(db_product)

    return ProductResponse(
        product_id=db_product.product_id,
        product_name=db_product.product_name,
        category_id=db_product.category_id,
        category_name=db_product.category.category_name if db_product.category else None,
        price=float(db_product.price),
        stock_quantity=db_product.stock_quantity,
        sku=db_product.sku,
        description=db_product.description,
        created_date=db_product.created_date,
        modified_date=db_product.modified_date,
    )


@router.put("/{product_id}", response_model=ProductResponse)
def update_product(product_id: int, product: ProductUpdate, db: Session = Depends(get_db)):
    """Update an existing product."""
    db_product = db.query(Product).filter(Product.product_id == product_id).first()
    if not db_product:
        raise HTTPException(status_code=404, detail="Product not found")

    if product.category_id is not None:
        category_exists = db.query(Category.category_id).filter(Category.category_id == product.category_id).first()
        if not category_exists:
            raise HTTPException(status_code=400, detail="Category not found")
        db_product.category_id = product.category_id

    if product.product_name is not None:
        db_product.product_name = product.product_name
    if product.price is not None:
        db_product.price = product.price
    if product.stock_quantity is not None:
        db_product.stock_quantity = product.stock_quantity
    if product.sku is not None:
        db_product.sku = product.sku
    if product.description is not None:
        db_product.description = product.description

    db_product.modified_date = func.getdate()
    db.commit()

    # Access relationship value before session closes
    category_name = db_product.category.category_name if db_product.category else None

    return ProductResponse(
        product_id=db_product.product_id,
        product_name=db_product.product_name,
        category_id=db_product.category_id,
        category_name=category_name,
        price=float(db_product.price),
        stock_quantity=db_product.stock_quantity,
        sku=db_product.sku,
        description=db_product.description,
        created_date=db_product.created_date,
        modified_date=db_product.modified_date,
    )


@router.delete("/{product_id}", status_code=204)
def delete_product(product_id: int, db: Session = Depends(get_db)):
    """Delete a product."""
    db_product = db.query(Product).filter(Product.product_id == product_id).first()
    if not db_product:
        raise HTTPException(status_code=404, detail="Product not found")
    db.delete(db_product)
    db.commit()
    return None
