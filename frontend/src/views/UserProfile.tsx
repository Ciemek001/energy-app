import React from "react";
import { useNavigate } from "react-router-dom";
import { Button, Box } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SettingsIcon from "@mui/icons-material/Settings";

export default function UserProfile() {
  const navigate = useNavigate();

  // Przykładowe dane użytkownika
  const user = {
    imie: "Jan",
    nazwisko: "Kowalski",
    email: "jan.kowalski@example.com",
    adres: "ul. Słoneczna 12, 00-123 Warszawa",
    budynki: [
      { id: 1, nazwa: "Dom jednorodzinny – Warszawa" },
      { id: 2, nazwa: "Budynek biurowy – Poznań" },
    ],
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, rgba(0, 90, 170, 0.3), rgba(0, 120, 200, 0.4))",
        padding: "40px",
        display: "flex",
        justifyContent: "center",
      }}
    >
      <div style={{ width: "100%", maxWidth: "800px" }}>
        <h1
          style={{
            textAlign: "center",
            color: "black",
            marginBottom: "30px",
            fontSize: "32px",
            fontWeight: 700,
          }}
        >
          Profil użytkownika
        </h1>

        {/* Sekcja danych */}
        <div
          style={{
            background: "white",
            borderRadius: "12px",
            padding: "25px 30px",
            boxShadow: "0 4px 14px rgba(0,0,0,0.12)",
            marginBottom: "25px",
          }}
        >
          <h2 style={{ marginBottom: "20px", color: "black" }}>Dane osobowe</h2>
          <div style={{ marginBottom: "10px" }}><strong>Imię:</strong> {user.imie}</div>
          <div style={{ marginBottom: "10px" }}><strong>Nazwisko:</strong> {user.nazwisko}</div>
          <div style={{ marginBottom: "10px" }}><strong>Email:</strong> {user.email}</div>
          <div style={{ marginBottom: "10px" }}><strong>Adres zamieszkania:</strong> {user.adres}</div>
        </div>

        {/* Sekcja budynków */}
        <div
          style={{
            background: "white",
            borderRadius: "12px",
            padding: "25px 30px",
            boxShadow: "0 4px 14px rgba(0,0,0,0.12)",
            marginBottom: "25px",
          }}
        >
          <h2 style={{ marginBottom: "20px", color: "black" }}>Twoje budynki</h2>
          {user.budynki.length > 0 ? (
            user.budynki.map((b) => (
              <div
                key={b.id}
                style={{
                  padding: "12px 15px",
                  borderRadius: "8px",
                  background: "#f5f8ff",
                  marginBottom: "10px",
                  border: "1px solid #dde6ff",
                }}
              >
                {b.nazwa}
              </div>
            ))
          ) : (
            <p style={{ color: "gray" }}>Brak przypisanych budynków</p>
          )}
        </div>

        {/* Przyciski Powrót i Ustawienia */}
        <Box sx={{ display: "flex", gap: 2, marginTop: 2 }}>
          <Button
            variant="outlined"
            color="primary"
            startIcon={<ArrowBackIcon />}
            fullWidth
            onClick={() => navigate("/mode-selection")}
          >
            Powrót do strony głównej
          </Button>

          <Button
            variant="outlined"
            color="primary"
            startIcon={<SettingsIcon />}
            fullWidth
            onClick={() => navigate("/settings")}
          >
            Ustawienia
          </Button>
        </Box>
      </div>
    </div>
  );
}
