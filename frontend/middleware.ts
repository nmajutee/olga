import { NextRequest, NextResponse } from "next/server";
import { i18n } from "./i18n/config";
import { getPreferredLocale } from "./lib/locale";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const pathnameHasLocale = i18n.locales.some(
    (locale) => pathname === `/${locale}` || pathname.startsWith(`/${locale}/`),
  );

  if (pathnameHasLocale) {
    return NextResponse.next();
  }

  const locale = getPreferredLocale({
    cookieLocale: request.cookies.get("NEXT_LOCALE")?.value,
    acceptLanguage: request.headers.get("accept-language"),
  });
  const url = request.nextUrl.clone();

  url.pathname = pathname === "/" ? `/${locale}` : `/${locale}${pathname}`;

  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|.*\\..*).*)"],
};