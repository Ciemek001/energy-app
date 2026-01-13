from pydantic import BaseModel
from typing import Optional


class HeatingSystemBase(BaseModel):
    name: str
    fuel_type: Optional[str] = None
    efficiency: float


class HeatingSystemCreate(HeatingSystemBase):
    pass


class HeatingSystemUpdate(BaseModel):
    name: Optional[str] = None
    fuel_type: Optional[str] = None
    efficiency: Optional[float] = None


class HeatingSystemOut(HeatingSystemBase):
    id: int

    class Config:
        from_attributes = True
