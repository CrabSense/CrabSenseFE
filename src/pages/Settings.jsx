import { useEffect, useState } from "react";

import {
  Settings2,
  Monitor,
  Activity,
  Languages,
  Bell,
  RefreshCw,
  Save,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { useSettings } from "../context/SettingsContext";
import useTranslation from "../hooks/useTranslation";

// Shared entrance animation
import PageReveal from "../components/ui/PageReveal";

const inputClassName = [
  "border-[#24382A]",
  "bg-[#050806] text-[#F4F7F4]",
  "focus-visible:border-[#77FF00]/40",
  "focus-visible:ring-[#77FF00]/15",
].join(" ");

function Settings() {
  const { settings: savedSettings, saveSettings } = useSettings();

  const { t } = useTranslation();

  const [settings, setSettings] = useState(() => ({ ...savedSettings }));

  const [message, setMessage] = useState(null);

  // Synchronize local form with saved settings
  useEffect(() => {
    setSettings({ ...savedSettings });
  }, [savedSettings]);

  const hasChanges =
    String(settings.refreshInterval) !==
      String(savedSettings.refreshInterval) ||
    settings.language !== savedSettings.language;

  // ============================================
  // CHANGE HANDLER
  // ============================================

  const handleChange = (field, value) => {
    setSettings((current) => ({
      ...current,
      [field]: value,
    }));

    setMessage(null);
  };

  // ============================================
  // SAVE SETTINGS
  // ============================================

  const handleSave = () => {
    const raw = String(settings.refreshInterval).trim();

    const seconds = Number(raw);

    if (
      raw === "" ||
      !Number.isInteger(seconds) ||
      seconds < 5 ||
      seconds > 300
    ) {
      setMessage({
        type: "error",
        text: t("settings.invalidInterval"),
      });

      return;
    }

    try {
      saveSettings({
        ...savedSettings,
        language: settings.language,
        refreshInterval: seconds,
      });

      setMessage({
        type: "success",
        text: t("settings.saved"),
      });
    } catch (error) {
      console.error("Save settings failed:", error);

      setMessage({
        type: "error",
        text: t("settings.saveFailed"),
      });
    }
  };

  // ============================================
  // CANCEL CHANGES
  // ============================================

  const handleCancel = () => {
    setSettings({ ...savedSettings });
    setMessage(null);
  };

  // ============================================
  // SETTINGS PAGE
  // ============================================

  return (
    <main className="mx-auto w-full min-w-0 max-w-[1600px] space-y-6 text-[#F4F7F4]">
      {/* ======================================
          1. SETTINGS HEADER
          Delay: 0ms
         ====================================== */}

      <PageReveal delay={0}>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="mb-2 flex items-center gap-2 text-[#77FF00]">
              <Settings2 size={15} />

              <span className="text-[10px] font-bold uppercase tracking-[0.15em]">
                {t("settings.eyebrow")}
              </span>
            </div>

            <h1 className="text-2xl font-semibold tracking-tight text-[#F4F7F4] sm:text-3xl">
              {t("settings.title")}
            </h1>

            <p className="mt-2 text-sm text-[#8C9A90]">
              {t("settings.description")}
            </p>
          </div>

          <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-[#77FF00]/20 bg-[#77FF00]/5">
            <Settings2 size={20} className="text-[#77FF00]" />
          </div>
        </div>
      </PageReveal>

      {/* ======================================
          2. SETTINGS CARDS
         ====================================== */}

      <div className="grid min-w-0 grid-cols-1 items-start gap-5 xl:grid-cols-2">
        {/* ====================================
            DISPLAY / LANGUAGE SETTINGS
            Delay: 90ms
           ==================================== */}

        <PageReveal delay={90} className="h-full">
          <Card className="h-full gap-0 border-[#24382A] bg-[#0D1510] py-0 text-[#F4F7F4] shadow-none">
            <CardHeader className="border-b border-[#24382A] px-5 py-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#77FF00]/10">
                  <Monitor size={19} className="text-[#77FF00]" />
                </div>

                <div className="min-w-0">
                  <CardTitle className="text-base text-[#F4F7F4]">
                    {t("settings.display")}
                  </CardTitle>

                  <CardDescription className="mt-1 text-xs text-[#8C9A90]">
                    {t("settings.displayDescription")}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent className="px-5 py-5">
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Languages
                    size={17}
                    className="mt-0.5 shrink-0 text-[#77FF00]"
                  />

                  <div className="min-w-0">
                    <Label
                      htmlFor="settings-language"
                      className="text-[#DCE4DE]"
                    >
                      {t("settings.language")}
                    </Label>

                    <p className="mt-1 text-xs text-[#8C9A90]">
                      {t("settings.languageDescription")}
                    </p>
                  </div>
                </div>

                <select
                  id="settings-language"
                  value={settings.language}
                  onChange={(event) =>
                    handleChange("language", event.target.value)
                  }
                  className={[
                    "h-10 w-full rounded-lg",
                    "border border-[#24382A]",
                    "bg-[#050806] px-3",
                    "text-sm text-[#F4F7F4]",
                    "outline-none",
                    "transition-[border-color,box-shadow]",
                    "duration-200",
                    "focus:border-[#77FF00]/40",
                    "focus:ring-2 focus:ring-[#77FF00]/15",
                  ].join(" ")}
                >
                  <option value="vi">Tiếng Việt</option>

                  <option value="en">English</option>
                </select>
              </div>
            </CardContent>
          </Card>
        </PageReveal>

        {/* ====================================
            MONITORING SETTINGS
            Delay: 170ms
           ==================================== */}

        <PageReveal delay={170} className="h-full">
          <Card className="h-full gap-0 border-[#24382A] bg-[#0D1510] py-0 text-[#F4F7F4] shadow-none">
            <CardHeader className="border-b border-[#24382A] px-5 py-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#77FF00]/10">
                  <Activity size={19} className="text-[#77FF00]" />
                </div>

                <div className="min-w-0">
                  <CardTitle className="text-base text-[#F4F7F4]">
                    {t("settings.monitoring")}
                  </CardTitle>

                  <CardDescription className="mt-1 text-xs text-[#8C9A90]">
                    {t("settings.monitoringDescription")}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-5 px-5 py-5">
              {/* REFRESH INTERVAL */}
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <RefreshCw
                    size={17}
                    className="mt-0.5 shrink-0 text-[#77FF00]"
                  />

                  <div className="min-w-0">
                    <Label
                      htmlFor="settings-refresh"
                      className="text-[#DCE4DE]"
                    >
                      {t("settings.refreshInterval")}
                    </Label>

                    <p className="mt-1 text-xs text-[#8C9A90]">
                      {t("settings.refreshDescription")}
                    </p>
                  </div>
                </div>

                <div className="relative">
                  <Input
                    id="settings-refresh"
                    type="number"
                    min={5}
                    max={300}
                    step={1}
                    value={settings.refreshInterval}
                    onChange={(event) =>
                      handleChange("refreshInterval", event.target.value)
                    }
                    className={`${inputClassName} pr-20`}
                  />

                  <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#8C9A90]">
                    {t("settings.seconds")}
                  </span>
                </div>
              </div>

              <div className="h-px bg-[#24382A]" />

              {/* ALERTS - TEMPORARILY DISABLED */}
              <div className="flex items-center justify-between gap-4 opacity-60">
                <div className="flex items-start gap-3">
                  <Bell size={17} className="mt-0.5 shrink-0 text-[#77FF00]" />

                  <div className="min-w-0">
                    <Label htmlFor="settings-alerts" className="text-[#DCE4DE]">
                      {t("settings.alerts")}
                    </Label>

                    <p className="mt-1 text-xs text-[#8C9A90]">
                      {t("settings.alertsDescription")}
                    </p>
                  </div>
                </div>

                <input
                  id="settings-alerts"
                  type="checkbox"
                  role="switch"
                  checked={Boolean(settings.alertsEnabled)}
                  disabled
                  readOnly
                  className="h-4 w-4 shrink-0 accent-[#77FF00]"
                />
              </div>
            </CardContent>
          </Card>
        </PageReveal>
      </div>

      {/* ======================================
          3. FEEDBACK MESSAGE
          No delay for immediate feedback
         ====================================== */}

      {message && (
        <PageReveal key={`${message.type}-${message.text}`} delay={0}>
          <div
            role={message.type === "error" ? "alert" : "status"}
            className={[
              "flex items-center gap-3",
              "rounded-xl border p-4 text-sm",

              message.type === "success"
                ? [
                    "border-[#77FF00]/25",
                    "bg-[#77FF00]/5",
                    "text-[#77FF00]",
                  ].join(" ")
                : ["border-red-500/30", "bg-red-500/5", "text-red-400"].join(
                    " ",
                  ),
            ].join(" ")}
          >
            {message.type === "success" ? (
              <CheckCircle2 size={18} className="shrink-0" />
            ) : (
              <AlertCircle size={18} className="shrink-0" />
            )}

            <span>{message.text}</span>
          </div>
        </PageReveal>
      )}

      {/* ======================================
          4. ACTIONS / SAVE & CANCEL
          Delay: 250ms
         ====================================== */}

      <PageReveal delay={250}>
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-[#24382A] bg-[#0D1510] p-4">
          <span className="text-xs text-[#8C9A90]">
            {hasChanges ? t("settings.unsaved") : t("settings.upToDate")}
          </span>

          <div className="flex flex-wrap gap-2">
            {/* CANCEL */}
            <Button
              type="button"
              variant="outline"
              disabled={!hasChanges}
              onClick={handleCancel}
              className={[
                "gap-2",
                "border-[#24382A]",
                "bg-[#050806]",
                "text-[#DCE4DE]",
                "transition-colors duration-200",
                "hover:bg-[#17251B]",
                "hover:text-white",
              ].join(" ")}
            >
              <RotateCcw size={15} />
              {t("common.cancel")}
            </Button>

            {/* SAVE */}
            <Button
              type="button"
              disabled={!hasChanges}
              onClick={handleSave}
              className={[
                "gap-2",
                "bg-[#77FF00]",
                "font-semibold",
                "text-[#050806]",
                "transition-[background-color,box-shadow]",
                "duration-200",
                "hover:bg-[#63E600]",
                "hover:shadow-[0_0_16px_rgba(119,255,0,0.15)]",
              ].join(" ")}
            >
              <Save size={15} />
              {t("common.save")}
            </Button>
          </div>
        </div>
      </PageReveal>
    </main>
  );
}

export default Settings;
