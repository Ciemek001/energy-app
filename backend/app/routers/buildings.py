from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db
from app.crud.crud_building import crud_building
from app.schemas.building import BuildingCreate, BuildingOut

router = APIRouter(prefix="/buildings", tags=["Buildings"])


@router.get("/", response_model=list[BuildingOut])
async def get_buildings(db: AsyncSession = Depends(get_db)):
    return await crud_building.get_all(db)


@router.get("/{building_id}", response_model=BuildingOut)
async def get_building(building_id: int, db: AsyncSession = Depends(get_db)):
    building = await crud_building.get(db, building_id)
    if not building:
        raise HTTPException(404, "Building not found")
    return building


@router.post("/", response_model=BuildingOut)
async def create_building(
    building: BuildingCreate,
    db: AsyncSession = Depends(get_db),
):
    return await crud_building.create(db, building)
