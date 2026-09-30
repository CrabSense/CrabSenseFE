import { useState } from 'react'
import { Outlet } from 'react-router-dom'

import Sidebar from './Sidebar.jsx'
import AdminHeader from './AdminHeader.jsx'

import '../../styles/layout/AdminLayout.css'

function AdminLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] =
    useState(false)

  const [mobileSidebarOpen, setMobileSidebarOpen] =
    useState(false)

  return (
    <div
      className={`admin-shell ${
        sidebarCollapsed ? 'sidebar-collapsed' : ''
      }`}
    >
      <Sidebar
        collapsed={sidebarCollapsed}
        mobileOpen={mobileSidebarOpen}
        onToggleCollapse={() =>
          setSidebarCollapsed((value) => !value)
        }
        onCloseMobile={() =>
          setMobileSidebarOpen(false)
        }
      />

      <div className="admin-workspace">
        <AdminHeader
          onOpenSidebar={() =>
            setMobileSidebarOpen(true)
          }
        />

        <main className="admin-content">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default AdminLayout