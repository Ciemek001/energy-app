# backend/app/utils/calculator_simple.py
from app.schemas.calculation import SimpleCalculationRequest, SimpleCalculationResponse, Recommendation
from app.core.constants import U_VALUES, HEATING_SYSTEMS, CLIMATE_DATA, VENTILATION_EFF

def calculate_simple_energy(data: SimpleCalculationRequest) -> SimpleCalculationResponse:
    
    # 1. GEOMETRIA (Szacowanie powierzchni przegród)
    # Zakładamy uproszczoną bryłę
    floor_area_per_level = data.area / max(data.floors, 1)
    
    # Dach = Powierzchnia rzutu (uproszczenie)
    area_roof = floor_area_per_level 
    # Podłoga = Powierzchnia rzutu
    area_floor = floor_area_per_level 
    # Okna = ok. 15% powierzchni podłogi (typowa norma)
    area_windows = data.area * 0.15 
    # Ściany = Obwód * Wysokość - Okna. 
    # Uproszczenie: Ściany to ok. 1.2 * Powierzchnia podłogi dla domów wolnostojących
    area_walls = (data.area * 1.2) - area_windows

    # 2. WSPÓŁCZYNNIKI U (Pobieramy ze stałych)
    u_wall = U_VALUES["wall"].get(data.standards.wall, 1.0)
    u_roof = U_VALUES["roof"].get(data.standards.roof, 1.0)
    u_win  = U_VALUES["window"].get(data.standards.window, 1.5)
    u_floor= U_VALUES["floor"].get(data.standards.floor, 1.0)

    # 3. WYZNACZENIE WSPÓŁCZYNNIKA STRAT CIEPŁA H [W/K]
    # H_tr = suma (U * A)
    H_tr = (u_wall * area_walls) + \
           (u_roof * area_roof) + \
           (u_win * area_windows) + \
           (u_floor * area_floor * 0.5) # *0.5 dla podłogi na gruncie (uproszczona norma PN-EN 12831)

    # H_ve (Wentylacja)
    # V_vent = Kubatura * krotność (0.5)
    # Kubatura = Area * 2.6m
    volume = data.area * 2.6
    vent_factor = VENTILATION_EFF.get(data.systems.ventilation, 1.0)
    H_ve = 0.34 * volume * 0.5 * vent_factor # 0.34 to ciepło właściwe powietrza

    H_total = H_tr + H_ve

    # 4. OBLICZENIE ZAPOTRZEBOWANIA NA ENERGIĘ UŻYTKOWĄ (EU)
    # Q_H = H_total * Stopniodni * 24h / 1000 (kWh)
    climate = CLIMATE_DATA.get(data.climateZone, CLIMATE_DATA["III"])
    Sd = climate["Sd"]
    
    Q_H_nd = (H_total * Sd * 24) / 1000 # Zapotrzebowanie na Ogrzewanie [kWh/rok]

    # Ciepła Woda (CWU)
    # Przyjmujemy ok. 800 kWh na osobę rocznie + straty
    Q_W_nd = data.inhabitants * 1000 # [kWh/rok]
    
    # Zyski ciepła (Słońce + Ludzie) - odejmujemy od zapotrzebowania
    # Uproszczenie: Zyski pokrywają ok. 15% strat w starych domach, 30% w nowych
    gain_factor = 0.85 
    EU_total = (Q_H_nd + Q_W_nd) * gain_factor

    # 5. ENERGIA KOŃCOWA (EK) - uwzględniamy sprawność
    # Pobieramy dane systemu grzewczego
    sys_primary = HEATING_SYSTEMS.get(data.systems.heatingPrimary, HEATING_SYSTEMS["gaz_stary"])
    
    # Jeśli jest drugie źródło, zakładamy że pokrywa 20% zapotrzebowania (średnia ważona)
    if data.systems.heatingSecondary:
        sys_secondary = HEATING_SYSTEMS.get(data.systems.heatingSecondary, sys_primary)
        avg_efficiency = (sys_primary["eff"] * 0.8) + (sys_secondary["eff"] * 0.2)
    else:
        avg_efficiency = sys_primary["eff"]

    # Sprawność CWU (często niższa niż CO, ale dla uproszczenia bierzemy źródło ciepła)
    # Jeśli są kolektory, CWU spada o 50%
    if data.systems.solar:
        Q_W_final = (Q_W_nd * 0.5) / avg_efficiency
    else:
        Q_W_final = Q_W_nd / avg_efficiency

    Q_H_final = (Q_H_nd * gain_factor) / avg_efficiency
    
    EK_total = Q_H_final + Q_W_final

    # 6. ENERGIA PIERWOTNA (EP) - uwzględniamy ekologię (wi)
    # EP = EK * wi
    if data.systems.heatingSecondary:
        sys_secondary = HEATING_SYSTEMS.get(data.systems.heatingSecondary, sys_primary)
        avg_wi = (sys_primary["wi"] * 0.8) + (sys_secondary["wi"] * 0.2)
    else:
        avg_wi = sys_primary["wi"]

    EP_total = EK_total * avg_wi

    # Korekta na Fotowoltaikę (PV)
    # Zakładamy że PV obniża EP o stałą wartość (np. produkcja 2000 kWh rocznie -> zmniejszenie EP)
    # W metodologii świadectw odejmuje się produkcję.
    if data.systems.pv:
        # Szacunkowa produkcja PV dla domu jednorodzinnego (np. 4kWp)
        pv_production = 3500 # kWh
        # Odejmujemy od EP (bo prąd z PV ma wi=0, a zaoszczędzony z sieci ma wi=2.5)
        # Efekt: Unikamy poboru sieciowego
        EP_total = max(0, EP_total - (pv_production * 2.5)) 

    # --- GENEROWANIE REKOMENDACJI ---
    recommendations = []

    # A. Izolacja
    if data.standards.wall in ["brak", "slaba"]:
        recommendations.append(Recommendation(
            title="Termomodernizacja ścian",
            description="Największe straty ciepła generują ściany. Zalecane ocieplenie styropianem 15-20cm.",
            type="modernization",
            priority="high"
        ))
    
    if data.standards.roof in ["brak"]:
        recommendations.append(Recommendation(
            title="Ocieplenie dachu",
            description="Ciepło ucieka do góry. Ocieplenie poddasza wełną (min. 25cm) to tania i skuteczna inwestycja.",
            type="modernization",
            priority="high"
        ))

    # B. Ogrzewanie (Smog / Koszty)
    if data.systems.heatingPrimary == "wegiel":
        recommendations.append(Recommendation(
            title="Wymiana kopciucha",
            description="Kocioł węglowy generuje wysokie koszty środowiskowe (EP). Rozważ pompę ciepła + PV.",
            type="system",
            priority="high"
        ))
    
    if data.systems.heatingPrimary == "prad" and not data.systems.pv:
        recommendations.append(Recommendation(
            title="Fotowoltaika obowiązkowa",
            description="Ogrzewanie prądem bez PV jest bardzo drogie w eksploatacji (wysokie EK) i nieekologiczne (wysokie EP).",
            type="oze",
            priority="high"
        ))

    # C. Wentylacja
    if data.systems.ventilation == "grawitacyjna" and data.year > 2000:
        recommendations.append(Recommendation(
            title="Rozważ rekuperację",
            description="W nowszych, szczelnych domach wentylacja grawitacyjna działa słabo i generuje straty. Rekuperacja zapewni komfort.",
            type="system",
            priority="medium"
        ))

    return SimpleCalculationResponse(
        EU=round(EU_total / data.area, 2),
        EK=round(EK_total / data.area, 2),
        EP=round(EP_total / data.area, 2),
        raw_EU=round(EU_total, 0),
        raw_EK=round(EK_total, 0),
        raw_EP=round(EP_total, 0),
        recommendations=recommendations
    )