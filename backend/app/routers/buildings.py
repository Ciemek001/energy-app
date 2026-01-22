from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.db.database import get_db
from app.models.user import User
from app.models.building import Building
from app.schemas.building import BuildingCreate, BuildingOut, BuildingUpdate
from app.dependencies import get_current_user

router = APIRouter(
    prefix="/buildings",
    tags=["buildings"]
)

@router.post("/", response_model=BuildingOut)
def create_building(
    building_data: BuildingCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    new_building = Building(
        owner_id=current_user.id,
        name=building_data.name,
        floor_area=building_data.area,
        construction_year=building_data.year,
        city=building_data.climate_zone, # Używamy tego pola jako strefy/miasta
        saved_data=building_data.details, # Zapisujemy JSON z parametrami
        calculated_eu=building_data.eu_result,
        calculated_ep=building_data.ep_result
    )
    
    db.add(new_building)
    db.commit()
    db.refresh(new_building)
    
    return new_building

# READ (Get One)
@router.get("/{building_id}", response_model=BuildingOut)
def get_building(
    building_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    building = db.query(Building).filter(Building.id == building_id).first()
    if not building:
        raise HTTPException(status_code=404, detail="Building not found")
    if building.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    return building

# UPDATE
@router.put("/{building_id}", response_model=BuildingOut)
def update_building(
    building_id: int,
    building_update: BuildingUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    building = db.query(Building).filter(Building.id == building_id).first()
    if not building:
        raise HTTPException(status_code=404, detail="Building not found")
    if building.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")

    # Aktualizacja pól, jeśli zostały przesłane
    if building_update.name is not None:
        building.name = building_update.name
    if building_update.area is not None:
        building.floor_area = building_update.area
    if building_update.year is not None:
        building.construction_year = building_update.year
    if building_update.details is not None:
        building.saved_data = building_update.details
    if building_update.eu_result is not None:
        building.calculated_eu = building_update.eu_result
    if building_update.ep_result is not None:
        building.calculated_ep = building_update.ep_result

    db.commit()
    db.refresh(building)
    return building

# DELETE
@router.delete("/{building_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_building(
    building_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    building = db.query(Building).filter(Building.id == building_id).first()
    if not building:
        raise HTTPException(status_code=404, detail="Building not found")
    if building.owner_id != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")

    db.delete(building)
    db.commit()
    return None