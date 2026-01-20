# backend/app/core/security.py
from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from passlib.context import CryptContext
from itsdangerous import URLSafeTimedSerializer
import os
from dotenv import load_dotenv

load_dotenv()

# KONFIGURACJA JWT
SECRET_KEY = os.getenv("SECRET_KEY", "super-tajny-klucz-zmien-go")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60

# Kontekst do hashowania haseł
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Serializer do linków aktywacyjnych (To już miałeś)
serializer = URLSafeTimedSerializer(SECRET_KEY)

# --- FUNKCJE HASŁA ---

def verify_password(plain_password, hashed_password):
    """Sprawdza czy hasło tekstowe pasuje do hasha w bazie."""
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    """Zamienia hasło tekstowe na bezpieczny hash."""
    return pwd_context.hash(password)

# --- FUNKCJE JWT ---

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    """Tworzy token JWT dla zalogowanego użytkownika."""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

# --- FUNKCJE EMAIL TOKEN (Twoje istniejące) ---

def generate_verification_token(email: str):
    return serializer.dumps(email, salt="email-verification")

def verify_token(token: str, expiration: int = 3600):
    try:
        email = serializer.loads(token, salt="email-verification", max_age=expiration)
        return email
    except:
        return None