import {
  LogOut,
  Menu,
  UserRound,
} from 'lucide-react'

import {
  useLocation,
  useNavigate,
} from 'react-router-dom'

import authService from '../../services/authService'

import FarmingAreaSelector
  from '../filters/FarmingAreaSelector'

import '../../styles/layout/AdminHeader.css'

const PAGE_TITLES = {
  '/dashboard': 'Dashboard',
  '/monitoring': 'Monitoring',
  '/analytics': 'Analytics',
  '/farm-management': 'Farm Management',
  '/settings': 'Settings',
}

function AdminHeader({ onOpenSidebar }) {
  const navigate = useNavigate()
  const location = useLocation()

  const user = authService.getStoredUser()

  const pageTitle =
    PAGE_TITLES[location.pathname] ||
    'CrabSense'

  const handleLogout = async () => {
    try {
      await authService.logout()
    } catch (error) {
      console.error(
        'Logout failed:',
        error
      )
    } finally {
      navigate('/login', {
        replace: true,
      })
    }
  }

  return (
    <header className="admin-topbar">
      <div className="admin-topbar-left">
        <button
          type="button"
          className="mobile-menu-button"
          onClick={onOpenSidebar}
          aria-label="Open navigation"
        >
          <Menu size={20} />
        </button>

        <div>
          <p className="topbar-eyebrow">
            CRABSENSE ADMIN
          </p>

          <h2>{pageTitle}</h2>
        </div>
      </div>

      <div className="admin-topbar-center">
        <FarmingAreaSelector />
      </div>

      <div className="admin-topbar-right">
        <div className="topbar-user">
          <div className="topbar-avatar">
            <UserRound size={18} />
          </div>

          <div className="topbar-user-info">
            <strong>
              {user?.fullName ||
                user?.username ||
                'Administrator'}
            </strong>

            <span>
              {user?.role || 'SystemAdmin'}
            </span>
          </div>
        </div>

        <button
          type="button"
          className="topbar-logout"
          onClick={handleLogout}
        >
          <LogOut size={18} />

          <span>Logout</span>
        </button>
      </div>
    </header>
  )
}

export default AdminHeader