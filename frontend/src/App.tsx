import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline } from "@mui/material";

// Importy widoków
// import Home from "./views/Home"; // Usuwamy stary widok Home
import Login from "./views/Login";
import Register from './views/Register';
import MainPage from "./views/MainPage"; // Nowa strona główna
import ModeSelection from "./views/ModeSelection";
import SimpleCalculator from "./views/SimpleCalculator";
import AdvancedCalculator from "./views/AdvancedCalculator";
import UserProfile from "./views/UserProfile";
import Statistics from "./views/Statistics";
import Settings from "./views/Settings";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminPanel from "./views/AdminPanel";

// Definicja motywu (taka sama jak użyta w MainPage dla spójności)
const theme = createTheme({
  palette: {
    primary: { main: "#0277bd" },
    secondary: { main: "#9c27b0" },
    background: { default: "#f5f9ff" }
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  }
});

const App: React.FC = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline /> {/* Reset stylów CSS dla spójnego wyglądu */}
      <Router>
        <Routes>
          
          {/* --- TRASY PUBLICZNE --- */}
          
          {/* MainPage jest teraz stroną startową */}
          <Route path="/" element={<MainPage />} />
          
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* --- TRASY CHRONIONE (Wymagają zalogowania) --- */}
          <Route element={<ProtectedRoute />}>
             {/* Po zalogowaniu użytkownik zazwyczaj trafia tutaj lub do profilu */}
             <Route path="/mode-selection" element={<ModeSelection />} />
             
             <Route path="/calculator-simple" element={<SimpleCalculator />} />
             <Route path="/calculator-advanced" element={<AdvancedCalculator />} />
             
             <Route path="/profile" element={<UserProfile />} />
             <Route path="/statistics" element={<Statistics />} />
             <Route path="/settings" element={<Settings />} />
             
             <Route path="/admin" element={<AdminPanel />} />
          </Route>

          {/* --- CATCH-ALL (Przekierowanie 404) --- */}
          {/* Jeśli adres nie istnieje, wróć na stronę główną */}
          <Route path="*" element={<Navigate to="/" replace />} />

        </Routes>
      </Router>
    </ThemeProvider>
  );
};

export default App;