# backend/app/models/user.py
from sqlalchemy import Column, Integer, String, Boolean
from sqlalchemy.orm import relationship # Opcjonalnie, jeśli będziemy łączyć z budynkami
from app.db.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, nullable=False, index=True)
    hashed_password = Column(String, nullable=False)
    role = Column(String, default="user")
    is_active = Column(Boolean, default=False)
    
    # --- NOWE POLA ---
    first_name = Column(String, nullable=True)
    last_name = Column(String, nullable=True)
    address = Column(String, nullable=True)

    # RELACJA DO BUDYNKÓW (TEGO BRAKUJE!)
    # back_populates musi pasować do nazwy 'owner' w modelu Building
    buildings = relationship("Building", back_populates="owner", cascade="all, delete-orphan")