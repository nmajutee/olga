import type { Locale } from "./config";

const dictionaries = {
  en: () => import("./dictionaries/en").then((m) => m.default),
  fr: () => import("./dictionaries/fr").then((m) => m.default),
};

export const getDictionary = async (locale: string) =>
  dictionaries[locale as Locale]?.() ?? dictionaries.en();

export type Dictionary = Awaited<ReturnType<typeof getDictionary>>;
