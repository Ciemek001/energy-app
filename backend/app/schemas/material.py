# backend/app/schemas/material.py
from pydantic import BaseModel
from typing import Optional

class MaterialBase(BaseModel):
    name: str
    category: str
    lambda_value: float
    density: Optional[float] = None
    price: Optional[float] = 0.0
    description: Optional[str] = None

class MaterialCreate(MaterialBase):
    pass

class MaterialUpdate(MaterialBase):
    name: Optional[str] = None
    category: Optional[str] = None
    lambda_value: Optional[float] = None
    price: Optional[float] = None

class MaterialOut(MaterialBase):
    id: int

    class Config:
        from_attributes = True