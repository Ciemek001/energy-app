# backend/app/models/material.py
from sqlalchemy import Column, Integer, String, Float
from app.db.database import Base

class Material(Base):
    __tablename__ = "materials"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)
    category = Column(String) # np. "construction" (mur), "insulation" (izolacja), "finish" (tynk)
    lambda_value = Column(Float) # W/mK - najważniejszy parametr
    density = Column(Float, nullable=True) # kg/m3 (do pojemności cieplnej)
    price = Column(Float, default=0.0) # PLN za m3 (dla izolacji/muru) lub m2 (dla tynku) - do analizy kosztów
    description = Column(String, nullable=True)