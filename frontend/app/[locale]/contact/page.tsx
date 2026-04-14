"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { useDictionary } from "@/i18n/dictionary-provider";
import { CONTACT_EMAIL, CONTACT_MAILTO } from "@/lib/contact";
import {
  EnvelopeIcon,
  MapPinIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";

type FormStatus = "idle" | "submitting" | "success" | "error";

export default function ContactPage() {
  const dict = useDictionary();
  const t = dict.contact;
  const pathname = usePathname();
  const locale = pathname.split("/")[1] || "en";
  const prefix = `/${locale}`;
  const contactPageUrl = `https://olgaemma.com/${locale}/contact`;

  const [status, setStatus] = useState<FormStatus>("idle");
  const [errors, setErrors] = useState<Record<string, string>>({});

  function validate(form: FormData): Record<string, string> {
    const errs: Record<string, string> = {};
    const name = form.get("name")?.toString().trim() ?? "";
    const email = form.get("email")?.toString().trim() ?? "";
    const message = form.get("message")?.toString().trim() ?? "";
    const consent = form.get("consent");

    if (!name) errs.name = t.errName;
    if (!email) errs.email = t.errEmail;
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      errs.email = t.errEmailInvalid;
    if (!message) errs.message = t.errMessage;
    else if (message.length < 10)
      errs.message = t.errMessageShort;
    if (!consent) errs.consent = t.errConsent;

    return errs;
  }

  function getInquiryLabel(value: string) {
    switch (value) {
      case "project":
        return t.inquiryProject;
      case "hire":
        return t.inquiryHire;
      case "consultation":
        return t.inquiryConsultation;
      case "collaboration":
        return t.inquiryCollaboration;
      case "other":
        return t.inquiryOther;
      default:
        return value;
    }
  }

  function buildMailtoUrl(form: FormData) {
    const name = form.get("name")?.toString().trim() ?? "";
    const email = form.get("email")?.toString().trim() ?? "";
    const company = form.get("company")?.toString().trim() ?? "";
    const inquiry = form.get("inquiry")?.toString().trim() ?? "";
    const message = form.get("message")?.toString().trim() ?? "";
    const inquiryLabel = getInquiryLabel(inquiry) || (locale === "fr" ? "Non précisé" : "Not specified");
    const companyLabel = company || (locale === "fr" ? "Non précisé" : "Not specified");
    const subject = `${locale === "fr" ? "Demande via le site" : "Website inquiry"} - ${name}`;
    const body = [
      `${t.nameLabel}: ${name}`,
      `${t.emailAddressLabel}: ${email}`,
      `${t.companyLabel}: ${companyLabel}`,
      `${t.inquiryLabel}: ${inquiryLabel}`,
      "",
      `${t.messageLabel}:`,
      message,
      "",
      `${locale === "fr" ? "Page" : "Page"}: ${contactPageUrl}`,
    ].join("\n");

    return `${CONTACT_MAILTO}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  }

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    // Honeypot check
    if (formData.get("website")) return;

    const validationErrors = validate(formData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors({});
    setStatus("submitting");

    try {
      window.location.assign(buildMailtoUrl(formData));
      setStatus("success");
    } catch {
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <>
        <Breadcrumbs items={[{ label: dict.nav.home, href: prefix }, { label: dict.nav.contact }]} />

        <section className="section">
          <div className="contact-success">
            <div className="contact-success-icon">
              <svg
                className="contact-success-checkmark"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <h1>{t.successTitle}</h1>
            <p>{t.successMessage}</p>
            <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
              <a href={CONTACT_MAILTO} className="btn btn-outline btn-lg">
                {t.directEmailCta}
              </a>
              <Link href={prefix} className="btn btn-primary btn-lg">
                {t.backToHome}
              </Link>
            </div>
          </div>
        </section>
      </>
    );
  }

  const contactJsonLd = {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    name: "Contact Olga Emma Elume",
    description: t.metaDescription,
    url: contactPageUrl,
    mainEntity: {
      "@type": "Person",
      "@id": "https://olgaemma.com/#person",
      name: "Olga Emma Elume",
      email: CONTACT_EMAIL,
      address: {
        "@type": "PostalAddress",
        addressCountry: "CM",
        addressLocality: "Buea",
      },
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(contactJsonLd) }}
      />
      <Breadcrumbs items={[{ label: dict.nav.home, href: prefix }, { label: dict.nav.contact }]} />

      <section className="section" aria-labelledby="contact-heading">
        <div className="container">
          <div className="contact-layout">
            {/* ── Left Column: Info ── */}
            <div className="contact-info">
              <div className="section-eyebrow" aria-hidden="true">
                {t.eyebrow}
              </div>
              <h1 id="contact-heading" className="section-title">
                {t.heading}
                <br />
                {t.headingLine2}
              </h1>
              <p className="section-subtitle">{t.subtitle}</p>

              {/* Contact Details */}
              <div style={{ marginTop: "2.5rem" }}>
                <div className="contact-info-item">
                  <div className="contact-info-icon contact-info-icon-rose">
                    <EnvelopeIcon width={18} height={18} aria-hidden="true" />
                  </div>
                  <div>
                    <div className="contact-info-label">{t.emailLabel}</div>
                    <div className="contact-info-value">
                      <a href={CONTACT_MAILTO}>
                        {CONTACT_EMAIL}
                      </a>
                    </div>
                  </div>
                </div>

                <div className="contact-info-item">
                  <div className="contact-info-icon contact-info-icon-sage">
                    <MapPinIcon width={18} height={18} aria-hidden="true" />
                  </div>
                  <div>
                    <div className="contact-info-label">{t.locationLabel}</div>
                    <div className="contact-info-value">{t.locationValue}</div>
                  </div>
                </div>

                <div className="contact-info-item">
                  <div className="contact-info-icon contact-info-icon-charcoal">
                    <ClockIcon width={18} height={18} aria-hidden="true" />
                  </div>
                  <div>
                    <div className="contact-info-label">{t.responseLabel}</div>
                    <div className="contact-info-value">{t.responseValue}</div>
                  </div>
                </div>
              </div>

              {/* Availability */}
              <div className="contact-availability">
                <span
                  className="contact-availability-dot"
                  aria-hidden="true"
                />
                <span className="contact-availability-text">
                  {t.availabilityText}
                </span>
              </div>

              {/* Social */}
              <div className="social-links" style={{ marginTop: "2rem" }}>
                <a
                  href="https://www.linkedin.com/in/olgaelume"
                  className="social-link"
                  aria-label="LinkedIn"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                  </svg>
                </a>
                <a
                  href="https://x.com/mumolga"
                  className="social-link"
                  aria-label="X (Twitter)"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                </a>
                <a
                  href="https://www.instagram.com/olgaelume"
                  className="social-link"
                  aria-label="Instagram"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                  </svg>
                </a>
                <a
                  href="https://www.facebook.com/share/1KZs6j1Db6/"
                  className="social-link"
                  aria-label="Facebook"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                </a>
              </div>
            </div>

            {/* ── Right Column: Form ── */}
            <div className="contact-form-card">
              <h2 className="contact-form-title">{t.formTitle}</h2>
              <p className="contact-form-subtitle">{t.formSubtitle}</p>

              <form onSubmit={handleSubmit} noValidate>
                {/* Honeypot */}
                <div
                  style={{ position: "absolute", left: "-9999px" }}
                  aria-hidden="true"
                >
                  <label htmlFor="website">Website</label>
                  <input
                    type="text"
                    id="website"
                    name="website"
                    tabIndex={-1}
                    autoComplete="off"
                  />
                </div>

                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "1.5rem",
                  }}
                >
                  {/* Name + Email row */}
                  <div className="contact-form-row">
                    <div className="form-group">
                      <label htmlFor="name" className="form-label">
                        {t.nameLabel}{" "}
                        <span aria-hidden="true" style={{ color: "var(--color-rose)" }}>{t.required}</span>
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        className="form-input"
                        placeholder={t.namePlaceholder}
                        required
                        autoComplete="name"
                        aria-required="true"
                        aria-invalid={!!errors.name}
                        aria-describedby={errors.name ? "name-error" : undefined}
                      />
                      {errors.name && (
                        <span id="name-error" className="form-error" role="alert">{errors.name}</span>
                      )}
                    </div>

                    <div className="form-group">
                      <label htmlFor="email" className="form-label">
                        {t.emailAddressLabel}{" "}
                        <span aria-hidden="true" style={{ color: "var(--color-rose)" }}>{t.required}</span>
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        className="form-input"
                        placeholder={t.emailPlaceholder}
                        required
                        autoComplete="email"
                        aria-required="true"
                        aria-invalid={!!errors.email}
                        aria-describedby={errors.email ? "email-error" : undefined}
                      />
                      {errors.email && (
                        <span id="email-error" className="form-error" role="alert">{errors.email}</span>
                      )}
                    </div>
                  </div>

                  {/* Company + Inquiry row */}
                  <div className="contact-form-row">
                    <div className="form-group">
                      <label htmlFor="company" className="form-label">{t.companyLabel}</label>
                      <input
                        type="text"
                        id="company"
                        name="company"
                        className="form-input"
                        placeholder={t.companyPlaceholder}
                        autoComplete="organization"
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="inquiry" className="form-label">{t.inquiryLabel}</label>
                      <select
                        id="inquiry"
                        name="inquiry"
                        className="form-input form-select"
                        defaultValue=""
                      >
                        <option value="" disabled>{t.inquiryPlaceholder}</option>
                        <option value="project">{t.inquiryProject}</option>
                        <option value="hire">{t.inquiryHire}</option>
                        <option value="consultation">{t.inquiryConsultation}</option>
                        <option value="collaboration">{t.inquiryCollaboration}</option>
                        <option value="other">{t.inquiryOther}</option>
                      </select>
                    </div>
                  </div>

                  {/* Message */}
                  <div className="form-group">
                    <label htmlFor="message" className="form-label">
                      {t.messageLabel}{" "}
                      <span aria-hidden="true" style={{ color: "var(--color-rose)" }}>{t.required}</span>
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      className="form-textarea"
                      placeholder={t.messagePlaceholder}
                      required
                      aria-required="true"
                      aria-invalid={!!errors.message}
                      aria-describedby={errors.message ? "message-error" : "message-hint"}
                      rows={5}
                    />
                    {errors.message ? (
                      <span id="message-error" className="form-error" role="alert">{errors.message}</span>
                    ) : (
                      <span id="message-hint" className="form-hint">{t.messageHint}</span>
                    )}
                  </div>

                  {/* Consent */}
                  <div className="form-checkbox-group">
                    <input
                      type="checkbox"
                      id="consent"
                      name="consent"
                      className="form-checkbox"
                      required
                      aria-required="true"
                      aria-invalid={!!errors.consent}
                      aria-describedby={errors.consent ? "consent-error" : undefined}
                    />
                    <div>
                      <label
                        htmlFor="consent"
                        style={{
                          fontSize: "0.85rem",
                          color: "var(--color-stone)",
                          lineHeight: "1.5",
                        }}
                      >
                        {t.consentText}{" "}
                        <Link
                          href={`${prefix}/privacy`}
                          style={{
                            color: "var(--color-rose)",
                            textDecoration: "underline",
                            textUnderlineOffset: "3px",
                          }}
                        >
                          {dict.footer.privacyPolicy}
                        </Link>
                        .{" "}
                        <span aria-hidden="true" style={{ color: "var(--color-rose)" }}>{t.required}</span>
                      </label>
                      {errors.consent && (
                        <span
                          id="consent-error"
                          className="form-error"
                          role="alert"
                          style={{ display: "block", marginTop: "0.25rem" }}
                        >
                          {errors.consent}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Submit */}
                  <button
                    type="submit"
                    className="btn btn-primary btn-lg"
                    style={{ width: "100%" }}
                  >
                    {t.submitButton}
                  </button>

                  {status === "error" && (
                    <p
                      className="form-error"
                      role="alert"
                      style={{ textAlign: "center" }}
                    >
                      {t.submitErrorPrefix}{" "}
                      <a
                        href={CONTACT_MAILTO}
                        style={{ color: "var(--color-rose)", textDecoration: "underline" }}
                      >
                        {CONTACT_EMAIL}
                      </a>
                      {t.submitErrorSuffix}
                    </p>
                  )}
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
