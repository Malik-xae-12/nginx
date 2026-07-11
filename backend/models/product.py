from sqlalchemy import Column, Integer, String, Numeric, DateTime, ForeignKey, func
from sqlalchemy.orm import relationship
from .base import Base

class Product(Base):
    __tablename__ = 'Products'

    product_id = Column('ProductID', Integer, primary_key=True, autoincrement=True)
    product_name = Column('ProductName', String(200), nullable=False)
    category_id = Column('CategoryID', Integer, ForeignKey('Categories.CategoryID'), nullable=False)
    price = Column('Price', Numeric(18, 2), nullable=False)
    stock_quantity = Column('StockQuantity', Integer, default=0, nullable=False)
    sku = Column('SKU', String(50), nullable=True)
    description = Column('Description', String(500), nullable=True)
    created_date = Column('CreatedDate', DateTime, server_default=func.getdate())
    modified_date = Column('ModifiedDate', DateTime, server_default=func.getdate(), onupdate=func.getdate(), nullable=True)

    category = relationship("Category", back_populates="products")
