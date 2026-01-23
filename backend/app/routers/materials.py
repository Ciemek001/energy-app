# backend/app/routers/materials.py
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.models.user import User
from app.models.material import Material
from app.schemas.material import MaterialCreate, MaterialOut, MaterialUpdate
from app.dependencies import get_current_active_admin, get_current_user

router = APIRouter(
    prefix="/materials",
    tags=["materials"]
)

# --- DLA WSZYSTKICH (Kalkulator potrzebuje listy) ---
@router.get("/", response_model=List[MaterialOut])
def read_materials(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return db.query(Material).all()

# --- TYLKO DLA ADMINA (Zarządzanie bazą) ---

@router.post("/", response_model=MaterialOut)
def create_material(
    material: MaterialCreate, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_admin)
):
    db_mat = db.query(Material).filter(Material.name == material.name).first()
    if db_mat:
        raise HTTPException(status_code=400, detail="Materiał o tej nazwie już istnieje")

    new_material = Material(**material.dict())
    db.add(new_material)
    db.commit()
    db.refresh(new_material)
    return new_material

@router.post("/seed")
def seed_materials(db: Session = Depends(get_db)):
    """
    Szybkie dodanie podstawowych materiałów do bazy, żeby nie wpisywać ręcznie.
    """
    defaults = [
        # KONSTRUKCJA (Mur)
        {"name": "Cegła pełna", "category": "construction", "lambda_value": 0.77, "price": 800.0},
        {"name": "Pustak ceramiczny (Porotherm)", "category": "construction", "lambda_value": 0.30, "price": 400.0},
        {"name": "Beton komórkowy (Ytong)", "category": "construction", "lambda_value": 0.14, "price": 350.0},
        {"name": "Żelbet", "category": "construction", "lambda_value": 1.7, "price": 500.0},
        
        # IZOLACJA
        {"name": "Styropian biały (EPS)", "category": "insulation", "lambda_value": 0.040, "price": 250.0},
        {"name": "Styropian grafitowy", "category": "insulation", "lambda_value": 0.031, "price": 320.0},
        {"name": "Wełna mineralna", "category": "insulation", "lambda_value": 0.035, "price": 400.0},
        {"name": "Pianka PUR (zamkniętokomórkowa)", "category": "insulation", "lambda_value": 0.022, "price": 600.0},

        # WYKOŃCZENIE
        {"name": "Tynk cementowo-wapienny", "category": "finish", "lambda_value": 0.82, "price": 40.0},
        {"name": "Tynk gipsowy", "category": "finish", "lambda_value": 0.40, "price": 35.0},
        {"name": "Płyta G-K", "category": "finish", "lambda_value": 0.25, "price": 25.0},
    ]

    added_count = 0
    for m in defaults:
        exists = db.query(Material).filter(Material.name == m["name"]).first()
        if not exists:
            db.add(Material(**m))
            added_count += 1
    
    db.commit()
    return {"message": f"Dodano {added_count} nowych materiałów."}

@router.delete("/{material_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_material(
    material_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_admin)
):
    mat = db.query(Material).filter(Material.id == material_id).first()
    if not mat:
        raise HTTPException(status_code=404, detail="Materiał nie znaleziony")
    db.delete(mat)
    db.commit()
    return None