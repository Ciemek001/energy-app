// frontend/src/views/Login.tsx
import { API_URL } from "../config";
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
  Alert,
  IconButton // <--- Import IconButton
} from "@mui/material";
import LockIcon from "@mui/icons-material/Lock";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

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
      const response = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("token", data.access_token);
        navigate("/mode-selection");
      } else {
        if (response.status === 422) {
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
        <Card 
            elevation={8} 
            sx={{ 
                width: "100%", 
                maxWidth: 400, 
                borderRadius: 3,
                overflow: "visible",
                position: "relative" // Konieczne do pozycjonowania strzałki
            }}
        >
            {/* --- PRZYCISK POWROTU (Nowy) --- */}
            <Box sx={{ position: "absolute", top: 16, left: 16 }}>
                <IconButton onClick={() => navigate("/")} aria-label="wróć">
                    <ArrowBackIcon />
                </IconButton>
            </Box>

          <CardContent sx={{ p: { xs: 3, sm: 4 }, pt: { xs: 6, sm: 6 } }}> {/* Zwiększony padding góra */}
            <Stack spacing={3} alignItems="center">
              <LockIcon sx={{ fontSize: 56, color: "#0277bd" }} />
              
              <Box textAlign="center">
                <Typography variant="h5" component="h1" fontWeight="bold">
                  Logowanie
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Wprowadź swoje dane, aby zarządzać budynkami.
                </Typography>
              </Box>

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
                size="large"
              >
                {loading ? "Logowanie..." : "Zaloguj się"}
              </Button>

              <Divider sx={{ width: "80%" }} />

              <Stack spacing={1} width="100%">
                <Button
                    variant="outlined"
                    color="secondary"
                    fullWidth
                    onClick={() => navigate("/register")}
                >
                    Załóż konto
                </Button>
                
                {/* Usunięto stary przycisk "Wróć do strony głównej" */}
              </Stack>

            </Stack>
          </CardContent>
        </Card>
      </Fade>
    </Box>
  );
};

export default LoginPage;