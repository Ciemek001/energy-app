import os
os.environ['HOME'] = 'C:\\'
os.environ['USERPROFILE'] = 'C:\\'
os.environ['PGPASSFILE'] = 'C:\\pgpass.conf'
from dotenv import load_dotenv

# Wczytaj zmienne z pliku .env
load_dotenv()

from fastapi import FastAPI
from app.routers import (
    users,
    buildings,
    materials,
    heating,
    building_parameters,
    calculations,
)

app = FastAPI()

app.include_router(users.router)
app.include_router(buildings.router)
app.include_router(materials.router)
app.include_router(heating.router)
app.include_router(building_parameters.router)
app.include_router(calculations.router)

@app.get("/")
def read_root():
    return {"message": "Hello, FastAPI!"}
