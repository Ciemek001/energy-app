import React, { useState, useEffect } from "react";
import {
  Box, Container, Typography, Paper, Button, Stack, Stepper, Step, StepLabel,
  Grid, TextField, FormControl, InputLabel, Select, MenuItem, InputAdornment,
  Divider, CircularProgress, Alert, Dialog, DialogTitle, DialogContent,
  DialogActions, LinearProgress, Checkbox, FormControlLabel,
  Card, CardContent, Chip
} from "@mui/material";

// --- IKONY (BOGATY ZESTAW) ---
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import BoltIcon from "@mui/icons-material/Bolt";
import ThermostatIcon from "@mui/icons-material/Thermostat";
import WaterDropIcon from '@mui/icons-material/WaterDrop';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import PropaneTankIcon from '@mui/icons-material/PropaneTank';
import MapIcon from '@mui/icons-material/Map';
import WbSunnyIcon from '@mui/icons-material/WbSunny';
import SaveIcon from '@mui/icons-material/Save';
import HomeWorkIcon from '@mui/icons-material/HomeWork';
import WindowIcon from '@mui/icons-material/Window';

import { useNavigate, useLocation } from "react-router-dom";
import { API_URL } from "../config";
import LayerBuilder from "../components/LayerBuilder";
import type { Layer, Material } from "../components/LayerBuilder";
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import { generateAdvancedReport } from "../utils/advancedPdfGenerator";

const WINDOW_SIZES = { small: 1.44, medium: 2.25, large: 4.5 };

interface EPResult {
    id: number;
    EU: number; EK: number; EP: number;
    classification: string; passed_wt2021: boolean; details: string;
    peak_power_kw: number; estimated_cost_pln: number;
    heat_loss_walls: number; heat_loss_windows: number; heat_loss_ventilation: number;
}

const STEPS = ["Dane ogólne", "Przegrody", "Stolarka", "Instalacje", "Weryfikacja"];

