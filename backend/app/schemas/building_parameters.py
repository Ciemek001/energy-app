from pydantic import BaseModel
from typing import Optional


class BuildingParametersBase(BaseModel):
    wall_type_id: int
    roof_type_id: int
    window_type_id: int
    heating_system_id: int
    ventilation_type: Optional[str] = None


class BuildingParametersCreate(BuildingParametersBase):
    building_id: int


class BuildingParametersUpdate(BaseModel):
    wall_type_id: Optional[int] = None
    roof_type_id: Optional[int] = None
    window_type_id: Optional[int] = None
    heating_system_id: Optional[int] = None
    ventilation_type: Optional[str] = None
    building_id: Optional[int] = None


class BuildingParametersOut(BuildingParametersBase):
    id: int
    building_id: int

    class Config:
        from_attributes = True
