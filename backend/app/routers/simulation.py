from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional
from app.db.database import get_db
from app.models.material import Material
from app.models.advanced_audit import AdvancedAudit
from app.models.user import User
from app.routers.auth import get_current_user

router = APIRouter(prefix="/simulation", tags=["simulation"])

# --- MODELE WEJŚCIOWE ---
class LayerInput(BaseModel):
    materialId: int
    thickness: float

class FullSimulationRequest(BaseModel):
    area: float
    height: float
    floors: int
    inhabitants: int
    year: int
    climateZone: str
    
    wallLayers: List[LayerInput]
    roofLayers: List[LayerInput]
    floorLayers: List[LayerInput]

    windowArea: float; windowU: float
    doorArea: float; doorU: float

    heatingSource: str
    hasSecondaryHeating: bool
    secondaryHeatingSource: Optional[str] = None
    ventilation: str
    waterProfile: str

    pvPower: float
    solarCollectorArea: float

# --- MODEL WYNIKOWY ---
class EPResult(BaseModel):
    id: int
    EU: float; EK: float; EP: float
    classification: str; passed_wt2021: bool; details: str
    peak_power_kw: float; estimated_cost_pln: float
    heat_loss_walls: float; heat_loss_windows: float; heat_loss_ventilation: float

# --- STAŁE FIZYCZNE ---
DESIGN_TEMPS = { "I": -16, "II": -18, "III": -20, "IV": -22, "V": -24 }
HDD_ZONES = { "I": 3000, "II": 3400, "III": 3800, "IV": 4000, "V": 4400 }
FUEL_PRICES = { "coal": 0.60, "coal_eco": 0.65, "gas_condensing": 0.35, "heat_pump_air": 1.00, "heat_pump_ground": 1.00, "electric": 1.00, "biomass": 0.45, "wood": 0.30, "fireplace": 0.30 }
EFFICIENCY = { "coal": 0.60, "coal_eco": 0.85, "gas_condensing": 0.95, "oil": 0.90, "heat_pump_air": 3.00, "heat_pump_ground": 4.00, "electric": 0.99, "biomass": 0.85, "wood": 0.70, "fireplace": 0.70 }
WI_FACTORS = { "coal": 1.1, "coal_eco": 1.1, "gas_condensing": 1.1, "oil": 1.1, "heat_pump_air": 3.0, "heat_pump_ground": 3.0, "electric": 3.0, "biomass": 0.2, "wood": 0.2, "fireplace": 0.2 }

# --- LOGIKA OBLICZENIOWA (Wydzielona funkcja) ---
def perform_physics_calculation(data: FullSimulationRequest, db: Session):
    # 1. Obliczenia U
    def calculate_u(layers, rsi, rse):
        r_sum = 0
        for l in layers:
            mat = db.query(Material).filter(Material.id == l.materialId).first()
            if mat: r_sum += (l.thickness / 100.0) / mat.lambda_value
        return 1.0 / (rsi + r_sum + rse) if r_sum > 0 else 5.0

    u_walls = calculate_u(data.wallLayers, 0.13, 0.04)
    u_roof = calculate_u(data.roofLayers, 0.10, 0.04)
    u_floor = calculate_u(data.floorLayers, 0.17, 0.0)

    # 2. Geometria i Straty
    import math
    base_area = data.area / max(data.floors, 1)
    perimeter = 4 * math.sqrt(base_area)
    wall_area_net = max(0, (perimeter * data.height * data.floors) - data.windowArea - data.doorArea)
    
    h_walls = wall_area_net * u_walls
    h_roof = base_area * u_roof
    h_floor = base_area * u_floor * 0.5
    h_windows = data.windowArea * data.windowU
    h_doors = data.doorArea * data.doorU
    
    vent_airflow = 0.5 if data.ventilation == "gravity" else 0.6
    vent_recovery = 0.0 if data.ventilation == "gravity" else 0.85
    volume = data.area * data.height
    h_ventilation = 0.34 * volume * vent_airflow * (1 - vent_recovery)

    H_tot = h_walls + h_roof + h_floor + h_windows + h_doors + h_ventilation

    # MOC SZCZYTOWA
    t_design_out = DESIGN_TEMPS.get(data.climateZone, -20)
    peak_power_kw = (H_tot * (20 - t_design_out)) / 1000 + (data.inhabitants * 0.25)

    # 3. Bilans Energii (EU)
    hdd = HDD_ZONES.get(data.climateZone, 3800)
    Q_loss = H_tot * hdd * 24 / 1000
    Q_gains = 0.9 * ((data.inhabitants * 100 * 24 * 300 / 1000) + (data.windowArea * 250))
    Q_H_nd = max(0, Q_loss - Q_gains)
    EU = Q_H_nd / data.area

    # 4. Energia Końcowa (EK)
    cwu_usage = 700
    if data.waterProfile == "low": cwu_usage = 500
    elif data.waterProfile == "high": cwu_usage = 1000
    Q_W_nd = max(0, (data.inhabitants * cwu_usage * 1.1) - (data.solarCollectorArea * 450))

    ratio_main = 0.8 if data.hasSecondaryHeating else 1.0
    ratio_sec = 0.2 if data.hasSecondaryHeating else 0.0
    eff_main = EFFICIENCY.get(data.heatingSource, 1.0)
    eff_sec = EFFICIENCY.get(data.secondaryHeatingSource, 1.0) if data.secondaryHeatingSource else 1.0
    
    fuel_kwh_main = ((Q_H_nd * ratio_main) / eff_main) + (Q_W_nd / eff_main)
    fuel_kwh_sec = ((Q_H_nd * ratio_sec) / eff_sec)
    
    pv_production = data.pvPower * 1000
    EK_total_net = max(0, (fuel_kwh_main + fuel_kwh_sec) - (pv_production * 0.3))
    EK = EK_total_net / data.area

    # KOSZTY
    price_main = FUEL_PRICES.get(data.heatingSource, 0.60)
    price_sec = FUEL_PRICES.get(data.secondaryHeatingSource, 0.60) if data.secondaryHeatingSource else 0
    cost_main = fuel_kwh_main * price_main
    if data.heatingSource in ["electric", "heat_pump_air", "heat_pump_ground"]:
        cost_main = max(0, cost_main - (pv_production * 0.9 * price_main))
    estimated_cost_pln = cost_main + (fuel_kwh_sec * price_sec)

    # 5. Energia Pierwotna (EP)
    wi_main = WI_FACTORS.get(data.heatingSource, 1.0)
    wi_sec = WI_FACTORS.get(data.secondaryHeatingSource, 1.0) if data.secondaryHeatingSource else 1.0
    EP_total = max(0, (fuel_kwh_main * wi_main) + (fuel_kwh_sec * wi_sec) - (pv_production * 0.7 * 2.5))
    EP = EP_total / data.area

    # Klasyfikacja
    classification = "F"
    if EP < 20: classification = "A+"
    elif EP < 65: classification = "A"
    elif EP < 90: classification = "B"
    elif EP < 150: classification = "C"
    elif EP < 250: classification = "D"

    return {
        "EU": round(EU, 2), "EK": round(EK, 2), "EP": round(EP, 2),
        "classification": classification, "passed_wt2021": EP <= 70.0,
        "peak_power_kw": round(peak_power_kw, 1), "estimated_cost_pln": round(estimated_cost_pln, 0),
        "heat_loss_walls": round(h_walls, 1), "heat_loss_windows": round(h_windows, 1),
        "heat_loss_ventilation": round(h_ventilation, 1)
    }

