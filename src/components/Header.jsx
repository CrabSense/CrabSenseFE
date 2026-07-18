import React from 'react'

const Header = () => {
  return (
    <header className="header">
      <nav>
        <div className="logo">CrabSense</div>
        <ul className="nav-links">
          <li><a href="/">Dashboard</a></li>
          <li><a href="/monitoring">Monitoring</a></li>
          <li><a href="/analytics">Analytics</a></li>
          <li><a href="/settings">Settings</a></li>
        </ul>
      </nav>
    </header>
  )
}

export default Header
