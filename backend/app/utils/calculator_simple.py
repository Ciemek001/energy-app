# backend/app/utils/calculator_simple.py
from app.schemas.calculation import SimpleCalculationRequest, SimpleCalculationResponse, Recommendation, ChartDetails
from app.core.constants import U_VALUES, HEATING_SYSTEMS, CLIMATE_DATA, VENTILATION_EFF

def calculate_simple_energy(data: SimpleCalculationRequest) -> SimpleCalculationResponse:
    
    # 1. GEOMETRIA (Szacowanie powierzchni przegród)
    floor_area_per_level = data.area / max(data.floors, 1)
    
    area_roof = floor_area_per_level 
    area_floor = floor_area_per_level 
    area_windows = data.area * 0.15 
    area_walls = (data.area * 1.2) - area_windows

    # 2. WSPÓŁCZYNNIKI U
    u_wall = U_VALUES["wall"].get(data.standards.wall, 1.0)
    u_roof = U_VALUES["roof"].get(data.standards.roof, 1.0)
    u_win  = U_VALUES["window"].get(data.standards.window, 1.5)
    u_floor= U_VALUES["floor"].get(data.standards.floor, 1.0)

    # 3. WYZNACZENIE WSPÓŁCZYNNIKA STRAT CIEPŁA H [W/K]
    # H_tr = suma (U * A) - Przenikanie
    H_tr = (u_wall * area_walls) + \
           (u_roof * area_roof) + \
           (u_win * area_windows) + \
           (u_floor * area_floor * 0.5)

    # H_ve - Wentylacja
    volume = data.area * 2.6
    vent_factor = VENTILATION_EFF.get(data.systems.ventilation, 1.0)
    H_ve = 0.34 * volume * 0.5 * vent_factor

    H_total = H_tr + H_ve

    # 4. OBLICZENIE ZAPOTRZEBOWANIA NA ENERGIĘ UŻYTKOWĄ (EU)
    climate = CLIMATE_DATA.get(data.climateZone, CLIMATE_DATA["III"])
    Sd = climate["Sd"]
    
    # --- NOWOŚĆ: Obliczamy składowe strat do wykresów [kWh/rok] ---
    Q_tr_loss = (H_tr * Sd * 24) / 1000  # Straty przez przenikanie
    Q_ve_loss = (H_ve * Sd * 24) / 1000  # Straty przez wentylację
    
    Q_H_nd = (H_total * Sd * 24) / 1000 # Zapotrzebowanie na Ogrzewanie całkowite

    # Ciepła Woda (CWU)
    # Przyjmujemy 800 kWh/os (nieco niżej niż stary ryczałt 1000, bardziej realne)
    Q_W_nd = data.inhabitants * 800 
    
    # Zyski ciepła (Słońce + Ludzie)
    gain_factor = 0.85 
    EU_total = (Q_H_nd + Q_W_nd) * gain_factor

    # 5. ENERGIA KOŃCOWA (EK)
    sys_primary = HEATING_SYSTEMS.get(data.systems.heatingPrimary, HEATING_SYSTEMS["gaz_stary"])
    
    if data.systems.heatingSecondary:
        sys_secondary = HEATING_SYSTEMS.get(data.systems.heatingSecondary, sys_primary)
        avg_efficiency = (sys_primary["eff"] * 0.8) + (sys_secondary["eff"] * 0.2)
    else:
        avg_efficiency = sys_primary["eff"]

    if data.systems.solar:
        Q_W_final = (Q_W_nd * 0.5) / avg_efficiency
    else:
        Q_W_final = Q_W_nd / avg_efficiency

    Q_H_final = (Q_H_nd * gain_factor) / avg_efficiency
    
    EK_total = Q_H_final + Q_W_final

    # 6. ENERGIA PIERWOTNA (EP)
    if data.systems.heatingSecondary:
        sys_secondary = HEATING_SYSTEMS.get(data.systems.heatingSecondary, sys_primary)
        avg_wi = (sys_primary["wi"] * 0.8) + (sys_secondary["wi"] * 0.2)
    else:
        avg_wi = sys_primary["wi"]

    EP_total = EK_total * avg_wi

    if data.systems.pv:
        pv_production = 3000 # kWh
        EP_total = max(0, EP_total - (pv_production * 2.5)) 

    # --- GENEROWANIE REKOMENDACJI ---
    recommendations = []

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
        # --- NOWOŚĆ: Przekazujemy detale do wykresu kołowego ---
        details=ChartDetails(
            heat_transmission=round(Q_tr_loss, 0),
            heat_ventilation=round(Q_ve_loss, 0),
            hot_water=round(Q_W_nd, 0)
        ),
        recommendations=recommendations
    )