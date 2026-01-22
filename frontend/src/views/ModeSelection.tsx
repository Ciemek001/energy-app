import React from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Stack,
  Fade,
  Container,
  Grid,
  IconButton,
  Tooltip,
  Paper
} from "@mui/material";
// Ikony
import CalculateIcon from "@mui/icons-material/Calculate";
import ConstructionIcon from "@mui/icons-material/Construction"; // Dla zaawansowanego/materiałów
import InsightsIcon from "@mui/icons-material/Insights"; // Dla statystyk
import PersonIcon from "@mui/icons-material/Person";
import LogoutIcon from "@mui/icons-material/Logout";
import BoltIcon from '@mui/icons-material/Bolt';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

import { useNavigate } from "react-router-dom";

const ModeSelection: React.FC = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token"); // Ważne: czyścimy token
    navigate("/");
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        background: "linear-gradient(135deg, #e8f7ff 0%, #f0fff4 100%)",
      }}
    >
      {/* --- 1. GÓRNY PASEK (NAVBAR) --- */}
      <Box 
        sx={{ 
          py: 2, 
          px: 4, 
          display: "flex", 
          justifyContent: "space-between", 
          alignItems: "center",
          bgcolor: "white",
          boxShadow: "0 2px 10px rgba(0,0,0,0.05)"
        }}
      >
        <Stack direction="row" alignItems="center" spacing={1}>
          <BoltIcon sx={{ color: "#0277bd", fontSize: 28 }} />
          <Typography variant="h6" fontWeight="bold" color="#0277bd">
            EnergyApp
          </Typography>
        </Stack>

        <Stack direction="row" spacing={2}>
            <Button 
                startIcon={<PersonIcon />} 
                onClick={() => navigate("/profile")}
                sx={{ textTransform: "none", fontWeight: 600 }}
            >
                Mój Profil
            </Button>
            <Button 
                variant="outlined" 
                color="error" 
                startIcon={<LogoutIcon />} 
                onClick={handleLogout}
                size="small"
                sx={{ borderRadius: 2 }}
            >
                Wyloguj
            </Button>
        </Stack>
      </Box>

      {/* --- 2. ZAWARTOŚĆ GŁÓWNA --- */}
      <Container maxWidth="lg" sx={{ flex: 1, display: "flex", alignItems: "center", py: 8 }}>
        <Fade in timeout={800}>
          <Box width="100%">
            
            <Box textAlign="center" mb={6}>
                <Typography variant="h3" fontWeight="bold" color="#1a237e" gutterBottom>
                    Wybierz narzędzie
                </Typography>
                <Typography variant="h6" color="text.secondary">
                    Dostępne moduły obliczeniowe i analityczne
                </Typography>
            </Box>

            <Grid container spacing={4} justifyContent="center">
                
                {/* KARTA 1: KALKULATOR UPROSZCZONY */}
                <ToolCard 
                    title="Kalkulator Uproszczony"
                    desc="Szybka analiza metodą wskaźnikową. Idealna do wstępnego szacowania zapotrzebowania na energię."
                    icon={<CalculateIcon sx={{ fontSize: 60, color: "#0277bd" }} />}
                    onClick={() => navigate("/calculator-simple")}
                    delay={0}
                />

                {/* KARTA 2: KALKULATOR ZAAWANSOWANY */}
                <ToolCard 
                    title="Fizyka Budowli & Materiały"
                    desc="Szczegółowe obliczenia przegród (warstwa po warstwie). Baza materiałów i współczynniki U."
                    icon={<ConstructionIcon sx={{ fontSize: 60, color: "#9c27b0" }} />}
                    onClick={() => navigate("/calculator-advanced")}
                    delay={200}
                />

                {/* KARTA 3: STATYSTYKI */}
                <ToolCard 
                    title="Historia i Statystyki"
                    desc="Przeglądaj zapisane projekty, analizuj wykresy i śledź historię swoich obliczeń."
                    icon={<InsightsIcon sx={{ fontSize: 60, color: "#2e7d32" }} />}
                    onClick={() => navigate("/statistics")}
                    delay={400}
                />

            </Grid>
          </Box>
        </Fade>
      </Container>
    </Box>
  );
};

// --- KOMPONENT KARTY NARZĘDZIA ---
interface ToolCardProps {
    title: string;
    desc: string;
    icon: React.ReactNode;
    onClick: () => void;
    delay: number;
}

const ToolCard: React.FC<ToolCardProps> = ({ title, desc, icon, onClick, delay }) => (
    <Grid item xs={12} md={4}>
        <Fade in style={{ transitionDelay: `${delay}ms` }}>
            <Paper
                elevation={4}
                onClick={onClick}
                sx={{
                    p: 4,
                    height: "100%",
                    borderRadius: 4,
                    cursor: "pointer",
                    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    textAlign: "center",
                    position: "relative",
                    overflow: "hidden",
                    "&:hover": {
                        transform: "translateY(-8px)",
                        boxShadow: 12,
                        "& .icon-box": { transform: "scale(1.1) rotate(5deg)" },
                        "& .action-text": { color: "#0277bd" }
                    }
                }}
            >
                {/* Ikona z animacją tła */}
                <Box 
                    className="icon-box"
                    sx={{ 
                        mb: 3, 
                        p: 3, 
                        borderRadius: "50%", 
                        bgcolor: "#f5f9ff",
                        transition: "transform 0.3s"
                    }}
                >
                    {icon}
                </Box>

                <Typography variant="h6" fontWeight="bold" gutterBottom>
                    {title}
                </Typography>
                
                <Typography variant="body2" color="text.secondary" sx={{ mb: 4, flex: 1, lineHeight: 1.6 }}>
                    {desc}
                </Typography>

                <Stack direction="row" alignItems="center" spacing={1} className="action-text" sx={{ mt: "auto", fontWeight: 600, color: "text.primary", transition: "color 0.3s" }}>
                    <Typography variant="button">Otwórz</Typography>
                    <ArrowForwardIcon fontSize="small" />
                </Stack>
            </Paper>
        </Fade>
    </Grid>
);

export default ModeSelection;