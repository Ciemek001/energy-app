import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Box, Card, CardContent, Typography, TextField, Button, Stack, Select, MenuItem, InputLabel,
  FormControl, Fade, Grid, Divider, Tooltip, IconButton, FormControlLabel, Checkbox, Collapse,
  Dialog, DialogTitle, DialogContent, DialogActions, Chip, List, ListItem, ListItemText, ListItemIcon,
  Paper, CircularProgress, Alert
} from "@mui/material";
import CalculateIcon from "@mui/icons-material/Calculate";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import InfoIcon from "@mui/icons-material/Info";
import SolarPowerIcon from '@mui/icons-material/SolarPower';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningIcon from '@mui/icons-material/Warning';
import SaveIcon from '@mui/icons-material/Save';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import { API_URL } from "../config"; 
import { generateEnergyReport } from "../utils/pdfGenerator";
import { 
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, 
    PieChart, Pie, Cell 
} from 'recharts';

interface Recommendation {
    title: string;
    description: string;
    type: string;
    priority: "high" | "medium" | "low";
}

interface ChartDetails {
    heat_transmission: number;
    heat_ventilation: number;
    hot_water: number;
}

interface CalculationResult {
    EU: number;
    EK: number;
    EP: number;
    raw_EU: number;
    raw_EK: number;
    raw_EP: number;
    details: ChartDetails;
    recommendations: Recommendation[];
}

