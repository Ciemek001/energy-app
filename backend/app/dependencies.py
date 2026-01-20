# backend/app/dependencies.py
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.models.user import User
from app.utils.security import SECRET_KEY, ALGORITHM

# To mówi FastAPI, że token przychodzi w nagłówku "Authorization: Bearer <token>"
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Nieprawidłowe dane uwierzytelniające",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        # Dekodujemy token
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    # Pobieramy użytkownika z bazy
    user = db.query(User).filter(User.email == email).first()
    if user is None:
        raise credentials_exception
    
    return user

def get_current_active_admin(current_user: User = Depends(get_current_user)):
    """
    Zależność, która sprawdza czy użytkownik jest administratorem.
    """
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Brak wystarczających uprawnień (wymagany Administrator)"
        )
    return current_user