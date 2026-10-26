import PropTypes from "prop-types";
import {
  BarChart3,
  Boxes,
  Brain,
  Cctv,
  Cpu,
  Gauge,
  HardDrive,
  MonitorDot,
  Rocket,
  ScrollText,
  Settings,
  Shield,
  ChevronsLeft,
  X,
  ShieldCheck,
  Activity,
  ChevronRight,
  UsersRound,
  Waves,
  BellRing,
  SlidersHorizontal,
  ClipboardList,
} from "lucide-react";

import { Button } from "@/components/ui/button";

import logo from "../../assets/LOGO2.png";
import SidebarNavItem from "./SidebarNavItem.jsx";
import useTranslation from "../../hooks/useTranslation";
import authService from "../../services/authService";
import { isSystemAdministratorRole } from "../../constants/roles";

const MAIN_NAV_ITEMS = [
  {
    to: "/dashboard",
    labelKey: "nav.dashboard",
    icon: Gauge,
  },
  {
    to: "/monitoring",
    labelKey: "nav.monitoring",
    icon: MonitorDot,
  },
  {
    to: "/analytics",
    labelKey: "nav.analytics",
    icon: BarChart3,
  },
  {
    to: "/farm-management",
    labelKey: "nav.farmManagement",
    icon: Boxes,
  },
  {
    to: "/farm-users",
    labelKey: "nav.employeeManagement",
    icon: UsersRound,
    adminOnly: true,
  },
  {
    to: "/ras-management",
    labelKey: "nav.rasManagement",
    icon: Waves,
    adminOnly: true,
  },
  {
    to: "/alerts",
    labelKey: "nav.alertManagement",
    icon: BellRing,
    adminOnly: true,
  },
  {
    to: "/environmental-thresholds",
    labelKey: "nav.environmentalThresholds",
    icon: SlidersHorizontal,
    adminOnly: true,
  },
  {
    to: "/operational-reports",
    labelKey: "nav.operationalReports",
    icon: ClipboardList,
    adminOnly: true,
  },
];

const SYSTEM_NAV_ITEMS = [
  {
    to: "/settings",
    labelKey: "nav.settings",
    icon: Settings,
  },
];

const SYSTEM_ADMIN_GROUPS = [
  {
    labelKey: null,
    items: [
      {
        to: "/system",
        labelKey: "nav.systemOverview",
        icon: Gauge,
      },
    ],
  },
  {
    labelKey: "nav.deviceAi",
    items: [
      {
        to: "/system/devices",
        labelKey: "nav.deviceManagement",
        icon: Cpu,
      },
      {
        to: "/system/cameras",
        labelKey: "nav.cameraRecording",
        icon: Cctv,
      },
      {
        to: "/system/ai",
        labelKey: "nav.aiServices",
        icon: Brain,
      },
    ],
  },
  {
    labelKey: "nav.infrastructure",
    items: [
      {
        to: "/system/storage",
        labelKey: "nav.storageBackup",
        icon: HardDrive,
      },
      {
        to: "/system/deployment",
        labelKey: "nav.deployment",
        icon: Rocket,
      },
    ],
  },
  {
    labelKey: "nav.securityGroup",
    items: [
      {
        to: "/system/security",
        labelKey: "nav.securityAccess",
        icon: Shield,
      },
      {
        to: "/system/logs",
        labelKey: "nav.systemLogs",
        icon: ScrollText,
      },
    ],
  },
];

