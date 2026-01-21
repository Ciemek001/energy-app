# backend/app/routers/calculations.py
from fastapi import APIRouter, Depends, HTTPException
from app.schemas.calculation import SimpleCalculationRequest, SimpleCalculationResponse
from app.utils.calculator_simple import calculate_simple_energy
from app.dependencies import get_current_user # Opcjonalnie, jeśli chcesz zapisywać historię

router = APIRouter(
    prefix="/calculations",
    tags=["calculations"]
)

@router.post("/simple", response_model=SimpleCalculationResponse)
def compute_simple_energy(data: SimpleCalculationRequest):
    """
    Przyjmuje dane budynku i zwraca szacunkowe zapotrzebowanie na energię (EU, EK, EP)
    oraz listę rekomendacji.
    """
    try:
        result = calculate_simple_energy(data)
        return result
    except Exception as e:
        # W razie błędu w obliczeniach
        print(f"Błąd obliczeń: {e}")
        raise HTTPException(status_code=500, detail=str(e))