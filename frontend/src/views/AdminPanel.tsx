import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Button, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, Chip, Stack, Tooltip, Alert, Avatar,
  TextField, FormControl, InputLabel, Select, MenuItem, CircularProgress, Divider, Checkbox
} from "@mui/material";
// Ikony
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import HomeWorkIcon from "@mui/icons-material/HomeWork"; 
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";
import PersonIcon from "@mui/icons-material/Person";
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import ScienceIcon from '@mui/icons-material/Science'; 
import AssessmentIcon from '@mui/icons-material/Assessment';

import { API_URL } from "../config";
import { generateEnergyReport } from "../utils/pdfGenerator";
// IMPORT NOWEGO GENERATORA
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
    ek_value?: number; // Opcjonalne, bo backend może nie zwracać w liście
    eu_value?: number;
    passed_wt2021: boolean;
    input_data: any; 
}

interface User {
  id: number;
  email: string;
  role: string;
  is_active: boolean; // <--- Upewnij się, że to masz po poprzednich zmianach
  first_name?: string;
  last_name?: string;
  address?: string;
  buildings?: Building[];
  advanced_audits?: any[]; // <--- DODAJ TO (tablica audytów)
}

const AdminPanel: React.FC = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [pdfLoadingId, setPdfLoadingId] = useState<number | null>(null);
  
  // NOWY STAN: MATERIAŁY DO PDF
  const [materials, setMaterials] = useState<any[]>([]);

  // --- STANY DLA MODALI ---
  const [selectedUserForBuildings, setSelectedUserForBuildings] = useState<User | null>(null);
  const [openBuildingsDialog, setOpenBuildingsDialog] = useState(false);

  const [selectedUserForAudits, setSelectedUserForAudits] = useState<User | null>(null);
  const [userAudits, setUserAudits] = useState<AdvancedAudit[]>([]);
  const [openAuditsDialog, setOpenAuditsDialog] = useState(false);
  const [auditsLoading, setAuditsLoading] = useState(false);

  const [openEditUserDialog, setOpenEditUserDialog] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editForm, setEditForm] = useState({
      email: "", first_name: "", last_name: "", address: "", role: "user"
  });

  // --- POBIERANIE DANYCH ---
  const fetchData = async () => {
    const token = localStorage.getItem("token");
    if (!token) { navigate("/login"); return; }

    try {
        // 1. Pobierz ID aktualnie zalogowanego admina (NOWE)
      const meResponse = await fetch(`${API_URL}/users/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (meResponse.ok) {
        const meData = await meResponse.json();
        setCurrentUserId(meData.id);
      }

      // 2. Użytkownicy
      const response = await fetch(`${API_URL}/users/`, { 
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.ok) {
        setUsers(await response.json());
      } else {
        alert("Brak dostępu (wymagana rola Admin)");
        navigate("/profile");
      }

      // 3. Materiały (potrzebne do generowania PDF Audytów)
      const matRes = await fetch(`${API_URL}/materials/`, { 
          headers: { Authorization: `Bearer ${token}` } 
      });
      if (matRes.ok) {
          setMaterials(await matRes.json());
      }

    } catch (error) { console.error("Błąd sieci:", error); }
  };

  useEffect(() => { fetchData(); }, []);

  // --- LOGIKA PDF (PROSTE) ---
  const handleGeneratePDF = async (building: Building) => {
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
            const inputDataForPdf = { name: building.name, ...payload };
            generateEnergyReport(inputDataForPdf, resultData);
        } else { alert("Błąd generowania raportu."); }
    } catch (err) { console.error(err); } finally { setPdfLoadingId(null); }
  };
// --- NOWA FUNKCJA: Zmiana statusu aktywności ---
  const handleStatusChange = async (userId: number, currentStatus: boolean) => {
    const newStatus = !currentStatus; // Odwracamy wartość
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/users/${userId}/status?is_active=${newStatus}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        // Aktualizujemy stan lokalnie, żeby checkbox "przeskoczył" od razu
        setUsers((prevUsers) =>
          prevUsers.map((user) =>
            user.id === userId ? { ...user, is_active: newStatus } : user
          )
        );
      } else {
        const errorData = await response.json();
        alert(`Nie udało się zmienić statusu: ${errorData.detail}`);
      }
    } catch (error) {
      console.error("Błąd sieci:", error);
      alert("Wystąpił błąd połączenia.");
    }
  };
  // --- LOGIKA PDF (ZAAWANSOWANE - NOWOŚĆ) ---
  const handleGenerateAdvancedPDF = (audit: AdvancedAudit) => {
      // Przygotowanie danych (mapowanie struktury z bazy na strukturę generatora)
      const pdfData = {
          input: audit.input_data,
          materials: materials, // Przekazujemy pobrane materiały
          result: {
              id: audit.id,
              EP: audit.ep_value,
              EK: audit.ek_value || 0,
              EU: audit.eu_value || 0,
              passed_wt2021: audit.passed_wt2021,
              classification: audit.classification,
              // Pola szczegółowe (zerujemy, bo lista historyczna ich nie zwraca wprost)
              estimated_cost_pln: 0,
              peak_power_kw: 0,
              heat_loss_walls: 0,
              heat_loss_windows: 0,
              heat_loss_ventilation: 0
          }
      };
      generateAdvancedReport(pdfData);
  };

  // --- LOGIKA AUDYTÓW ---
  const handleOpenAudits = async (user: User) => {
      setSelectedUserForAudits(user);
      setOpenAuditsDialog(true);
      setAuditsLoading(true);
      
      const token = localStorage.getItem("token");
      try {
          const res = await fetch(`${API_URL}/simulation/admin/history/${user.id}`, {
              headers: { Authorization: `Bearer ${token}` }
          });
          if(res.ok) {
              setUserAudits(await res.json());
          } else {
              alert("Błąd pobierania audytów.");
          }
      } catch(e) { console.error(e); } finally { setAuditsLoading(false); }
  };

  const handleDeleteAudit = async (auditId: number) => {
      if(!window.confirm("Usunąć audyt?")) return;
      const token = localStorage.getItem("token");
      try {
          const res = await fetch(`${API_URL}/simulation/admin/history/${auditId}`, {
              method: "DELETE", headers: { Authorization: `Bearer ${token}` }
          });
          if(res.ok) setUserAudits(userAudits.filter(a => a.id !== auditId));
      } catch(e) { console.error(e); }
  };

  // --- LOGIKA USERA I BUDYNKÓW ---
  const handleDeleteUser = async (userId: number) => {
    // ZABEZPIECZENIE LOGICZNE
    if (userId === currentUserId) {
        alert("Nie możesz usunąć własnego konta administratora!");
        return;
    }

    if (!window.confirm("Usunąć użytkownika i WSZYSTKIE dane?")) return;
    const token = localStorage.getItem("token");
    try {
        const res = await fetch(`${API_URL}/users/${userId}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
        if (res.ok) setUsers(users.filter(u => u.id !== userId));
    } catch (err) { console.error(err); }
  };

  const handleDeleteBuilding = async (buildingId: number) => {
      if (!window.confirm("Usunąć budynek?")) return;
      const token = localStorage.getItem("token");
      try {
          const res = await fetch(`${API_URL}/buildings/${buildingId}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
          if (res.ok && selectedUserForBuildings && selectedUserForBuildings.buildings) {
              const updatedBuildings = selectedUserForBuildings.buildings.filter(b => b.id !== buildingId);
              const updatedUser = { ...selectedUserForBuildings, buildings: updatedBuildings };
              setSelectedUserForBuildings(updatedUser);
              setUsers(users.map(u => u.id === selectedUserForBuildings.id ? updatedUser : u));
          }
      } catch (err) { console.error(err); }
  };

  const handleOpenEdit = (user: User) => {
      setEditingUser(user);
      setEditForm({ email: user.email, first_name: user.first_name || "", last_name: user.last_name || "", address: user.address || "", role: user.role });
      setOpenEditUserDialog(true);
  };

  const handleUpdateUser = async () => {
      if (!editingUser) return;
      const token = localStorage.getItem("token");
      try {
          const res = await fetch(`${API_URL}/users/${editingUser.id}`, {
              method: "PUT", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
              body: JSON.stringify(editForm)
          });
          if (res.ok) {
              const updatedUser = await res.json();
              setUsers(users.map(u => u.id === editingUser.id ? { ...u, ...updatedUser } : u));
              setOpenEditUserDialog(false);
          } else { alert("Błąd aktualizacji"); }
      } catch (err) { console.error(err); }
  };

  return (
    <Box sx={{ minHeight: "100vh", p: 4, background: "#f5f5f5" }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={4}>
          <Box>
            <Typography variant="h4" fontWeight="bold" color="secondary.main">Panel Administratora</Typography>
            <Typography variant="body2" color="text.secondary">Zarządzanie użytkownikami i audytami</Typography>
          </Box>
          <Button startIcon={<ArrowBackIcon />} onClick={() => navigate("/profile")}>Wróć do profilu</Button>
      </Stack>

      <Paper elevation={3} sx={{ borderRadius: 3, overflow: "hidden" }}>
          <TableContainer>
            <Table>
                <TableHead sx={{ bgcolor: "#eee" }}>
                    <TableRow>
                        <TableCell>ID</TableCell>
                        <TableCell>Użytkownik</TableCell>
                        <TableCell>Email</TableCell>
                        <TableCell>Rola</TableCell>
                        <TableCell align="center">Status</TableCell>
                        <TableCell align="center">Dane</TableCell>
                        <TableCell align="right">Akcje</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {users.map((user) => (
                        <TableRow key={user.id} hover>
                            <TableCell>{user.id}</TableCell>
                            <TableCell>
                                <Stack direction="row" alignItems="center" spacing={1}>
                                    <Avatar sx={{ width: 30, height: 30, bgcolor: user.role === 'admin' ? "secondary.main" : "primary.main" }}>
                                        {user.first_name ? user.first_name[0] : <PersonIcon fontSize="small"/>}
                                    </Avatar>
                                    <Box>
                                        <Typography variant="body2" fontWeight="bold">{user.first_name} {user.last_name}</Typography>
                                        {user.address && <Typography variant="caption" color="text.secondary">{user.address}</Typography>}
                                    </Box>
                                </Stack>
                            </TableCell>
                            <TableCell>{user.email}</TableCell>
                            <TableCell>{user.role === "admin" ? <Chip icon={<VerifiedUserIcon />} label="Admin" color="secondary" size="small" /> : <Chip label="User" size="small" />}</TableCell>
                            
                            {/* --- NOWA KOMÓRKA Z CHECKBOXEM --- */}
                            <TableCell align="center">
                                <Tooltip title={user.is_active ? "Konto aktywne" : "Konto nieaktywne - kliknij, aby aktywować"}>
                                    <Checkbox
                                        checked={user.is_active}
                                        onChange={() => handleStatusChange(user.id, user.is_active)}
                                        color="success"
                                    />
                                </Tooltip>
                            </TableCell>
                            {/* --------------------------------- */}

                            <TableCell align="center">
    <Stack direction="row" justifyContent="center" spacing={1}>
        {/* BUDYNKI PROSTE */}
        <Tooltip title="Budynki Proste">
            <Chip 
                icon={<HomeWorkIcon/>} 
                label={user.buildings?.length || 0} 
                variant="outlined" 
                size="small" 
                onClick={() => { setSelectedUserForBuildings(user); setOpenBuildingsDialog(true); }} 
            />
        </Tooltip>
        
        {/* --- AUDYTY ZAAWANSOWANE (ZMIANA) --- */}
        <Tooltip title="Audyty Zaawansowane">
            <Chip 
                icon={<ScienceIcon/>} 
                // Tutaj wyświetlamy długość tablicy advanced_audits
                label={user.advanced_audits?.length || 0} 
                variant="outlined" 
                size="small"
                color="primary" // Możesz dać inny kolor dla odróżnienia
                onClick={() => handleOpenAudits(user)}
                clickable // Żeby kursor zmieniał się w rączkę
            />
        </Tooltip>
        {/* ------------------------------------ */}
    </Stack>
</TableCell>

                            <TableCell align="right">
                                <Stack direction="row" justifyContent="flex-end" spacing={1}>
                                    <Tooltip title="Edytuj dane"><IconButton color="default" onClick={() => handleOpenEdit(user)}><EditIcon /></IconButton></Tooltip>
                                    <Tooltip title={user.id === currentUserId ? "Nie możesz usunąć siebie" : "Usuń użytkownika"}>
            <span> {/* Span jest potrzebny, żeby Tooltip działał na disabled button */}
                <IconButton 
                    color="error" 
                    onClick={() => handleDeleteUser(user.id)}
                    disabled={user.id === currentUserId} // Blokada, jeśli to Ty
                >
                    <DeleteIcon />
                </IconButton>
            </span>
        </Tooltip>
        {/* --------------------------------------- */}
                                </Stack>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
          </TableContainer>
      </Paper>

      {/* --- MODAL 1: BUDYNKI PROSTE --- */}
      <Dialog open={openBuildingsDialog} onClose={() => setOpenBuildingsDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ bgcolor: "#f5f5f5" }}>Budynki użytkownika: {selectedUserForBuildings?.email}</DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
            {selectedUserForBuildings?.buildings && selectedUserForBuildings.buildings.length > 0 ? (
                <Stack spacing={2} mt={1}>
                    {selectedUserForBuildings.buildings.map((b) => (
                        <Paper key={b.id} variant="outlined" sx={{ p: 2, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <Box>
                                <Typography variant="subtitle1" fontWeight="bold">{b.name}</Typography>
                                <Typography variant="caption">Rok: {b.construction_year} | {b.floor_area} m²</Typography>
                            </Box>
                            <Stack direction="row" spacing={1}>
                                <Tooltip title="PDF"><IconButton color="primary" onClick={() => handleGeneratePDF(b)} disabled={pdfLoadingId === b.id}>{pdfLoadingId === b.id ? <CircularProgress size={20} /> : <PictureAsPdfIcon />}</IconButton></Tooltip>
                                <Button variant="outlined" color="error" startIcon={<DeleteIcon />} size="small" onClick={() => handleDeleteBuilding(b.id)}>Usuń</Button>
                            </Stack>
                        </Paper>
                    ))}
                </Stack>
            ) : (<Alert severity="info">Brak zapisanych budynków prostych.</Alert>)}
        </DialogContent>
        <DialogActions><Button onClick={() => setOpenBuildingsDialog(false)}>Zamknij</Button></DialogActions>
      </Dialog>

      {/* --- MODAL 2: AUDYTY ZAAWANSOWANE --- */}
      <Dialog open={openAuditsDialog} onClose={() => setOpenAuditsDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ bgcolor: "#e3f2fd" }}>
            <Stack direction="row" alignItems="center" spacing={1}>
                <ScienceIcon color="primary"/>
                <Typography>Audyty Inżynierskie: {selectedUserForAudits?.email}</Typography>
            </Stack>
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
            {auditsLoading ? (
                <Box textAlign="center" p={4}><CircularProgress /></Box>
            ) : userAudits.length > 0 ? (
                <Stack spacing={2} mt={1}>
                    {userAudits.map((audit) => (
                        <Paper key={audit.id} elevation={2} sx={{ p: 2, display: "flex", justifyContent: "space-between", alignItems: "center", border: '1px solid #90caf9' }}>
                            <Box>
                                <Stack direction="row" spacing={1} alignItems="center" mb={0.5}>
                                    <Typography variant="subtitle1" fontWeight="bold">Audyt #{audit.id}</Typography>
                                    <Chip label={`Klasa ${audit.classification}`} size="small" color={audit.passed_wt2021 ? "success" : "error"} />
                                </Stack>
                                <Typography variant="caption" display="block">
                                    Data: {new Date(audit.created_at).toLocaleDateString()} | Strefa: {audit.input_data.climateZone}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                    EP: {Math.round(audit.ep_value)} kWh/m² | Źródło: {audit.input_data.heatingSource}
                                </Typography>
                            </Box>
                            
                            <Stack direction="row" spacing={1}>
                                {/* NOWY PRZYCISK PDF (DLA ADMINA) */}
                                <Tooltip title="Pobierz Raport PDF">
                                    <IconButton color="secondary" onClick={() => handleGenerateAdvancedPDF(audit)}>
                                        <PictureAsPdfIcon />
                                    </IconButton>
                                </Tooltip>

                                <Button variant="contained" color="error" startIcon={<DeleteIcon />} size="small" onClick={() => handleDeleteAudit(audit.id)}>
                                    Usuń
                                </Button>
                            </Stack>
                        </Paper>
                    ))}
                </Stack>
            ) : (
                <Alert severity="info">Ten użytkownik nie posiada żadnych audytów inżynierskich.</Alert>
            )}
        </DialogContent>
        <DialogActions><Button onClick={() => setOpenAuditsDialog(false)}>Zamknij</Button></DialogActions>
      </Dialog>

      {/* --- MODAL 3: EDYCJA UŻYTKOWNIKA --- */}
      <Dialog open={openEditUserDialog} onClose={() => setOpenEditUserDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Edycja Użytkownika (ID: {editingUser?.id})</DialogTitle>
          <DialogContent dividers>
              <Stack spacing={2} sx={{ mt: 1 }}>
                  <TextField label="Email" fullWidth value={editForm.email} onChange={(e) => setEditForm({...editForm, email: e.target.value})} />
                  <Stack direction="row" spacing={2}>
                      <TextField label="Imię" fullWidth value={editForm.first_name} onChange={(e) => setEditForm({...editForm, first_name: e.target.value})} />
                      <TextField label="Nazwisko" fullWidth value={editForm.last_name} onChange={(e) => setEditForm({...editForm, last_name: e.target.value})} />
                  </Stack>
                  <TextField label="Adres" fullWidth value={editForm.address} onChange={(e) => setEditForm({...editForm, address: e.target.value})} />
                  <FormControl fullWidth>
                      <InputLabel>Rola</InputLabel>
                      <Select value={editForm.role} label="Rola" onChange={(e) => setEditForm({...editForm, role: e.target.value})}>
                          <MenuItem value="user">Użytkownik</MenuItem>
                          <MenuItem value="admin">Administrator</MenuItem>
                      </Select>
                  </FormControl>
              </Stack>
          </DialogContent>
          <DialogActions>
              <Button onClick={() => setOpenEditUserDialog(false)}>Anuluj</Button>
              <Button onClick={handleUpdateUser} variant="contained" color="primary">Zapisz zmiany</Button>
          </DialogActions>
      </Dialog>

    </Box>
  );
};

export default AdminPanel;