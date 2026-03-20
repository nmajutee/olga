"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useDictionary } from "@/i18n/dictionary-provider";

export default function NotFound() {
  const dict = useDictionary();
  const t = dict.notFound;
  const pathname = usePathname();
  const locale = pathname.split("/")[1] || "en";

  return (
    <section className="section" style={{ textAlign: "center", paddingTop: "6rem", paddingBottom: "6rem" }}>
      <div className="container">
        <span className="section-eyebrow">404</span>
        <h1 className="section-title" style={{ marginTop: "1rem" }}>{t.title}</h1>
        <p className="section-subtitle">{t.message}</p>
        <div style={{ marginTop: "2rem" }}>
          <Link href={`/${locale}`} className="btn btn-primary btn-lg">
            {t.cta}
          </Link>
        </div>
      </div>
    </section>
  );
}