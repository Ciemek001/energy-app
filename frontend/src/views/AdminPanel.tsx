import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Fade,
  Alert,
  Stack
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';

// Typ danych użytkownika (zgodny z backendem)
interface User {
  id: number;
  email: string;
  role: string;
  is_active: boolean;
  first_name?: string;
  last_name?: string;
  address?: string;
}

const AdminPanel: React.FC = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // Stan dla edycji
  const [editOpen, setEditOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Pobieranie listy użytkowników
  const fetchUsers = async () => {
    const token = localStorage.getItem("token");
    if (!token) return navigate("/login");

    try {
      const response = await fetch("http://localhost:8000/users/", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      } else {
        // Jeśli 403 Forbidden - nie jesteś adminem
        if (response.status === 403) {
            alert("Brak uprawnień administratora!");
            navigate("/main");
        }
        setError("Błąd pobierania danych");
      }
    } catch (err) {
      setError("Błąd połączenia z serwerem");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Usuwanie użytkownika
  const handleDelete = async (id: number) => {
    if (!window.confirm("Czy na pewno chcesz usunąć tego użytkownika?")) return;

    const token = localStorage.getItem("token");
    try {
      const response = await fetch(`http://localhost:8000/users/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        setUsers(users.filter((u) => u.id !== id));
      } else {
        const err = await response.json();
        alert(err.detail || "Nie udało się usunąć użytkownika");
      }
    } catch (err) {
      alert("Błąd sieci");
    }
  };

  // Otwieranie okna edycji
  const handleEditClick = (user: User) => {
    setCurrentUser({ ...user }); // Kopia obiektu
    setEditOpen(true);
  };

  // Zapisywanie edycji
  const handleSaveEdit = async () => {
    if (!currentUser) return;
    const token = localStorage.getItem("token");

    try {
      const response = await fetch(`http://localhost:8000/users/${currentUser.id}`, {
        method: "PUT",
        headers: { 
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({
            email: currentUser.email,
            role: currentUser.role,
            first_name: currentUser.first_name,
            last_name: currentUser.last_name,
            address: currentUser.address,
            // is_active: currentUser.is_active // backend UserUpdate tego nie ma, ale UserCreate ma. Można dodać w przyszłości.
        }),
      });

      if (response.ok) {
        setEditOpen(false);
        fetchUsers(); // Odśwież listę
      } else {
        alert("Błąd podczas aktualizacji");
      }
    } catch (err) {
      alert("Błąd sieci");
    }
  };

  if (loading) return <Box p={4} textAlign="center">Ładowanie panelu...</Box>;

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #e8f7ff 0%, #f0fff4 100%)",
        p: 3,
        display: "flex",
        justifyContent: "center",
      }}
    >
      <Fade in timeout={800}>
        <Card elevation={6} sx={{ width: "100%", maxWidth: 1000, borderRadius: 3 }}>
          <CardContent sx={{ p: 4 }}>
            
            <Stack direction="row" alignItems="center" spacing={2} mb={4}>
                <AdminPanelSettingsIcon color="primary" sx={{ fontSize: 40 }}/>
                <Typography variant="h4" fontWeight="bold">
                Panel Administratora
                </Typography>
            </Stack>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            <TableContainer component={Paper} elevation={2} sx={{ borderRadius: 2 }}>
              <Table>
                <TableHead sx={{ bgcolor: "#f5f5f5" }}>
                  <TableRow>
                    <TableCell>ID</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Imię i Nazwisko</TableCell>
                    <TableCell>Rola</TableCell>
                    <TableCell align="right">Akcje</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id} hover>
                      <TableCell>{user.id}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        {user.first_name} {user.last_name}
                      </TableCell>
                      <TableCell>
                        <Chip 
                            label={user.role} 
                            color={user.role === "admin" ? "success" : "primary"} 
                            size="small" 
                            variant="outlined"
                        />
                      </TableCell>
                      <TableCell align="right">
                        <IconButton color="primary" onClick={() => handleEditClick(user)}>
                          <EditIcon />
                        </IconButton>
                        <IconButton color="error" onClick={() => handleDelete(user.id)}>
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            <Box mt={4}>
              <Button startIcon={<ArrowBackIcon />} onClick={() => navigate("/mode-selection")}>
                Wróć do menu
              </Button>
            </Box>

          </CardContent>
        </Card>
      </Fade>

      {/* MODAL EDYCJI */}
      <Dialog open={editOpen} onClose={() => setEditOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Edytuj użytkownika (ID: {currentUser?.id})</DialogTitle>
        <DialogContent dividers>
            <Stack spacing={2} sx={{ mt: 1 }}>
                <TextField 
                    label="Email" 
                    fullWidth 
                    value={currentUser?.email} 
                    onChange={(e) => setCurrentUser(prev => prev ? {...prev, email: e.target.value} : null)}
                />
                <FormControl fullWidth>
                    <InputLabel>Rola</InputLabel>
                    <Select
                        value={currentUser?.role || "user"}
                        label="Rola"
                        onChange={(e) => setCurrentUser(prev => prev ? {...prev, role: e.target.value} : null)}
                    >
                        <MenuItem value="user">User</MenuItem>
                        <MenuItem value="admin">Admin</MenuItem>
                        <MenuItem value="auditor">Auditor</MenuItem>
                    </Select>
                </FormControl>
                <Stack direction="row" spacing={2}>
                    <TextField 
                        label="Imię" 
                        fullWidth 
                        value={currentUser?.first_name || ""} 
                        onChange={(e) => setCurrentUser(prev => prev ? {...prev, first_name: e.target.value} : null)}
                    />
                    <TextField 
                        label="Nazwisko" 
                        fullWidth 
                        value={currentUser?.last_name || ""} 
                        onChange={(e) => setCurrentUser(prev => prev ? {...prev, last_name: e.target.value} : null)}
                    />
                </Stack>
                <TextField 
                    label="Adres" 
                    fullWidth 
                    value={currentUser?.address || ""} 
                    onChange={(e) => setCurrentUser(prev => prev ? {...prev, address: e.target.value} : null)}
                />
            </Stack>
        </DialogContent>
        <DialogActions>
            <Button onClick={() => setEditOpen(false)}>Anuluj</Button>
            <Button variant="contained" onClick={handleSaveEdit}>Zapisz</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminPanel;