import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box, Card, CardContent, Typography, Button, TextField, Stack, Avatar, Divider, Fade,
  Grid, Alert, IconButton, Chip, Paper, Tooltip, CircularProgress
} from "@mui/material";

// IKONY
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Cancel";
import PersonIcon from "@mui/icons-material/Person";
import LogoutIcon from "@mui/icons-material/Logout";
import HomeWorkIcon from "@mui/icons-material/HomeWork";
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import DeleteIcon from "@mui/icons-material/Delete";
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import ScienceIcon from '@mui/icons-material/Science';
import AssessmentIcon from '@mui/icons-material/Assessment';

import { API_URL } from "../config";
import { generateEnergyReport } from "../utils/pdfGenerator";
import { generateAdvancedReport } from "../utils/advancedPdfGenerator";

// --- INTERFEJSY ---
interface Building {
    id: number;
    name: string;
    floor_area: number;
    construction_year: number;
    calculated_ep?: number;
    saved_data?: any;
    city?: string;
}

interface AdvancedAudit {
    id: number;
    created_at: string;
    classification: string;
    ep_value: number;
    passed_wt2021: boolean;
    input_data: any;
    // Opcjonalnie dodatkowe pola, jeśli backend je zwraca w /history
    ek_value?: number;
    eu_value?: number; 
}

interface UserData {
  email: string;
  first_name?: string;
  last_name?: string;
  address?: string;
  role?: string;
  buildings: Building[];
}

