import { useState } from "react";

import {
  LogOut,
  Menu,
  UserRound,
  ShieldCheck,
  ChevronRight,
} from "lucide-react";

import { useLocation, useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";

import authService from "../../services/authService";
import { isSystemAdministratorRole } from "../../constants/roles";
import FarmingAreaSelector from "../filters/FarmingAreaSelector";
import useTranslation from "../../hooks/useTranslation";

// ============================================
// PAGE TITLE MAPPING
// ============================================

const PAGE_TITLE_KEYS = {
  "/dashboard": "nav.dashboard",
  "/monitoring": "nav.monitoring",
  "/analytics": "nav.analytics",
  "/farm-management": "nav.farmManagement",
  "/settings": "nav.settings",
  "/system": "nav.systemOverview",
  "/system/devices": "nav.deviceManagement",
  "/system/cameras": "nav.cameraRecording",
  "/system/ai": "nav.aiServices",
  "/system/storage": "nav.storageBackup",
  "/system/deployment": "nav.deployment",
  "/system/security": "nav.securityAccess",
  "/system/logs": "nav.systemLogs",
};

// ============================================
// ADMIN HEADER
// ============================================

function AdminHeader({ onOpenSidebar }) {
  const navigate = useNavigate();
  const location = useLocation();

  const { t } = useTranslation();

  const [loggingOut, setLoggingOut] = useState(false);

  const user = authService.getStoredUser();
  const isSystemAdmin = isSystemAdministratorRole(user?.role);

  const titleKey = PAGE_TITLE_KEYS[location.pathname];

  const pageTitle = titleKey ? t(titleKey) : "CrabSense";

  // ==========================================
  // LOGOUT
  // ==========================================

  const handleLogout = async () => {
    if (loggingOut) return;

    setLoggingOut(true);

    try {
      await authService.logout();
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      navigate("/login", {
        replace: true,
      });
    }
  };

  // ==========================================
  // RENDER
  // ==========================================

  return (
    <header
      className={[
        // Sticky header
        "sticky top-0 z-[100]",

        // Dropdown must be able to overflow
        "overflow-visible",

        // Layout
        "flex min-h-[74px]",
        "items-center justify-between",
        "gap-4",

        // Dark header styling
        "border-b border-[#77FF00]/10",
        "bg-[#080D09]/95",
        "backdrop-blur-xl",

        // Header transition
        "transition-[background-color,border-color]",
        "duration-[240ms]",

        // Responsive
        "px-7",
        "max-[900px]:px-[18px]",
        "max-[760px]:flex-wrap",
        "max-[760px]:py-3",
      ].join(" ")}
    >
      {/* ======================================
          LEFT: PAGE IDENTITY
         ====================================== */}

      <div
        className={["flex min-w-0 shrink-0", "items-center gap-3"].join(" ")}
      >
        {/* MOBILE SIDEBAR BUTTON */}
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={onOpenSidebar}
          aria-label={t("nav.openNavigation")}
          aria-controls="crabsense-sidebar"
          className={[
            "hidden h-10 w-10 shrink-0",

            "rounded-xl",

            "border-[#77FF00]/15",
            "bg-[#77FF00]/[0.05]",
            "text-[#77FF00]",

            "transition-[background-color,border-color,box-shadow]",
            "duration-200",

            "hover:border-[#77FF00]/30",
            "hover:bg-[#77FF00]/10",
            "hover:shadow-[0_0_18px_rgba(119,255,0,0.06)]",

            "focus-visible:ring-2",
            "focus-visible:ring-[#77FF00]/30",

            "max-[900px]:inline-flex",
          ].join(" ")}
        >
          <Menu size={20} aria-hidden="true" />
        </Button>

        {/* TITLE GROUP */}
        <div className="min-w-0">
          <div className="mb-1 flex items-center gap-1.5">
            <ShieldCheck
              size={12}
              aria-hidden="true"
              className="text-[#77FF00]"
            />

            <span className="truncate text-[9px] font-bold uppercase tracking-[0.13em] text-[#77FF00]">
              {t("nav.adminPortal")}
            </span>

            <ChevronRight
              size={12}
              aria-hidden="true"
              className="text-[#526A56]"
            />
          </div>

          {/* ANIMATED PAGE TITLE */}
          <h2
            key={location.pathname}
            className={[
              "admin-header-title-reveal",

              "truncate text-[19px]",
              "font-semibold",
              "tracking-[-0.5px]",
              "text-[#F4F7F4]",
            ].join(" ")}
          >
            {pageTitle}
          </h2>
        </div>
      </div>

      {/* ======================================
          CENTER: FARMING AREA SELECTOR
         ====================================== */}

      <div
        className={[
          "relative z-20",

          "flex min-w-0 flex-1",
          "items-center justify-center",

          "overflow-visible",
          "px-3",

          "max-[760px]:order-3",
          "max-[760px]:w-full",
          "max-[760px]:basis-full",
          "max-[760px]:px-0",
        ].join(" ")}
      >
        <div
          className={[
            "relative w-full min-w-0",
            "max-w-[470px]",
            "overflow-visible",
          ].join(" ")}
        >
          {isSystemAdmin ? null : <FarmingAreaSelector />}
        </div>
      </div>

      {/* ======================================
          RIGHT: USER AND LOGOUT
         ====================================== */}

      <div
        className={[
          "relative z-10",

          "flex shrink-0",
          "items-center gap-3",
        ].join(" ")}
      >
        {/* ACCOUNT */}
        <div className="group flex items-center gap-2.5">
          {/* AVATAR */}
          <div
            className={[
              "flex h-10 w-10",
              "shrink-0 items-center justify-center",

              "rounded-xl",

              "border border-[#77FF00]/20",
              "bg-[#77FF00]/[0.06]",
              "text-[#77FF00]",

              "transition-[background-color,border-color,box-shadow]",
              "duration-[220ms]",

              "group-hover:border-[#77FF00]/30",
              "group-hover:bg-[#77FF00]/[0.09]",
              "group-hover:shadow-[0_0_16px_rgba(119,255,0,0.05)]",
            ].join(" ")}
          >
            <UserRound size={19} aria-hidden="true" />
          </div>

          {/* USER INFO */}
          <div
            className={[
              "flex max-w-[165px]",
              "min-w-0 flex-col",

              "max-[1100px]:hidden",
            ].join(" ")}
          >
            <strong className="truncate text-xs font-semibold text-[#E5EEE6]">
              {user?.fullName || user?.username || t("common.administrator")}
            </strong>

            <span className="mt-1 truncate text-[10px] text-[#87988A]">
              {isSystemAdmin ? "System Administrator" : user?.role || "FarmAdministrator"}
            </span>
          </div>
        </div>

        {/* LOGOUT */}
        <Button
          type="button"
          variant="outline"
          onClick={handleLogout}
          disabled={loggingOut}
          aria-label={loggingOut ? t("common.loggingOut") : t("common.logout")}
          title={t("common.logout")}
          className={[
            "h-10 gap-2 rounded-xl",

            "border-[#2A3B2E]",
            "bg-[#111A13]",

            "px-3.5",

            "text-[#A3B3A6]",

            "transition-[background-color,border-color,color,box-shadow]",
            "duration-[220ms]",

            "hover:border-red-500/25",
            "hover:bg-red-500/[0.08]",
            "hover:text-red-400",
            "hover:shadow-[0_0_16px_rgba(239,68,68,0.04)]",

            "focus-visible:ring-2",
            "focus-visible:ring-red-500/20",

            "disabled:opacity-50",

            "max-[520px]:px-3",
          ].join(" ")}
        >
          <LogOut size={16} aria-hidden="true" />

          <span className="max-[520px]:hidden">
            {loggingOut ? t("common.loggingOut") : t("common.logout")}
          </span>
        </Button>
      </div>
    </header>
  );
}

export default AdminHeader;
