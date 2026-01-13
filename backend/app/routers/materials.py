from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db
from app.db.crud_material import crud_material
from app.schemas.material import MaterialCreate, MaterialOut

router = APIRouter(prefix="/materials", tags=["Materials"])


@router.get("/", response_model=list[MaterialOut])
async def get_materials(db: AsyncSession = Depends(get_db)):
    return await crud_material.get_all(db)


@router.get("/{material_id}", response_model=MaterialOut)
async def get_material(material_id: int, db: AsyncSession = Depends(get_db)):
    material = await crud_material.get(db, material_id)
    if not material:
        raise HTTPException(404, "Material not found")
    return material


@router.post("/", response_model=MaterialOut)
async def create_material(material: MaterialCreate, db: AsyncSession = Depends(get_db)):
    return await crud_material.create(db, material)
