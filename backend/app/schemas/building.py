from pydantic import BaseModel
from typing import Optional, Dict, Any

class BuildingCreate(BaseModel):
    name: str
    area: float
    year: int
    climate_zone: str
    details: Dict[str, Any]
    eu_result: Optional[float] = None
    ep_result: Optional[float] = None

# Nowy schemat do edycji
class BuildingUpdate(BaseModel):
    name: Optional[str] = None
    area: Optional[float] = None
    year: Optional[int] = None
    climate_zone: Optional[str] = None
    details: Optional[Dict[str, Any]] = None
    eu_result: Optional[float] = None
    ep_result: Optional[float] = None

class BuildingOut(BaseModel):
    id: int
    name: str
    floor_area: float
    construction_year: int
    calculated_ep: Optional[float] = None # Upewnij się, że to pole tu jest
    saved_data: Optional[Dict[str, Any]] = None # Potrzebne do wczytania danych do kalkulatora

    class Config:
        from_attributes = True