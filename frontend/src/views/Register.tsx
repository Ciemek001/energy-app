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
} from "@mui/material";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import { useNavigate } from "react-router-dom";

const Register: React.FC = () => {
  const navigate = useNavigate();

  // Stany formularza
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  // Stany obsługi błędów
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    setError("");
    
    // Prosta walidacja front-endowa
    if (!username || !email || !password) {
      setError("Wypełnij wszystkie wymagane pola.");
      return;
    }
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
      // Próba wysłania danych do backendu (FastAPI)
      const response = await fetch("http://localhost:8000/users/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: username,
          email: email,
          password: password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Sukces - przekierowanie do logowania
        // Można tu dodać np. toast/snackbar z informacją "Konto utworzone"
        navigate("/login");
      } else {
        // Błąd zwrócony przez API (np. email zajęty)
        setError(data.detail || "Wystąpił błąd podczas rejestracji.");
      }
    } catch (err) {
      setError("Nie udało się połączyć z serwerem.");
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
        // Ten sam gradient co w Login.tsx dla spójności
        background: "linear-gradient(135deg, #e8f7ff 0%, #f0fff4 100%)",
        p: 2,
      }}
    >
      <Fade in timeout={700}>
        <Card
          elevation={8}
          sx={{
            width: "100%",
            maxWidth: 450, // Nieco szersza karta niż logowanie, bo więcej pól
            borderRadius: 3,
            overflow: "visible",
          }}
        >
          <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
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
                label="Nazwa użytkownika"
                variant="outlined"
                fullWidth
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
              <TextField
                label="Email"
                type="email"
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