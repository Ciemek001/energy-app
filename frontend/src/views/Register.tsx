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
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  
  const [confirmPassword, setConfirmPassword] = useState("");
  
  // Stany obsługi błędów
  const [error, setError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Prosty Regex do walidacji emaila
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  // Funkcja walidująca hasło
  const validatePassword = (pass: string) => {
    if (pass.length < 8) {
        return "Hasło musi mieć min. 8 znaków.";
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(pass)) {
        return "Hasło musi zawierać znak specjalny.";
    }
    return "";
  };

  const handleRegister = async () => {
    setError("");
    setPasswordError("");
    
    // 1. Walidacja pustych pól
    if (!formData.email || !formData.password) {
      setError("Wypełnij wszystkie pola.");
      return;
    }

    // 2. Walidacja formatu email
    if (!emailRegex.test(formData.email)) {
        setError("Wprowadź poprawny adres email.");
        return;
    }

    // 3. Walidacja zgodności haseł
    if (formData.password !== confirmPassword) {
        setError("Hasła nie są identyczne.");
        return;
    }

    // 4. Walidacja siły hasła
    const passMsg = validatePassword(formData.password);
    if (passMsg) {
        setPasswordError(passMsg);
        return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/users/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        if (data.detail && Array.isArray(data.detail)) {
             const msg = data.detail.map((e: any) => e.msg).join(", ");
             throw new Error(msg);
        }
        throw new Error(data.detail || "Błąd rejestracji");
      }

      setSuccess(true); 

    } catch (err: any) {
      setError(err.message);
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
        // ZMIANA: Tło zgodne z Login.tsx (jasny gradient)
        background: "linear-gradient(135deg, #e8f7ff 0%, #f0fff4 100%)",
        p: 2,
      }}
    >
      <Fade in={true} timeout={800}>
        <Card 
            elevation={8} // ZMIANA: Zwiększony cień jak w Login
            sx={{ 
                width: "100%", 
                maxWidth: 400, // ZMIANA: Szerokość jak w Login
                borderRadius: 3, 
                overflow: "visible",
                position: "relative",
                p: 0 // Padding przeniesiony do CardContent
            }}
        >
            {/* Przycisk powrotu w lewym górnym rogu (jak w Login) */}
            <Box sx={{ position: "absolute", top: 16, left: 16 }}>
                <IconButton onClick={() => navigate("/")} aria-label="wróć">
                    <ArrowBackIcon />
                </IconButton>
            </Box>

          <CardContent sx={{ p: { xs: 3, sm: 4 }, pt: { xs: 6, sm: 6 } }}>
            <Stack spacing={3} alignItems="center">
              
              <PersonAddIcon sx={{ fontSize: 56, color: "#0277bd" }} /> {/* Kolor dopasowany do kłódki z Login */}

              <Box textAlign="center">
                  <Typography variant="h5" fontWeight="bold">
                    Utwórz konto
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                     Dołącz do systemu audytu energetycznego.
                  </Typography>
              </Box>

              {error && <Alert severity="error" sx={{ width: "100%" }}>{error}</Alert>}

              {success ? (
                  <Alert severity="success" sx={{ width: "100%", mt: 2 }}>
                      <Typography fontWeight="bold">Rejestracja udana!</Typography>
                      Aktywuj swoje konto klikając w link wysłany na twoją skrzynkę email.
                      <Button color="inherit" size="small" onClick={() => navigate("/login")} sx={{ mt: 1, display: 'block' }}>
                          Wróć do logowania
                      </Button>
                  </Alert>
              ) : (
                <>
                  <TextField
                    label="Email"
                    variant="outlined"
                    fullWidth
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />

                  <TextField
                    label="Hasło"
                    type="password"
                    variant="outlined"
                    fullWidth
                    value={formData.password}
                    onChange={(e) => {
                        setFormData({ ...formData, password: e.target.value });
                        if (passwordError) setPasswordError(""); 
                    }}
                    error={!!passwordError}
                    helperText={passwordError}
                  />

                  <TextField
                    label="Potwierdź hasło"
                    type="password"
                    variant="outlined"
                    fullWidth
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    error={formData.password !== confirmPassword && confirmPassword !== ""}
                    helperText={
                      formData.password !== confirmPassword && confirmPassword !== ""
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
                  >
                    {loading ? "Rejestracja..." : "Zarejestruj się"}
                  </Button>
                </>
              )}

              <Divider sx={{ width: "80%" }} />

              <Stack width="100%" spacing={1}>
                <Button 
                  variant="outlined"
                  color="secondary" 
                  fullWidth
                  onClick={() => navigate("/login")}
                >
                  Mam już konto (Zaloguj się)
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