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
  IconButton
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Cancel";
import PersonIcon from "@mui/icons-material/Person";

// Interfejs zgodny z backendem (UserOut)
interface UserData {
  email: string;
  first_name?: string;
  last_name?: string;
  address?: string;
  role?: string;
}

const UserProfile: React.FC = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<UserData | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Stany formularza edycji
  const [editForm, setEditForm] = useState<UserData>({
    email: "",
    first_name: "",
    last_name: "",
    address: "",
  });

  // 1. Pobieranie danych użytkownika
  const fetchUserProfile = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    try {
      const response = await fetch("http://localhost:8000/users/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data);
        setEditForm(data); // Inicjalizacja formularza
      } else {
        navigate("/login"); // Token nieważny
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

  // 2. Obsługa zapisu danych
  const handleSave = async () => {
    const token = localStorage.getItem("token");
    try {
      const response = await fetch("http://localhost:8000/users/me", {
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
        const updatedUser = await response.json();
        setUser(updatedUser);
        setIsEditing(false);
        setMessage({ type: "success", text: "Profil zaktualizowany pomyślnie!" });
      } else {
        setMessage({ type: "error", text: "Nie udało się zapisać zmian." });
      }
    } catch (err) {
      setMessage({ type: "error", text: "Błąd połączenia z serwerem." });
    }
  };

  if (loading) return <Box p={4} textAlign="center">Ładowanie profilu...</Box>;

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #e8f7ff 0%, #f0fff4 100%)", // Spójne tło
        p: 3,
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-start",
      }}
    >
      <Fade in timeout={800}>
        <Card elevation={6} sx={{ width: "100%", maxWidth: 800, borderRadius: 3, mt: 4 }}>
          <CardContent sx={{ p: 4 }}>
            
            {/* Nagłówek i Komunikaty */}
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
              {/* Kolumna Lewa: Awatar i Email */}
              <Grid item xs={12} md={4} textAlign="center">
                <Box display="flex" flexDirection="column" alignItems="center">
                  <Avatar sx={{ width: 100, height: 100, bgcolor: "#0277bd", mb: 2, fontSize: 40 }}>
                    {user?.first_name ? user.first_name[0] : <PersonIcon fontSize="large"/>}
                  </Avatar>
                  <Typography variant="h6">{user?.email}</Typography>
                  <Typography variant="body2" color="text.secondary">Rola: {user?.role}</Typography>
                </Box>
              </Grid>

              {/* Kolumna Prawa: Dane szczegółowe */}
              <Grid item xs={12} md={8}>
                <Stack spacing={3}>
                  <Box>
                    <Typography variant="caption" color="text.secondary">Imię</Typography>
                    {isEditing ? (
                      <TextField
                        fullWidth
                        size="small"
                        value={editForm.first_name || ""}
                        onChange={(e) => setEditForm({...editForm, first_name: e.target.value})}
                      />
                    ) : (
                      <Typography variant="body1" fontWeight="500">
                        {user?.first_name || "—"}
                      </Typography>
                    )}
                  </Box>

                  <Box>
                    <Typography variant="caption" color="text.secondary">Nazwisko</Typography>
                    {isEditing ? (
                      <TextField
                        fullWidth
                        size="small"
                        value={editForm.last_name || ""}
                        onChange={(e) => setEditForm({...editForm, last_name: e.target.value})}
                      />
                    ) : (
                      <Typography variant="body1" fontWeight="500">
                        {user?.last_name || "—"}
                      </Typography>
                    )}
                  </Box>

                  <Box>
                    <Typography variant="caption" color="text.secondary">Adres</Typography>
                    {isEditing ? (
                      <TextField
                        fullWidth
                        size="small"
                        value={editForm.address || ""}
                        onChange={(e) => setEditForm({...editForm, address: e.target.value})}
                      />
                    ) : (
                      <Typography variant="body1" fontWeight="500">
                        {user?.address || "—"}
                      </Typography>
                    )}
                  </Box>
                </Stack>
              </Grid>
            </Grid>

            <Divider sx={{ my: 4 }} />

            {/* Sekcja Budynków (Placeholder na przyszłość) */}
            <Typography variant="h6" gutterBottom>Twoje budynki</Typography>
            <Box sx={{ p: 2, bgcolor: "#f5f8ff", borderRadius: 2, border: "1px dashed #0277bd" }}>
              <Typography color="text.secondary" align="center">
                Tutaj pojawi się lista Twoich budynków po podłączeniu modułu obliczeniowego.
              </Typography>
            </Box>

            <Box mt={4}>
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
                  sx={{ mt: 2 }} // Odstęp
                  onClick={() => navigate("/admin")}
                >
                  Panel Administratora
                </Button>
              )}
            </Box>

          </CardContent>
        </Card>
      </Fade>
    </Box>
  );
};

export default UserProfile;