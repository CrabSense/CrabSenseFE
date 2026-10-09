import { useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";

import Sidebar from "./Sidebar.jsx";
import AdminHeader from "./AdminHeader.jsx";
import PageScrollbar from "./PageScrollbar.jsx";
import ScrollToTop from "./ScrollToTop.jsx";

function AdminLayout() {
  const location = useLocation();

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Close mobile sidebar after route navigation.
  useEffect(() => {
    setMobileSidebarOpen(false);
  }, [location.pathname]);

  // Close mobile sidebar when Escape is pressed.
  useEffect(() => {
    if (!mobileSidebarOpen) return;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setMobileSidebarOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [mobileSidebarOpen]);

  const handleToggleCollapse = () => {
    setSidebarCollapsed((current) => !current);
  };

  const handleOpenMobile = () => {
    setMobileSidebarOpen(true);
  };

  const handleCloseMobile = () => {
    setMobileSidebarOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#050806]">
      {/* RESET SCROLL WHEN ROUTE CHANGES */}
      <ScrollToTop />

      {/* SIDEBAR */}
      <Sidebar
        collapsed={sidebarCollapsed}
        mobileOpen={mobileSidebarOpen}
        onToggleCollapse={handleToggleCollapse}
        onCloseMobile={handleCloseMobile}
      />

      {/* CUSTOM PAGE SCROLLBAR */}
      <PageScrollbar />

      {/* PAGE CONTAINER */}
      <div
        className={[
          "min-h-screen min-w-0",

          // Smooth transition when Sidebar expands/collapses
          "transition-[margin-left]",
          "duration-[320ms]",
          "ease-[cubic-bezier(0.22,1,0.36,1)]",
          "motion-reduce:transition-none",

          sidebarCollapsed ? "min-[901px]:ml-[80px]" : "min-[901px]:ml-[272px]",

          "max-[900px]:ml-0",
        ].join(" ")}
      >
        {/* ADMIN HEADER */}
        <AdminHeader onOpenSidebar={handleOpenMobile} />

        {/* PAGE CONTENT */}
        <main
          className={[
            "min-h-[calc(100vh-74px)]",
            "min-w-0",

            // Dashboard background
            "bg-[radial-gradient(circle_at_80%_0%,rgba(77,255,0,0.025),transparent_25%),#070B08]",

            // Desktop spacing
            "px-[30px] pb-10 pt-7",

            // Mobile spacing
            "max-[900px]:px-[18px]",
            "max-[900px]:pb-9",
            "max-[900px]:pt-6",
          ].join(" ")}
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default AdminLayout;