# --- ENDPOINTY ---

@router.post("/calculate-ep", response_model=EPResult)
def create_audit(data: FullSimulationRequest, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    # 1. Oblicz
    res = perform_physics_calculation(data, db)
    
    # 2. Zapisz nowy
    source_name = data.heatingSource.replace("_", " ").upper()
    details_msg = f"Strefa: {data.climateZone} | Źródło: {source_name}"
    
    new_audit = AdvancedAudit(
        user_id=current_user.id,
        input_data=data.dict(),
        ep_value=res["EP"], ek_value=res["EK"], eu_value=res["EU"],
        classification=res["classification"], passed_wt2021=res["passed_wt2021"]
    )
    db.add(new_audit)
    db.commit()
    db.refresh(new_audit)

    return {**res, "id": new_audit.id, "details": details_msg}

@router.get("/history")
def get_user_audits(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    audits = db.query(AdvancedAudit).filter(AdvancedAudit.user_id == current_user.id).order_by(AdvancedAudit.created_at.desc()).all()
    return audits

@router.delete("/history/{audit_id}")
def delete_audit(audit_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    audit = db.query(AdvancedAudit).filter(AdvancedAudit.id == audit_id, AdvancedAudit.user_id == current_user.id).first()
    if not audit:
        raise HTTPException(status_code=404, detail="Audyt nie znaleziony")
    db.delete(audit)
    db.commit()
    return {"message": "Usunięto pomyślnie"}

@router.get("/admin/history/{user_id}")
def get_audits_by_user_id(
    user_id: int, 
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    # 1. Sprawdź czy to Admin
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Brak uprawnień administratora")
    
    # 2. Pobierz audyty wskazanego użytkownika
    audits = db.query(AdvancedAudit).filter(AdvancedAudit.user_id == user_id).order_by(AdvancedAudit.created_at.desc()).all()
    return audits

@router.delete("/admin/history/{audit_id}")
def delete_audit_as_admin(
    audit_id: int, 
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    # 1. Sprawdź czy to Admin
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Brak uprawnień administratora")

    # 2. Znajdź i usuń audyt (bez sprawdzania czy należy do current_user)
    audit = db.query(AdvancedAudit).filter(AdvancedAudit.id == audit_id).first()
    if not audit:
        raise HTTPException(status_code=404, detail="Audyt nie znaleziony")
    
    db.delete(audit)
    db.commit()
    return {"message": "Audyt usunięty przez administratora"}

@router.put("/history/{audit_id}", response_model=EPResult)
def update_audit(audit_id: int, data: FullSimulationRequest, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    # 1. Znajdź istniejący
    audit = db.query(AdvancedAudit).filter(AdvancedAudit.id == audit_id, AdvancedAudit.user_id == current_user.id).first()
    if not audit:
        raise HTTPException(status_code=404, detail="Audyt nie znaleziony")
    
    # 2. Przelicz na nowo
    res = perform_physics_calculation(data, db)
    
    # 3. Zaktualizuj pola
    audit.input_data = data.dict()
    audit.ep_value = res["EP"]
    audit.ek_value = res["EK"]
    audit.eu_value = res["EU"]
    audit.classification = res["classification"]
    audit.passed_wt2021 = res["passed_wt2021"]
    
    db.commit()
    db.refresh(audit)
    
    source_name = data.heatingSource.replace("_", " ").upper()
    details_msg = f"Strefa: {data.climateZone} | Źródło: {source_name} (Zaktualizowano)"

    return {**res, "id": audit.id, "details": details_msg}