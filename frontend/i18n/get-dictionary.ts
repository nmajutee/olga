import { i18n, isLocale, type Locale } from "./config";

const dictionaries = {
  en: () => import("./dictionaries/en").then((m) => m.default),
  fr: () => import("./dictionaries/fr").then((m) => m.default),
};

export const getDictionary = async (locale: string) => {
  const resolvedLocale: Locale = isLocale(locale)
    ? locale
    : i18n.defaultLocale;

  return dictionaries[resolvedLocale]();
};

export type Dictionary = Awaited<ReturnType<typeof getDictionary>>;
