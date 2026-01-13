from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db
from app.db.crud_building_parameters import crud_building_params
from app.schemas.building_parameters import BuildingParametersCreate, BuildingParametersOut

router = APIRouter(prefix="/building-parameters", tags=["Building Parameters"])


@router.get("/", response_model=list[BuildingParametersOut])
async def get_all(db: AsyncSession = Depends(get_db)):
    return await crud_building_params.get_all(db)


@router.get("/{params_id}", response_model=BuildingParametersOut)
async def get(params_id: int, db: AsyncSession = Depends(get_db)):
    params = await crud_building_params.get(db, params_id)
    if not params:
        raise HTTPException(404, "Parameters not found")
    return params


@router.post("/", response_model=BuildingParametersOut)
async def create(
    params: BuildingParametersCreate,
    db: AsyncSession = Depends(get_db),
):
    return await crud_building_params.create(db, params)
