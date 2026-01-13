from pydantic import BaseModel
from typing import Optional


class BuildingBase(BaseModel):
    location: str
    build_year: int
    heated_area: float
    floors: int
    zone: Optional[str] = None


class BuildingCreate(BuildingBase):
    user_id: Optional[int] = None


class BuildingUpdate(BaseModel):
    location: Optional[str] = None
    build_year: Optional[int] = None
    heated_area: Optional[float] = None
    floors: Optional[int] = None
    zone: Optional[str] = None
    user_id: Optional[int] = None


class BuildingOut(BuildingBase):
    id: int
    user_id: Optional[int]

    class Config:
        from_attributes = True
