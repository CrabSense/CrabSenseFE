import { Gauge, Cpu, Cctv, Radio, Activity, Brain, CalendarClock, HardDrive, DatabaseBackup, Shield, Rocket, ScrollText } from "lucide-react";

export const SYSTEM_ADMIN_GROUPS = [
  { labelKey: "nav.systemOverviewGroup", items: [
    { to: "/system", labelKey: "nav.systemOverview", icon: Gauge },
  ] },
  { labelKey: "nav.systemDevicesGroup", items: [
    { to: "/system/devices", labelKey: "nav.deviceManagement", icon: Cpu },
    { to: "/system/devices/cameras", labelKey: "nav.manageCameras", icon: Cctv, child: true },
    { to: "/system/devices/sensors", labelKey: "nav.manageSensors", icon: Radio, child: true },
    { to: "/system/devices/controllers", labelKey: "nav.manageControllers", icon: Cpu, child: true },
    { to: "/system/device-monitoring", labelKey: "nav.deviceMonitoring", icon: Activity },
  ] },
  { labelKey: "nav.systemAiGroup", items: [
    { to: "/system/ai", labelKey: "nav.aiManager", icon: Brain },
    { to: "/system/cameras", labelKey: "nav.recordingSchedule", icon: CalendarClock },
  ] },
  { labelKey: "nav.systemDataGroup", items: [
    { to: "/system/storage", labelKey: "nav.storageManagement", icon: HardDrive },
    { to: "/system/backup", labelKey: "nav.backupRecovery", icon: DatabaseBackup },
  ] },
  { labelKey: "nav.systemOperationsGroup", items: [
    { to: "/system/security", labelKey: "nav.systemSecurity", icon: Shield },
    { to: "/system/deployment", labelKey: "nav.deployment", icon: Rocket },
    { to: "/system/logs", labelKey: "nav.systemLogs", icon: ScrollText },
  ] },
];
export const SYSTEM_ADMIN_ITEMS = SYSTEM_ADMIN_GROUPS.flatMap(group => group.items);
