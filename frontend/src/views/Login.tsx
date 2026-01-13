// frontend/src/Login.tsx
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
  Divider,
} from "@mui/material";
import LockIcon from "@mui/icons-material/Lock";
import { useNavigate } from "react-router-dom";

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = () => {
    // Tutaj w przyszłości podłącz fetch/axios do backendu
    // Tymczasowo przekierowanie do ModeSelection
    navigate("/mode-selection");
  };

  const handleRegister = () => {
    alert("Przejście do rejestracji (do zaimplementowania)");
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
          }}
        >
          <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
            <Stack spacing={3} alignItems="center">
              <LockIcon sx={{ fontSize: 56, color: "#0277bd" }} />
              <Typography variant="h5" component="h1">
                Logowanie
              </Typography>
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
              />

              <Button
                variant="contained"
                color="primary"
                fullWidth
                onClick={handleLogin}
              >
                Zaloguj się
              </Button>

              <Divider sx={{ width: "80%" }} />

              <Button
                variant="outlined"
                color="secondary"
                fullWidth
                onClick={handleRegister}
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
