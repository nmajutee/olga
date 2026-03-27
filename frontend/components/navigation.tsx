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

export function Navigation() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const dict = useDictionary();

  const closeMobile = useCallback(() => setMobileOpen(false), []);

  // Extract locale prefix from pathname (e.g., "/en" or "/fr")
  const segments = pathname.split("/");
  const locale = segments[1] || "en";
  const prefix = `/${locale}`;

  const navItems = [
    { href: `${prefix}`, label: dict.nav.home },
    { href: `${prefix}/about`, label: dict.nav.about },
    { href: `${prefix}/portfolio`, label: dict.nav.portfolio },
    { href: `${prefix}/services`, label: dict.nav.services },
    { href: `${prefix}/blog`, label: dict.nav.blog },
  ];

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
            <Link href={prefix} className="brand" aria-label="Olga Emma Elume | Home">
              Olga Emma Elume
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
