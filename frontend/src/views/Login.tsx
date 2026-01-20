// frontend/src/views/Login.tsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Stack,
  Fade,
  Divider,
  Alert
} from "@mui/material";
import LockIcon from "@mui/icons-material/Lock";

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async () => {
    setError("");
    setLoading(true);

    try {
      console.log("Wysyłanie danych:", { email, password }); // Logowanie wysyłanych danych

      const response = await fetch("http://localhost:8000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      console.log("Odpowiedź serwera:", data); // Logowanie odpowiedzi

      if (response.ok) {
        // Sukces
        localStorage.setItem("token", data.access_token);
        navigate("/mode-selection");
      } else {
        // Obsługa błędów
        if (response.status === 422) {
            // Specjalna obsługa błędu walidacji (422)
            // Backend zwraca tablicę błędów w 'detail'
            if (Array.isArray(data.detail)) {
                 const msgs = data.detail.map((err: any) => err.msg).join(", ");
                 setError("Błąd danych: " + msgs);
            } else {
                 setError(data.detail || "Nieprawidłowe dane (format)");
            }
        } else {
            setError(data.detail || "Błąd logowania");
        }
      }
    } catch (err) {
      console.error(err);
      setError("Brak połączenia z serwerem");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        height: "100vh",
        width: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #e8f7ff 0%, #f0fff4 100%)",
        p: 2,
      }}
    >
      <Fade in timeout={700}>
        <Card elevation={8} sx={{ width: "100%", maxWidth: 400, borderRadius: 3 }}>
          <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
            <Stack spacing={3} alignItems="center">
              <LockIcon sx={{ fontSize: 56, color: "#0277bd" }} />
              <Typography variant="h5" component="h1">
                Logowanie
              </Typography>

              {error && (
                <Alert severity="error" sx={{ width: "100%" }}>
                  {error}
                </Alert>
              )}

              <TextField
                label="Email"
                variant="outlined"
                fullWidth
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <TextField
                label="Hasło"
                type="password"
                variant="outlined"
                fullWidth
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
              />

              <Button
                variant="contained"
                color="primary"
                fullWidth
                onClick={handleLogin}
                disabled={loading}
              >
                {loading ? "Logowanie..." : "Zaloguj się"}
              </Button>

              <Divider sx={{ width: "80%" }} />

              <Button
                variant="outlined"
                color="secondary"
                fullWidth
                onClick={() => navigate("/register")}
              >
                Załóż konto
              </Button>
            </Stack>
          </CardContent>
        </Card>
      </Fade>
    </Box>
  );
};

export default LoginPage;