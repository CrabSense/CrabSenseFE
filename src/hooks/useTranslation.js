import { useCallback } from "react";

import { useSettings } from "../context/SettingsContext";
import { translations } from "../i18n/translations";

export default function useTranslation() {
  const { settings } = useSettings();

  const language = settings.language === "en" ? "en" : "vi";

  const t = useCallback(
    (key) => {
      const readKey = (dictionary) =>
        key.split(".").reduce((value, part) => value?.[part], dictionary);

      return readKey(translations[language]) ?? readKey(translations.en) ?? key;
    },
    [language],
  );

  return { t, language };
}
