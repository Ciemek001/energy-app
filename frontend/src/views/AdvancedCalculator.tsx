import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./AdvancedCalculator.css";



export default function AdvancedCalculator() {
  const navigate = useNavigate();

  const [open, setOpen] = useState<string | null>(null);
  const toggle = (section: string) => {
    setOpen(open === section ? null : section);
  };

  const [form, setForm] = useState({
    // 1 — Dane podstawowe
    powierzchnia: "",
    kubatura: "",
    rokBudowy: "",
    modernizacje: "",
    kondygnacje: "",
    wysokosc: "",
    funkcja: "",

    // 2 — Konstrukcja
    sciany: "",
    scianyU: "",
    dach: "",
    dachU: "",
    podloga: "",
    oknaTyp: "",
    oknaU: "",
    oknaG: "",
    oknaPow: "",
    mostki: "",

    // 3 — Instalacje
    ogrzewanie: "",
    sprawnoscOgrz: "",
    mocOgrz: "",
    cwu: "",
    wentylacja: "",
    rekuperacjaSprawnosc: "",
    przeplywPowietrza: "",
    klimatyzacja: "",
    sterowanie: "",

    // 4 — Użytkowanie
    osoby: "",
    tryb: "",
    tempDzien: "",
    tempNoc: "",
    preferencje: "",
    energiaElektryczna: "",

    // 5 — Klimat
    lokalizacja: "",
    strefaKlimatyczna: "",
    tempZew: "",
    naslonecznienie: "",
    wilgotnosc: "",
    meteo: "",
  });

  const handleInputChange =
    <T extends Record<string, any>>(setter: React.Dispatch<React.SetStateAction<T>>) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { name, value } = e.target;
      setter((prev) => ({ ...prev, [name]: value }));
    };

  const sectionStyle = {
    background: "#fff",
    borderRadius: "12px",
    padding: "18px 22px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
    marginBottom: "15px",
  };

  const labelStyle: React.CSSProperties = {
    fontWeight: 600,
    marginTop: "10px",
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(135deg, rgba(0, 90, 170, 0.35), rgba(0, 120, 200, 0.45))",
        padding: "40px",
        display: "flex",
        justifyContent: "center",
      }}
    >
      <div style={{ width: "100%", maxWidth: "850px" }}>
        <h1
          style={{
            textAlign: "center",
            color: "black",
            marginBottom: "30px",
            fontSize: "32px",
          }}
        >
          Zaawansowany kalkulator energetyczny
        </h1>

        {/* 1 — Dane podstawowe */}
        <div style={sectionStyle}>
          <h2
            onClick={() => toggle("basic")}
            style={{ cursor: "pointer", marginBottom: "10px" }}
          >
            1. Dane podstawowe o budynku
          </h2>

          {open === "basic" && (
            <div>
              <label style={labelStyle}>Powierzchnia użytkowa (m²)</label>
              <input className="form-input" type="number" name="powierzchnia"
                value={form.powierzchnia} onChange={handleInputChange(setForm)} />

              <label style={labelStyle}>Kubatura (m³)</label>
              <input className="form-input" type="number" name="kubatura"
                value={form.kubatura} onChange={handleInputChange(setForm)} />

              <label style={labelStyle}>Rok budowy</label>
              <input className="form-input" type="number" name="rokBudowy"
                value={form.rokBudowy} onChange={handleInputChange(setForm)} />

              <label style={labelStyle}>Modernizacje</label>
              <input className="form-input" type="text" name="modernizacje"
                value={form.modernizacje} onChange={handleInputChange(setForm)} />

              <label style={labelStyle}>Liczba kondygnacji</label>
              <input className="form-input" type="number" name="kondygnacje"
                value={form.kondygnacje} onChange={handleInputChange(setForm)} />

              <label style={labelStyle}>Wysokość pomieszczeń (m)</label>
              <input className="form-input" type="number" name="wysokosc"
                value={form.wysokosc} onChange={handleInputChange(setForm)} />

              <label style={labelStyle}>Funkcja budynku</label>
              <input className="form-input" type="text" name="funkcja"
                value={form.funkcja} onChange={handleInputChange(setForm)} />
            </div>
          )}
        </div>

        {/* 2 — Konstrukcja */}
        <div style={sectionStyle}>
          <h2
            onClick={() => toggle("construction")}
            style={{ cursor: "pointer", marginBottom: "10px" }}
          >
            2. Konstrukcja budynku
          </h2>

          {open === "construction" && (
            <div>
              <label style={labelStyle}>Ściany (opis)</label>
              <input className="form-input" name="sciany"
                value={form.sciany} onChange={handleInputChange(setForm)} />

              <label style={labelStyle}>Ściany — U (W/m²K)</label>
              <input className="form-input" name="scianyU"
                value={form.scianyU} onChange={handleInputChange(setForm)} />

              <label style={labelStyle}>Dach / strop</label>
              <input className="form-input" name="dach"
                value={form.dach} onChange={handleInputChange(setForm)} />

              <label style={labelStyle}>Dach — U</label>
              <input className="form-input" name="dachU"
                value={form.dachU} onChange={handleInputChange(setForm)} />

              <label style={labelStyle}>Podłoga</label>
              <input className="form-input" name="podloga"
                value={form.podloga} onChange={handleInputChange(setForm)} />

              <label style={labelStyle}>Okna — typ szyb</label>
              <input className="form-input" name="oknaTyp"
                value={form.oknaTyp} onChange={handleInputChange(setForm)} />

              <label style={labelStyle}>Okna — U</label>
              <input className="form-input" name="oknaU"
                value={form.oknaU} onChange={handleInputChange(setForm)} />

              <label style={labelStyle}>Okna — g (przepuszczalność)</label>
              <input className="form-input" name="oknaG"
                value={form.oknaG} onChange={handleInputChange(setForm)} />

              <label style={labelStyle}>Powierzchnia okien (m²)</label>
              <input className="form-input" name="oknaPow"
                value={form.oknaPow} onChange={handleInputChange(setForm)} />

              <label style={labelStyle}>Mostki cieplne</label>
              <input className="form-input" name="mostki"
                value={form.mostki} onChange={handleInputChange(setForm)} />
            </div>
          )}
        </div>

        {/* 3 — Instalacje */}
        <div style={sectionStyle}>
          <h2 onClick={() => toggle("systems")} style={{ cursor: "pointer" }}>
            3. Instalacje grzewcze i wentylacja
          </h2>

          {open === "systems" && (
            <div>
              <label style={labelStyle}>Rodzaj ogrzewania</label>
              <input className="form-input" name="ogrzewanie"
                value={form.ogrzewanie} onChange={handleInputChange(setForm)} />

              <label style={labelStyle}>Sprawność ogrzewania (%)</label>
              <input className="form-input" name="sprawnoscOgrz"
                value={form.sprawnoscOgrz} onChange={handleInputChange(setForm)} />

              <label style={labelStyle}>Moc nominalna (kW)</label>
              <input className="form-input" name="mocOgrz"
                value={form.mocOgrz} onChange={handleInputChange(setForm)} />

              <label style={labelStyle}>Ciepła woda użytkowa</label>
              <input className="form-input" name="cwu"
                value={form.cwu} onChange={handleInputChange(setForm)} />

              <label style={labelStyle}>Wentylacja</label>
              <input className="form-input" name="wentylacja"
                value={form.wentylacja} onChange={handleInputChange(setForm)} />

              <label style={labelStyle}>Rekuperacja — sprawność (%)</label>
              <input className="form-input" name="rekuperacjaSprawnosc"
                value={form.rekuperacjaSprawnosc} onChange={handleInputChange(setForm)} />

              <label style={labelStyle}>Przepływ powietrza (m³/h)</label>
              <input className="form-input" name="przeplywPowietrza"
                value={form.przeplywPowietrza} onChange={handleInputChange(setForm)} />

              <label style={labelStyle}>Klimatyzacja</label>
              <input className="form-input" name="klimatyzacja"
                value={form.klimatyzacja} onChange={handleInputChange(setForm)} />

              <label style={labelStyle}>Sterowanie instalacjami</label>
              <input className="form-input" name="sterowanie"
                value={form.sterowanie} onChange={handleInputChange(setForm)} />
            </div>
          )}
        </div>

        {/* 4 — Warunki użytkowania */}
        <div style={sectionStyle}>
          <h2 onClick={() => toggle("usage")} style={{ cursor: "pointer" }}>
            4. Warunki użytkowania
          </h2>

          {open === "usage" && (
            <div>
              <label style={labelStyle}>Liczba osób</label>
              <input className="form-input" name="osoby"
                value={form.osoby} onChange={handleInputChange(setForm)} />

              <label style={labelStyle}>Tryb użytkowania</label>
              <input className="form-input" name="tryb"
                value={form.tryb} onChange={handleInputChange(setForm)} />

              <label style={labelStyle}>Temperatura dzienna (°C)</label>
              <input className="form-input" name="tempDzien"
                value={form.tempDzien} onChange={handleInputChange(setForm)} />

              <label style={labelStyle}>Temperatura nocna (°C)</label>
              <input className="form-input" name="tempNoc"
                value={form.tempNoc} onChange={handleInputChange(setForm)} />

              <label style={labelStyle}>Preferencje cieplne</label>
              <input className="form-input" name="preferencje"
                value={form.preferencje} onChange={handleInputChange(setForm)} />

              <label style={labelStyle}>Zużycie energii elektrycznej</label>
              <input className="form-input" name="energiaElektryczna"
                value={form.energiaElektryczna} onChange={handleInputChange(setForm)} />
            </div>
          )}
        </div>

        {/* 5 — Klimat */}
        <div style={sectionStyle}>
          <h2 onClick={() => toggle("climate")} style={{ cursor: "pointer" }}>
            5. Warunki klimatyczne i lokalizacja
          </h2>

          {open === "climate" && (
            <div>
              <label style={labelStyle}>Lokalizacja</label>
              <input className="form-input" name="lokalizacja"
                value={form.lokalizacja} onChange={handleInputChange(setForm)} />

              <label style={labelStyle}>Strefa klimatyczna</label>
              <input className="form-input" name="strefaKlimatyczna"
                value={form.strefaKlimatyczna} onChange={handleInputChange(setForm)} />

              <label style={labelStyle}>Temperatura zewnętrzna (°C)</label>
              <input className="form-input" name="tempZew"
                value={form.tempZew} onChange={handleInputChange(setForm)} />

              <label style={labelStyle}>Nasłonecznienie</label>
              <input className="form-input" name="naslonecznienie"
                value={form.naslonecznienie} onChange={handleInputChange(setForm)} />

              <label style={labelStyle}>Wilgotność (%)</label>
              <input className="form-input" name="wilgotnosc"
                value={form.wilgotnosc} onChange={handleInputChange(setForm)} />

              <label style={labelStyle}>Dane meteorologiczne</label>
              <input className="form-input" name="meteo"
                value={form.meteo} onChange={handleInputChange(setForm)} />
            </div>
          )}
        </div>

        {/* BUTTONS */}
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: "35px" }}>
          <button onClick={() => navigate("/mode-selection")} className="back-button">
            ⬅ Powrót
          </button>

          <button
            style={{
              padding: "12px 32px",
              borderRadius: "14px",
              background: "black",
              color: "white",
              border: "none",
              fontSize: "16px",
              cursor: "pointer",
            }}
          >
            Oblicz
          </button>
        </div>
      </div>
    </div>
  );
}
