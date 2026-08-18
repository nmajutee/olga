"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bars3Icon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { useDictionary } from "@/i18n/dictionary-provider";
import { LanguageSwitcher } from "./language-switcher";
import { Search } from "./search";

type NavLink = { href: string; label: string };

type NavigationProps = {
  links: NavLink[];
  brand: string;
  logoUrl?: string;
};

export function Navigation({ links, brand, logoUrl }: NavigationProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const dict = useDictionary();

  const closeMobile = useCallback(() => setMobileOpen(false), []);

  // Extract locale prefix from pathname (e.g., "/en" or "/fr")
  const segments = pathname.split("/");
  const locale = segments[1] || "en";
  const prefix = `/${locale}`;

  // Internal links are stored without a locale, so the prefix is added here;
  // external ones are passed through untouched.
  const navItems = links.map((item) => ({
    label: item.label,
    href: item.href.startsWith("http")
      ? item.href
      : item.href === "/"
        ? prefix
        : `${prefix}${item.href.startsWith("/") ? item.href : `/${item.href}`}`,
  }));

  // Check active state by comparing path without locale prefix
  const pathWithoutLocale = "/" + segments.slice(2).join("/");
  const isActive = (href: string) => {
    const hrefPath = href.replace(prefix, "") || "/";
    return pathWithoutLocale === hrefPath || pathWithoutLocale === hrefPath + "/";
  };

  return (
    <>
      <header className="site-header" role="banner">
        <div className="container">
          <div className="header-inner">
            <Link href={prefix} className="brand" aria-label={`${brand} | ${dict.nav.home}`}>
              {logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={logoUrl} alt={brand} className="brand-logo" />
              ) : (
                brand
              )}
            </Link>

            <nav className="nav-desktop" aria-label="Primary navigation">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`nav-link${isActive(item.href) ? " active" : ""}`}
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            <div className="nav-actions">
              <Link href={`${prefix}/contact`} className="nav-cta">
                {dict.nav.letsTalk}
              </Link>
              <Search />
              <LanguageSwitcher />
              <button
                className="nav-toggle"
                onClick={() => setMobileOpen(true)}
                aria-label={dict.nav.openMenu}
                aria-expanded={mobileOpen}
              >
                <Bars3Icon width={24} height={24} aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Navigation Overlay */}
      {mobileOpen && (
        <div className="mobile-nav is-open" role="dialog" aria-label="Navigation menu">
          <button
            className="mobile-nav-close"
            onClick={closeMobile}
            aria-label={dict.nav.closeMenu}
          >
            <XMarkIcon width={24} height={24} aria-hidden="true" />
          </button>

          <nav aria-label="Mobile navigation">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="mobile-nav-link"
                onClick={closeMobile}
              >
                {item.label}
              </Link>
            ))}
            <div className="mobile-nav-actions">
              <LanguageSwitcher />
            </div>
            <Link
              href={`${prefix}/contact`}
              className="btn btn-dark btn-lg"
              onClick={closeMobile}
              style={{ marginTop: "2rem" }}
            >
              {dict.nav.letsTalk}
            </Link>
          </nav>
        </div>
      )}
    </>
  );
}
