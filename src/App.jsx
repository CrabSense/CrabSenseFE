import { Navigate, Route, Routes } from "react-router-dom";

import Login from "./pages/Login.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Monitoring from "./pages/Monitoring.jsx";
import Analytics from "./pages/Analytics.jsx";
import Settings from "./pages/Settings.jsx";
import FarmManagement from "./pages/FarmManagement.jsx";

import ProtectedRoute from "./components/ProtectedRoute.jsx";
import AdminLayout from "./components/layout/AdminLayout.jsx";

import AreaProvider from "./context/AreaContext";
import SettingsProvider from "./context/SettingsContext";

function App() {
  return (
    <SettingsProvider>
      <Routes>
        {/* DEFAULT REDIRECT */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        {/* PUBLIC LOGIN */}
        <Route path="/login" element={<Login />} />

        {/* PROTECTED ADMIN ROUTES */}
        <Route
          element={
            <ProtectedRoute allowedRoles={["SystemAdmin"]}>
              <AreaProvider>
                <AdminLayout />
              </AreaProvider>
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard" element={<Dashboard />} />

          <Route path="/monitoring" element={<Monitoring />} />

          <Route path="/analytics" element={<Analytics />} />

          <Route path="/farm-management" element={<FarmManagement />} />

          <Route path="/settings" element={<Settings />} />
        </Route>

        {/* FALLBACK */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </SettingsProvider>
  );
}

export default App;
