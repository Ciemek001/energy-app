import React from "react";
import { 
  Box, 
  Typography, 
  Button, 
  Stack, 
  Container, 
  Grid, 
  Paper, 
  useTheme, 
  useMediaQuery 
} from "@mui/material";
import { useNavigate } from "react-router-dom";

// Ikony
import CalculateIcon from "@mui/icons-material/Calculate";
import BarChartIcon from "@mui/icons-material/BarChart";
import AutoFixHighIcon from "@mui/icons-material/AutoFixHigh";
import BoltIcon from '@mui/icons-material/Bolt';
import SecurityIcon from '@mui/icons-material/Security';
import SavingsIcon from '@mui/icons-material/Savings';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

const MainPage: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  return (
    <Box sx={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      
      {/* --- 1. NAVBAR --- */}
      <Box 
        sx={{ 
          py: 2, 
          px: 4, 
          display: "flex", 
          justifyContent: "space-between", 
          alignItems: "center",
          bgcolor: "white",
          boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
          position: "sticky",
          top: 0,
          zIndex: 100
        }}
      >
        <Stack direction="row" alignItems="center" spacing={1}>
          <BoltIcon sx={{ color: "#0277bd", fontSize: 30 }} />
          <Typography variant="h5" fontWeight="bold" color="#0277bd" sx={{ letterSpacing: 1 }}>
            EnergyApp
          </Typography>
        </Stack>
        
        <Stack direction="row" spacing={2}>
          <Button variant="text" color="primary" onClick={() => navigate("/login")}>
            Zaloguj
          </Button>
          <Button 
            variant="contained" 
            color="primary" 
            onClick={() => navigate("/register")}
            sx={{ borderRadius: 5, px: 3 }}
          >
            Rejestracja
          </Button>
        </Stack>
      </Box>

      {/* --- 2. HERO SECTION --- */}
      <Box 
        sx={{ 
          background: "linear-gradient(135deg, #e3f2fd 0%, #ffffff 100%)", 
          py: 10,
          px: 2,
          textAlign: "center"
        }}
      >
        <Container maxWidth="md">
            <FadeIn>
                <Typography variant="h2" component="h1" fontWeight="800" gutterBottom sx={{ color: "#1a237e", fontSize: { xs: "2.5rem", md: "3.5rem" } }}>
                    Zadbaj o efektywność <br />
                    <span style={{ color: "#0277bd" }}>energetyczną swojego domu</span>
                </Typography>
                
                <Typography variant="h6" color="text.secondary" paragraph sx={{ mb: 4, lineHeight: 1.6 }}>
                    Profesjonalne narzędzie dla inżynierów i właścicieli domów. 
                    Oblicz zapotrzebowanie na energię (EU, EK, EP), wygeneruj raport PDF 
                    i sprawdź, jak obniżyć rachunki dzięki termomodernizacji.
                </Typography>

                <Stack 
                    direction={{ xs: "column", sm: "row" }} 
                    spacing={3} 
                    justifyContent="center"
                    alignItems="center"
                >
                    <Button 
                        variant="contained" 
                        size="large" 
                        endIcon={<ArrowForwardIcon />}
                        onClick={() => navigate("/register")}
                        sx={{ 
                            px: 5, py: 1.5, fontSize: "1.1rem", borderRadius: 3,
                            background: "linear-gradient(45deg, #0288d1 30%, #03a9f4 90%)",
                            boxShadow: "0 3px 5px 2px rgba(33, 203, 243, .3)"
                        }}
                    >
                        Rozpocznij za darmo
                    </Button>
                    <Button 
                        variant="outlined" 
                        size="large" 
                        onClick={() => navigate("/login")}
                        sx={{ px: 5, py: 1.5, borderRadius: 3, fontSize: "1.1rem" }}
                    >
                        Mam już konto
                    </Button>
                </Stack>
            </FadeIn>
        </Container>
      </Box>

      {/* --- 3. DLACZEGO WARTO? (Poprawione teksty i wyrównanie) --- */}
      <Box sx={{ bgcolor: "white", py: 8 }}>
          <Container>
            <Typography variant="h4" fontWeight="bold" textAlign="center" mb={6} color="text.primary">
                Dlaczego EnergyApp?
            </Typography>
            
            <Grid container spacing={4} alignItems="stretch">
                <ValueCard 
                    icon={<CalculateIcon fontSize="large" color="primary" />}
                    title="Błyskawiczne Obliczenia"
                    desc="Zapomnij o skomplikowanych arkuszach kalkulacyjnych. Nasz algorytm w kilka sekund przetwarza dane budynku, wyliczając kluczowe wskaźniki (EP, EK, EU) zgodnie z aktualnymi normami i fizyką budowli."
                />
                <ValueCard 
                    icon={<SavingsIcon fontSize="large" color="success" />}
                    title="Realna Oszczędność"
                    desc="Zidentyfikuj najsłabsze punkty swojego domu. Dowiedz się, czy bardziej opłaca się ocieplić ściany, wymienić okna czy zainwestować w pompę ciepła, aby maksymalnie obniżyć rachunki za ogrzewanie."
                />
                <ValueCard 
                    icon={<SecurityIcon fontSize="large" color="secondary" />}
                    title="Profesjonalne Dane"
                    desc="Korzystamy z wiarygodnych baz danych klimatycznych i materiałowych. Otrzymasz nie tylko 'suche liczby', ale także gotowy do druku raport PDF z rekomendacjami modernizacyjnymi."
                />
            </Grid>
          </Container>
      </Box>

      {/* --- 4. CO ZNAJDZIESZ W ŚRODKU (Poprawiony hover i odstępy) --- */}
      <Box sx={{ bgcolor: "#f5f9ff", py: 8 }}>
        <Container>
            <Typography variant="h4" fontWeight="bold" textAlign="center" mb={2}>
                Narzędzia dostępne po zalogowaniu
            </Typography>
            <Typography textAlign="center" color="text.secondary" mb={8}>
                Dołącz do platformy, aby uzyskać pełny dostęp do funkcjonalności.
            </Typography>

            {/* Zwiększony spacing={6} aby kafelki miały więcej luzu */}
            <Grid container spacing={6} justifyContent="center">
                <FeaturePreview 
                    title="Kalkulator Uproszczony"
                    desc="Idealny na start. Odpowiedz na kilka prostych pytań o standard budynku i otrzymaj wstępną analizę energetyczną wraz z wykresem."
                    icon={<CalculateIcon sx={{ fontSize: 40, color: "#0277bd" }} />}
                    action={() => navigate("/register")}
                />
                <FeaturePreview 
                    title="Baza Materiałów (Wkrótce)"
                    desc="Twórz własne przegrody warstwa po warstwie. Korzystaj z rozbudowanej bazy cegieł, styropianów i tynków, aby precyzyjnie obliczyć współczynnik U."
                    icon={<AutoFixHighIcon sx={{ fontSize: 40, color: "#9c27b0" }} />}
                    action={() => navigate("/register")}
                />
                <FeaturePreview 
                    title="Historia i Statystyki"
                    desc="Zapisuj wszystkie swoje projekty w bezpiecznej chmurze. Wracaj do nich w dowolnym momencie, edytuj parametry i porównuj wyniki."
                    icon={<BarChartIcon sx={{ fontSize: 40, color: "#2e7d32" }} />}
                    action={() => navigate("/register")}
                />
            </Grid>
        </Container>
      </Box>

      {/* --- 5. STOPKA --- */}
      <Box sx={{ bgcolor: "#1a237e", color: "white", py: 4, mt: "auto", textAlign: "center" }}>
        <Typography variant="body2" sx={{ opacity: 0.8 }}>
            © 2024 EnergyApp. Praca Inżynierska. Wszelkie prawa zastrzeżone.
        </Typography>
      </Box>

    </Box>
  );
};

