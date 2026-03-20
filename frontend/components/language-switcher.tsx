"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";

export function LanguageSwitcher() {
  const pathname = usePathname();

  const segments = pathname.split("/");
  const currentLocale = segments[1] || "en";
  const targetLocale = currentLocale === "fr" ? "en" : "fr";
  segments[1] = targetLocale;
  const targetPath = segments.join("/");

  return (
    <div className="lang-pill" role="radiogroup" aria-label="Language">
      {currentLocale === "en" ? (
        <>
          <span className="lang-pill-option lang-pill-active" aria-current="true">
            EN
          </span>
          <Link
            href={targetPath}
            className="lang-pill-option"
            aria-label="Passer en français"
            onClick={() => {
              document.cookie = `NEXT_LOCALE=fr;path=/;max-age=31536000`;
            }}
          >
            FR
          </Link>
        </>
      ) : (
        <>
          <Link
            href={targetPath}
            className="lang-pill-option"
            aria-label="Switch to English"
            onClick={() => {
              document.cookie = `NEXT_LOCALE=en;path=/;max-age=31536000`;
            }}
          >
            EN
          </Link>
          <span className="lang-pill-option lang-pill-active" aria-current="true">
            FR
          </span>
        </>
      )}
    </div>
  );
}
