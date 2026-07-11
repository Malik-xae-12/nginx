from sqlalchemy import Column, Integer, String, DateTime, func
from sqlalchemy.orm import relationship
from .base import Base

class Category(Base):
    __tablename__ = 'Categories'

    category_id = Column('CategoryID', Integer, primary_key=True, autoincrement=True)
    category_name = Column('CategoryName', String(100), nullable=False)
    description = Column('Description', String(500), nullable=True)
    created_date = Column('CreatedDate', DateTime, server_default=func.getdate())
    modified_date = Column('ModifiedDate', DateTime, server_default=func.getdate(), onupdate=func.getdate(), nullable=True)

    products = relationship("Product", back_populates="category")
