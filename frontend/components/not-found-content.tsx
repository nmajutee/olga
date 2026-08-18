"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

/**
 * Shared 404 body.
 *
 * Deliberately self-contained: it carries its own copy rather than reading the
 * dictionary provider. Next renders the not-found boundary outside that
 * provider, which is why the localised page was never reaching the visitor —
 * the root fallback was rendering every time.
 */
const COPY = {
  en: {
    title: "That page is not here",
    message:
      "The link may be out of date, or the page may have moved. Nothing is lost — here is where to go instead.",
    home: "Back to the homepage",
    destinations: [
      { path: "/blog", label: "Writing", hint: "Articles on digital rights, media literacy and communications practice." },
      { path: "/services", label: "Services", hint: "Strategy, training and communications support." },
      { path: "/portfolio", label: "Portfolio", hint: "Selected work and collaborations." },
      { path: "/contact", label: "Contact", hint: "Start a conversation about a project." },
    ],
  },
  fr: {
    title: "Cette page n'est pas ici",
    message:
      "Le lien est peut-être obsolète, ou la page a été déplacée. Rien n'est perdu — voici où aller.",
    home: "Retour à l'accueil",
    destinations: [
      { path: "/blog", label: "Articles", hint: "Droits numériques, éducation aux médias et pratique de la communication." },
      { path: "/services", label: "Services", hint: "Stratégie, formation et accompagnement en communication." },
      { path: "/portfolio", label: "Portfolio", hint: "Travaux et collaborations sélectionnés." },
      { path: "/contact", label: "Contact", hint: "Discutons de votre projet." },
    ],
  },
} as const;

export function NotFoundContent() {
  const pathname = usePathname();
  const segment = pathname.split("/")[1];
  const locale = segment === "fr" ? "fr" : "en";
  const t = COPY[locale];
  const prefix = `/${locale}`;

  return (
    <section className="section" aria-labelledby="notfound-heading">
      <div className="container">
        <div className="notfound">
          <span className="section-eyebrow">404</span>
          <h1 id="notfound-heading" className="section-title">
            {t.title}
          </h1>
          <p className="section-subtitle">{t.message}</p>

          <div className="notfound-actions">
            <Link href={prefix} className="btn btn-primary btn-lg">
              {t.home}
            </Link>
          </div>

          <div className="notfound-grid">
            {t.destinations.map((destination) => (
              <Link
                key={destination.path}
                href={`${prefix}${destination.path}`}
                className="notfound-card"
              >
                <span className="notfound-card-label">{destination.label}</span>
                <span className="notfound-card-hint">{destination.hint}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
