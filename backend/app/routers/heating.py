from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db
from app.crud.crud_heating import crud_heating
from app.schemas.heating import HeatingSystemCreate, HeatingSystemOut

router = APIRouter(prefix="/heating", tags=["Heating Systems"])


@router.get("/", response_model=list[HeatingSystemOut])
async def get_heating_systems(db: AsyncSession = Depends(get_db)):
    return await crud_heating.get_all(db)


@router.get("/{system_id}", response_model=HeatingSystemOut)
async def get_heating(system_id: int, db: AsyncSession = Depends(get_db)):
    system = await crud_heating.get(db, system_id)
    if not system:
        raise HTTPException(404, "Heating system not found")
    return system


@router.post("/", response_model=HeatingSystemOut)
async def create_heating(system: HeatingSystemCreate, db: AsyncSession = Depends(get_db)):
    return await crud_heating.create(db, system)
