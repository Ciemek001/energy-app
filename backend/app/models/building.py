from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime, JSON # <--- Dodaj JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.database import Base

class Building(Base):
    __tablename__ = "buildings"

    id = Column(Integer, primary_key=True, index=True)
    owner_id = Column(Integer, ForeignKey("users.id"))
    
    name = Column(String, nullable=False) # Np. "Dom na Wiosennej"
    
    # Podstawowe parametry
    building_type = Column(String, default="single_family") 
    construction_year = Column(Integer, nullable=False)
    floor_area = Column(Float, nullable=False)
    city = Column(String, nullable=True) # Strefa klimatyczna
    
    # Tutaj zapiszemy WSZYSTKIE parametry z kalkulatora (standards, systems)
    # Dzięki temu nie musimy tworzyć 50 kolumn w bazie
    saved_data = Column(JSON, nullable=True) 

    # Wyniki obliczeń (opcjonalnie, żeby szybko wyświetlać bez przeliczania)
    calculated_eu = Column(Float, nullable=True)
    calculated_ep = Column(Float, nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    owner = relationship("User", back_populates="buildings")