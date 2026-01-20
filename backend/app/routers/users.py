# backend/app/routers/users.py
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.models.user import User
from app.schemas.user import UserCreate, UserOut, UserUpdate
from app.utils.security import get_password_hash, generate_verification_token, verify_token
from app.utils.email import send_verification_email # Zakładam, że plik email.py jest w app/email.py
from app.dependencies import get_current_user, get_current_active_admin

router = APIRouter(
    prefix="/users",
    tags=["users"]
)

@router.post("/", response_model=UserOut)
def create_user(
    user: UserCreate, 
    background_tasks: BackgroundTasks, # Używamy zadań w tle do wysyłki maila (szybciej dla usera)
    db: Session = Depends(get_db)
):
    # 1. Sprawdź czy użytkownik istnieje
    db_user = db.query(User).filter(User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Ten email jest już zarejestrowany.")

    # 2. Hashowanie hasła
    hashed_pwd = get_password_hash(user.password)

    # 3. Tworzenie użytkownika (domyślnie nieaktywny)
    new_user = User(
        email=user.email,
        hashed_password=hashed_pwd,
        role="user", # Domyślna rola
        is_active=False,
        first_name="", 
        last_name="",
        address=""
    )
    
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    # 4. Generowanie tokena i wysyłka maila w tle
    verification_token = generate_verification_token(new_user.email)
    
    # Uwaga: background_tasks wymaga aby funkcja send_verification_email była async lub zwykła
    # Jeśli w email.py masz async def, użyjemy await w wrapperze lub przekażemy bezpośrednio
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

@router.get("/me", response_model=UserOut)
def read_users_me(current_user: User = Depends(get_current_user)):
    """
    Zwraca dane aktualnie zalogowanego użytkownika.
    Wymaga tokena JWT w nagłówku.
    """
    return current_user

@router.put("/me", response_model=UserOut)
def update_user_me(
    user_update: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Aktualizujemy tylko te pola, które zostały przesłane (nie są None)
    if user_update.first_name is not None:
        current_user.first_name = user_update.first_name
    if user_update.last_name is not None:
        current_user.last_name = user_update.last_name
    if user_update.address is not None:
        current_user.address = user_update.address
    
    # Opcjonalnie zmiana hasła (wymagałaby hashowania!)
    # if user_update.password: ...

    db.add(current_user)
    db.commit()
    db.refresh(current_user)
    return current_user

@router.get("/", response_model=List[UserOut])
def read_all_users(
    skip: int = 0, 
    limit: int = 100, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_admin) # <--- Tylko admin
):
    """
    Admin: Pobiera listę wszystkich użytkowników.
    """
    users = db.query(User).offset(skip).limit(limit).all()
    return users

@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_admin) # <--- Tylko admin
):
    """
    Admin: Usuwa użytkownika po ID.
    """
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Użytkownik nie znaleziony")
    
    # Opcjonalnie: Zablokuj usuwanie samego siebie
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
    current_user: User = Depends(get_current_active_admin) # <--- Tylko admin
):
    """
    Admin: Edytuje dowolnego użytkownika (np. zmiana roli, reset hasła, edycja danych).
    """
    db_user = db.query(User).filter(User.id == user_id).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="Użytkownik nie znaleziony")

    # Aktualizacja pól
    if user_update.email is not None:
        # Sprawdź czy email nie jest zajęty przez kogoś innego
        existing_email = db.query(User).filter(User.email == user_update.email).filter(User.id != user_id).first()
        if existing_email:
            raise HTTPException(status_code=400, detail="Email zajęty")
        db_user.email = user_update.email
        
    if user_update.role is not None:
        db_user.role = user_update.role
        
    if user_update.first_name is not None:
        db_user.first_name = user_update.first_name
        
    if user_update.last_name is not None:
        db_user.last_name = user_update.last_name
        
    if user_update.address is not None:
        db_user.address = user_update.address

    # Jeśli admin zmienia hasło użytkownikowi
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

    # 5. Zwrócenie obiektu (TEGO TEŻ BRAKOWAŁO!)
    return db_user
   