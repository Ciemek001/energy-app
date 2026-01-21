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
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Fade,
  Grid,
  Divider,
  Tooltip,
  IconButton,
  FormControlLabel,
  Checkbox,
  Collapse,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Paper,
  CircularProgress
} from "@mui/material";
import CalculateIcon from "@mui/icons-material/Calculate";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import InfoIcon from "@mui/icons-material/Info";
import SolarPowerIcon from '@mui/icons-material/SolarPower';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningIcon from '@mui/icons-material/Warning';
import ErrorIcon from '@mui/icons-material/Error';
import { API_URL } from "../config"; // Upewnij się, że masz ten plik!

// Typy odpowiedzi z backendu
interface Recommendation {
    title: string;
    description: string;
    type: string;
    priority: "high" | "medium" | "low";
}

interface CalculationResult {
    EU: number;
    EK: number;
    EP: number;
    raw_EU: number;
    raw_EK: number;
    raw_EP: number;
    recommendations: Recommendation[];
}

const SimpleCalculator: React.FC = () => {
  const navigate = useNavigate();

  // --- STANY DANYCH ---
  const [area, setArea] = useState<number | "">("");
  const [year, setYear] = useState<number | "">("");
  const [floors, setFloors] = useState<number | "">("");
  const [inhabitants, setInhabitants] = useState<number | "">("");
  const [climateZone, setClimateZone] = useState("I"); 

  const [wallStandard, setWallStandard] = useState("brak");
  const [roofStandard, setRoofStandard] = useState("brak");
  const [windowStandard, setWindowStandard] = useState("stare");
  const [floorStandard, setFloorStandard] = useState("nieocieplona");

  const [heatingSource, setHeatingSource] = useState("wegiel");
  const [hotWaterSource, setHotWaterSource] = useState("to_samo");
  const [ventilation, setVentilation] = useState("grawitacyjna");
  
  const [hasSecondaryHeating, setHasSecondaryHeating] = useState(false);
  const [secondaryHeatingSource, setSecondaryHeatingSource] = useState("kominek"); 
  
  const [hasPV, setHasPV] = useState(false);
  const [hasSolarCollectors, setHasSolarCollectors] = useState(false);

  // --- STANY UI ---
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CalculationResult | null>(null);
  const [openResult, setOpenResult] = useState(false);

  const handleCalculate = async () => {
    if (!area || !year || !floors || !inhabitants) {
        alert("Wypełnij wszystkie pola liczbowe (Powierzchnia, Rok, Mieszkańcy, Piętra).");
        return;
    }

    setLoading(true);

    const payload = {
        area: Number(area),
        year: Number(year),
        floors: Number(floors),
        inhabitants: Number(inhabitants),
        climateZone,
        standards: { 
            wall: wallStandard, 
            roof: roofStandard, 
            window: windowStandard, 
            floor: floorStandard 
        },
        systems: { 
            heatingPrimary: heatingSource, 
            heatingSecondary: hasSecondaryHeating ? secondaryHeatingSource : null,
            hotWater: hotWaterSource, 
            ventilation,
            pv: hasPV,
            solar: hasSolarCollectors
        }
    };

    try {
        const response = await fetch(`${API_URL}/calculations/simple`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        if (response.ok) {
            const data = await response.json();
            setResult(data);
            setOpenResult(true);
        } else {
            const err = await response.json();
            alert("Błąd obliczeń: " + (err.detail || "Nieznany błąd"));
        }
    } catch (error) {
        console.error(error);
        alert("Nie udało się połączyć z serwerem.");
    } finally {
        setLoading(false);
    }
  };

  // Helper do kolorów wyników
  const getEpColor = (ep: number) => {
      if (ep <= 70) return "#4caf50"; // Zielony (WT2021)
      if (ep <= 150) return "#ff9800"; // Pomarańczowy
      return "#f44336"; // Czerwony
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-start",
        background: "linear-gradient(135deg, #e8f7ff 0%, #f0fff4 100%)",
        p: 4,
      }}
    >
      <Fade in timeout={700}>
        <Card sx={{ width: "100%", maxWidth: 900, borderRadius: 3, p: 2 }} elevation={8}>
          <CardContent>
            
            <Stack direction="row" alignItems="center" spacing={2} mb={4}>
                <IconButton onClick={() => navigate("/mode-selection")}>
                    <ArrowBackIcon />
                </IconButton>
                <Box>
                    <Typography variant="h4" fontWeight="bold" color="#0277bd">
                        Kalkulator Uproszczony
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Metoda wskaźnikowa – szacunek na podstawie standardu budynku.
                    </Typography>
                </Box>
            </Stack>

            <Grid container spacing={4}>
                {/* 1. GEOMETRIA */}
                <Grid item xs={12}>
                    <Typography variant="h6" gutterBottom sx={{ color: "#1a237e", fontWeight: 600 }}>1. Geometria i Lokalizacja</Typography>
                    <Divider sx={{ mb: 2 }} />
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={6} md={3}>
                            <TextField label="Pow. ogrzewana (m²)" type="number" fullWidth value={area} onChange={(e) => setArea(Number(e.target.value))} />
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <TextField label="Rok budowy" type="number" fullWidth value={year} onChange={(e) => setYear(Number(e.target.value))} />
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                             <TextField label="Liczba mieszkańców" type="number" fullWidth value={inhabitants} onChange={(e) => setInhabitants(Number(e.target.value))} />
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <TextField label="Liczba kondygnacji" type="number" fullWidth value={floors} onChange={(e) => setFloors(Number(e.target.value))} />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <FormControl fullWidth>
                                <InputLabel id="zone-label">Strefa Klimatyczna</InputLabel>
                                <Select labelId="zone-label" value={climateZone} label="Strefa Klimatyczna" onChange={(e) => setClimateZone(e.target.value)}>
                                    <MenuItem value="I">I - Zachód (Szczecin, Wrocław)</MenuItem>
                                    <MenuItem value="II">II - Centrum (Poznań, Łódź)</MenuItem>
                                    <MenuItem value="III">III - Wschód (Warszawa, Kielce)</MenuItem>
                                    <MenuItem value="IV">IV - Północ (Białystok, Olsztyn)</MenuItem>
                                    <MenuItem value="V">V - Góry (Zakopane)</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                    </Grid>
                </Grid>

                {/* 2. IZOLACJA */}
                <Grid item xs={12}>
                    <Typography variant="h6" sx={{ color: "#1a237e", fontWeight: 600 }}>2. Standard Izolacji</Typography>
                    <Divider sx={{ mb: 2, mt: 1 }} />
                    <Grid container spacing={2}>
                        <Grid item xs={12} md={6}>
                            <FormControl fullWidth>
                                <InputLabel id="wall-label">Ściany Zewnętrzne</InputLabel>
                                <Select labelId="wall-label" value={wallStandard} label="Ściany Zewnętrzne" onChange={(e) => setWallStandard(e.target.value)}>
                                    <MenuItem value="brak">Brak izolacji (tylko mur)</MenuItem>
                                    <MenuItem value="slaba">Słaba izolacja (5-8 cm)</MenuItem>
                                    <MenuItem value="srednia">Średnia izolacja (10-15 cm)</MenuItem>
                                    <MenuItem value="dobra">Dobra izolacja (&gt; 15 cm)</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <FormControl fullWidth>
                                <InputLabel id="roof-label">Dach / Poddasze</InputLabel>
                                <Select labelId="roof-label" value={roofStandard} label="Dach / Poddasze" onChange={(e) => setRoofStandard(e.target.value)}>
                                    <MenuItem value="brak">Brak ocieplenia</MenuItem>
                                    <MenuItem value="srednia">Średnie ocieplenie (wełna 10-15cm)</MenuItem>
                                    <MenuItem value="dobra">Dobre ocieplenie (wełna &gt; 20cm)</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <FormControl fullWidth>
                                <InputLabel id="win-label">Stolarka Okienna</InputLabel>
                                <Select labelId="win-label" value={windowStandard} label="Stolarka Okienna" onChange={(e) => setWindowStandard(e.target.value)}>
                                    <MenuItem value="stare">Stare (nieszczelne)</MenuItem>
                                    <MenuItem value="standard">Standardowe (2-szybowe)</MenuItem>
                                    <MenuItem value="energo">Energooszczędne (3-szybowe)</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <FormControl fullWidth>
                                <InputLabel id="floor-label">Podłoga na gruncie</InputLabel>
                                <Select labelId="floor-label" value={floorStandard} label="Podłoga na gruncie" onChange={(e) => setFloorStandard(e.target.value)}>
                                    <MenuItem value="nieocieplona">Nieocieplona</MenuItem>
                                    <MenuItem value="ocieplona">Ocieplona</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                    </Grid>
                </Grid>

                {/* 3. INSTALACJE */}
                <Grid item xs={12}>
                    <Typography variant="h6" gutterBottom sx={{ color: "#1a237e", fontWeight: 600 }}>3. Instalacje i Źródła Ciepła</Typography>
                    <Divider sx={{ mb: 2 }} />
                    <Grid container spacing={3}>
                        <Grid item xs={12} md={6}>
                            <FormControl fullWidth>
                                <InputLabel id="heat-label">Główne źródło ciepła</InputLabel>
                                <Select labelId="heat-label" value={heatingSource} label="Główne źródło ciepła" onChange={(e) => setHeatingSource(e.target.value)}>
                                    <MenuItem value="wegiel">Kocioł węglowy / Ekogroszek</MenuItem>
                                    <MenuItem value="biomasa">Kocioł na drewno / Pellet</MenuItem>
                                    <MenuItem value="gaz_stary">Kocioł gazowy (tradycyjny)</MenuItem>
                                    <MenuItem value="gaz_kond">Kocioł gazowy (kondensacyjny)</MenuItem>
                                    <MenuItem value="prad">Ogrzewanie elektryczne</MenuItem>
                                    <MenuItem value="pompa_powietrze">Pompa ciepła (Powietrzna)</MenuItem>
                                    <MenuItem value="pompa_grunt">Pompa ciepła (Gruntowa)</MenuItem>
                                </Select>
                            </FormControl>
                            <FormControlLabel
                                control={<Checkbox checked={hasSecondaryHeating} onChange={(e) => setHasSecondaryHeating(e.target.checked)} />}
                                label="Posiadam drugie źródło (np. Hybryda, Kominek)"
                                sx={{ mt: 1 }}
                            />
                            <Collapse in={hasSecondaryHeating}>
                                <FormControl fullWidth sx={{ mt: 2 }}>
                                    <InputLabel id="sec-heat-label">Drugie źródło ciepła</InputLabel>
                                    <Select labelId="sec-heat-label" value={secondaryHeatingSource} label="Drugie źródło ciepła" onChange={(e) => setSecondaryHeatingSource(e.target.value)}>
                                        <MenuItem value="kominek">Kominek (drewno)</MenuItem>
                                        <MenuItem value="gaz_kond">Kocioł gazowy (kondensacyjny)</MenuItem>
                                        <MenuItem value="gaz_stary">Kocioł gazowy (tradycyjny)</MenuItem>
                                        <MenuItem value="prad">Grzałka elektryczna</MenuItem>
                                        <MenuItem value="pompa_powietrze">Pompa ciepła (Powietrzna)</MenuItem>
                                        <MenuItem value="biomasa">Kocioł na drewno / Pellet</MenuItem>
                                        <MenuItem value="wegiel">Kocioł węglowy</MenuItem>
                                    </Select>
                                </FormControl>
                            </Collapse>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <Stack spacing={3}>
                                <FormControl fullWidth>
                                    <InputLabel id="cwu-label">Ciepła Woda (CWU)</InputLabel>
                                    <Select labelId="cwu-label" value={hotWaterSource} label="Ciepła Woda (CWU)" onChange={(e) => setHotWaterSource(e.target.value)}>
                                        <MenuItem value="to_samo">Tak jak główne ogrzewanie</MenuItem>
                                        <MenuItem value="bojler">Bojler elektryczny</MenuItem>
                                        <MenuItem value="gazowy">Piecyk gazowy (Junkers)</MenuItem>
                                        <MenuItem value="pompa_cwu">Pompa ciepła do CWU</MenuItem>
                                    </Select>
                                </FormControl>
                                <FormControl fullWidth>
                                    <InputLabel id="vent-label">Wentylacja</InputLabel>
                                    <Select labelId="vent-label" value={ventilation} label="Wentylacja" onChange={(e) => setVentilation(e.target.value)}>
                                        <MenuItem value="grawitacyjna">Grawitacyjna (Naturalna)</MenuItem>
                                        <MenuItem value="mechaniczna">Rekuperacja (Odzysk ciepła)</MenuItem>
                                    </Select>
                                </FormControl>
                            </Stack>
                        </Grid>
                        <Grid item xs={12}>
                            <Box sx={{ bgcolor: "#f1f8e9", p: 2, borderRadius: 2, border: "1px solid #c5e1a5" }}>
                                <Stack direction="row" alignItems="center" spacing={1} mb={1}>
                                    <SolarPowerIcon color="success" />
                                    <Typography variant="subtitle1" fontWeight="bold">Odnawialne Źródła Energii (OZE)</Typography>
                                </Stack>
                                <Stack direction={{ xs: "column", sm: "row" }} spacing={4}>
                                    <FormControlLabel control={<Checkbox checked={hasPV} onChange={(e) => setHasPV(e.target.checked)} color="success" />} label="Instalacja Fotowoltaiczna (PV)" />
                                    <FormControlLabel control={<Checkbox checked={hasSolarCollectors} onChange={(e) => setHasSolarCollectors(e.target.checked)} color="success" />} label="Kolektory Słoneczne (do wody)" />
                                </Stack>
                            </Box>
                        </Grid>
                    </Grid>
                </Grid>

                {/* PRZYCISK */}
                <Grid item xs={12}>
                    <Box mt={2} display="flex" justifyContent="center">
                        <Button
                            variant="contained"
                            size="large"
                            startIcon={loading ? <CircularProgress size={24} color="inherit"/> : <CalculateIcon />}
                            onClick={handleCalculate}
                            disabled={loading}
                            sx={{ 
                                px: 5, py: 1.5, fontSize: "1.1rem", borderRadius: 3,
                                background: "linear-gradient(45deg, #0288d1 30%, #03a9f4 90%)",
                                boxShadow: "0 3px 5px 2px rgba(33, 203, 243, .3)"
                            }}
                        >
                            {loading ? "Obliczanie..." : "Wykonaj obliczenia"}
                        </Button>
                    </Box>
                </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Fade>

      {/* --- MODAL Z WYNIKAMI --- */}
      <Dialog open={openResult} onClose={() => setOpenResult(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ textAlign: "center", fontWeight: "bold", bgcolor: "#f5f5f5" }}>
            Wyniki Analizy Energetycznej
        </DialogTitle>
        <DialogContent dividers>
            {result && (
                <Stack spacing={4} sx={{ mt: 2 }}>
                    
                    {/* WSKAŹNIKI */}
                    <Grid container spacing={2} justifyContent="center">
                        {[
                            { label: "Energia Użytkowa (EU)", val: result.EU, unit: "kWh/m²rok", desc: "Zapotrzebowanie budynku (Izolacja)" },
                            { label: "Energia Końcowa (EK)", val: result.EK, unit: "kWh/m²rok", desc: "To co na rachunku (Systemy)" },
                            { label: "Energia Pierwotna (EP)", val: result.EP, unit: "kWh/m²rok", desc: "Wpływ na środowisko (Ekologia)" }
                        ].map((item, idx) => (
                            <Grid item xs={12} md={4} key={idx}>
                                <Paper elevation={3} sx={{ p: 2, textAlign: "center", borderRadius: 3, borderTop: `4px solid ${idx===2 ? getEpColor(item.val) : "#1976d2"}` }}>
                                    <Typography variant="caption" color="text.secondary">{item.label}</Typography>
                                    <Typography variant="h4" fontWeight="bold" my={1} color={idx===2 ? getEpColor(item.val) : "inherit"}>
                                        {item.val}
                                    </Typography>
                                    <Typography variant="caption">{item.unit}</Typography>
                                </Paper>
                            </Grid>
                        ))}
                    </Grid>

                    <Divider>
                        <Chip label="REKOMENDACJE" color="primary" variant="outlined" />
                    </Divider>

                    {/* LISTA REKOMENDACJI */}
                    <List>
                        {result.recommendations.length > 0 ? (
                            result.recommendations.map((rec, index) => (
                                <Paper key={index} elevation={1} sx={{ mb: 2, borderLeft: rec.priority === 'high' ? "6px solid #d32f2f" : "6px solid #ff9800" }}>
                                    <ListItem>
                                        <ListItemIcon>
                                            {rec.priority === 'high' ? <WarningIcon color="error" /> : <CheckCircleIcon color="warning" />}
                                        </ListItemIcon>
                                        <ListItemText 
                                            primary={<Typography variant="h6">{rec.title}</Typography>}
                                            secondary={rec.description}
                                        />
                                        <Chip 
                                            label={rec.priority === 'high' ? "PRIORYTET" : "ZALECANE"} 
                                            color={rec.priority === 'high' ? "error" : "warning"} 
                                            size="small" 
                                        />
                                    </ListItem>
                                </Paper>
                            ))
                        ) : (
                            <Box textAlign="center" p={2}>
                                <CheckCircleIcon color="success" sx={{ fontSize: 50 }} />
                                <Typography>Gratulacje! Twój budynek spełnia wysokie standardy.</Typography>
                            </Box>
                        )}
                    </List>

                </Stack>
            )}
        </DialogContent>
        <DialogActions>
            <Button onClick={() => setOpenResult(false)} variant="contained">Zamknij</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SimpleCalculator;