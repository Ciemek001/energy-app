from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db
from app.db.crud_calculation import crud_calculation
from app.schemas.calculation import CalculationCreate, CalculationOut

router = APIRouter(prefix="/calculations", tags=["Calculations"])


@router.get("/", response_model=list[CalculationOut])
async def get_all(db: AsyncSession = Depends(get_db)):
    return await crud_calculation.get_all(db)


@router.get("/{calc_id}", response_model=CalculationOut)
async def get(calc_id: int, db: AsyncSession = Depends(get_db)):
    calc = await crud_calculation.get(db, calc_id)
    if not calc:
        raise HTTPException(404, "Calculation not found")
    return calc


@router.post("/", response_model=CalculationOut)
async def create(
    calculation: CalculationCreate,
    db: AsyncSession = Depends(get_db),
):
    return await crud_calculation.create(db, calculation)
