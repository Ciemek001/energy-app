from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.models.user import User
from app.models.building import Building
from app.models.advanced_audit import AdvancedAudit
from app.routers.auth import get_current_user

router = APIRouter(
    prefix="/statistics",
    tags=["statistics"]
)

@router.get("/dashboard")
def get_global_statistics(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # 1. Pobierz wszystkie dane (Dla inżynierki pobieranie wszystkiego do RAMu jest OK)
    simple_buildings = db.query(Building).all()
    advanced_audits = db.query(AdvancedAudit).all()

    # --- ZMIENNE DO LICZNIKÓW ---
    total_audits = len(simple_buildings) + len(advanced_audits)
    pv_count = 0
    heat_pump_count = 0
    total_area = 0
    source_counts = {} # np. {"gaz": 5, "wegiel": 2}
    
    # Lista do Rankingu (znormalizowana)
    leaderboard = []

    # --- ANALIZA BUDYNKÓW PROSTYCH ---
    for b in simple_buildings:
        # Wyciągamy dane z JSONA (saved_data)
        data = b.saved_data if b.saved_data else {}
        systems = data.get("details", {}).get("systems", {})
        
        # PV
        if systems.get("pv") == True:
            pv_count += 1
            
        # Źródło ciepła
        source = systems.get("heatingPrimary", "unknown")
        if source in ["pompa_ciepla", "heat_pump"]: heat_pump_count += 1
        source_counts[source] = source_counts.get(source, 0) + 1
        
        # Powierzchnia
        total_area += b.floor_area
        
        # Do rankingu (jeśli ma policzone EP)
        if b.calculated_ep:
            leaderboard.append({
                "type": "Prosty",
                "name": b.name,
                "ep": b.calculated_ep,
                "source": source,
                "date": b.construction_year # Używamy roku jako daty orientacyjnej
            })

    # --- ANALIZA AUDYTÓW ZAAWANSOWANYCH ---
    for a in advanced_audits:
        # Dane z JSONA (input_data)
        data = a.input_data if a.input_data else {}
        
        # PV
        if data.get("pvPower", 0) > 0:
            pv_count += 1
            
        # Źródło
        source = data.get("heatingSource", "unknown")
        if "heat_pump" in source: heat_pump_count += 1
        source_counts[source] = source_counts.get(source, 0) + 1
        
        # Powierzchnia
        total_area += data.get("area", 0)
        
        # Do rankingu
        leaderboard.append({
            "type": "Inżynierski",
            "name": f"Audyt #{a.id} (Strefa {data.get('climateZone', '?')})",
            "ep": a.ep_value,
            "source": source,
            "date": a.created_at
        })

    # --- SORTOWANIE RANKINGU ---
    # Najlepsze budynki to te z NAJNIŻSZYM EP
    leaderboard.sort(key=lambda x: x["ep"])
    top_10 = leaderboard[:10]

    # --- FORMATOWANIE DO WYKRESÓW ---
    # 1. Wykres źródeł (Pie Chart)
    chart_sources = [
        {"name": k.replace("_", " ").upper(), "value": v} 
        for k, v in source_counts.items() 
        if v > 0
    ]

    return {
        "kpi": {
            "total_audits": total_audits,
            "pv_users": pv_count,
            "heat_pump_users": heat_pump_count,
            "total_area_m2": round(total_area, 0)
        },
        "charts": {
            "sources": chart_sources
        },
        "leaderboard": top_10
    }