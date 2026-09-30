import { NavLink, useNavigate } from 'react-router-dom'
import authService from '../services/authService'

function Header() {
  const navigate = useNavigate()
  const user = authService.getStoredUser()

  const handleLogout = async () => {
    try {
      await authService.logout()
    } catch (error) {
      console.error('Logout failed:', error)
    } finally {
      navigate('/login', { replace: true })
    }
  }

  return (
    <header className="admin-header">
      <div className="admin-header-logo">
        CrabSense
      </div>

      <nav className="admin-nav">
        <NavLink to="/dashboard">Dashboard</NavLink>
        <NavLink to="/monitoring">Monitoring</NavLink>
        <NavLink to="/analytics">Analytics</NavLink>
        <NavLink to="/farm-management">Farm Management</NavLink>
        <NavLink to="/settings">Settings</NavLink>
      </nav>

      <div className="admin-user">
        <span>
          {user?.fullName || user?.username || 'Admin'}
        </span>

        <button
          type="button"
          className="logout-button"
          onClick={handleLogout}
        >
          Logout
        </button>
      </div>
    </header>
  )
}

export default Header