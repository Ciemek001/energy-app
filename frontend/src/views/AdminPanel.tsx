import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Button, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, Chip, Stack, Tooltip, Alert, Avatar,
  TextField, FormControl, InputLabel, Select, MenuItem
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit"; // <--- IKONA EDYCJI
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import HomeWorkIcon from "@mui/icons-material/HomeWork";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";
import PersonIcon from "@mui/icons-material/Person";
import { API_URL } from "../config";

interface Building {
    id: number;
    name: string;
    floor_area: number;
    construction_year: number;
    calculated_ep?: number;
}

interface User {
  id: number;
  email: string;
  role: string;
  first_name?: string;
  last_name?: string;
  address?: string; // Dodano adres do interfejsu
  buildings?: Building[];
}

const AdminPanel: React.FC = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  
  // --- STANY DLA MODALA BUDYNKÓW ---
  const [selectedUserForBuildings, setSelectedUserForBuildings] = useState<User | null>(null);
  const [openBuildingsDialog, setOpenBuildingsDialog] = useState(false);

  // --- STANY DLA MODALA EDYCJI UŻYTKOWNIKA ---
  const [openEditUserDialog, setOpenEditUserDialog] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  // Formularz edycji
  const [editForm, setEditForm] = useState({
      email: "",
      first_name: "",
      last_name: "",
      address: "",
      role: "user"
  });

  const fetchUsers = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
        navigate("/login");
        return;
    }

    try {
      const response = await fetch(`${API_URL}/users/`, { 
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      } else {
        alert("Brak dostępu (wymagana rola Admin)");
        navigate("/profile");
      }
    } catch (error) {
      console.error("Błąd sieci:", error);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // --- LOGIKA USUWANIA ---
  const handleDeleteUser = async (userId: number) => {
    if (!window.confirm("Czy na pewno chcesz usunąć tego użytkownika i wszystkie jego dane?")) {
        return;
    }
    const token = localStorage.getItem("token");
    try {
        const res = await fetch(`${API_URL}/users/${userId}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
            setUsers(users.filter(u => u.id !== userId));
        } else {
            alert("Błąd usuwania użytkownika.");
        }
    } catch (err) {
        console.error(err);
    }
  };

  const handleDeleteBuilding = async (buildingId: number) => {
      if (!window.confirm("Czy usunąć ten budynek?")) {
          return;
      }
      const token = localStorage.getItem("token");
      try {
          const res = await fetch(`${API_URL}/buildings/${buildingId}`, {
              method: "DELETE",
              headers: { Authorization: `Bearer ${token}` }
          });
          if (res.ok && selectedUserForBuildings && selectedUserForBuildings.buildings) {
              // Aktualizuj lokalnie listę budynków w modalu
              const updatedBuildings = selectedUserForBuildings.buildings.filter(b => b.id !== buildingId);
              const updatedUser = { ...selectedUserForBuildings, buildings: updatedBuildings };
              setSelectedUserForBuildings(updatedUser);
              // Aktualizuj główną listę userów
              setUsers(users.map(u => u.id === selectedUserForBuildings.id ? updatedUser : u));
          } else {
              alert("Błąd usuwania budynku.");
          }
      } catch (err) {
          console.error(err);
      }
  };

  // --- LOGIKA EDYCJI UŻYTKOWNIKA ---
  
  const handleOpenEdit = (user: User) => {
      setEditingUser(user);
      setEditForm({
          email: user.email,
          first_name: user.first_name || "",
          last_name: user.last_name || "",
          address: user.address || "",
          role: user.role
      });
      setOpenEditUserDialog(true);
  };

  const handleUpdateUser = async () => {
      if (!editingUser) return;
      
      const token = localStorage.getItem("token");
      try {
          const res = await fetch(`${API_URL}/users/${editingUser.id}`, {
              method: "PUT",
              headers: { 
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${token}` 
              },
              body: JSON.stringify(editForm)
          });

          if (res.ok) {
              const updatedUser = await res.json();
              // Aktualizujemy listę userów w tabeli
              setUsers(users.map(u => u.id === editingUser.id ? { ...u, ...updatedUser } : u));
              setOpenEditUserDialog(false);
              // alert("Zaktualizowano dane użytkownika!");
          } else {
              const err = await res.json();
              alert("Błąd aktualizacji: " + (err.detail || "Nieznany błąd"));
          }
      } catch (err) {
          console.error(err);
          alert("Błąd sieci");
      }
  };


  return (
    <Box sx={{ minHeight: "100vh", p: 4, background: "#f5f5f5" }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={4}>
          <Box>
            <Typography variant="h4" fontWeight="bold" color="secondary.main">
                Panel Administratora
            </Typography>
            <Typography variant="body2" color="text.secondary">
                Zarządzanie użytkownikami
            </Typography>
          </Box>
          <Button startIcon={<ArrowBackIcon />} onClick={() => navigate("/profile")}>
              Wróć do profilu
          </Button>
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
                        <TableCell align="center">Budynki</TableCell>
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
                                        <Typography variant="body2" fontWeight="bold">
                                            {user.first_name} {user.last_name}
                                        </Typography>
                                        {user.address && <Typography variant="caption" color="text.secondary">{user.address}</Typography>}
                                    </Box>
                                </Stack>
                            </TableCell>
                            <TableCell>{user.email}</TableCell>
                            <TableCell>
                                {user.role === "admin" ? <Chip icon={<VerifiedUserIcon />} label="Admin" color="secondary" size="small" /> : <Chip label="User" size="small" />}
                            </TableCell>
                            <TableCell align="center">
                                <Chip label={user.buildings?.length || 0} variant="outlined" size="small" />
                            </TableCell>
                            <TableCell align="right">
                                <Stack direction="row" justifyContent="flex-end" spacing={1}>
                                    
                                    {/* EDYCJA DANYCH */}
                                    <Tooltip title="Edytuj dane użytkownika">
                                        <IconButton color="default" onClick={() => handleOpenEdit(user)}>
                                            <EditIcon />
                                        </IconButton>
                                    </Tooltip>

                                    {/* PODGLĄD BUDYNKÓW */}
                                    <Tooltip title="Zarządzaj budynkami">
                                        <IconButton color="primary" onClick={() => { setSelectedUserForBuildings(user); setOpenBuildingsDialog(true); }}>
                                            <HomeWorkIcon />
                                        </IconButton>
                                    </Tooltip>
                                    
                                    {/* USUWANIE */}
                                    <Tooltip title="Usuń użytkownika">
                                        <IconButton color="error" onClick={() => handleDeleteUser(user.id)}>
                                            <DeleteIcon />
                                        </IconButton>
                                    </Tooltip>
                                </Stack>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
          </TableContainer>
      </Paper>

      {/* --- MODAL 1: LISTA BUDYNKÓW --- */}
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
                            <Button variant="outlined" color="error" startIcon={<DeleteIcon />} size="small" onClick={() => handleDeleteBuilding(b.id)}>Usuń</Button>
                        </Paper>
                    ))}
                </Stack>
            ) : (
                <Alert severity="info">Brak zapisanych budynków.</Alert>
            )}
        </DialogContent>
        <DialogActions><Button onClick={() => setOpenBuildingsDialog(false)}>Zamknij</Button></DialogActions>
      </Dialog>

      {/* --- MODAL 2: EDYCJA DANYCH UŻYTKOWNIKA --- */}
      <Dialog open={openEditUserDialog} onClose={() => setOpenEditUserDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Edycja Użytkownika (ID: {editingUser?.id})</DialogTitle>
          <DialogContent dividers>
              <Stack spacing={2} sx={{ mt: 1 }}>
                  <TextField 
                      label="Email" 
                      fullWidth 
                      value={editForm.email}
                      onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                  />
                  <Stack direction="row" spacing={2}>
                      <TextField 
                          label="Imię" 
                          fullWidth 
                          value={editForm.first_name}
                          onChange={(e) => setEditForm({...editForm, first_name: e.target.value})}
                      />
                      <TextField 
                          label="Nazwisko" 
                          fullWidth 
                          value={editForm.last_name}
                          onChange={(e) => setEditForm({...editForm, last_name: e.target.value})}
                      />
                  </Stack>
                  <TextField 
                      label="Adres" 
                      fullWidth 
                      value={editForm.address}
                      onChange={(e) => setEditForm({...editForm, address: e.target.value})}
                  />
                  
                  <FormControl fullWidth>
                      <InputLabel>Rola</InputLabel>
                      <Select
                          value={editForm.role}
                          label="Rola"
                          onChange={(e) => setEditForm({...editForm, role: e.target.value})}
                      >
                          <MenuItem value="user">Użytkownik (User)</MenuItem>
                          <MenuItem value="admin">Administrator (Admin)</MenuItem>
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