from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.crud.crud_user import crud_user
from app.schemas.user import UserCreate, UserOut
from app.utils.security import generate_verification_token, verify_token
from app.utils.email import send_verification_email

router = APIRouter(prefix="/users", tags=["Users"])


@router.get("/", response_model=list[UserOut])
def get_users(db: Session = Depends(get_db)):
    # Usunięto await, zmieniono AsyncSession na Session
    return crud_user.get_multi(db)


@router.get("/{user_id}", response_model=UserOut)
def get_user(user_id: int, db: Session = Depends(get_db)):
    # Usunięto await, zmieniono AsyncSession na Session
    user = crud_user.get(db, id=user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="Użytkownik nie został znaleziony"
        )
    return user


@router.post("/", response_model=UserOut, status_code=status.HTTP_201_CREATED)
async def create_user(user: UserCreate, db: Session = Depends(get_db)):
    # Sprawdzenie czy mail jest zajęty
    db_user = crud_user.get_by_email(db, email=user.email)
    if db_user:
        raise HTTPException(
            status_code=400,
            detail="Użytkownik o tym adresie e-mail już istnieje."
        )

    # 1. Stwórz użytkownika (domyślnie is_active=False w modelu)
    new_user = crud_user.create(db, user)
    
    # 2. Wygeneruj token i wyślij maila (to zostaje asynchroniczne)
    token = generate_verification_token(new_user.email)
    try:
        await send_verification_email(new_user.email, token)
    except Exception as e:
        # Opcjonalnie: logowanie błędu wysyłki maila
        print(f"Błąd wysyłki maila: {e}")
    
    return new_user


@router.get("/verify/{token}")
def verify_user_email(token: str, db: Session = Depends(get_db)):
    # Dekodowanie maila z tokena
    email = verify_token(token)
    if not email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail="Nieprawidłowy lub wygasły token"
        )
    
    # Pobranie użytkownika
    user = crud_user.get_by_email(db, email=email)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="Użytkownik nie istnieje"
        )
        
    if user.is_active:
        return {"message": "Konto jest już aktywne."}

    # Aktywacja konta
    user.is_active = True
    db.add(user)
    db.commit()
    
    return {"message": "Konto zostało aktywowane pomyślnie!"}