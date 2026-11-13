import { useEffect, useState } from "react";
import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { Activity, Menu, X, LogOut, Search, UserRound, Bell, ChevronRight, ChevronDown } from "lucide-react";
import authService from "../../services/authService";
import useTranslation from "../../hooks/useTranslation";
import ScrollToTop from "./ScrollToTop";

import { SYSTEM_ADMIN_GROUPS, SYSTEM_ADMIN_ITEMS } from "./systemAdminNav";

export default function OverviewLayout() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const currentPage = SYSTEM_ADMIN_ITEMS.find(item => item.to === pathname);
  const user = authService.getStoredUser();
  const [open, setOpen] = useState(false);
  const inDeviceGroup = pathname === "/system/devices" || pathname.startsWith("/system/devices/");
  const [devicesExpanded, setDevicesExpanded] = useState(inDeviceGroup);
  const [search, setSearch] = useState("");
  const [loggingOut, setLoggingOut] = useState(false);
  useEffect(() => {
    if (!open) return;
    const closeOnEscape = (event) => { if (event.key === "Escape") setOpen(false); };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [open]);
  useEffect(() => { setOpen(false); setSearch(""); }, [pathname]);
  // Reveal the active child when opening a direct link or using browser navigation.
  useEffect(() => {
    if (pathname === "/system/devices" || pathname.startsWith("/system/devices/")) setDevicesExpanded(true);
  }, [pathname]);
  const matches = SYSTEM_ADMIN_ITEMS.filter(({ labelKey }) => t(labelKey).toLocaleLowerCase().includes(search.trim().toLocaleLowerCase()));
  const logout = async () => {
    if (loggingOut) return;
    setLoggingOut(true);
    try { await authService.logout(); }
    catch (error) { console.error("Logout failed:", error); }
    finally { navigate("/login", { replace: true }); }
  };
  return (
    <div className="system-admin-light min-h-dvh bg-[#edf6f5] text-[#153b56] [color-scheme:light]">
      <ScrollToTop />
      {open && <button type="button" aria-label={t("nav.closeNavigation")} onClick={() => setOpen(false)} className="fixed inset-0 z-40 bg-[#153b56]/40 min-[901px]:hidden" />}
      <aside id="overview-sidebar" className={`fixed inset-y-3 left-3 z-50 flex w-[258px] flex-col overflow-hidden rounded-[24px] border border-white bg-[#fffffa] shadow-[0_8px_30px_rgba(22,72,80,0.1)] transition-transform min-[901px]:translate-x-0 ${open ? "translate-x-0" : "-translate-x-[110%]"}`}>
        <div className="relative shrink-0 border-b border-[#e2eeeb] px-4 pb-4 pt-5 text-center">
          <button type="button" onClick={() => setOpen(false)} aria-label={t("nav.closeNavigation")} className="absolute right-2 top-2 rounded-lg p-2 min-[901px]:hidden"><X size={19}/></button>
          <img src={import.meta.env.BASE_URL + "login/logo.png"} alt="CrabSense" className="mx-auto h-[76px] w-auto max-w-full object-contain" />
          <div className="mt-1 text-[26px] font-extrabold tracking-tight text-[#153b56]">CrabSense</div>
          <p className="mt-1 text-[11px] font-medium leading-snug text-[#526f79]">{t("login.farmTitle")}</p>
          <p className="mt-2 text-[10px] font-semibold uppercase tracking-wider text-[#138779]">System Administrator</p>
        </div>
        <nav aria-label={t("nav.mainNavigation")} className="min-h-0 flex-1 space-y-1 overflow-y-auto p-3">
          {SYSTEM_ADMIN_GROUPS.map(group => <section key={group.labelKey} className="mb-4 last:mb-0">
            <h2 className="mb-1.5 px-3 text-[10px] font-bold uppercase tracking-wider text-[#64818b]">{t(group.labelKey)}</h2>
            {group.items.filter(item => !item.child).map(({to,labelKey,icon:Icon}) => {
              if (to === "/system/devices") return (
                <div key={to}>
                  <button type="button" aria-expanded={devicesExpanded} aria-controls="system-device-submenu" onClick={() => setDevicesExpanded(value => !value)} className={`flex min-h-10 w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-[12px] font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-[#147e75] ${inDeviceGroup ? "bg-[#e4f5ed] text-[#13796e]" : "text-[#244b60] hover:bg-[#e6f4ee]"}`}>
                    <Icon size={17} aria-hidden="true" className="shrink-0"/>
                    <span className="min-w-0 flex-1">{t(labelKey)}</span>
                    <ChevronDown size={15} aria-hidden="true" className={`shrink-0 transition-transform motion-reduce:transition-none ${devicesExpanded ? "rotate-180" : ""}`}/>
                  </button>
                  <div id="system-device-submenu" hidden={!devicesExpanded} className="ml-5 mt-1 border-l border-[#d5e9e2] pl-2">
                    {group.items.filter(item => item.child).map(({to:childTo,labelKey:childKey,icon:ChildIcon}) => <NavLink key={childTo} to={childTo} end onClick={() => setOpen(false)} className={({isActive}) => `flex min-h-9 items-center gap-2 rounded-xl px-3 py-2 text-[12px] font-semibold no-underline transition-colors ${isActive ? "bg-gradient-to-r from-[#147a8f] to-[#2e9b5f] text-white shadow-sm" : "text-[#244b60] hover:bg-[#e6f4ee]"}`}><ChildIcon size={16} aria-hidden="true" className="shrink-0"/><span className="min-w-0 flex-1">{t(childKey)}</span></NavLink>)}
                  </div>
                </div>
              );
              return <NavLink key={to} to={to} end onClick={() => setOpen(false)} className={({isActive}) => `flex min-h-10 items-center gap-2.5 rounded-xl px-3 py-2 text-[12px] font-semibold no-underline transition-colors ${isActive ? "bg-gradient-to-r from-[#147a8f] to-[#2e9b5f] text-white shadow-sm" : "text-[#244b60] hover:bg-[#e6f4ee]"}`}><Icon size={17} aria-hidden="true" className="shrink-0"/><span className="min-w-0 flex-1">{t(labelKey)}</span></NavLink>;
            })}
          </section>)}
        </nav>
        <div className="relative shrink-0 overflow-hidden border-t border-[#dceee8] bg-gradient-to-br from-[#e9f7ef] to-[#bce5d5] px-4 py-4">
          <div aria-hidden="true" className="absolute -bottom-16 -right-16 h-40 w-48 rounded-[50%] border-8 border-white/50"/>
          <div className="relative flex items-center gap-2 text-[#13796e]"><Activity size={19}/><span className="text-xs font-bold">CrabSense</span></div>
          <p className="relative mt-1 text-[11px] leading-relaxed text-[#416d69]">{t("login.tagline")}</p>
        </div>
      </aside>
      <div className="min-w-0 min-[901px]:ml-[282px]">
        <header className="sticky top-0 z-30 flex flex-wrap items-center gap-3 border-b border-[#dcebe9] bg-[#f8fcfb]/95 px-4 py-3 backdrop-blur-lg sm:px-6">
          <button type="button" onClick={() => setOpen(true)} aria-label={t("nav.openNavigation")} aria-controls="overview-sidebar" aria-expanded={open} className="rounded-xl border border-[#d4e7e3] p-2 min-[901px]:hidden"><Menu size={20}/></button>
          <h1 className="min-w-0 mr-auto text-lg font-extrabold tracking-tight sm:text-[24px]">{t(currentPage?.labelKey || "nav.systemOverview")}</h1>
          <div className="relative order-3 w-full sm:order-none sm:w-[220px] xl:w-[300px]">
            <Search size={17} className="absolute left-3 top-3 text-[#66858d]" aria-hidden="true"/>
            <input value={search} onChange={e=>setSearch(e.target.value)} onKeyDown={e=>{if(e.key==="Escape")setSearch("");}} aria-label="Tìm trang quản trị" placeholder="Tìm trang quản trị..." className="h-10 w-full rounded-full border border-[#d6e6e7] bg-white pl-9 pr-4 text-sm outline-none focus:border-[#168b7e]"/>
            {search.trim() && <div className="absolute top-12 z-50 w-full rounded-xl border border-[#dcebe9] bg-white p-2 shadow-lg">{matches.length ? matches.map(({to,labelKey})=><Link key={to} to={to} onClick={()=>setSearch("")} className="flex items-center justify-between rounded-lg p-2 text-sm hover:bg-[#e6f4ee]">{t(labelKey)}<ChevronRight size={15}/></Link>) : <p className="p-2 text-xs text-[#66858d]">Không tìm thấy trang.</p>}</div>}
          </div>
          <Link to="/system/logs" aria-label="Nhật ký và cảnh báo" title="Nhật ký và cảnh báo" className="rounded-xl p-2 text-[#167d83] hover:bg-[#e5f3ef]"><Bell size={21}/></Link>
          <div className="flex items-center gap-2 border-l border-[#dcebe9] pl-3"><div className="grid h-9 w-9 place-items-center rounded-full bg-[#168b7e] text-white"><UserRound size={19}/></div><div className="hidden max-w-[140px] sm:block"><div className="truncate text-xs font-bold">{user?.fullName || user?.username || "System Admin"}</div><div className="text-[10px] text-[#66858d]">System Administrator</div></div></div>
          <button type="button" onClick={logout} disabled={loggingOut} aria-label={t("common.logout")} title={t("common.logout")} className="rounded-xl p-2 text-[#54737d] hover:bg-red-50 hover:text-red-600 disabled:opacity-50"><LogOut size={19}/></button>
        </header>
        <main className="mx-auto max-w-[1800px] px-4 pb-8 pt-5 sm:px-6"><Outlet /></main>
      </div>
    </div>
  );
}
