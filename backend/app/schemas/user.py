# backend/app/schemas/user.py
from pydantic import BaseModel, EmailStr, validator
from typing import Optional, List
import re
# Musimy zaimportować schemat BuildingOut, żeby użyć go w UserOut
from app.schemas.building import BuildingOut 

class UserBase(BaseModel):
    email: EmailStr
    role: Optional[str] = "user"
    # Opcjonalne pola profilowe
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    address: Optional[str] = None

class UserCreate(UserBase):
    password: str

    # Walidacja hasła przy rejestracji
    @validator("password")
    def validate_password_strength(cls, v):
        if len(v) < 8:
            raise ValueError('Hasło musi mieć co najmniej 8 znaków')
        if not re.search(r"[!@#$%^&*(),.?\":{}|<>]", v):
            raise ValueError('Hasło musi zawierać co najmniej jeden znak specjalny (np. !@#$%)')
        return v

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
    buildings: List[BuildingOut] = [] 

    class Config:
        from_attributes = True

# --- LOGOWANIE I TOKENY ---

class UserLogin(BaseModel):
    email: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None

# --- NOWOŚĆ: ZMIANA HASŁA ---
class UserPasswordChange(BaseModel):
    old_password: str
    new_password: str

    # Walidacja nowego hasła (taka sama jak przy rejestracji)
    @validator("new_password")
    def validate_password_strength(cls, v):
        if len(v) < 8:
            raise ValueError('Hasło musi mieć co najmniej 8 znaków')
        if not re.search(r"[!@#$%^&*(),.?\":{}|<>]", v):
            raise ValueError('Hasło musi zawierać co najmniej jeden znak specjalny (np. !@#$%)')
        return v