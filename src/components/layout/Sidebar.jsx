import {
    BarChart3,
    Boxes,
    Gauge,
    MonitorDot,
    Settings,
    PanelLeftClose,
    PanelLeftOpen,
  } from 'lucide-react'
  
  import logo from '../../assets/LOGO2.png'
  import SidebarNavItem from './SidebarNavItem.jsx'
  
  import '../../styles/layout/Sidebar.css'
  
  const NAV_ITEMS = [
    {
      to: '/dashboard',
      label: 'Dashboard',
      icon: Gauge,
    },
    {
      to: '/monitoring',
      label: 'Monitoring',
      icon: MonitorDot,
    },
    {
      to: '/analytics',
      label: 'Analytics',
      icon: BarChart3,
    },
    {
      to: '/farm-management',
      label: 'Farm Management',
      icon: Boxes,
    },
    {
      to: '/settings',
      label: 'Settings',
      icon: Settings,
    },
  ]
  
  function Sidebar({
    collapsed,
    mobileOpen,
    onToggleCollapse,
    onCloseMobile,
  }) {
    return (
      <>
        {mobileOpen && (
          <div
            className="sidebar-overlay"
            onClick={onCloseMobile}
          />
        )}
  
        <aside
          className={[
            'admin-sidebar',
            collapsed ? 'collapsed' : '',
            mobileOpen ? 'mobile-open' : '',
          ].join(' ')}
        >
          <div className="sidebar-header">
            <div className="sidebar-brand">
              <img
                src={logo}
                alt="CrabSense"
                className="sidebar-logo"
              />
  
              {!collapsed && (
                <div className="sidebar-brand-text">
                  <strong>CrabSense</strong>
                  <span>Admin Portal</span>
                </div>
              )}
            </div>
  
            <button
              type="button"
              className="sidebar-collapse-button"
              onClick={onToggleCollapse}
              aria-label={
                collapsed
                  ? 'Expand sidebar'
                  : 'Collapse sidebar'
              }
            >
              {collapsed ? (
                <PanelLeftOpen size={18} />
              ) : (
                <PanelLeftClose size={18} />
              )}
            </button>
          </div>
  
          <div className="sidebar-section-label">
            {!collapsed && 'MAIN MENU'}
          </div>
  
          <nav className="sidebar-navigation">
            {NAV_ITEMS.map((item) => (
              <SidebarNavItem
                key={item.to}
                {...item}
                collapsed={collapsed}
                onClick={onCloseMobile}
              />
            ))}
          </nav>
  
          <div className="sidebar-footer">
            <span className="sidebar-status-dot" />
  
            {!collapsed && (
              <div>
                <strong>System Online</strong>
                <span>CrabSense Platform</span>
              </div>
            )}
          </div>
        </aside>
      </>
    )
  }
  
  export default Sidebar