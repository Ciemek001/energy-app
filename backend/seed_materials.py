# backend/seed_materials.py
import sys
import os

# Dodajemy bieżący katalog do ścieżki, żeby Python widział moduł 'app'
sys.path.append(os.getcwd())

from app.db.database import SessionLocal
from app.models.material import Material 

def seed_materials():
    db = SessionLocal()
    
    # Dane na podstawie Twojego modelu Material
    # name: Unikalna nazwa
    # category: "Mur", "Izolacja", "Tynk", "Dach", "Podłoga" (takie będą w dropdownie)
    # lambda_value: Przewodność cieplna [W/mK]
    # density: Gęstość [kg/m3] (opcjonalne, ale warto dać)
    # price: Cena [PLN] (opcjonalne)
    
    materials_data = [
        # --- KATEGORIA: MUR (CONSTRUCTION) ---
        {
            "name": "Cegła pełna ceramiczna",
            "category": "Mur", 
            "lambda_value": 0.77, 
            "density": 1800, 
            "price": 2.50 # cena za sztukę lub przeliczona
        },
        {
            "name": "Pustak ceramiczny (Porotherm) 25cm",
            "category": "Mur",
            "lambda_value": 0.30, 
            "density": 800,
            "price": 12.00
        },
        {
            "name": "Beton komórkowy (Gazobeton) 500",
            "category": "Mur",
            "lambda_value": 0.14, 
            "density": 500,
            "price": 15.00
        },
        {
            "name": "Bloczek silikatowy",
            "category": "Mur",
            "lambda_value": 0.80, 
            "density": 1400,
            "price": 5.00
        },
        {
            "name": "Żelbet (Beton zbrojony)",
            "category": "Mur",
            "lambda_value": 1.70, 
            "density": 2400,
            "price": 250.00
        },
        {
            "name": "Drewno lite (sosna/świerk)",
            "category": "Mur",
            "lambda_value": 0.16, 
            "density": 500,
            "price": 1200.00
        },

        # --- KATEGORIA: IZOLACJA (INSULATION) ---
        {
            "name": "Styropian EPS (Fasada) Biały",
            "category": "Izolacja",
            "lambda_value": 0.040, 
            "density": 15,
            "price": 250.00 # zł/m3
        },
        {
            "name": "Styropian EPS (Fasada) Grafitowy",
            "category": "Izolacja",
            "lambda_value": 0.031, 
            "density": 15,
            "price": 320.00
        },
        {
            "name": "Wełna mineralna skalna",
            "category": "Izolacja",
            "lambda_value": 0.035, 
            "density": 100,
            "price": 450.00
        },
        {
            "name": "Wełna szklana (miękka)",
            "category": "Izolacja",
            "lambda_value": 0.039, 
            "density": 15,
            "price": 180.00
        },
        {
            "name": "Pianka PUR (zamkniętokomórkowa)",
            "category": "Izolacja",
            "lambda_value": 0.024, 
            "density": 35,
            "price": 600.00
        },
        {
            "name": "Polistyren ekstrudowany (XPS)",
            "category": "Izolacja",
            "lambda_value": 0.034, 
            "density": 30,
            "price": 550.00
        },

        # --- KATEGORIA: TYNK / WYKOŃCZENIE (FINISH) ---
        {
            "name": "Tynk cementowo-wapienny",
            "category": "Tynk",
            "lambda_value": 0.82, 
            "density": 1850,
            "price": 25.00
        },
        {
            "name": "Tynk gipsowy",
            "category": "Tynk",
            "lambda_value": 0.40, 
            "density": 1000,
            "price": 30.00
        },
        {
            "name": "Płyta G-K (Gips-Karton)",
            "category": "Tynk",
            "lambda_value": 0.25, 
            "density": 800,
            "price": 20.00
        },
        {
            "name": "Tynk strukturalny (cienki)",
            "category": "Tynk",
            "lambda_value": 0.70, 
            "density": 1400,
            "price": 40.00
        },
        
        # --- KATEGORIA: DACH / STROP ---
        {
            "name": "Dachówka ceramiczna",
            "category": "Dach",
            "lambda_value": 1.00,
            "density": 2000,
            "price": 60.00
        },
        {
            "name": "Blachodachówka",
            "category": "Dach",
            "lambda_value": 50.00, # Metal dobrze przewodzi
            "density": 7800,
            "price": 45.00
        }
    ]

    print("--- ROZPOCZYNAM SEEDOWANIE MATERIAŁÓW ---")
    
    added_count = 0
    for mat in materials_data:
        # Sprawdzamy po nazwie, czy materiał już jest w bazie
        exists = db.query(Material).filter(Material.name == mat["name"]).first()
        
        if not exists:
            new_material = Material(
                name=mat["name"],
                category=mat["category"],
                lambda_value=mat["lambda_value"],
                density=mat["density"],
                price=mat["price"]
            )
            db.add(new_material)
            added_count += 1
            print(f"[+] Dodano: {mat['name']} (L={mat['lambda_value']})")
        else:
            print(f"[ ] Pominięto (już istnieje): {mat['name']}")

    try:
        db.commit()
        print(f"\n[SUKCES] Zapisano {added_count} nowych materiałów w bazie.")
    except Exception as e:
        print(f"\n[BŁĄD] Nie udało się zapisać danych: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_materials()