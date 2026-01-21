# backend/app/schemas/calculation.py
from pydantic import BaseModel
from typing import Optional, List

# --- MODELE WEJŚCIOWE (INPUT) ---

class StandardsInput(BaseModel):
    wall: str   # brak, slaba, srednia, dobra
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
    climateZone: str # I, II, III, IV, V
    standards: StandardsInput
    systems: SystemsInput

# --- MODELE WYJŚCIOWE (OUTPUT) ---

class Recommendation(BaseModel):
    title: str
    description: str
    type: str       # modernization, system, oze
    priority: str   # high, medium, low

class SimpleCalculationResponse(BaseModel):
    EU: float # Energia Użytkowa [kWh/m2/rok]
    EK: float # Energia Końcowa [kWh/m2/rok]
    EP: float # Energia Pierwotna [kWh/m2/rok]
    raw_EU: float # Całkowita energia użytkowa [kWh/rok]
    raw_EK: float # Całkowita energia końcowa [kWh/rok]
    raw_EP: float # Całkowita energia pierwotna [kWh/rok]
    recommendations: List[Recommendation]