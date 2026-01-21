# backend/app/core/constants.py

# 1. WSPÓŁCZYNNIKI PRZENIKANIA CIEPŁA U [W/m2K]
# Szacunkowe wartości dla różnych standardów
U_VALUES = {
    "wall": {
        "brak": 1.50,    # Cegła pełna bez ocieplenia
        "slaba": 0.70,   # 5-8 cm styropianu
        "srednia": 0.28, # Standard WT2014-2017 (12-15 cm)
        "dobra": 0.18    # Standard WT2021 (20 cm grafit)
    },
    "roof": {
        "brak": 1.00,
        "srednia": 0.25,
        "dobra": 0.12
    },
    "window": {
        "stare": 2.60,   # Stare drewniane/PCV
        "standard": 1.30, # Pakiet 2-szybowy
        "energo": 0.90   # Pakiet 3-szybowy
    },
    "floor": {
        "nieocieplona": 1.20,
        "ocieplona": 0.30
    }
}

# 2. PARAMETRY SYSTEMÓW GRZEWCZYCH
# eff = sprawność średnioroczna (wytwarzanie + przesył + regulacja)
# wi = współczynnik nakładu nieodnawialnej energii pierwotnej
HEATING_SYSTEMS = {
    "wegiel":           {"eff": 0.60, "wi": 1.10},
    "biomasa":          {"eff": 0.65, "wi": 0.20}, # Pellet/Drewno - niskie EP!
    "gaz_stary":        {"eff": 0.75, "wi": 1.10},
    "gaz_kond":         {"eff": 0.95, "wi": 1.10},
    "prad":             {"eff": 0.99, "wi": 2.50}, # Prąd z sieci ma wysokie EP w Polsce
    "pompa_powietrze":  {"eff": 3.00, "wi": 2.50}, # SCOP ok. 3.0
    "pompa_grunt":      {"eff": 4.00, "wi": 2.50}, # SCOP ok. 4.0
    "kominek":          {"eff": 0.60, "wi": 0.20}
}

# 3. STREFY KLIMATYCZNE POLSKI
# Sd = Liczba stopniodni grzania (szacunek dla typowego roku)
CLIMATE_DATA = {
    "I":   {"Sd": 3400, "Text": -16}, # Szczecin, Wrocław
    "II":  {"Sd": 3600, "Text": -18}, # Poznań, Łódź
    "III": {"Sd": 3800, "Text": -20}, # Warszawa, Kielce
    "IV":  {"Sd": 4000, "Text": -22}, # Białystok
    "V":   {"Sd": 4400, "Text": -24}  # Zakopane, Suwałki
}

# 4. WENTYLACJA
# Współczynnik korygujący straty na wentylację
VENTILATION_EFF = {
    "grawitacyjna": 1.0, # 100% strat
    "mechaniczna": 0.3   # Rekuperacja odzyskuje ok. 70%, więc zostaje 30% strat
}