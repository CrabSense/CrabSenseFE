import React from 'react'

const Header = ({ onBack, canGoBack }) => {
  return (
    <header className="header">
      <nav>
        <button type="button" className="back-button" onClick={onBack} disabled={!canGoBack} aria-label="Quay lại">
          ←
        </button>
        <div className="logo">CrabSense</div>
        <ul className="nav-links">
          <li>Dashboard</li>
          <li>Monitoring</li>
          <li>Analytics</li>
          <li>Settings</li>
        </ul>
      </nav>
    </header>
  )
}

export default Header
