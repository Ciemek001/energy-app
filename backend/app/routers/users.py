# backend/app/routers/users.py
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from sqlalchemy.orm import Session, joinedload
from app.db.database import get_db
from app.models.user import User
# Zaktualizowane importy schematów (dodano UserPasswordChange)
from app.schemas.user import UserCreate, UserOut, UserUpdate, UserPasswordChange
# Zaktualizowane importy security (dodano verify_password)
from app.utils.security import get_password_hash, generate_verification_token, verify_token, verify_password
# Upewnij się, że masz ten plik lub zakomentuj import, jeśli jeszcze nie wysyłasz maili
from app.utils.email import send_verification_email 
from app.dependencies import get_current_user, get_current_active_admin

router = APIRouter(
    prefix="/users",
    tags=["users"]
)

# --- REJESTRACJA I LOGOWANIE ---

@router.post("/", response_model=UserOut)
def create_user(
    user: UserCreate, 
    background_tasks: BackgroundTasks, 
    db: Session = Depends(get_db)
):
    # 1. Sprawdź czy użytkownik istnieje
    db_user = db.query(User).filter(User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Ten email jest już zarejestrowany.")

    # 2. Hashowanie hasła
    hashed_pwd = get_password_hash(user.password)

    # 3. Tworzenie użytkownika
    new_user = User(
        email=user.email,
        hashed_password=hashed_pwd,
        role="user", 
        is_active=False,
        first_name="", 
        last_name="",
        address=""
    )
    
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

     #4. Generowanie tokena i wysyłka maila (jeśli skonfigurowane)
    verification_token = generate_verification_token(new_user.email)
    background_tasks.add_task(send_verification_email, new_user.email, verification_token)

    return new_user

@router.get("/verify/{token}")
def verify_user_email(token: str, db: Session = Depends(get_db)):
    email = verify_token(token)
    if not email:
        raise HTTPException(status_code=400, detail="Nieprawidłowy lub wygasły link aktywacyjny.")
    
    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(status_code=404, detail="Użytkownik nie znaleziony.")
    
    if user.is_active:
        return {"message": "Konto jest już aktywne."}

    user.is_active = True
    db.commit()
    return {"message": "Konto zostało pomyślnie aktywowane! Możesz się teraz zalogować."}

# --- PROFIL UŻYTKOWNIKA ---

@router.get("/me", response_model=UserOut)
def read_users_me(current_user: User = Depends(get_current_user)):
    """
    Zwraca dane aktualnie zalogowanego użytkownika (wraz z budynkami).
    """
    return current_user

@router.put("/me", response_model=UserOut)
def update_user_me(
    user_update: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Edycja własnego profilu przez użytkownika.
    """
    if user_update.first_name is not None:
        current_user.first_name = user_update.first_name
    if user_update.last_name is not None:
        current_user.last_name = user_update.last_name
    if user_update.address is not None:
        current_user.address = user_update.address
    
    db.add(current_user)
    db.commit()
    db.refresh(current_user)
    return current_user

# --- ENDPOINTY DLA ADMINA (PANEL ADMINISTRATORA) ---

@router.get("/", response_model=List[UserOut])
def read_all_users(
    skip: int = 0, 
    limit: int = 100, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_admin) # <--- Tylko Admin
):
    """
    Admin: Pobiera listę wszystkich użytkowników (potrzebne do tabeli w panelu).
    """
    users = db.query(User).options(joinedload(User.buildings)).offset(skip).limit(limit).all()
    return users

@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_admin) # <--- Tylko Admin
):
    """
    Admin: Usuwa użytkownika po ID.
    """
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Użytkownik nie znaleziony")
    
    # Zabezpieczenie przed usunięciem samego siebie
    if user.id == current_user.id:
         raise HTTPException(status_code=400, detail="Nie możesz usunąć własnego konta administratora")

    db.delete(user)
    db.commit()
    return None

@router.put("/{user_id}", response_model=UserOut)
def update_user_by_admin(
    user_id: int,
    user_update: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_admin) # <--- Tylko Admin
):
    """
    Admin: Edytuje dowolnego użytkownika (np. zmiana roli, blokada, reset danych).
    """
    db_user = db.query(User).filter(User.id == user_id).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="Użytkownik nie znaleziony")

    # Aktualizacja pól
    if user_update.email is not None:
        # Sprawdź czy nowy email nie jest zajęty
        existing_email = db.query(User).filter(User.email == user_update.email).filter(User.id != user_id).first()
        if existing_email:
            raise HTTPException(status_code=400, detail="Ten email jest już zajęty")
        db_user.email = user_update.email
        
    if user_update.role is not None:
        db_user.role = user_update.role
        
    if user_update.first_name is not None:
        db_user.first_name = user_update.first_name
        
    if user_update.last_name is not None:
        db_user.last_name = user_update.last_name
        
    if user_update.address is not None:
        db_user.address = user_update.address

    # Jeśli admin zmienia hasło użytkownikowi (reset hasła)
    if user_update.password is not None:
         db_user.hashed_password = get_password_hash(user_update.password)

    try:
        db.add(db_user)
        db.commit()
        db.refresh(db_user)
    except Exception as e:
        db.rollback()
        print(f"Błąd bazy: {e}")
        raise HTTPException(status_code=500, detail="Błąd podczas zapisywania zmian")

    return db_user

@router.patch("/{user_id}/status", response_model=UserOut)
def update_user_status(
    user_id: int,
    is_active: bool,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_admin) # Tylko admin może to zrobić
):
    """
    Szybka zmiana statusu aktywności użytkownika (dla Admina).
    """
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Użytkownik nie znaleziony")
    
    # Zabezpieczenie: Nie pozwól adminowi dezaktywować samego siebie
    if user.id == current_user.id:
         raise HTTPException(status_code=400, detail="Nie możesz zmienić statusu własnego konta")

    user.is_active = is_active
    db.commit()
    db.refresh(user)
    return user

# --- NOWOŚĆ: ZMIANA HASŁA PRZEZ UŻYTKOWNIKA ---

@router.post("/change-password", status_code=status.HTTP_200_OK)
def change_password(
    password_data: UserPasswordChange,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Pozwala zalogowanemu użytkownikowi zmienić hasło.
    Wymaga podania starego hasła.
    """
    # 1. Weryfikacja starego hasła
    if not verify_password(password_data.old_password, current_user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail="Stare hasło jest nieprawidłowe."
        )
    
    # 2. Sprawdzenie czy nowe hasło jest inne
    if password_data.old_password == password_data.new_password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Nowe hasło musi różnić się od starego."
        )

    # 3. Zapisanie nowego hasła
    current_user.hashed_password = get_password_hash(password_data.new_password)
    db.add(current_user)
    db.commit()
    
    return {"message": "Hasło zostało pomyślnie zmienione."}