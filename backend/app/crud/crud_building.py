# app/crud/crud_building.py

# Jeśli używasz SQLAlchemy / SQLModel:
from sqlalchemy.orm import Session
# ... inne importy ...

class CRUDBuilding:
    def get_multi(self, db: Session):
        # logika...
        pass

# To jest kluczowe! Musisz wyeksportować tę nazwę:
crud_building = CRUDBuilding()