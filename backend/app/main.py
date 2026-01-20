import os
# Twoje ustawienia środowiskowe dla Windows/Postgres
os.environ['HOME'] = 'C:\\'
os.environ['USERPROFILE'] = 'C:\\'
os.environ['PGPASSFILE'] = 'C:\\pgpass.conf'

from dotenv import load_dotenv

# Wczytaj zmienne z pliku .env
load_dotenv()

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware  # <--- 1. Import niezbędny do CORS

from app.routers import (
    users,
    auth,
    buildings,
    materials,
    heating,
    building_parameters,
    calculations,
)

app = FastAPI()

# <--- 2. Konfiguracja CORS (To naprawia błąd połączenia z Frontendem)
origins = [
    "http://localhost:5173",    # Domyślny port Vite (Twój frontend)
    "http://127.0.0.1:5173",
    "http://localhost:3000",    # Alternatywny port Reacta (na wszelki wypadek)
    "http://localhost:80",      # Jeśli testujesz lokalnie na porcie 80
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,      # Zezwól na zapytania z tych adresów
    allow_credentials=True,
    allow_methods=["*"],        # Zezwól na wszystkie metody (POST, GET, OPTIONS itd.)
    allow_headers=["*"],        # Zezwól na wszystkie nagłówki
)
# ---> Koniec konfiguracji CORS

# Dołączanie routerów
app.include_router(auth.router)
app.include_router(users.router)
app.include_router(buildings.router)
app.include_router(materials.router)
app.include_router(heating.router)
app.include_router(building_parameters.router)
app.include_router(calculations.router)

@app.get("/")
def read_root():
    return {"message": "Hello, FastAPI!"}