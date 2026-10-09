import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

const STORAGE_KEY = "crabsense-settings";

export const DEFAULT_SETTINGS = {
  refreshInterval: 30,
  alertsEnabled: true,
  language: "vi",
};

function normalizeSettings(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return { ...DEFAULT_SETTINGS };
  }

  const interval = Number(value.refreshInterval);

  return {
    refreshInterval:
      Number.isInteger(interval) && interval >= 5 && interval <= 300
        ? interval
        : DEFAULT_SETTINGS.refreshInterval,

    alertsEnabled:
      typeof value.alertsEnabled === "boolean"
        ? value.alertsEnabled
        : DEFAULT_SETTINGS.alertsEnabled,

    language: ["vi", "en"].includes(value.language)
      ? value.language
      : DEFAULT_SETTINGS.language,
  };
}

function readStoredSettings() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);

    return raw ? normalizeSettings(JSON.parse(raw)) : { ...DEFAULT_SETTINGS };
  } catch (error) {
    console.error("Unable to read settings:", error);

    return { ...DEFAULT_SETTINGS };
  }
}

const SettingsContext = createContext(null);

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(readStoredSettings);

  // Keep Dark Mode permanently active.
  // Language remains controlled by Settings.
  useEffect(() => {
    const root = document.documentElement;

    root.classList.add("dark");
    root.classList.remove("light");

    root.lang = settings.language;
  }, [settings.language]);

  const saveSettings = useCallback((nextSettings) => {
    const rawInterval = String(nextSettings.refreshInterval).trim();

    const interval = Number(rawInterval);

    if (
      rawInterval === "" ||
      !Number.isInteger(interval) ||
      interval < 5 ||
      interval > 300
    ) {
      throw new Error("Refresh interval must be between 5 and 300 seconds.");
    }

    const normalized = normalizeSettings(nextSettings);

    localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));

    setSettings(normalized);

    return normalized;
  }, []);

  const value = useMemo(
    () => ({
      settings,
      saveSettings,
    }),
    [settings, saveSettings],
  );

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);

  if (!context) {
    throw new Error("useSettings must be used inside SettingsProvider.");
  }

  return context;
}

export default SettingsProvider;
