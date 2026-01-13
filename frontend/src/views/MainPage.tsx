// frontend/src/views/MainPage.tsx
import React from "react";
import { Box, Typography, Button, Stack, Card, CardContent, CardActions, Divider } from "@mui/material";
import CalculateIcon from "@mui/icons-material/Calculate";
import BarChartIcon from "@mui/icons-material/BarChart";
import AutoFixHighIcon from "@mui/icons-material/AutoFixHigh";
import { useNavigate } from "react-router-dom";

const FeatureCard: React.FC<{ title: string; description: string; icon: React.ReactNode; onClick?: () => void }> = ({
  title,
  description,
  icon,
  onClick,
}) => (
  <Card
    elevation={6}
    sx={{
      minWidth: 250,
      flex: 1,
      borderRadius: 3,
      transition: "transform 0.2s, box-shadow 0.2s",
      "&:hover": { transform: "translateY(-5px)", boxShadow: 12 },
    }}
  >
    <CardContent sx={{ textAlign: "center" }}>
      <Box sx={{ fontSize: 48, mb: 2 }}>{icon}</Box>
      <Typography variant="h6" gutterBottom>
        {title}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        {description}
      </Typography>
    </CardContent>
    {onClick && (
      <CardActions sx={{ justifyContent: "center" }}>
        
      </CardActions>
    )}
  </Card>
);

const MainPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        minHeight: "100vh",
        p: 3,
        background: "linear-gradient(135deg, #f0f9ff 0%, #e6f7ff 100%)",
      }}
    >
      {/* Nagłówek */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 6,
        }}
      >
        <Typography variant="h4" sx={{ fontWeight: "bold", color: "#0277bd" }}>
          ThermoCheck
        </Typography>
        <Button variant="contained" onClick={() => navigate("/login")}>
          Zaloguj się
        </Button>
      </Box>

      {/* Opis */}
      <Box sx={{ textAlign: "center", mb: 6, maxWidth: 700, mx: "auto" }}>
        <Typography variant="h5" gutterBottom color="black">
          Twój inteligentny system analizy efektywności energetycznej budynków
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Szybkie obliczenia, szczegółowa analiza i wizualizacja danych. Wybierz odpowiedni kalkulator lub przejrzyj
          statystyki budynków.
        </Typography>
      </Box>

      {/* Karty funkcji */}
      <Stack
        direction={{ xs: "column", md: "row" }}
        spacing={4}
        justifyContent="center"
        alignItems="stretch"
      >
        <FeatureCard
          title="Kalkulator Uproszczony"
          description="Szybkie obliczenia efektywności energetycznej budynku w kilku krokach."
          icon={<CalculateIcon color="primary" />}
          onClick={() => alert("Przejście do kalkulatora uproszczonego")}
        />
        <FeatureCard
          title="Kalkulator Zaawansowany"
          description="Szczegółowa analiza zużycia energii i materiałów budowlanych."
          icon={<AutoFixHighIcon color="secondary" />}
          onClick={() => alert("Przejście do kalkulatora zaawansowanego")}
        />
        <FeatureCard
          title="Wykresy i statystyki"
          description="Wizualizacja danych zebranych z budynków w postaci wykresów i tabel."
          icon={<BarChartIcon color="success" />}
          onClick={() => alert("Przejście do wykresów i statystyk")}
        />
      </Stack>
    </Box>
  );
};

export default MainPage;
