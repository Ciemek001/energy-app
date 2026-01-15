from pydantic import BaseModel
from typing import Optional

# 1. Zawsze najpierw klasa bazowa
class HeatingSystemBase(BaseModel):
    name: str
    fuel_type: Optional[str] = None
    efficiency: float

# 2. Klasa do tworzenia (Create)
class HeatingSystemCreate(HeatingSystemBase):
    pass  # Jeśli nie dodajesz nowych pól, samo pass wystarczy

# 3. Klasa do aktualizacji (Update) - wszystkie pola opcjonalne
class HeatingSystemUpdate(BaseModel):
    name: Optional[str] = None
    fuel_type: Optional[str] = None
    efficiency: Optional[float] = None

# 4. Klasa wyjściowa (Out) - tutaj dodajemy ID i Config dla ORM
class HeatingSystemOut(HeatingSystemBase):
    id: int

    class Config:
        from_attributes = True  # Umożliwia mapowanie z modeli bazy danych