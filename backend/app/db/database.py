import os
from pathlib import Path
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv

# 1. Wyznaczamy ścieżkę do folderu 'backend' i pliku '.env'
# Ten plik jest w backend/app/db/database.py, więc idziemy 2 poziomy w górę
BASE_DIR = Path(__file__).resolve().parents[2]
env_path = BASE_DIR / ".env"

# 2. Wczytujemy .env z konkretnej ścieżki
load_dotenv(dotenv_path=env_path)

# 3. Pobieramy adres i sprawdzamy czy na pewno istnieje
SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL")

if not SQLALCHEMY_DATABASE_URL:
    raise ValueError(f"BŁĄD: Nie znaleziono DATABASE_URL w pliku .env! Szukałem w: {env_path}")

# 4. Tworzymy silnik (z poprawką na kodowanie Windows, o której rozmawialiśmy)
engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"client_encoding": "utf8"}
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()