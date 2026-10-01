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

import AreaProvider from './context/AreaContext'

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
          <ProtectedRoute
            allowedRoles={['SystemAdmin']}
          >
            <AreaProvider>
              <AdminLayout />
            </AreaProvider>
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
          path="/farm-management"
          element={<FarmManagement />}
        />

        <Route
          path="/settings"
          element={<Settings />}
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