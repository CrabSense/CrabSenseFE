import { Navigate, Route, Routes } from "react-router-dom";

import Login from "./pages/Login.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Monitoring from "./pages/Monitoring.jsx";
import Analytics from "./pages/Analytics.jsx";
import Settings from "./pages/Settings.jsx";
import FarmManagement from "./pages/FarmManagement.jsx";
import SystemOverview from "./pages/system/SystemOverview.jsx";
import DeviceManagement from "./pages/system/DeviceManagement.jsx";
import CameraRecording from "./pages/system/CameraRecording.jsx";
import AiServices from "./pages/system/AiServices.jsx";
import StorageBackup from "./pages/system/StorageBackup.jsx";
import Deployment from "./pages/system/Deployment.jsx";
import SecurityAccess from "./pages/system/SecurityAccess.jsx";
import SystemLogs from "./pages/system/SystemLogs.jsx";

import ProtectedRoute from "./components/ProtectedRoute.jsx";
import AdminLayout from "./components/layout/AdminLayout.jsx";
import authService from "./services/authService";
import {
  FARM_PORTAL_ROLES,
  SYSTEM_ADMINISTRATOR_ROLE,
  homePathForRole,
} from "./constants/roles";

import AreaProvider from "./context/AreaContext";
import SettingsProvider from "./context/SettingsContext";

function RoleHome() {
  const role = authService.getStoredUser()?.role;
  return <Navigate to={homePathForRole(role)} replace />;
}

function App() {
  return (
    <SettingsProvider>
      <Routes>
        {/* DEFAULT REDIRECT */}
        <Route path="/" element={<RoleHome />} />

        {/* PUBLIC LOGIN */}
        <Route path="/login" element={<Login />} />

        {/* PROTECTED ADMIN ROUTES */}
        <Route
          element={
            <ProtectedRoute allowedRoles={FARM_PORTAL_ROLES}>
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

        <Route
          element={
            <ProtectedRoute allowedRoles={[SYSTEM_ADMINISTRATOR_ROLE, "SystemAdmin"]}>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/system" element={<SystemOverview />} />
          <Route path="/system/devices" element={<DeviceManagement />} />
          <Route path="/system/cameras" element={<CameraRecording />} />
          <Route path="/system/ai" element={<AiServices />} />
          <Route path="/system/storage" element={<StorageBackup />} />
          <Route path="/system/deployment" element={<Deployment />} />
          <Route path="/system/security" element={<SecurityAccess />} />
          <Route path="/system/logs" element={<SystemLogs />} />
        </Route>

        {/* FALLBACK */}
        <Route path="*" element={<RoleHome />} />
      </Routes>
    </SettingsProvider>
  );
}

export default App;