const AdvancedCalculator: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation(); 
  
  const [activeStep, setActiveStep] = useState(0);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [calculating, setCalculating] = useState(false);
  const [result, setResult] = useState<EPResult | null>(null);
  const [openResultDialog, setOpenResultDialog] = useState(false);

  // ID audytu (edycja)
  const [editingAuditId, setEditingAuditId] = useState<number | null>(null);

  // Domyślne dane
  const defaultFormData = {
      area: 120, height: 2.7, floors: 1, inhabitants: 4, year: 2020, climateZone: "III",
      wallLayers: [] as Layer[], roofLayers: [] as Layer[], floorLayers: [] as Layer[],
      windowsSmall: 3, windowsMedium: 2, windowsLarge: 1, windowU: 1.0, 
      doorCount: 1, doorU: 1.3,
      heatingSource: "gas_condensing", hasSecondaryHeating: false, secondaryHeatingSource: "fireplace",
      ventilation: "gravity", waterProfile: "medium",
      pvPower: 0, solarCollectorArea: 0 
  };

  const [formData, setFormData] = useState(defaultFormData);

  const totalWindowArea = (formData.windowsSmall * WINDOW_SIZES.small) + (formData.windowsMedium * WINDOW_SIZES.medium) + (formData.windowsLarge * WINDOW_SIZES.large);
  const totalDoorArea = formData.doorCount * 2.1; 

  // --- INICJALIZACJA ---
  useEffect(() => {
    const init = async () => {
        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`${API_URL}/materials/`, { headers: { Authorization: `Bearer ${token}` } });
            if(res.ok) setMaterials(await res.json());

            if (location.state && location.state.auditData && location.state.auditId) {
                console.log("TRYB EDYCJI - ID:", location.state.auditId);
                setEditingAuditId(location.state.auditId);
                setFormData(prev => ({ ...prev, ...location.state.auditData }));
            }
        } catch(e) { console.error(e); } finally { setLoading(false); }
    };
    init();
  }, [location]);

  // --- OBLICZENIA ---
  const handleCalculate = async () => {
      setCalculating(true);
      try {
          const token = localStorage.getItem("token");
          const payload = { ...formData, windowArea: Number(totalWindowArea.toFixed(2)), doorArea: Number(totalDoorArea.toFixed(2)) };
          
          let url = `${API_URL}/simulation/calculate-ep`;
          let method = "POST";

          if (editingAuditId) {
              url = `${API_URL}/simulation/history/${editingAuditId}`;
              method = "PUT";
          }

          const response = await fetch(url, {
              method: method,
              headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
              body: JSON.stringify(payload)
          });

          if (response.ok) {
              const data: EPResult = await response.json();
              setResult(data);
              setOpenResultDialog(true);
              if (!editingAuditId) setEditingAuditId(data.id);
          } else {
              alert("Błąd serwera. Sprawdź warstwy przegród.");
          }
      } catch (error) { console.error(error); } finally { setCalculating(false); }
  };

  const handleNext = () => setActiveStep((prev) => prev + 1);
  const handleBack = () => setActiveStep((prev) => prev - 1);

  // --- UI COMPONENTS ---
  const EnergyBar = ({ label, value, max, unit, color }: any) => (
      <Box mb={2}>
          <Box display="flex" justifyContent="space-between" mb={0.5}>
              <Typography variant="body2" fontWeight="bold">{label}</Typography>
              <Typography variant="body2">{value} {unit}</Typography>
          </Box>
          <LinearProgress variant="determinate" value={Math.min((value/max)*100, 100)} sx={{ height: 10, borderRadius: 5, bgcolor: "#eee", "& .MuiLinearProgress-bar": { bgcolor: color } }} />
      </Box>
  );

  // --- KROKI ---
  
  const StepGeneral = () => (
      <Grid container spacing={3}>
          <Grid item xs={12} md={6}><TextField fullWidth label="Powierzchnia (m²)" type="number" value={formData.area} onChange={e=>setFormData({...formData, area: Number(e.target.value)})} /></Grid>
          <Grid item xs={12} md={6}><TextField fullWidth label="Mieszkańcy" type="number" value={formData.inhabitants} onChange={e=>setFormData({...formData, inhabitants: Number(e.target.value)})} /></Grid>
          <Grid item xs={12} md={6}>
               <FormControl fullWidth>
                  <InputLabel><MapIcon sx={{fontSize:16, mr:1}}/>Lokalizacja</InputLabel>
                  <Select value={formData.climateZone} label="Lokalizacja" onChange={e=>setFormData({...formData, climateZone: e.target.value})}>
                      <MenuItem value="I">I - Szczecin (Ciepło)</MenuItem>
                      <MenuItem value="II">II - Poznań / Wrocław</MenuItem>
                      <MenuItem value="III">III - Warszawa / Kraków</MenuItem>
                      <MenuItem value="IV">IV - Białystok</MenuItem>
                      <MenuItem value="V">V - Suwałki (Zimno)</MenuItem>
                  </Select>
               </FormControl>
          </Grid>
          <Grid item xs={6} md={3}><TextField fullWidth label="Wysokość (m)" type="number" value={formData.height} onChange={e=>setFormData({...formData, height: Number(e.target.value)})} /></Grid>
          <Grid item xs={6} md={3}><TextField fullWidth label="Kondygnacje" type="number" value={formData.floors} onChange={e=>setFormData({...formData, floors: Number(e.target.value)})} /></Grid>
      </Grid>
  );

  const StepEnvelop = () => (
      <Grid container spacing={2}>
          <Grid item xs={12} md={4}><Box height="100%"><LayerBuilder title="Ściany Zewn." materials={materials} layers={formData.wallLayers} setLayers={l=>setFormData({...formData, wallLayers: l})} /></Box></Grid>
          <Grid item xs={12} md={4}><Box height="100%"><LayerBuilder title="Podłoga" materials={materials} layers={formData.floorLayers} setLayers={l=>setFormData({...formData, floorLayers: l})} /></Box></Grid>
          <Grid item xs={12} md={4}><Box height="100%"><LayerBuilder title="Dach / Strop" materials={materials} layers={formData.roofLayers} setLayers={l=>setFormData({...formData, roofLayers: l})} /></Box></Grid>
      </Grid>
  );

  const StepWindows = () => (
      <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
              <Typography variant="h6" color="primary">Okna</Typography>
              <Paper variant="outlined" sx={{ p: 2 }}>
                  <Stack spacing={2}>
                      <TextField label="Małe (~1.44 m²)" type="number" size="small" value={formData.windowsSmall} onChange={e=>setFormData({...formData, windowsSmall: Number(e.target.value)})} />
                      <TextField label="Średnie (~2.25 m²)" type="number" size="small" value={formData.windowsMedium} onChange={e=>setFormData({...formData, windowsMedium: Number(e.target.value)})} />
                      <TextField label="Duże (~4.5 m²)" type="number" size="small" value={formData.windowsLarge} onChange={e=>setFormData({...formData, windowsLarge: Number(e.target.value)})} />
                      <Divider />
                      <TextField label="Uw (W/m²K)" type="number" value={formData.windowU} onChange={e=>setFormData({...formData, windowU: Number(e.target.value)})} />
                  </Stack>
              </Paper>
              <Box mt={1} textAlign="right"><Chip label={`Razem: ${totalWindowArea.toFixed(1)} m²`} color="primary" variant="outlined"/></Box>
          </Grid>
          <Grid item xs={12} md={6}>
              <Typography variant="h6" color="primary">Drzwi</Typography>
              <Paper variant="outlined" sx={{ p: 2 }}>
                  <Stack spacing={2}>
                       <TextField label="Sztuk" type="number" value={formData.doorCount} onChange={e=>setFormData({...formData, doorCount: Number(e.target.value)})} />
                       <TextField label="Ud (W/m²K)" type="number" value={formData.doorU} onChange={e=>setFormData({...formData, doorU: Number(e.target.value)})} />
                  </Stack>
              </Paper>
              <Box mt={1} textAlign="right"><Chip label={`Razem: ${totalDoorArea.toFixed(1)} m²`} color="primary" variant="outlined"/></Box>
          </Grid>
      </Grid>
  );

  const StepSystems = () => (
      <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
              <Typography variant="h6"><ThermostatIcon sx={{verticalAlign:'middle'}}/> Ogrzewanie</Typography>
              <FormControl fullWidth sx={{ mb: 2, mt: 1 }}>
                  <InputLabel>Główne Źródło</InputLabel>
                  <Select value={formData.heatingSource} label="Główne Źródło" onChange={e=>setFormData({...formData, heatingSource: e.target.value})}>
                      <MenuItem value="gas_condensing">Kocioł Gazowy Kondensacyjny</MenuItem>
                      <MenuItem value="heat_pump_air">Pompa Ciepła (Powietrzna)</MenuItem>
                      <MenuItem value="heat_pump_ground">Pompa Ciepła (Gruntowa)</MenuItem>
                      <MenuItem value="coal_eco">Ekogroszek</MenuItem>
                      <MenuItem value="biomass">Pellet / Biomasa</MenuItem>
                      <MenuItem value="coal">Węgiel (Stary)</MenuItem>
                      <MenuItem value="electric">Prąd</MenuItem>
                  </Select>
              </FormControl>
              <Paper variant="outlined" sx={{ p: 2, bgcolor: formData.hasSecondaryHeating ? "#e3f2fd" : "transparent" }}>
                  <FormControlLabel control={<Checkbox checked={formData.hasSecondaryHeating} onChange={e => setFormData({...formData, hasSecondaryHeating: e.target.checked})} />} label={<b>Hybryda (Drugie źródło)</b>} />
                  {formData.hasSecondaryHeating && (
                      <FormControl fullWidth size="small" sx={{ mt: 1 }}>
                          <InputLabel>Dodatkowe</InputLabel>
                          <Select value={formData.secondaryHeatingSource} label="Dodatkowe" onChange={e=>setFormData({...formData, secondaryHeatingSource: e.target.value})}>
                              <MenuItem value="fireplace">Kominek</MenuItem>
                              <MenuItem value="electric">Grzałki</MenuItem>
                              <MenuItem value="gas_condensing">Gaz</MenuItem>
                          </Select>
                      </FormControl>
                  )}
              </Paper>
          </Grid>
          <Grid item xs={12} md={6}>
               <Typography variant="h6"><WaterDropIcon sx={{verticalAlign:'middle'}}/> Woda i Wentylacja</Typography>
               <FormControl fullWidth sx={{ mb: 2, mt: 1 }}>
                  <InputLabel>Profil Wody</InputLabel>
                  <Select value={formData.waterProfile} label="Profil Wody" onChange={e=>setFormData({...formData, waterProfile: e.target.value})}>
                      <MenuItem value="low">Oszczędny</MenuItem>
                      <MenuItem value="medium">Standard</MenuItem>
                      <MenuItem value="high">Komfort (Wanna)</MenuItem>
                  </Select>
               </FormControl>
               <FormControl fullWidth sx={{ mb: 3 }}>
                  <InputLabel>Wentylacja</InputLabel>
                  <Select value={formData.ventilation} label="Wentylacja" onChange={e=>setFormData({...formData, ventilation: e.target.value})}>
                      <MenuItem value="gravity">Grawitacyjna</MenuItem>
                      <MenuItem value="mechanical_recovery">Rekuperacja</MenuItem>
                  </Select>
               </FormControl>
               <Typography variant="subtitle2">OZE</Typography>
               <Grid container spacing={2}>
                  <Grid item xs={6}><TextField fullWidth label="PV (kWp)" type="number" value={formData.pvPower} onChange={e => setFormData({...formData, pvPower: Number(e.target.value)})}/></Grid>
                  <Grid item xs={6}><TextField fullWidth label="Solary (m²)" type="number" value={formData.solarCollectorArea} onChange={e => setFormData({...formData, solarCollectorArea: Number(e.target.value)})}/></Grid>
               </Grid>
          </Grid>
      </Grid>
  );

  // --- KROK 5: BOGATE PODSUMOWANIE (STEP SUMMARY) ---
  const StepSummary = () => {
      
      const getMainMaterialName = (layers: Layer[]) => {
          if (layers.length === 0) return "Brak warstw";
          const mat = materials.find(m => m.id === layers[0].materialId);
          return mat ? `${mat.name} + ${layers.length - 1} inne` : `${layers.length} warstw`;
      };

      return (
        <Box sx={{ maxWidth: 900, mx: "auto" }}>
            <Box textAlign="center" mb={4}>
                <Typography variant="h5" fontWeight="bold">Weryfikacja {editingAuditId ? "(Edycja)" : "(Nowy Audyt)"}</Typography>
                <Typography color="text.secondary">Sprawdź dane przed uruchomieniem silnika fizycznego.</Typography>
            </Box>

            <Grid container spacing={3}>
                
                {/* GEOMETRIA */}
                <Grid item xs={12} md={6}>
                    <Card variant="outlined" sx={{ height: '100%', borderColor: '#bbdefb' }}>
                        <CardContent>
                            <Stack direction="row" spacing={1} mb={2} alignItems="center">
                                <MapIcon color="primary" />
                                <Typography variant="h6" color="primary">Lokalizacja i Bryła</Typography>
                            </Stack>
                            <Divider sx={{ mb: 2 }} />
                            <Grid container spacing={2}>
                                <Grid item xs={6}><Typography variant="caption">Powierzchnia</Typography><Typography fontWeight="bold">{formData.area} m²</Typography></Grid>
                                <Grid item xs={6}><Typography variant="caption">Strefa</Typography><Chip label={`Strefa ${formData.climateZone}`} size="small" color="primary" variant="outlined"/></Grid>
                                <Grid item xs={6}><Typography variant="caption">Mieszkańcy</Typography><Typography>{formData.inhabitants} os.</Typography></Grid>
                                <Grid item xs={6}><Typography variant="caption">Rok</Typography><Typography>{formData.year}</Typography></Grid>
                            </Grid>
                        </CardContent>
                    </Card>
                </Grid>

                {/* SYSTEMY */}
                <Grid item xs={12} md={6}>
                    <Card variant="outlined" sx={{ height: '100%', borderColor: '#c8e6c9', bgcolor: '#f1f8e9' }}>
                        <CardContent>
                            <Stack direction="row" spacing={1} mb={2} alignItems="center">
                                <ThermostatIcon color="success" />
                                <Typography variant="h6" color="success.main">Instalacje</Typography>
                            </Stack>
                            <Divider sx={{ mb: 2 }} />
                            <Box mb={1}>
                                <Typography variant="caption">Ogrzewanie</Typography>
                                <Typography fontWeight="bold">{formData.heatingSource.toUpperCase().replace('_', ' ')}</Typography>
                                {formData.hasSecondaryHeating && <Typography variant="caption" color="success.dark">+ {formData.secondaryHeatingSource} (Hybryda)</Typography>}
                            </Box>
                            <Grid container>
                                <Grid item xs={6}><Typography variant="caption">Wentylacja</Typography><Typography>{formData.ventilation === 'gravity' ? 'Grawitacyjna' : 'Rekuperacja'}</Typography></Grid>
                                <Grid item xs={6}><Typography variant="caption">Woda</Typography><Typography>{formData.waterProfile}</Typography></Grid>
                            </Grid>
                        </CardContent>
                    </Card>
                </Grid>

                {/* PRZEGRODY */}
                <Grid item xs={12} md={6}>
                    <Card variant="outlined" sx={{ height: '100%', borderColor: '#ffe0b2' }}>
                        <CardContent>
                            <Stack direction="row" spacing={1} mb={2} alignItems="center">
                                <HomeWorkIcon sx={{ color: '#f57c00' }} />
                                <Typography variant="h6" sx={{ color: '#f57c00' }}>Przegrody</Typography>
                            </Stack>
                            <Divider sx={{ mb: 2 }} />
                            <Stack spacing={1}>
                                <Box display="flex" justifyContent="space-between"><Typography variant="body2">Ściany:</Typography><Typography variant="body2" fontWeight="bold">{getMainMaterialName(formData.wallLayers)}</Typography></Box>
                                <Box display="flex" justifyContent="space-between"><Typography variant="body2">Dach:</Typography><Typography variant="body2" fontWeight="bold">{getMainMaterialName(formData.roofLayers)}</Typography></Box>
                                <Box display="flex" justifyContent="space-between"><Typography variant="body2">Podłoga:</Typography><Typography variant="body2" fontWeight="bold">{getMainMaterialName(formData.floorLayers)}</Typography></Box>
                            </Stack>
                        </CardContent>
                    </Card>
                </Grid>

                {/* STOLARKA */}
                <Grid item xs={12} md={6}>
                    <Card variant="outlined" sx={{ height: '100%' }}>
                        <CardContent>
                            <Stack direction="row" spacing={1} mb={2} alignItems="center">
                                <WindowIcon color="action" />
                                <Typography variant="h6">Stolarka</Typography>
                            </Stack>
                            <Divider sx={{ mb: 2 }} />
                            <Typography variant="body2">Okna: <b>{totalWindowArea.toFixed(1)} m²</b> (Uw: {formData.windowU})</Typography>
                            <Typography variant="body2">Drzwi: <b>{formData.doorCount} szt.</b> (Ud: {formData.doorU})</Typography>
                        </CardContent>
                    </Card>
                </Grid>

                 {/* OZE */}
                 <Grid item xs={12}>
                    <Paper elevation={0} variant="outlined" sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-around', bgcolor: '#fffde7', borderColor: '#fff59d' }}>
                        <Box textAlign="center">
                            <WbSunnyIcon sx={{ color: '#fbc02d', mb: 1 }} />
                            <Typography variant="caption" display="block">Fotowoltaika</Typography>
                            <Typography variant="h6">{formData.pvPower} kWp</Typography>
                        </Box>
                        <Divider orientation="vertical" flexItem />
                        <Box textAlign="center">
                            <WaterDropIcon sx={{ color: '#039be5', mb: 1 }} />
                            <Typography variant="caption" display="block">Kolektory</Typography>
                            <Typography variant="h6">{formData.solarCollectorArea} m²</Typography>
                        </Box>
                    </Paper>
                </Grid>

            </Grid>
        </Box>
      );
  };

  const getStepContent = (step: number) => {
      switch(step) {
          case 0: return <StepGeneral />;
          case 1: return <StepEnvelop />;
          case 2: return <StepWindows />;
          case 3: return <StepSystems />;
          case 4: return <StepSummary />;
          default: return "Nieznany krok";
      }
  };

  if(loading) return <Box p={5} textAlign="center"><CircularProgress /></Box>;

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f5f9ff", pb: 8 }}>
        <Box sx={{ bgcolor: "white", py: 2, px: 3, boxShadow: 1, display: "flex", alignItems: "center", gap: 2 }}>
             <Button startIcon={<ArrowBackIcon />} onClick={() => navigate(editingAuditId ? "/profile" : "/mode-selection")}>
                {editingAuditId ? "Wróć do Profilu" : "Menu"}
             </Button>
             <Typography variant="h6" fontWeight="bold" color="primary">
                 Zaawansowany Audyt {editingAuditId && `(Edycja #${editingAuditId})`}
             </Typography>
        </Box>

        <Container maxWidth="lg" sx={{ mt: 4 }}>
            <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 5 }}>
                {STEPS.map(label => <Step key={label}><StepLabel>{label}</StepLabel></Step>)}
            </Stepper>

            <Paper elevation={3} sx={{ p: 4, borderRadius: 3, minHeight: 450 }}>
                {getStepContent(activeStep)}
                <Box sx={{ display: "flex", justifyContent: "space-between", mt: 6, pt: 2, borderTop: "1px solid #eee" }}>
                    <Button disabled={activeStep === 0} onClick={handleBack} variant="outlined">Wstecz</Button>
                    {activeStep === STEPS.length - 1 ? (
                        <Button 
                            variant="contained" 
                            color="success" 
                            size="large" 
                            onClick={handleCalculate} 
                            disabled={calculating} 
                            startIcon={calculating ? <CircularProgress size={20}/> : (editingAuditId ? <SaveIcon/> : <CheckCircleIcon/>)}
                        >
                            {calculating ? "Przeliczanie..." : (editingAuditId ? "Zaktualizuj Audyt" : "Generuj Raport")}
                        </Button>
                    ) : (
                        <Button variant="contained" onClick={handleNext} size="large">Dalej</Button>
                    )}
                </Box>
            </Paper>
        </Container>

        {/* --- RAPORT WYNIKÓW (BOGATY) --- */}
        <Dialog open={openResultDialog} onClose={() => setOpenResultDialog(false)} maxWidth="md" fullWidth>
            {result && (
                <>
                <DialogTitle sx={{ bgcolor: result.passed_wt2021 ? "#2e7d32" : "#d32f2f", color: "white", py: 3 }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Box>
                            <Typography variant="overline" sx={{ opacity: 0.9 }}>WYNIK AUDYTU #{result.id}</Typography>
                            <Typography variant="h4" fontWeight="bold">Klasa {result.classification}</Typography>
                        </Box>
                        <Stack direction="row" spacing={1}>
                            {/* PRZYCISK PDF */}
                            <Button 
                                variant="contained" 
                                color="secondary" 
                                startIcon={<PictureAsPdfIcon />}
                                onClick={() => generateAdvancedReport({
                                    input: formData, // Dane z formularza
                                    result: result,  // Wyniki z API
                                    materials: materials // Lista materiałów (do nazw)
                                })}
                                sx={{ bgcolor: 'rgba(255,255,255,0.2)', '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' } }}
                            >
                                PDF
                            </Button>
                            
                            <Chip label={result.passed_wt2021 ? "WT 2021 ZGODNY" : "WT 2021 NIEZGODNY"} sx={{bgcolor:'white', color: result.passed_wt2021 ? '#2e7d32' : '#d32f2f', fontWeight:'bold'}} />
                        </Stack>
                    </Stack>
                </DialogTitle>
                <DialogContent sx={{ p: 4 }}>
                    <Grid container spacing={4}>
                        <Grid item xs={12}>
                            <Grid container spacing={2}>
                                <Grid item xs={12} md={6}>
                                    <Paper elevation={3} sx={{ p: 2, bgcolor: "#fff8e1", border: "1px solid #ffecb3", display: "flex", alignItems: "center", gap: 2 }}>
                                        <AttachMoneyIcon sx={{ fontSize: 40, color: "#ff8f00" }} />
                                        <Box>
                                            <Typography variant="caption" fontWeight="bold" color="#ff8f00">SZACUNKOWY KOSZT</Typography>
                                            <Typography variant="h4" fontWeight="bold">{result.estimated_cost_pln} zł</Typography>
                                            <Typography variant="caption">rocznie (ogrzewanie + woda)</Typography>
                                        </Box>
                                    </Paper>
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <Paper elevation={3} sx={{ p: 2, bgcolor: "#e3f2fd", border: "1px solid #bbdefb", display: "flex", alignItems: "center", gap: 2 }}>
                                        <PropaneTankIcon sx={{ fontSize: 40, color: "#1976d2" }} />
                                        <Box>
                                            <Typography variant="caption" fontWeight="bold" color="#1976d2">MOC SZCZYTOWA</Typography>
                                            <Typography variant="h4" fontWeight="bold">{result.peak_power_kw} kW</Typography>
                                            <Typography variant="caption">na mrozy (projektowa)</Typography>
                                        </Box>
                                    </Paper>
                                </Grid>
                            </Grid>
                        </Grid>
                        <Grid item xs={12}><Divider/></Grid>
                        <Grid item xs={12} md={6}>
                            <Typography variant="h6" gutterBottom color="text.secondary">Wskaźniki Energetyczne</Typography>
                            <EnergyBar label="EP (Energia Pierwotna)" value={result.EP} max={160} unit="kWh/m²" color={result.passed_wt2021 ? "#4caf50" : "#f44336"} />
                            <EnergyBar label="EK (Energia Końcowa)" value={result.EK} max={200} unit="kWh/m²" color="#2196f3" />
                            <EnergyBar label="EU (Energia Użytkowa)" value={result.EU} max={150} unit="kWh/m²" color="#ff9800" />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <Typography variant="h6" gutterBottom color="text.secondary">Straty Ciepła (Bilans)</Typography>
                            <Stack spacing={1}>
                                <Paper sx={{p:1, display:'flex', justifyContent:'space-between', bgcolor:'#f5f5f5'}}><Typography>Ściany Zewnętrzne</Typography><Typography fontWeight="bold">{result.heat_loss_walls} W/K</Typography></Paper>
                                <Paper sx={{p:1, display:'flex', justifyContent:'space-between', bgcolor:'#f5f5f5'}}><Typography>Okna i Drzwi</Typography><Typography fontWeight="bold">{result.heat_loss_windows} W/K</Typography></Paper>
                                <Paper sx={{p:1, display:'flex', justifyContent:'space-between', bgcolor:'#f5f5f5'}}><Typography>Wentylacja</Typography><Typography fontWeight="bold">{result.heat_loss_ventilation} W/K</Typography></Paper>
                            </Stack>
                            <Alert severity="info" sx={{ mt: 2, fontSize: '0.85rem' }}>{result.details}</Alert>
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions sx={{ p: 3 }}>
                    <Button onClick={() => setOpenResultDialog(false)} variant="contained">Zamknij</Button>
                    <Button onClick={() => navigate('/profile')} variant="outlined">Wróć do Profilu</Button>
                </DialogActions>
                </>
            )}
        </Dialog>
    </Box>
  );
};

export default AdvancedCalculator;