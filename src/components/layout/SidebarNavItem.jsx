import { NavLink } from 'react-router-dom'

function SidebarNavItem({
  to,
  icon: Icon,
  label,
  collapsed,
  onClick,
}) {
  return (
    <NavLink
      to={to}
      onClick={onClick}
      className={({ isActive }) =>
        `sidebar-nav-item ${isActive ? 'active' : ''}`
      }
      title={collapsed ? label : undefined}
    >
      <span className="sidebar-nav-icon">
        <Icon size={19} strokeWidth={1.9} />
      </span>

      {!collapsed && (
        <span className="sidebar-nav-label">
          {label}
        </span>
      )}
    </NavLink>
  )
}

export default SidebarNavItem