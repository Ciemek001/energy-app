// frontend/src/views/Register.tsx
import React, { useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Stack,
  Fade,
  Alert,
  Divider,
  IconButton,
} from "@mui/material";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useNavigate } from "react-router-dom";
import { API_URL } from "../config";

const Register: React.FC = () => {
  const navigate = useNavigate();

  // Stany formularza
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  // Stany obsługi błędów
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Prosty Regex do walidacji emaila (musi mieć znaki, małpę, znaki, kropkę, znaki)
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const handleRegister = async () => {
    setError("");
    
    // 1. Walidacja pustych pól
    if (!email || !password) {
      setError("Wypełnij wszystkie wymagane pola.");
      return;
    }

    // 2. NOWA WALIDACJA: Sprawdzenie formatu email
    if (!emailRegex.test(email)) {
        setError("Podaj poprawny adres email (np. jan@example.com).");
        return;
    }

    // 3. Walidacja haseł
    if (password !== confirmPassword) {
      setError("Hasła nie są identyczne.");
      return;
    }
    if (password.length < 5) {
      setError("Hasło musi mieć co najmniej 5 znaków.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/users/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email,
          password: password,
        }),
      });

      // Zabezpieczenie przed błędem parsowania (gdyby serwer rzucił 500 HTML zamiast JSON)
      let data;
      try {
          data = await response.json();
      } catch (parseError) {
          throw new Error("Błąd serwera (niepoprawna odpowiedź). Spróbuj ponownie później.");
      }

      if (response.ok) {
        // Sukces
        navigate("/login");
      } else {
        // Obsługa błędów z API (np. email zajęty lub format niepoprawny wg backendu)
        // Pydantic zwraca błędy walidacji w polu 'detail'
        if (typeof data.detail === 'string') {
            setError(data.detail);
        } else if (Array.isArray(data.detail)) {
            // Czasami Pydantic zwraca tablicę błędów
            setError(data.detail[0]?.msg || "Błąd walidacji danych.");
        } else {
            setError("Wystąpił błąd podczas rejestracji.");
        }
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Nie udało się połączyć z serwerem.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
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
            maxWidth: 450,
            borderRadius: 3,
            overflow: "visible",
            position: "relative"
          }}
        >
            {/* PRZYCISK POWROTU */}
            <Box sx={{ position: "absolute", top: 16, left: 16 }}>
                <IconButton onClick={() => navigate("/")} aria-label="wróć">
                    <ArrowBackIcon />
                </IconButton>
            </Box>

          <CardContent sx={{ p: { xs: 3, sm: 4 }, pt: { xs: 6, sm: 6 } }}>
            <Stack spacing={2} alignItems="center">
              <PersonAddIcon sx={{ fontSize: 56, color: "#0277bd" }} />
              
              <Typography variant="h5" component="h1" gutterBottom>
                Utwórz konto
              </Typography>

              {error && (
                <Alert severity="error" sx={{ width: "100%" }}>
                  {error}
                </Alert>
              )}

              <TextField
                label="Email"
                type="email"
                variant="outlined"
                fullWidth
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                error={!!error && error.includes("email")} // Podświetla na czerwono jeśli błąd dotyczy maila
              />
              <TextField
                label="Hasło"
                type="password"
                variant="outlined"
                fullWidth
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <TextField
                label="Powtórz hasło"
                type="password"
                variant="outlined"
                fullWidth
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                error={password !== confirmPassword && confirmPassword !== ""}
                helperText={
                  password !== confirmPassword && confirmPassword !== ""
                    ? "Hasła muszą być takie same"
                    : ""
                }
              />

              <Button
                variant="contained"
                color="primary"
                fullWidth
                size="large"
                onClick={handleRegister}
                disabled={loading}
                sx={{ mt: 1 }}
              >
                {loading ? "Rejestracja..." : "Zarejestruj się"}
              </Button>

              <Divider sx={{ width: "80%", my: 1 }} />

              <Stack direction="row" spacing={1} alignItems="center">
                <Typography variant="body2" color="text.secondary">
                  Masz już konto?
                </Typography>
                <Button 
                  color="secondary" 
                  onClick={() => navigate("/login")}
                  sx={{ textTransform: "none", fontWeight: "bold" }}
                >
                  Zaloguj się
                </Button>
              </Stack>

            </Stack>
          </CardContent>
        </Card>
      </Fade>
    </Box>
  );
};

export default Register;