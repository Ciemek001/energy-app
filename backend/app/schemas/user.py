# backend/app/schemas/user.py
from pydantic import BaseModel, EmailStr
from typing import Optional, List
# Musimy zaimportować schemat BuildingOut, żeby użyć go w UserOut
from app.schemas.building import BuildingOut 

class UserBase(BaseModel):
    email: EmailStr
    role: Optional[str] = "user"
    # Dodajemy opcjonalne pola do bazy
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    address: Optional[str] = None

class UserCreate(UserBase):
    password: str
    # Opcjonalnie: imie, nazwisko itp.

class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    password: Optional[str] = None
    role: Optional[str] = None
    is_active: Optional[bool] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    address: Optional[str] = None

class UserOut(UserBase):
    id: int
    is_active: bool
    # To jest kluczowa linijka, której brakowało:
    buildings: List[BuildingOut] = [] 

    class Config:
        from_attributes = True

# --- NOWE KLASY DO LOGOWANIA I TOKENÓW ---

class UserLogin(BaseModel):
    email: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None
    role: Optional[str] = None