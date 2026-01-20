// frontend/src/components/ProtectedRoute.tsx
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = () => {
    // Sprawdzamy, czy w localStorage jest token
    const token = localStorage.getItem("token");

    // Jeśli token istnieje, renderujemy podstronę (Outlet)
    // Jeśli nie, przekierowujemy do logowania
    return token ? <Outlet /> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;