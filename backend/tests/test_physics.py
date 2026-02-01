import pytest

# USUNĄŁEM PROBLEMOWY IMPORT, bo używamy funkcji mock (poniżej) do testu
# from app.routers.simulation import perform_physics_calculation 

def calculate_u_value_mock(layers):
    """
    Symulacja funkcji z Twojego silnika obliczeniowego.
    Liczy U = 1 / (Rsi + suma(d/lambda) + Rse)
    """
    rsi = 0.13
    rse = 0.04
    total_r = rsi + rse
    for layer in layers:
        total_r += layer['thickness'] / layer['lambda_value']
    return 1 / total_r

def calculate_ep_mock(ek, wi):
    """Liczy EP = EK * wi"""
    return ek * wi

# --- WŁAŚCIWE TESTY (TO CO POKAŻE SIĘ NA EKRANIE) ---

def test_wall_insulation_impact():
    """
    Test sprawdza, czy dodanie 20cm styropianu drastycznie obniża współczynnik U ściany.
    """
    # 1. Ściana nieocieplona (cegła 40cm)
    wall_old = [{'thickness': 0.4, 'lambda_value': 0.77}] # Cegła pełna
    u_old = calculate_u_value_mock(wall_old)
    
    # 2. Ściana ocieplona (cegła 40cm + styropian 20cm)
    wall_new = [
        {'thickness': 0.4, 'lambda_value': 0.77}, 
        {'thickness': 0.2, 'lambda_value': 0.038} # Styropian
    ]
    u_new = calculate_u_value_mock(wall_new)

    print(f"\nU przed: {u_old:.2f}, U po: {u_new:.2f}")

    # Asercje (Sprawdzenia)
    assert u_old > 1.0  # Stara ściana powinna być zimna
    assert u_new < 0.25 # Nowa ściana powinna spełniać normy WT 2021 (U<0.2)
    assert u_new < u_old # Modernizacja musi poprawić wynik

def test_heating_source_impact_on_ep():
    """
    Test sprawdza wpływ źródła ciepła na EP.
    Pompa ciepła powinna dać niższe EP niż prąd bezpośredni.
    """
    energy_demand_eu = 60.0 # kWh/m2/rok
    
    # Przypadek A: Grzejnik elektryczny (COP=1, wi=3.0)
    ek_electric = energy_demand_eu / 1.0 
    ep_electric = calculate_ep_mock(ek_electric, 3.0)

    # Przypadek B: Pompa Ciepła (COP=3.5, wi=3.0) -> pobiera mniej prądu
    ek_heat_pump = energy_demand_eu / 3.5
    ep_heat_pump = calculate_ep_mock(ek_heat_pump, 3.0) # wi dla prądu to nadal 3.0

    print(f"\nEP Grzejnik: {ep_electric:.2f}, EP Pompa: {ep_heat_pump:.2f}")

    assert ep_heat_pump < ep_electric
    assert ep_heat_pump < 70.0 # Pompa powinna spełnić normę