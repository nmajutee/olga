import { i18n, isLocale, type Locale } from "@/i18n/config";

export function getPreferredLocale(options?: {
  cookieLocale?: string | null;
  acceptLanguage?: string | null;
}): Locale {
  const cookieLocale = options?.cookieLocale;

  if (cookieLocale && isLocale(cookieLocale)) {
    return cookieLocale;
  }

  const acceptLanguage = options?.acceptLanguage ?? "";
  const preferredLanguage = acceptLanguage
    .split(",")
    .map((entry) => entry.trim().split(";")[0]?.toLowerCase())
    .find(Boolean);

  if (preferredLanguage?.startsWith("fr")) {
    return "fr";
  }

  return i18n.defaultLocale;
}