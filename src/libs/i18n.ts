import i18next from "i18next";
import { initReactI18next } from "react-i18next";
import * as Localization from "expo-localization";
import { storage } from "@/utils/storage";

import ja from "@/locales/ja.json";
import en from "@/locales/en.json";

const LANGUAGE_KEY = "language";

function getInitialLanguage(): string {
  const saved = storage.get<string | null>(LANGUAGE_KEY, null);
  if (saved) return saved;

  const locales = Localization.getLocales();
  const languageCode = locales[0]?.languageCode ?? "en";
  return languageCode === "ja" ? "ja" : "en";
}

i18next.use(initReactI18next).init({
  resources: {
    ja: { translation: ja },
    en: { translation: en },
  },
  lng: getInitialLanguage(),
  fallbackLng: "en",
  interpolation: {
    escapeValue: false,
  },
});

export { i18next };
export const LANGUAGE_STORAGE_KEY = LANGUAGE_KEY;
