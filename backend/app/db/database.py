import os
from pathlib import Path
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.declarative import declarative_base
from dotenv import load_dotenv

# 1. Próba wczytania pliku .env (przydatne tylko lokalnie)
# W Dockerze ten plik może nie istnieć, ale to nie szkodzi - load_dotenv po prostu to zignoruje.
BASE_DIR = Path(__file__).resolve().parents[2]
env_path = BASE_DIR / ".env"
load_dotenv(dotenv_path=env_path)

# 2. Pobranie adresu bazy danych
# Priorytet: Zmienna środowiskowa (Docker) -> Plik .env -> Domyślny Localhost
# Dzięki temu kod zadziała u Ciebie lokalnie ORAZ u prowadzącego w Dockerze.
SQLALCHEMY_DATABASE_URL = os.getenv(
    "DATABASE_URL", 
    "postgresql://postgres:admin@localhost:5432/energy_db" # <-- Fallback dla lokalnego uruchamiania
)

# 3. Tworzenie silnika bazy danych
# connect_args={"client_encoding": "utf8"} zostawiamy, bo pomaga przy polskich znakach na Windowsie
engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"client_encoding": "utf8"}
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

# 4. Dependency do pobierania sesji
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()