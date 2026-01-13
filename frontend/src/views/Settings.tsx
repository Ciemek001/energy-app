// frontend/src/Settings.tsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Card, CardContent, Typography, Button, FormControl, InputLabel, Select, MenuItem, TextField } from "@mui/material";

const Settings: React.FC = () => {
  const navigate = useNavigate();

  const [theme, setTheme] = useState("light");
  const [fontSize, setFontSize] = useState("medium");
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const handleSaveSettings = () => {
    if (!oldPassword || !newPassword) {
      alert("Podaj zarówno stare, jak i nowe hasło!");
      return;
    }
    // Tutaj w przyszłości walidacja starego hasła z backendem i zapis nowego
    alert("Hasło zmienione i ustawienia zapisane!");
    setOldPassword("");
    setNewPassword("");
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, rgba(0, 90, 170, 0.3), rgba(0, 120, 200, 0.4))",
        padding: 4,
        display: "flex",
        justifyContent: "center",
      }}
    >
      <Box sx={{ width: "100%", maxWidth: 800 }}>
        <Typography variant="h4" align="center" gutterBottom sx={{ color: "black", fontWeight: 700 }}>
          Ustawienia
        </Typography>

        {/* Sekcja Personalizacja */}
        <Card sx={{ mb: 4, borderRadius: 3, boxShadow: 3 }}>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2 }}>Personalizacja</Typography>

            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel>Motyw</InputLabel>
              <Select value={theme} label="Motyw" onChange={(e) => setTheme(e.target.value)}>
                <MenuItem value="light">Jasny</MenuItem>
                <MenuItem value="dark">Ciemny</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>Rozmiar czcionki</InputLabel>
              <Select value={fontSize} label="Rozmiar czcionki" onChange={(e) => setFontSize(e.target.value)}>
                <MenuItem value="small">Mała</MenuItem>
                <MenuItem value="medium">Średnia</MenuItem>
                <MenuItem value="large">Duża</MenuItem>
              </Select>
            </FormControl>
          </CardContent>
        </Card>

        {/* Sekcja Bezpieczeństwo */}
        <Card sx={{ mb: 4, borderRadius: 3, boxShadow: 3 }}>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2 }}>Bezpieczeństwo</Typography>
            
            <TextField
              fullWidth
              label="Stare hasło"
              type="password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Nowe hasło"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              sx={{ mb: 2 }}
            />
            <Button variant="contained" color="primary" onClick={handleSaveSettings} fullWidth>
              Zapisz zmiany
            </Button>
          </CardContent>
        </Card>

        {/* Powrót do strony głównej */}
        <Button
          variant="outlined"
          color="primary"
          fullWidth
          onClick={() => navigate("/mode-selection")}
        >
          ⬅ Powrót
        </Button>
      </Box>
    </Box>
  );
};

export default Settings;