function Sidebar({
  collapsed = false,
  mobileOpen = false,
  onToggleCollapse,
  onCloseMobile,
}) {
  const { t } = useTranslation();
  const user = authService.getStoredUser();
  const isSystemAdmin = isSystemAdministratorRole(user?.role);

  // Hide text immediately when collapsing.
  // Reveal it only after the sidebar has
  // almost completed expanding.
  const textMotion = [
    "transition-opacity",
    "duration-[180ms]",
    "ease-out",
    "motion-reduce:transition-none",
    collapsed
      ? [
          "min-[901px]:opacity-0",
          "min-[901px]:invisible",
          "min-[901px]:delay-0",
        ].join(" ")
      : [
          "min-[901px]:opacity-100",
          "min-[901px]:visible",
          "min-[901px]:delay-[270ms]",
        ].join(" "),
    "max-[900px]:opacity-100",
    "max-[900px]:visible",
  ].join(" ");

  return (
    <>
      {/* MOBILE OVERLAY */}
      {mobileOpen && (
        <button
          type="button"
          aria-label={t("nav.closeNavigation")}
          onClick={onCloseMobile}
          className={[
            "fixed inset-0 z-[90]",
            "bg-[#020503]/80",
            "backdrop-blur-sm",
            "min-[901px]:hidden",
          ].join(" ")}
        />
      )}

      <aside
        id="crabsense-sidebar"
        aria-label={t("nav.mainNavigation")}
        className={[
          "fixed inset-y-0 left-0 z-[100]",
          "flex h-dvh flex-col",
          "overflow-visible",

          "border-r border-[#77FF00]/10",
          "bg-[#080D09]",
          "shadow-[12px_0_40px_rgba(0,0,0,0.25)]",

          "transition-[width,transform]",
          "duration-[320ms]",
          "ease-[cubic-bezier(0.22,1,0.36,1)]",
          "motion-reduce:transition-none",

          collapsed ? "min-[901px]:w-[80px]" : "min-[901px]:w-[272px]",

          "max-[900px]:w-[272px]",

          mobileOpen
            ? "max-[900px]:translate-x-0"
            : "max-[900px]:-translate-x-full",
        ].join(" ")}
      >
        {/* FLOATING TOGGLE */}
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={onToggleCollapse}
          aria-label={
            collapsed ? t("nav.expandSidebar") : t("nav.collapseSidebar")
          }
          aria-expanded={!collapsed}
          aria-controls="crabsense-sidebar"
          title={collapsed ? t("nav.expandSidebar") : t("nav.collapseSidebar")}
          className={[
            "absolute -right-[14px] top-[86px] z-30",
            "flex h-9 w-7 shrink-0",
            "items-center justify-center rounded-lg",

            "border border-[#37523B]",
            "bg-[#142319] text-[#A4C99A]",
            "shadow-[3px_4px_14px_rgba(0,0,0,0.4)]",

            "transition-[background-color,border-color,box-shadow,transform]",
            "duration-200 ease-out",

            "hover:scale-105",
            "hover:border-[#77FF00]/60",
            "hover:bg-[#203A24]",
            "hover:text-[#77FF00]",
            "active:scale-95",

            "focus-visible:ring-2",
            "focus-visible:ring-[#77FF00]/40",
            "max-[900px]:hidden",
          ].join(" ")}
        >
          <ChevronsLeft
            size={17}
            strokeWidth={2}
            aria-hidden="true"
            className={[
              "transition-transform",
              "duration-[320ms]",
              "ease-in-out",
              "motion-reduce:transition-none",
              collapsed ? "rotate-180" : "rotate-0",
            ].join(" ")}
          />
        </Button>

        {/* BRAND HEADER */}
        <div className="shrink-0 border-b border-white/[0.06] px-3 py-5">
          <div className="relative flex h-[49px] items-center">
            {/* LOGO MOVEMENT */}
            <div
              className={[
                "absolute top-1/2",
                "flex h-12 w-12",
                "items-center justify-center",
                "-translate-y-1/2",

                "rounded-xl",
                "border border-[#77FF00]/15",
                "bg-[#77FF00]/[0.05]",

                "transition-[left,transform]",
                "duration-[320ms]",
                "ease-[cubic-bezier(0.22,1,0.36,1)]",
                "motion-reduce:transition-none",

                collapsed
                  ? [
                      "min-[901px]:left-1/2",
                      "min-[901px]:-translate-x-1/2",
                    ].join(" ")
                  : ["min-[901px]:left-0", "min-[901px]:translate-x-0"].join(
                      " ",
                    ),

                "max-[900px]:left-0",
                "max-[900px]:translate-x-0",
              ].join(" ")}
            >
              <img
                src={logo}
                alt="CrabSense"
                className="h-11 w-11 object-contain"
              />
            </div>

            {/* BRAND TEXT */}
            <div
              className={[
                "ml-[60px] min-w-0 flex-1",
                "overflow-hidden whitespace-nowrap",
                textMotion,
              ].join(" ")}
            >
              <strong className="block truncate text-[17px] font-bold tracking-[-0.4px] text-[#F4F7F4]">
                CrabSense
              </strong>

              <span className="mt-1 block truncate text-[9px] font-semibold uppercase tracking-[0.11em] text-[#8B9B8E]">
                {isSystemAdmin ? t("nav.systemRole") : t("nav.adminPortal")}
              </span>
            </div>

            {/* MOBILE CLOSE */}
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={onCloseMobile}
              aria-label={t("nav.closeNavigation")}
              className={[
                "ml-auto hidden h-9 w-9 shrink-0",
                "rounded-lg text-[#98A99B]",
                "hover:bg-white/5",
                "hover:text-[#F4F7F4]",
                "max-[900px]:inline-flex",
              ].join(" ")}
            >
              <X size={19} />
            </Button>
          </div>
        </div>

        {/* SCROLLABLE NAVIGATION */}
        <div
          className={[
            "min-h-0 flex-1",
            "overflow-y-auto overflow-x-hidden",
            "px-3 py-5",

            // Prevent scrollbar flash.
            "[scrollbar-width:none]",
            "[-ms-overflow-style:none]",
            "[&::-webkit-scrollbar]:hidden",
          ].join(" ")}
        >
          {/* WORKSPACE CARD */}
          <div
            className={[
              "overflow-hidden rounded-xl",
              "border border-[#77FF00]/10",
              "bg-[#77FF00]/[0.035]",

              "transition-[max-height,margin,padding,border-color,opacity]",
              "duration-[320ms]",
              "ease-in-out",
              "motion-reduce:transition-none",

              collapsed
                ? [
                    "min-[901px]:max-h-0",
                    "min-[901px]:mb-0",
                    "min-[901px]:p-0",
                    "min-[901px]:opacity-0",
                    "min-[901px]:border-transparent",
                  ].join(" ")
                : [
                    "min-[901px]:max-h-[130px]",
                    "min-[901px]:mb-7",
                    "min-[901px]:p-3.5",
                    "min-[901px]:opacity-100",
                  ].join(" "),

              "max-[900px]:mb-7",
              "max-[900px]:max-h-[130px]",
              "max-[900px]:p-3.5",
              "max-[900px]:opacity-100",
            ].join(" ")}
          >
            <div className={textMotion}>
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#77FF00]/10">
                  <Activity
                    size={15}
                    aria-hidden="true"
                    className="text-[#77FF00]"
                  />
                </div>

                <strong className="min-w-0 flex-1 truncate text-[11px] font-semibold text-[#E4EFE5]">
                  {isSystemAdmin ? t("nav.systemWorkspace") : t("nav.farmWorkspace")}
                </strong>

                <span
                  aria-hidden="true"
                  className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#77FF00]"
                />
              </div>

              <p className="mt-2.5 text-[10px] leading-[1.7] text-[#8D9D90]">
                {isSystemAdmin
                  ? t("nav.systemWorkspaceDescription")
                  : t("nav.workspaceDescription")}
              </p>
            </div>
          </div>

          {(isSystemAdmin
            ? SYSTEM_ADMIN_GROUPS
            : [
                { labelKey: "nav.mainMenu", items: MAIN_NAV_ITEMS },
                { labelKey: "nav.systemMenu", items: SYSTEM_NAV_ITEMS },
              ]
          ).map((group, index) => (
            <div key={group.labelKey || "overview"} className={index ? "mt-5" : ""}>
              {index > 0 ? <div className="mb-5 h-px bg-white/[0.07]" /> : null}
              {group.labelKey ? (
                <div
                  className={[
                    "overflow-hidden",
                    "text-[10px] font-bold uppercase",
                    "tracking-[0.16em] text-[#728575]",
                    "transition-[max-height,margin,opacity]",
                    "duration-[320ms]",
                    "ease-in-out",
                    "motion-reduce:transition-none",
                    collapsed
                      ? "min-[901px]:mb-0 min-[901px]:max-h-0 min-[901px]:opacity-0"
                      : "min-[901px]:mb-3 min-[901px]:max-h-8 min-[901px]:opacity-100",
                    "mb-3 max-h-8 max-[900px]:opacity-100",
                  ].join(" ")}
                >
                  <span className={["block whitespace-nowrap px-3", textMotion].join(" ")}>
                    {t(group.labelKey)}
                  </span>
                </div>
              ) : null}
              <nav className="flex flex-col gap-1.5">
              {group.items.filter((item) => ! item.adminOnly || user?.role === "FarmAdministrator").map((item) => (
                  <SidebarNavItem
                    key={item.to}
                    to={item.to}
                    icon={item.icon}
                    label={t(item.labelKey)}
                    collapsed={collapsed}
                    onClick={onCloseMobile}
                  />
                ))}
              </nav>
            </div>
          ))}
        </div>

        {/* FOOTER */}
        <div className="shrink-0 border-t border-white/[0.06] p-3">
          <div
            className={[
              "relative flex h-[64px]",
              "items-center overflow-hidden rounded-xl",
              "border border-[#77FF00]/10",
              "bg-[#111C13]",
            ].join(" ")}
          >
            {/* FOOTER ICON */}
            <div
              className={[
                "absolute top-1/2",
                "flex h-10 w-10",
                "items-center justify-center",
                "-translate-y-1/2",
                "rounded-xl",
                "border border-[#77FF00]/15",
                "bg-[#77FF00]/[0.08]",

                "transition-[left,transform]",
                "duration-[320ms]",
                "ease-[cubic-bezier(0.22,1,0.36,1)]",
                "motion-reduce:transition-none",

                collapsed
                  ? [
                      "min-[901px]:left-1/2",
                      "min-[901px]:-translate-x-1/2",
                    ].join(" ")
                  : ["min-[901px]:left-2", "min-[901px]:translate-x-0"].join(
                      " ",
                    ),

                "max-[900px]:left-2",
                "max-[900px]:translate-x-0",
              ].join(" ")}
            >
              <ShieldCheck
                size={20}
                aria-hidden="true"
                className="text-[#77FF00]"
              />
            </div>

            {/* FOOTER TEXT */}
            <div
              className={[
                "ml-[60px] min-w-0 flex-1",
                "overflow-hidden whitespace-nowrap",
                textMotion,
              ].join(" ")}
            >
              <strong className="block truncate text-[11px] font-semibold text-[#E3EDE5]">
                {isSystemAdmin ? t("nav.systemRole") : t("nav.platform")}
              </strong>

              <span className="mt-1 block truncate text-[10px] text-[#8D9D90]">
                {isSystemAdmin
                  ? user?.email || user?.username || t("nav.systemAdministration")
                  : t("nav.systemAdministration")}
              </span>
            </div>

            <ChevronRight
              size={15}
              aria-hidden="true"
              className={["mr-2 shrink-0 text-[#657F68]", textMotion].join(" ")}
            />
          </div>
        </div>
      </aside>
    </>
  );
}

Sidebar.propTypes = {
  collapsed: PropTypes.bool,
  mobileOpen: PropTypes.bool,
  onToggleCollapse: PropTypes.func,
  onCloseMobile: PropTypes.func,
};

export default Sidebar;
