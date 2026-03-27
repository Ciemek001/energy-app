import os
from dotenv import load_dotenv

# Ustawienia środowiskowe (zostawiamy, nie szkodzą w Dockerze, a pomagają na Windows)
os.environ['HOME'] = 'C:\\'
os.environ['USERPROFILE'] = 'C:\\'
os.environ['PGPASSFILE'] = 'C:\\pgpass.conf'

# Wczytaj zmienne z pliku .env
load_dotenv()

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# --- IMPORTY BAZY DANYCH ---
# Musimy zaimportować 'Base', aby mieć dostęp do metadanych tabel
from app.db.database import engine, Base 

# --- IMPORTY MODELI (KLUCZOWE) ---
# SQLAlchemy musi "widzieć" te klasy przed startem, żeby utworzyć tabele
from app.models.user import User 
from app.models.building import Building
from app.models.material import Material
# Jeśli masz inne modele w innych plikach, dodaj je tutaj, np.:
# from app.models.audit import AdvancedAudit 

# --- IMPORTY ROUTERÓW ---
from app.routers import (
    users,
    auth,
    buildings,
    materials,
    heating,
    building_parameters,
    calculations,
    simulation,
    statistics
)

# --- TWORZENIE TABEL W BAZIE DANYCH ---
# To jest linia, której brakowało! Tworzy tabele przy starcie aplikacji.
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Energy App")

# --- KONFIGURACJA CORS ---
origins = [
    "http://localhost:5173",    # Vite lokalnie
    "http://127.0.0.1:5173",
    "http://localhost:3000",    # Docker Frontend (zmapowany na 3000)
    "http://127.0.0.1:3000",
    "http://localhost:80",      # Docker Frontend (wewnętrzny port 80)
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- DOŁĄCZANIE ROUTERÓW ---
app.include_router(auth.router)
app.include_router(users.router)
app.include_router(buildings.router)
app.include_router(materials.router)
app.include_router(heating.router)
app.include_router(building_parameters.router)
app.include_router(calculations.router)
app.include_router(simulation.router)
app.include_router(statistics.router)

@app.get("/")
def read_root():
    return {"message": "Energy App API is running!"}