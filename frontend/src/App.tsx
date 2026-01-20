import React from "react";
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from "./views/Home";
import Login from "./views/Login";
import Register from './views/Register';
import MainPage from "./views/MainPage";
import ModeSelection from "./views/ModeSelection";
import SimpleCalculator from "./views/SimpleCalculator";
import AdvancedCalculator from "./views/AdvancedCalculator";
import UserProfile from "./views/UserProfile";
import Statistics from "./views/Statistics";
import Settings from "./views/Settings";
import ProtectedRoute from "./components/ProtectedRoute"; // <--- Import

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        {/* Trasy publiczne (dostępne dla każdego) */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Trasy chronione (tylko dla zalogowanych) */}
        <Route element={<ProtectedRoute />}>
            <Route path="/main" element={<MainPage />} />
            <Route path="/mode-selection" element={<ModeSelection />} />
            <Route path="/calculator-simple" element={<SimpleCalculator />} />
            <Route path="/calculator-advanced" element={<AdvancedCalculator />} />
            <Route path="/profile" element={<UserProfile />} />
            <Route path="/statistics" element={<Statistics />} />
            <Route path="/settings" element={<Settings />} />
        </Route>

      </Routes>
    </Router>
  );
};

export default App;