// --- POMOCNICZE KOMPONENTY ---

// Poprawiony ValueCard (Wyrównana wysokość)
const ValueCard: React.FC<{ icon: React.ReactNode, title: string, desc: string }> = ({ icon, title, desc }) => (
    <Grid item xs={12} md={4} sx={{ display: 'flex' }}>
        <Paper 
            elevation={0} 
            sx={{ 
                p: 3, 
                textAlign: "center", 
                height: "100%", // Rozciąga się do wysokości rodzica (Grid item)
                bgcolor: "transparent",
                display: "flex",
                flexDirection: "column",
                alignItems: "center"
            }}
        >
            <Box sx={{ mb: 2, display: "inline-flex", p: 2, borderRadius: "50%", bgcolor: "#e3f2fd" }}>
                {icon}
            </Box>
            <Typography variant="h6" fontWeight="bold" gutterBottom>{title}</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                {desc}
            </Typography>
        </Paper>
    </Grid>
);

// Poprawiony FeaturePreview (Naprawiony Z-Index przy hover)
const FeaturePreview: React.FC<{ title: string, desc: string, icon: React.ReactNode, action: () => void }> = ({ title, desc, icon, action }) => (
    <Grid item xs={12} md={4}>
        <Paper 
            elevation={3} 
            sx={{ 
                p: 3, 
                borderRadius: 4, 
                height: "100%", 
                maxWidth: 340, 
                mx: "auto", 
                display: "flex", 
                flexDirection: "column", 
                alignItems: "center", 
                textAlign: "center",
                position: "relative",
                transition: "all 0.3s ease-in-out",
                // Kluczowe poprawki hovera:
                "&:hover": { 
                    transform: "translateY(-10px)", 
                    boxShadow: 12,
                    zIndex: 10, // Wysoki indeks, żeby na pewno był na wierzchu
                    position: "relative" // Wymagane, aby zIndex zadziałał
                }
            }}
        >
            <Box sx={{ mb: 2 }}>{icon}</Box>
            <Typography variant="h6" fontWeight="bold" gutterBottom>{title}</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3, flex: 1, lineHeight: 1.5 }}>{desc}</Typography>
            <Button variant="outlined" size="small" fullWidth onClick={action}>Zaloguj, aby użyć</Button>
        </Paper>
    </Grid>
);

const FadeIn: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <Box sx={{ animation: "fadeIn 1s ease-in-out" }}>
        <style>
            {`@keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }`}
        </style>
        {children}
    </Box>
);

export default MainPage;