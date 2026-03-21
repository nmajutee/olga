import { NextRequest, NextResponse } from "next/server";
import { i18n } from "./i18n/config";

export const runtime = "experimental-edge";

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip internal files and special routes
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.includes(".")
  ) {
    return;
  }

  // Check if the pathname already has a locale
  const pathnameHasLocale = i18n.locales.some(
    (locale) =>
      pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );

  if (pathnameHasLocale) return;

  // Detect preferred locale
  const locale = getPreferredLocale(request);

  // Redirect to locale-prefixed URL
  return NextResponse.redirect(
    new URL(`/${locale}${pathname}`, request.url)
  );
}

function getPreferredLocale(request: NextRequest): string {
  // Check the cookie first
  const cookieLocale = request.cookies.get("NEXT_LOCALE")?.value;
  if (cookieLocale && i18n.locales.includes(cookieLocale as typeof i18n.locales[number])) {
    return cookieLocale;
  }

  // Check Accept-Language header
  const acceptLanguage = request.headers.get("accept-language") || "";
  if (acceptLanguage.toLowerCase().startsWith("fr")) return "fr";

  return i18n.defaultLocale;
}

export const config = {
  matcher: ["/((?!_next|api|.*\\..*).*)"],
};