const UserProfile: React.FC = () => {
  const navigate = useNavigate();
  
  // STANY
  const [user, setUser] = useState<UserData | null>(null);
  const [audits, setAudits] = useState<AdvancedAudit[]>([]);
  const [materials, setMaterials] = useState<any[]>([]); // Baza materiałów do PDF
  
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [pdfLoadingId, setPdfLoadingId] = useState<number | null>(null); // Loader dla PDF prostych budynków
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  
  const [editForm, setEditForm] = useState<UserData>({
    email: "", first_name: "", last_name: "", address: "", buildings: []
  });

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  // --- POBIERANIE DANYCH (GŁÓWNY USE EFFECT) ---
  useEffect(() => {
    const fetchData = async () => {
        const token = localStorage.getItem("token");
        if (!token) { navigate("/login"); return; }
    
        try {
          // 1. Profil i Budynki
          const userRes = await fetch(`${API_URL}/users/me`, { headers: { Authorization: `Bearer ${token}` } });
          if (userRes.ok) {
            const userData = await userRes.json();
            setUser(userData);
            setEditForm(userData);
          } else {
            navigate("/login"); return;
          }
    
          // 2. Audyty Zaawansowane
          const auditRes = await fetch(`${API_URL}/simulation/history`, { headers: { Authorization: `Bearer ${token}` } });
          if (auditRes.ok) setAudits(await auditRes.json());

          // 3. Materiały (do PDF)
          const matRes = await fetch(`${API_URL}/materials/`, { headers: { Authorization: `Bearer ${token}` } });
          if (matRes.ok) setMaterials(await matRes.json());
    
        } catch (err) {
          console.error("Błąd pobierania danych", err);
        } finally {
          setLoading(false);
        }
    };
    fetchData();
  }, [navigate]);


  // --- OBSŁUGA PROFILU ---
  const handleSaveProfile = async () => {
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(`${API_URL}/users/me`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          first_name: editForm.first_name,
          last_name: editForm.last_name,
          address: editForm.address,
        }),
      });

      if (response.ok) {
        // Odśwież widok (ręczne przypisanie, żeby nie robić fetch ponownie)
        setUser(prev => prev ? ({...prev, first_name: editForm.first_name, last_name: editForm.last_name, address: editForm.address}) : null);
        setIsEditing(false);
        setMessage({ type: "success", text: "Profil zaktualizowany!" });
      } else {
        setMessage({ type: "error", text: "Nie udało się zapisać zmian." });
      }
    } catch (err) { setMessage({ type: "error", text: "Błąd połączenia." }); }
  };

  // --- OBSŁUGA BUDYNKÓW (PROSTE) ---
  const handleDeleteBuilding = async (id: number) => {
    if (!window.confirm("Usunąć budynek?")) return;
    const token = localStorage.getItem("token");
    try {
        const res = await fetch(`${API_URL}/buildings/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
        if (res.ok) {
            setUser(prev => prev ? ({...prev, buildings: prev.buildings.filter(b => b.id !== id)}) : null);
            setMessage({ type: "success", text: "Budynek usunięty." });
        }
    } catch (err) { console.error(err); }
  };

  const handleEditBuilding = (building: Building) => {
      navigate("/calculator-simple", { state: { buildingData: building } });
  };

  const handleGenerateSimplePDF = async (building: Building) => {
    setPdfLoadingId(building.id);
    try {
        const details = building.saved_data?.details || {};
        const systems = details.systems || {};
        const payload = {
            area: building.floor_area, year: building.construction_year, floors: details.floors || 1, inhabitants: details.inhabitants || 1,
            climateZone: building.saved_data?.climate_zone || building.city || "I",
            standards: details.standards || { wall: "brak", roof: "brak", window: "stare", floor: "nieocieplona" },
            systems: {
                heatingPrimary: systems.heatingPrimary || systems.heating || "wegiel",
                heatingSecondary: systems.heatingSecondary || null,
                hotWater: systems.hotWater || "to_samo",
                ventilation: systems.ventilation || "grawitacyjna",
                pv: systems.pv || false, solar: systems.solar || false
            }
        };
        const res = await fetch(`${API_URL}/calculations/simple`, {
            method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload)
        });
        if (res.ok) {
            const resultData = await res.json();
            generateEnergyReport({ name: building.name, ...payload }, resultData);
            setMessage({ type: "success", text: "PDF pobrany." });
        }
    } catch (err) { setMessage({ type: "error", text: "Błąd generowania PDF." }); } finally { setPdfLoadingId(null); }
  };


  // --- OBSŁUGA AUDYTÓW ZAAWANSOWANYCH ---
  const handleDeleteAudit = async (id: number) => {
      if(!window.confirm("Usunąć audyt z historii?")) return;
      const token = localStorage.getItem("token");
      try {
          const res = await fetch(`${API_URL}/simulation/history/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
          if(res.ok) {
              setAudits(audits.filter(a => a.id !== id));
              setMessage({ type: "success", text: "Audyt usunięty." });
          }
      } catch(e) { console.error(e); }
  };

  const handleEditAudit = (audit: AdvancedAudit) => {
      navigate('/advanced-calculator', { state: { auditData: audit.input_data, auditId: audit.id } });
  };

  // NOWA FUNKCJA: GENEROWANIE PDF Z HISTORII
  const handleDownloadAdvancedPdf = (audit: AdvancedAudit) => {
      const pdfData = {
          input: audit.input_data,
          materials: materials,
          result: {
              id: audit.id,
              // Mapowanie pól z bazy na format oczekiwany przez generator
              EP: audit.ep_value,
              EK: audit.ek_value || 0, // Jeśli backend /history nie zwraca tych pól, dajemy 0
              EU: audit.eu_value || 0,
              passed_wt2021: audit.passed_wt2021,
              classification: audit.classification,
              // Pola szczegółowe (koszty, straty) mogą być puste, bo /history ich nie zwraca
              estimated_cost_pln: 0,
              peak_power_kw: 0,
              heat_loss_walls: 0,
              heat_loss_windows: 0,
              heat_loss_ventilation: 0
          }
      };
      generateAdvancedReport(pdfData);
  };

  // --- WIDOK ---
  const getEpColor = (ep?: number) => {
      if (!ep) return "default";
      if (ep <= 70) return "success";
      if (ep <= 150) return "warning";
      return "error";
  };

  if (loading) return <Box p={4} textAlign="center"><CircularProgress /></Box>;

  return (
    <Box sx={{ minHeight: "100vh", background: "linear-gradient(135deg, #e8f7ff 0%, #f0fff4 100%)", p: 3, display: "flex", justifyContent: "center", alignItems: "flex-start" }}>
      <Fade in timeout={800}>
        <Card elevation={6} sx={{ width: "100%", maxWidth: 1000, borderRadius: 3, mt: 4 }}>
          <CardContent sx={{ p: 4 }}>
            
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
              <Typography variant="h4" fontWeight="bold" color="primary.main">Twój Profil</Typography>
              {!isEditing ? (
                <Button startIcon={<EditIcon />} variant="outlined" onClick={() => setIsEditing(true)}>Edytuj dane</Button>
              ) : (
                <Stack direction="row" spacing={1}>
                  <IconButton color="error" onClick={() => { setIsEditing(false); setEditForm(user!); }}><CancelIcon /></IconButton>
                  <Button startIcon={<SaveIcon />} variant="contained" color="success" onClick={handleSaveProfile}>Zapisz</Button>
                </Stack>
              )}
            </Stack>

            {message && <Alert severity={message.type} onClose={() => setMessage(null)} sx={{ mb: 3 }}>{message.text}</Alert>}

            <Grid container spacing={4}>
              {/* LEWA: DANE */}
              <Grid item xs={12} md={4} textAlign="center">
                <Box display="flex" flexDirection="column" alignItems="center">
                  <Avatar sx={{ width: 100, height: 100, bgcolor: "#0277bd", mb: 2 }}>
                    {user?.first_name ? user.first_name[0] : <PersonIcon fontSize="large"/>}
                  </Avatar>
                  <Typography variant="h6">{user?.email}</Typography>
                  <Typography variant="body2" color="text.secondary">Rola: {user?.role}</Typography>
                </Box>
                <Stack spacing={2} mt={3} textAlign="left">
                    <TextField label="Imię" size="small" disabled={!isEditing} value={isEditing ? editForm.first_name : user?.first_name || ""} onChange={(e) => setEditForm({...editForm, first_name: e.target.value})} />
                    <TextField label="Nazwisko" size="small" disabled={!isEditing} value={isEditing ? editForm.last_name : user?.last_name || ""} onChange={(e) => setEditForm({...editForm, last_name: e.target.value})} />
                    <TextField label="Adres" size="small" disabled={!isEditing} value={isEditing ? editForm.address : user?.address || ""} onChange={(e) => setEditForm({...editForm, address: e.target.value})} />
                </Stack>
              </Grid>

              {/* PRAWA: LISTY */}
              <Grid item xs={12} md={8}>
                
                {/* 1. BUDYNKI PROSTE */}
                <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                    <Typography variant="h6" display="flex" alignItems="center" gap={1}><HomeWorkIcon color="action"/> Twoje budynki (Proste)</Typography>
                    <Button startIcon={<AddCircleOutlineIcon />} size="small" onClick={() => navigate("/calculator-simple")}>Dodaj</Button>
                </Stack>
                <Divider sx={{ mb: 2 }} />
                <Stack spacing={2} mb={4}>
                    {user?.buildings && user.buildings.length > 0 ? (
                        user.buildings.map((b) => (
                            <Paper key={b.id} variant="outlined" sx={{ p: 2, borderRadius: 2, display: "flex", justifyContent: "space-between", alignItems: "center", bgcolor: "#fafafa" }}>
                                <Box>
                                    <Typography variant="subtitle1" fontWeight="bold">{b.name}</Typography>
                                    <Typography variant="body2" color="text.secondary">Rok: {b.construction_year} | {b.floor_area} m²</Typography>
                                </Box>
                                <Stack direction="row" spacing={1} alignItems="center">
                                    {b.calculated_ep && <Chip label={`EP: ${Math.round(b.calculated_ep)}`} color={getEpColor(b.calculated_ep) as any} variant="outlined" size="small" />}
                                    <Tooltip title="PDF"><IconButton color="secondary" onClick={() => handleGenerateSimplePDF(b)} disabled={pdfLoadingId === b.id}>{pdfLoadingId === b.id ? <CircularProgress size={20} /> : <PictureAsPdfIcon />}</IconButton></Tooltip>
                                    <Tooltip title="Edytuj"><IconButton color="primary" onClick={() => handleEditBuilding(b)}><EditIcon /></IconButton></Tooltip>
                                    <Tooltip title="Usuń"><IconButton color="error" onClick={() => handleDeleteBuilding(b.id)}><DeleteIcon /></IconButton></Tooltip>
                                </Stack>
                            </Paper>
                        ))
                    ) : <Typography color="text.secondary" align="center" py={2}>Brak budynków.</Typography>}
                </Stack>

                {/* 2. AUDYTY ZAAWANSOWANE */}
                <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                    <Typography variant="h6" display="flex" alignItems="center" gap={1}><ScienceIcon color="primary"/> Audyty Inżynierskie</Typography>
                    <Button startIcon={<AddCircleOutlineIcon />} size="small" color="primary" onClick={() => navigate("/advanced-calculator")}>Nowy Audyt</Button>
                </Stack>
                <Divider sx={{ mb: 2 }} />
                <Stack spacing={2}>
                    {audits.length > 0 ? (
                        audits.map((a) => (
                            <Paper key={a.id} elevation={2} sx={{ p: 2, borderRadius: 2, display: "flex", justifyContent: "space-between", alignItems: "center", bgcolor: "#e3f2fd", border: '1px solid #90caf9' }}>
                                <Box>
                                    <Box display="flex" alignItems="center" gap={1}>
                                        <Typography variant="subtitle1" fontWeight="bold">Audyt #{a.id}</Typography>
                                        <Chip label={`Klasa ${a.classification}`} size="small" color={a.passed_wt2021 ? "success" : "error"} />
                                    </Box>
                                    <Typography variant="body2" color="text.secondary">
                                        Data: {new Date(a.created_at).toLocaleDateString()} | Strefa: {a.input_data.climateZone}
                                    </Typography>
                                    <Typography variant="caption" display="block">Źródło: {a.input_data.heatingSource?.toUpperCase()}</Typography>
                                </Box>
                                <Stack direction="row" spacing={1} alignItems="center">
                                    <Chip label={`EP: ${Math.round(a.ep_value)}`} variant="filled" color="primary" size="small" />
                                    
                                    {/* PRZYCISK PDF (NOWOŚĆ) */}
                                    <Tooltip title="Pobierz PDF">
                                        <IconButton color="secondary" onClick={() => handleDownloadAdvancedPdf(a)}>
                                            <PictureAsPdfIcon />
                                        </IconButton>
                                    </Tooltip>

                                    <Tooltip title="Edycja">
                                        <IconButton color="primary" onClick={() => handleEditAudit(a)}>
                                            <AssessmentIcon />
                                        </IconButton>
                                    </Tooltip>
                                    <Tooltip title="Usuń">
                                        <IconButton color="error" onClick={() => handleDeleteAudit(a.id)}>
                                            <DeleteIcon />
                                        </IconButton>
                                    </Tooltip>
                                </Stack>
                            </Paper>
                        ))
                    ) : <Typography color="text.secondary" align="center" py={2}>Brak audytów.</Typography>}
                </Stack>

              </Grid>
            </Grid>

            <Divider sx={{ my: 4 }} />
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Stack direction="row" spacing={2}>
                  <Button startIcon={<ArrowBackIcon />} onClick={() => navigate("/mode-selection")}>Menu</Button>
                  {user?.role === "admin" && <Button variant="contained" color="secondary" startIcon={<AdminPanelSettingsIcon />} onClick={() => navigate("/admin")}>Panel Administratora</Button>}
              </Stack>
              <Button variant="outlined" color="error" startIcon={<LogoutIcon />} onClick={handleLogout}>Wyloguj</Button>
            </Box>

          </CardContent>
        </Card>
      </Fade>
    </Box>
  );
};

export default UserProfile;