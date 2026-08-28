import React, { useState } from 'react'
import './styles/App.css'
import Header from './components/Header.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Monitoring from './pages/Monitoring.jsx'
import Analytics from './pages/Analytics.jsx'
import Settings from './pages/Settings.jsx'
import FarmManagement from './pages/FarmManagement.jsx'

/** Pages thật trong repo CrabSenseFE */
const PAGES = {
  '/': Dashboard,
  '/monitoring': Monitoring,
  '/analytics': Analytics,
  '/settings': Settings,
  '/farm-management': FarmManagement,
}

function App() {
  const [history, setHistory] = useState(['/'])
  const path = history[history.length - 1]
  const Page = PAGES[path] ?? Dashboard

  const navigate = (nextPath) => {
    setHistory((current) => current[current.length - 1] === nextPath
      ? current
      : [...current, nextPath])
  }

  const goBack = () => {
    setHistory((current) => current.length > 1 ? current.slice(0, -1) : current)
  }

  return (
    <div className="phone-backdrop">
      <div className="phone-frame" aria-label="CrabSense FE phone preview">
        <div className="App phone-app">
          <Header onBack={goBack} canGoBack={history.length > 1} />
          {/* Nav thật theo Header links — dùng state vì chưa có react-router */}
          <nav className="phone-nav">
            <button type="button" className={path === '/' ? 'on' : ''} onClick={() => navigate('/')}>
              Dashboard
            </button>
            <button type="button" className={path === '/monitoring' ? 'on' : ''} onClick={() => navigate('/monitoring')}>
              Monitoring
            </button>
            <button type="button" className={path === '/analytics' ? 'on' : ''} onClick={() => navigate('/analytics')}>
              Analytics
            </button>
            <button type="button" className={path === '/settings' ? 'on' : ''} onClick={() => navigate('/settings')}>
              Settings
            </button>
            <button type="button" className={path === '/farm-management' ? 'on' : ''} onClick={() => navigate('/farm-management')}>
              Hộp nuôi
            </button>
          </nav>
          <main className="phone-main">
            <Page />
          </main>
        </div>
      </div>
      <p className="phone-note">
        UI từ repo CrabSenseFE (Dashboard / Monitoring / Analytics / Settings) · form điện thoại
      </p>
    </div>
  )
}

export default App