const SimpleCalculator: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

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

  // --- STANY DO ZAPISU / EDYCJI ---
  const [saveMode, setSaveMode] = useState(false);
  const [buildingName, setBuildingName] = useState("");
  const [saveLoading, setSaveLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  
  const [editingId, setEditingId] = useState<number | null>(null);

  useEffect(() => {
    if (location.state && location.state.buildingData) {
        const b = location.state.buildingData;
        const details = b.saved_data;
        
        console.log("Tryb edycji dla:", b.name);
        setEditingId(b.id);
        setBuildingName(b.name);
        setSaveMode(true); 

        setArea(b.floor_area);
        setYear(b.construction_year);
        setClimateZone(b.city || "I"); 

        if (details) {
            setFloors(details.floors || 1);
            setInhabitants(details.inhabitants || 1);

            if (details.standards) {
                setWallStandard(details.standards.wall);
                setRoofStandard(details.standards.roof);
                setWindowStandard(details.standards.window);
                setFloorStandard(details.standards.floor);
            }

            if (details.systems) {
                setHeatingSource(details.systems.heatingPrimary || details.systems.heating); 
                setHotWaterSource(details.systems.hotWater);
                setVentilation(details.systems.ventilation);
                setHasPV(details.systems.pv);
                setHasSolarCollectors(details.systems.solar);
                
                if (details.systems.heatingSecondary) {
                    setHasSecondaryHeating(true);
                    setSecondaryHeatingSource(details.systems.heatingSecondary);
                }
            }
        }
    }
  }, [location]);

  const handleCalculate = async () => {
    if (!area || !year || !floors || !inhabitants) {
        alert("Wypełnij wszystkie pola liczbowe.");
        return;
    }
    setLoading(true);
    if (!editingId) setSaveMode(false); 
    setSaveSuccess(false);

    const payload = {
        area: Number(area),
        year: Number(year),
        floors: Number(floors),
        inhabitants: Number(inhabitants),
        climateZone,
        standards: { wall: wallStandard, roof: roofStandard, window: windowStandard, floor: floorStandard },
        systems: { 
            heatingPrimary: heatingSource, 
            heatingSecondary: hasSecondaryHeating ? secondaryHeatingSource : null,
            hotWater: hotWaterSource, 
            ventilation,
            pv: hasPV, solar: hasSolarCollectors
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
            alert("Błąd obliczeń");
        }
    } catch (error) {
        console.error(error);
        alert("Błąd sieci");
    } finally {
        setLoading(false);
    }
  };

  const handleSaveBuilding = async () => {
      if (!buildingName) {
          alert("Podaj nazwę budynku!");
          return;
      }
      
      const token = localStorage.getItem("token");
      if (!token) {
          alert("Musisz być zalogowany, aby zapisać budynek.");
          return; 
      }

      setSaveLoading(true);
      
      const savePayload = {
          name: buildingName,
          area: Number(area),
          year: Number(year),
          climate_zone: climateZone,
          details: { 
              floors: Number(floors),
              inhabitants: Number(inhabitants),
              standards: { wall: wallStandard, roof: roofStandard, window: windowStandard, floor: floorStandard },
              systems: { 
                  heatingPrimary: heatingSource, 
                  heatingSecondary: hasSecondaryHeating ? secondaryHeatingSource : null,
                  hotWater: hotWaterSource, 
                  ventilation, 
                  pv: hasPV, 
                  solar: hasSolarCollectors 
              }
          },
          eu_result: result?.EU,
          ep_result: result?.EP
      };

      try {
          const url = editingId 
            ? `${API_URL}/buildings/${editingId}` 
            : `${API_URL}/buildings/`;
            
          const method = editingId ? "PUT" : "POST";

          const response = await fetch(url, {
              method: method,
              headers: { 
                  "Content-Type": "application/json",
                  "Authorization": `Bearer ${token}` 
              },
              body: JSON.stringify(savePayload)
          });

          if (response.ok) {
              setSaveSuccess(true);
              setSaveMode(false);
              
              if (editingId) {
                  alert("Zaktualizowano dane budynku!");
                  navigate("/profile"); 
              }
          } else {
              alert("Błąd zapisu danych");
          }
      } catch (err) {
          console.error(err);
          alert("Błąd połączenia");
      } finally {
          setSaveLoading(false);
      }
  };

  const handleDownloadPDF = () => {
    if (!result) return;
    
    const inputData = {
        name: buildingName || "Budynek bez nazwy",
        area, year, floors, inhabitants, climateZone,
        standards: { wall: wallStandard, roof: roofStandard, window: windowStandard, floor: floorStandard },
        systems: { heatingPrimary: heatingSource, ventilation: ventilation, pv: hasPV }
    };

    generateEnergyReport(inputData, result);
  };

  const getEpColor = (ep: number) => {
      if (ep <= 70) return "#4caf50"; 
      if (ep <= 150) return "#ff9800"; 
      return "#f44336";
  };

  const barData = result ? [
      { name: 'Twój Dom', EP: result.EP },
      { name: 'Norma WT2021', EP: 70 },
  ] : [];

  const pieData = result && result.details ? [
      { name: 'Przenikanie', value: result.details.heat_transmission },
      { name: 'Wentylacja', value: result.details.heat_ventilation },
      { name: 'CWU', value: result.details.hot_water },
  ] : [];

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28'];

  return (
    <Box sx={{ minHeight: "100vh", display: "flex", justifyContent: "center", alignItems: "flex-start", background: "linear-gradient(135deg, #e8f7ff 0%, #f0fff4 100%)", p: 4 }}>
      <Fade in timeout={700}>
        <Card sx={{ width: "100%", maxWidth: 900, borderRadius: 3, p: 2 }} elevation={8}>
          <CardContent>
            
             <Stack direction="row" alignItems="center" spacing={2} mb={4}>
                <IconButton onClick={() => navigate("/mode-selection")}>
                    <ArrowBackIcon />
                </IconButton>
                <Box>
                    <Typography variant="h4" fontWeight="bold" color="#0277bd">
                        {editingId ? "Edycja Budynku" : "Kalkulator Uproszczony"}
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
                            <TextField label="Kondygnacje" type="number" fullWidth value={floors} onChange={(e) => setFloors(Number(e.target.value))} />
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
                            {loading ? "Obliczanie..." : editingId ? "Zaktualizuj i Przelicz" : "Wykonaj obliczenia"}
                        </Button>
                    </Box>
                </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Fade>

      {/* --- MODAL Z WYNIKAMI I WYKRESAMI --- */}
      {/* ZMIANA: maxWidth="md" zamiast "lg" - zwężenie okna */}
      <Dialog open={openResult} onClose={() => setOpenResult(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ textAlign: "center", fontWeight: "bold", bgcolor: "#f5f5f5" }}>
            Wyniki Analizy Energetycznej
        </DialogTitle>
        <DialogContent dividers>
            {result && (
                <Grid container spacing={4}>
                    
                    {/* LEWA KOLUMNA: LICZBY + WYKRESY (md=6 czyli 50%) */}
                    <Grid item xs={12} md={6}>
                        {/* KAFELKI Z WYNIKAMI */}
                        <Stack direction="row" spacing={1} justifyContent="space-between" mb={4}>
                            {[
                                { label: "Energia Użytkowa (EU)", val: result.EU, desc: "Zapotrzebowanie" },
                                { label: "Energia Końcowa (EK)", val: result.EK, desc: "Rachunki" },
                                { label: "Energia Pierwotna (EP)", val: result.EP, desc: "Ekologia" }
                            ].map((item, idx) => (
                                <Paper key={idx} elevation={3} sx={{ p: 1, textAlign: "center", flex: 1, borderTop: `4px solid ${item.label.includes("EP") ? getEpColor(item.val) : "#1976d2"}` }}>
                                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>{item.label}</Typography>
                                    <Typography variant="h6" fontWeight="bold" my={1} color={item.label.includes("EP") ? getEpColor(item.val) : "inherit"}>
                                        {item.val}
                                    </Typography>
                                </Paper>
                            ))}
                        </Stack>

                        {/* WYKRES 1: SŁUPKOWY EP */}
                        <Typography variant="subtitle2" gutterBottom align="center">Twoje EP vs Norma WT2021</Typography>
                        <Box sx={{ height: 200, width: "100%", mb: 2 }}>
                             <ResponsiveContainer>
                                <BarChart data={barData} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis type="number" />
                                    <YAxis dataKey="name" type="category" width={80} style={{ fontSize: '0.8rem' }} />
                                    <RechartsTooltip />
                                    <Bar dataKey="EP" fill="#8884d8" name="Wskaźnik EP [kWh/m²rok]" barSize={20}>
                                        {barData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={index === 0 ? getEpColor(entry.EP) : '#82ca9d'} />
                                        ))}
                                    </Bar>
                                </BarChart>
                             </ResponsiveContainer>
                        </Box>

                        {/* WYKRES 2: KOŁOWY STRATY */}
                        <Typography variant="subtitle2" gutterBottom align="center">Struktura Strat Energii</Typography>
                        <Box sx={{ height: 220, width: "100%" }}>
                            <ResponsiveContainer>
                                <PieChart>
                                    <Pie 
                                        data={pieData} 
                                        cx="50%" 
                                        cy="50%" 
                                        outerRadius={70} // Zmniejszony wykres
                                        fill="#8884d8" 
                                        dataKey="value" 
                                        label={({percent}) => `${(percent * 100).toFixed(0)}%`}
                                    >
                                        {pieData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <RechartsTooltip />
                                    <Legend verticalAlign="bottom" height={36} />
                                </PieChart>
                            </ResponsiveContainer>
                        </Box>
                    </Grid>

                    {/* PRAWA KOLUMNA: REKOMENDACJE, ZAPIS, PDF (md=6 czyli 50%) */}
                    <Grid item xs={12} md={6} sx={{ borderLeft: { md: "1px solid #ddd" }, pl: { md: 2 } }}>
                        
                        <Typography variant="h6" gutterBottom color="primary">Rekomendacje Eksperta</Typography>
                        <List dense>
                            {result.recommendations.map((rec, index) => (
                                <Paper key={index} variant="outlined" sx={{ mb: 1, borderLeft: rec.priority === 'high' ? "4px solid #d32f2f" : "4px solid #ff9800" }}>
                                    <ListItem>
                                        <ListItemText 
                                            primary={<Typography variant="subtitle2" fontWeight="bold">{rec.title}</Typography>} 
                                            secondary={rec.description} 
                                        />
                                        <Chip label={rec.priority === 'high' ? "Wysoki" : "Średni"} size="small" color={rec.priority === 'high' ? "error" : "warning"} />
                                    </ListItem>
                                </Paper>
                            ))}
                        </List>

                        <Divider sx={{ my: 2 }} />

                        {/* SEKJA ZAPISU */}
                        <Box textAlign="center" sx={{ p: 2, bgcolor: "#e3f2fd", borderRadius: 2 }}>
                            {saveSuccess ? (
                                <Alert severity="success">
                                    {editingId ? "Dane budynku zostały zaktualizowane!" : "Budynek został pomyślnie zapisany w Twoim profilu!"}
                                </Alert>
                            ) : (
                                !saveMode ? (
                                    <Button 
                                        variant="contained" 
                                        color="secondary" 
                                        startIcon={<SaveIcon />}
                                        onClick={() => setSaveMode(true)}
                                        fullWidth
                                    >
                                        {editingId ? "Zapisz zmiany w tym budynku" : "Zapisz ten budynek w profilu"}
                                    </Button>
                                ) : (
                                    <Stack spacing={2}>
                                        <TextField 
                                            label="Nazwij swój budynek" 
                                            size="small"
                                            value={buildingName}
                                            onChange={(e) => setBuildingName(e.target.value)}
                                            sx={{ bgcolor: "white" }}
                                        />
                                        <Stack direction="row" spacing={1}>
                                            <Button 
                                                variant="contained" 
                                                color="success"
                                                onClick={handleSaveBuilding}
                                                disabled={saveLoading}
                                                fullWidth
                                            >
                                                Zatwierdź
                                            </Button>
                                            <Button onClick={() => setSaveMode(false)} fullWidth>Anuluj</Button>
                                        </Stack>
                                    </Stack>
                                )
                            )}
                        </Box>

                        {/* SEKCJA PDF */}
                        <Box textAlign="center" mt={2}>
                            <Button 
                                variant="outlined" 
                                color="primary" 
                                startIcon={<PictureAsPdfIcon />}
                                onClick={handleDownloadPDF}
                                fullWidth
                            >
                                Pobierz oficjalny raport PDF
                            </Button>
                        </Box>

                    </Grid>
                </Grid>
            )}
        </DialogContent>
        <DialogActions>
            <Button onClick={() => setOpenResult(false)} variant="outlined">Zamknij</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SimpleCalculator;