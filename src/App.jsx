import React from 'react'
import {
  Navigate,
  Route,
  Routes,
} from 'react-router-dom'

import Login from './pages/Login.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Monitoring from './pages/Monitoring.jsx'
import Analytics from './pages/Analytics.jsx'
import Settings from './pages/Settings.jsx'
import FarmManagement from './pages/FarmManagement.jsx'

import ProtectedRoute from './components/ProtectedRoute.jsx'
import AdminLayout from './components/layout/AdminLayout.jsx'

function App() {
  return (
    <Routes>
      <Route
        path="/"
        element={<Navigate to="/dashboard" replace />}
      />

      <Route
        path="/login"
        element={<Login />}
      />

      <Route
        element={
          <ProtectedRoute allowedRoles={['SystemAdmin']}>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route
          path="/dashboard"
          element={<Dashboard />}
        />

        <Route
          path="/monitoring"
          element={<Monitoring />}
        />

        <Route
          path="/analytics"
          element={<Analytics />}
        />

        <Route
          path="/settings"
          element={<Settings />}
        />

        <Route
          path="/farm-management"
          element={<FarmManagement />}
        />
      </Route>

      <Route
        path="*"
        element={<Navigate to="/dashboard" replace />}
      />
    </Routes>
  )
}

export default App