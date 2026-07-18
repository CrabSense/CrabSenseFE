import React from 'react'

const Dashboard = () => {
  return (
    <div className="dashboard">
      <h2>Dashboard</h2>
      <div className="dashboard-grid">
        <div className="card">
          <h3>Water Temperature</h3>
          <p className="metric">25°C</p>
        </div>
        <div className="card">
          <h3>pH Level</h3>
          <p className="metric">7.5</p>
        </div>
        <div className="card">
          <h3>Dissolved Oxygen</h3>
          <p className="metric">8.2 mg/L</p>
        </div>
        <div className="card">
          <h3>Salinity</h3>
          <p className="metric">32 ppt</p>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
