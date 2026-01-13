// frontend/src/App.tsx
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./views/Home";
import MainPage from "./views/MainPage";
import Login from "./views/Login";
import ModeSelection from "./views/ModeSelection";
import SimpleCalculator from "./views/SimpleCalculator";
import AdvancedCalculator from "./views/AdvancedCalculator";
import UserProfile from "./views/UserProfile";
import Statistics from "./views/Statistics";
import Settings from "./views/Settings";

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/main" element={<MainPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/mode-selection" element={<ModeSelection />} />
        <Route path="/calculator-simple" element={<SimpleCalculator />} />
        <Route path="/calculator-advanced" element={<AdvancedCalculator />} />
        <Route path="/profile" element={<UserProfile />} />
        <Route path="/statistics" element={<Statistics />} />
        <Route path="/settings" element={<Settings />} />
        
      </Routes>
    </Router>
  );
};

export default App;
