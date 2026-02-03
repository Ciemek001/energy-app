from pydantic import BaseModel, Field
from typing import Optional, Dict, Any
from datetime import datetime

current_year = datetime.now().year

class BuildingCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    area: float = Field(..., gt=0, le=10000, description="Powierzchnia w m2")
    year: int = Field(..., ge=1800, le=current_year, description="Rok budowy")
    climate_zone: str
    details: Dict[str, Any]
    eu_result: Optional[float] = None
    ep_result: Optional[float] = None

class BuildingUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    area: Optional[float] = Field(None, gt=0, le=10000)
    year: Optional[int] = Field(None, ge=1800, le=current_year)
    climate_zone: Optional[str] = None
    details: Optional[Dict[str, Any]] = None
    eu_result: Optional[float] = None
    ep_result: Optional[float] = None

class BuildingOut(BaseModel):
    id: int
    name: str
    floor_area: float
    construction_year: int
    calculated_ep: Optional[float] = None
    saved_data: Optional[Dict[str, Any]] = None

    class Config:
        from_attributes = True