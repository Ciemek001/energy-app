// frontend/src/ModeSelection.tsx
import React from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Stack,
  Fade,
} from "@mui/material";
import CalculateIcon from "@mui/icons-material/Calculate";
import FunctionsIcon from "@mui/icons-material/Functions";
import PersonIcon from "@mui/icons-material/Person";
import { useNavigate } from "react-router-dom";

const ModeSelection: React.FC = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    navigate("/main");
  };

  const handleProfile = () => {
    navigate("/profile");
  };

  const handleSimpleCalculator = () => {
    navigate("/calculator-simple");
  };

  const handleAdvancedCalculator = () => {
    navigate("/calculator-advanced");
  };

  return (
    <Box
      sx={{
        height: "100vh",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #e8f7ff 0%, #f0fff4 100%)",
        p: 2,
        position: "relative",
      }}
    >
      {/* Przycisk PROFIL użytkownika */}
      <Button
        variant="contained"
        color="primary"
        startIcon={<PersonIcon />}
        sx={{
          position: "absolute",
          top: 16,
          right: 150,     // <<< PRZESUNIĘCIE W LEWO OD WYLOGUJ
        }}
        onClick={handleProfile}
      >
        Profil
      </Button>

      {/* Przycisk WYLOGUJ */}
      <Button
        variant="outlined"
        color="secondary"
        sx={{ position: "absolute", top: 16, right: 16 }}
        onClick={handleLogout}
      >
        Wyloguj się
      </Button>

      <Fade in timeout={700}>
        <Card elevation={8} sx={{ width: "100%", maxWidth: 800, borderRadius: 3 }}>
          <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
            <Stack spacing={4} alignItems="center" textAlign="center">
              <Typography variant="h4" component="h1">
                Wybierz tryb kalkulatora
              </Typography>

              <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 600 }}>
                Wybierz, czy chcesz użyć uproszczonego kalkulatora do szybkich obliczeń,
                czy zaawansowanego kalkulatora do bardziej szczegółowej analizy.
              </Typography>

              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={3}
                sx={{ width: "100%", justifyContent: "center" }}
              >
                <Card
                  sx={{
                    flex: 1,
                    cursor: "pointer",
                    transition: "0.3s",
                    "&:hover": { transform: "scale(1.05)" },
                  }}
                  onClick={handleSimpleCalculator}
                >
                  <CardContent sx={{ textAlign: "center" }}>
                    <CalculateIcon sx={{ fontSize: 48, color: "#0277bd", mb: 1 }} />
                    <Typography variant="h6">Kalkulator Uproszczony</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Szybkie i uproszczone obliczenia efektywności energetycznej.
                    </Typography>
                  </CardContent>
                </Card>

                <Card
                  sx={{
                    flex: 1,
                    cursor: "pointer",
                    transition: "0.3s",
                    "&:hover": { transform: "scale(1.05)" },
                  }}
                  onClick={handleAdvancedCalculator}
                >
                  <CardContent sx={{ textAlign: "center" }}>
                    <FunctionsIcon sx={{ fontSize: 48, color: "#388e3c", mb: 1 }} />
                    <Typography variant="h6">Kalkulator Zaawansowany</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Szczegółowa analiza zużycia energii z dodatkowymi parametrami.
                    </Typography>
                  </CardContent>
                </Card>
              </Stack>
            </Stack>
            <Stack sx={{ width: "100%", justifyContent: "center", mt: 3 }}>
  <Button
    variant="contained"
    color="secondary"
    sx={{ padding: "12px 32px", fontSize: "16px", borderRadius: "12px" }}
    onClick={() => navigate("/statistics")}
  >
    Statystyki
  </Button>
</Stack>
          </CardContent>
        </Card>
      </Fade>
    </Box>
  );
};

export default ModeSelection;
