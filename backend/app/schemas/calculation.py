from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class CalculationBase(BaseModel):
    ep: float
    ek: float
    eu: float


class CalculationCreate(CalculationBase):
    building_id: int


class CalculationUpdate(BaseModel):
    ep: Optional[float] = None
    ek: Optional[float] = None
    eu: Optional[float] = None


class CalculationOut(CalculationBase):
    id: int
    building_id: int
    timestamp: datetime

    class Config:
        from_attributes = True
