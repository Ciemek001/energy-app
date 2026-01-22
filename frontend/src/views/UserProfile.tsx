// frontend/src/views/UserProfile.tsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Stack,
  Avatar,
  Divider,
  Fade,
  Grid,
  Alert,
  IconButton,
  Chip,
  Paper,
  Tooltip,
  CircularProgress
} from "@mui/material";
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
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf'; // <--- IKONA PDF
import { API_URL } from "../config";
import { generateEnergyReport } from "../utils/pdfGenerator"; // <--- GENERATOR PDF

interface Building {
    id: number;
    name: string;
    floor_area: number;
    construction_year: number;
    calculated_ep?: number;
    saved_data?: any;
    city?: string; // Czasami strefa jest w city lub saved_data
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
  const [user, setUser] = useState<UserData | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [pdfLoadingId, setPdfLoadingId] = useState<number | null>(null); // Loader dla konkretnego budynku
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const [editForm, setEditForm] = useState<UserData>({
    email: "",
    first_name: "",
    last_name: "",
    address: "",
    buildings: []
  });

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const fetchUserProfile = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    try {
      const response = await fetch(`${API_URL}/users/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data);
        setEditForm(data);
      } else {
        navigate("/login");
      }
    } catch (err) {
      console.error("Błąd pobierania profilu", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserProfile();
  }, [navigate]);

  const handleSave = async () => {
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(`${API_URL}/users/me`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          first_name: editForm.first_name,
          last_name: editForm.last_name,
          address: editForm.address,
        }),
      });

      if (response.ok) {
        fetchUserProfile(); 
        setIsEditing(false);
        setMessage({ type: "success", text: "Profil zaktualizowany pomyślnie!" });
      } else {
        setMessage({ type: "error", text: "Nie udało się zapisać zmian." });
      }
    } catch (err) {
      setMessage({ type: "error", text: "Błąd połączenia z serwerem." });
    }
  };

  const handleDeleteBuilding = async (id: number) => {
    if (!window.confirm("Czy na pewno chcesz usunąć ten budynek?")) return;

    const token = localStorage.getItem("token");
    try {
        const res = await fetch(`${API_URL}/buildings/${id}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
            fetchUserProfile(); 
            setMessage({ type: "success", text: "Budynek usunięty." });
        } else {
            setMessage({ type: "error", text: "Błąd usuwania budynku." });
        }
    } catch (err) {
        console.error(err);
    }
  };

  const handleEditBuilding = (building: Building) => {
      navigate("/calculator-simple", { state: { buildingData: building } });
  };

  // --- NOWA FUNKCJA: Generowanie PDF z listy ---
  const handleGeneratePDF = async (building: Building) => {
    setPdfLoadingId(building.id);
    try {
        // 1. Przygotuj dane do ponownego przeliczenia (Backend potrzebuje formatu SimpleCalculationRequest)
        const details = building.saved_data?.details || {};
        const systems = details.systems || {};
        
        // Mapowanie pól (z zapisanego obiektu na wymagania API)
        const payload = {
            area: building.floor_area,
            year: building.construction_year,
            floors: details.floors || 1,
            inhabitants: details.inhabitants || 1,
            climateZone: building.saved_data?.climate_zone || building.city || "I",
            standards: details.standards || { wall: "brak", roof: "brak", window: "stare", floor: "nieocieplona" },
            systems: {
                heatingPrimary: systems.heatingPrimary || systems.heating || "wegiel", // Obsługa starych i nowych nazw
                heatingSecondary: systems.heatingSecondary || null,
                hotWater: systems.hotWater || "to_samo",
                ventilation: systems.ventilation || "grawitacyjna",
                pv: systems.pv || false,
                solar: systems.solar || false
            }
        };

        // 2. Wyślij do API obliczeniowego
        const res = await fetch(`${API_URL}/calculations/simple`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        if (res.ok) {
            const resultData = await res.json();
            
            // 3. Wygeneruj PDF
            const inputDataForPdf = {
                name: building.name,
                ...payload // Dodajemy parametry wejściowe do nagłówka PDF
            };
            generateEnergyReport(inputDataForPdf, resultData);
            
            setMessage({ type: "success", text: "Raport PDF został pobrany." });
        } else {
            setMessage({ type: "error", text: "Błąd generowania danych do raportu." });
        }

    } catch (err) {
        console.error(err);
        setMessage({ type: "error", text: "Błąd połączenia podczas generowania PDF." });
    } finally {
        setPdfLoadingId(null);
    }
  };

  const getEpColor = (ep?: number) => {
      if (!ep) return "default";
      if (ep <= 70) return "success";
      if (ep <= 150) return "warning";
      return "error";
  };

  if (loading) return <Box p={4} textAlign="center">Ładowanie profilu...</Box>;

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #e8f7ff 0%, #f0fff4 100%)",
        p: 3,
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-start",
      }}
    >
      <Fade in timeout={800}>
        <Card elevation={6} sx={{ width: "100%", maxWidth: 900, borderRadius: 3, mt: 4 }}>
          <CardContent sx={{ p: 4 }}>
            
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
              <Typography variant="h4" fontWeight="bold" color="primary.main">
                Twój Profil
              </Typography>
              {!isEditing ? (
                <Button 
                  startIcon={<EditIcon />} 
                  variant="outlined" 
                  onClick={() => setIsEditing(true)}
                >
                  Edytuj dane
                </Button>
              ) : (
                <Stack direction="row" spacing={1}>
                  <IconButton color="error" onClick={() => { setIsEditing(false); setEditForm(user!); }}>
                    <CancelIcon />
                  </IconButton>
                  <Button 
                    startIcon={<SaveIcon />} 
                    variant="contained" 
                    color="success" 
                    onClick={handleSave}
                  >
                    Zapisz
                  </Button>
                </Stack>
              )}
            </Stack>

            {message && (
              <Alert severity={message.type} onClose={() => setMessage(null)} sx={{ mb: 3 }}>
                {message.text}
              </Alert>
            )}

            <Grid container spacing={4}>
              <Grid item xs={12} md={4} textAlign="center">
                <Box display="flex" flexDirection="column" alignItems="center">
                  <Avatar sx={{ width: 100, height: 100, bgcolor: "#0277bd", mb: 2 }}>
                    {user?.first_name ? user.first_name[0] : <PersonIcon fontSize="large"/>}
                  </Avatar>
                  <Typography variant="h6">{user?.email}</Typography>
                  <Typography variant="body2" color="text.secondary">Rola: {user?.role}</Typography>
                </Box>
                
                <Stack spacing={2} mt={3} textAlign="left">
                    <TextField
                        label="Imię"
                        size="small"
                        disabled={!isEditing}
                        value={isEditing ? editForm.first_name : user?.first_name || ""}
                        onChange={(e) => setEditForm({...editForm, first_name: e.target.value})}
                    />
                    <TextField
                        label="Nazwisko"
                        size="small"
                        disabled={!isEditing}
                        value={isEditing ? editForm.last_name : user?.last_name || ""}
                        onChange={(e) => setEditForm({...editForm, last_name: e.target.value})}
                    />
                    <TextField
                        label="Adres"
                        size="small"
                        disabled={!isEditing}
                        value={isEditing ? editForm.address : user?.address || ""}
                        onChange={(e) => setEditForm({...editForm, address: e.target.value})}
                    />
                </Stack>
              </Grid>

              <Grid item xs={12} md={8}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                    <Typography variant="h6" display="flex" alignItems="center" gap={1}>
                        <HomeWorkIcon color="action"/> Twoje budynki
                    </Typography>
                    <Button 
                        startIcon={<AddCircleOutlineIcon />} 
                        size="small"
                        onClick={() => navigate("/calculator-simple")}
                    >
                        Dodaj nowy
                    </Button>
                </Stack>
                
                <Divider sx={{ mb: 2 }} />

                <Stack spacing={2}>
                    {user?.buildings && user.buildings.length > 0 ? (
                        user.buildings.map((building) => (
                            <Paper 
                                key={building.id} 
                                variant="outlined" 
                                sx={{ p: 2, borderRadius: 2, display: "flex", justifyContent: "space-between", alignItems: "center", bgcolor: "#fafafa" }}
                            >
                                <Box>
                                    <Typography variant="subtitle1" fontWeight="bold">
                                        {building.name}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Rok: {building.construction_year} | Pow: {building.floor_area} m²
                                    </Typography>
                                </Box>
                                
                                <Stack direction="row" spacing={1} alignItems="center">
                                    {building.calculated_ep && (
                                        <Chip 
                                            label={`EP: ${Math.round(building.calculated_ep)}`} 
                                            color={getEpColor(building.calculated_ep) as any} 
                                            variant="outlined" 
                                            size="small"
                                        />
                                    )}
                                    
                                    {/* PRZYCISK PDF */}
                                    <Tooltip title="Pobierz Raport PDF">
                                        <IconButton 
                                            color="secondary" 
                                            onClick={() => handleGeneratePDF(building)}
                                            disabled={pdfLoadingId === building.id}
                                        >
                                            {pdfLoadingId === building.id ? <CircularProgress size={24} /> : <PictureAsPdfIcon />}
                                        </IconButton>
                                    </Tooltip>

                                    <Tooltip title="Edytuj i Przelicz">
                                        <IconButton color="primary" onClick={() => handleEditBuilding(building)}>
                                            <EditIcon />
                                        </IconButton>
                                    </Tooltip>

                                    <Tooltip title="Usuń">
                                        <IconButton color="error" onClick={() => handleDeleteBuilding(building.id)}>
                                            <DeleteIcon />
                                        </IconButton>
                                    </Tooltip>
                                </Stack>
                            </Paper>
                        ))
                    ) : (
                        <Box sx={{ p: 4, bgcolor: "#f5f8ff", borderRadius: 2, border: "1px dashed #0277bd", textAlign: "center" }}>
                            <Typography color="text.secondary">
                                Nie masz jeszcze zapisanych budynków.
                            </Typography>
                            <Button sx={{ mt: 1 }} onClick={() => navigate("/calculator-simple")}>
                                Przejdź do kalkulatora
                            </Button>
                        </Box>
                    )}
                </Stack>

              </Grid>
            </Grid>

            <Divider sx={{ my: 4 }} />

            {/* --- DOLNY PASEK NAWIGACJI --- */}
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Stack direction="row" spacing={2}>
                  <Button
                    startIcon={<ArrowBackIcon />}
                    onClick={() => navigate("/mode-selection")}
                  >
                    Powrót do menu
                  </Button>

                  {user?.role === "admin" && (
                    <Button
                        variant="contained"
                        color="secondary"
                        startIcon={<AdminPanelSettingsIcon />}
                        onClick={() => navigate("/admin")}
                    >
                        Panel Administratora
                    </Button>
                  )}
              </Stack>

              <Button 
                variant="outlined" 
                color="error" 
                startIcon={<LogoutIcon />} 
                onClick={handleLogout}
              >
                Wyloguj
              </Button>
            </Box>

          </CardContent>
        </Card>
      </Fade>
    </Box>
  );
};

export default UserProfile;