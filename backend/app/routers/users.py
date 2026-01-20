# backend/app/routers/users.py
from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.models.user import User
from app.schemas.user import UserCreate, UserOut
from app.utils.security import get_password_hash, generate_verification_token, verify_token
from app.utils.email import send_verification_email # Zakładam, że plik email.py jest w app/email.py
from app.dependencies import get_current_user

router = APIRouter(
    prefix="/users",
    tags=["users"]
)

@router.post("/", response_model=UserOut)
async def create_user(
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
        role=user.role if user.role else "user",
        is_active=False # Musi potwierdzić maila
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