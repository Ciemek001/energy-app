# backend/app/schemas/calculation.py
from pydantic import BaseModel
from typing import Optional, List

class StandardsInput(BaseModel):
    wall: str
    roof: str
    window: str
    floor: str

class SystemsInput(BaseModel):
    heatingPrimary: str
    heatingSecondary: Optional[str] = None
    hotWater: str
    ventilation: str
    pv: bool
    solar: bool

class SimpleCalculationRequest(BaseModel):
    area: float
    year: int
    floors: int
    inhabitants: int
    climateZone: str
    standards: StandardsInput
    systems: SystemsInput

class Recommendation(BaseModel):
    title: str
    description: str
    type: str
    priority: str

# --- NOWE: Szczegóły do wykresów ---
class ChartDetails(BaseModel):
    heat_transmission: float
    heat_ventilation: float
    hot_water: float

class SimpleCalculationResponse(BaseModel):
    EU: float
    EK: float
    EP: float
    raw_EU: float
    raw_EK: float
    raw_EP: float
    # To pole jest wymagane, żeby wykresy działały!
    details: Optional[ChartDetails] = None 
    recommendations: List[Recommendation]