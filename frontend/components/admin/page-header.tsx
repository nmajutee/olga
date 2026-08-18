import Link from "next/link";

/** Shared page header so every screen sits on the same baseline. */
export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
  back,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: React.ReactNode;
  back?: { href: string; label: string };
}) {
  return (
    /* Same rhythm as the dashboard header, so switching screens does not
       shift the title baseline. */
    <div className="pb-6 pt-7">
      {back && (
        <Link
          href={back.href}
          className="admin-meta mb-2 inline-flex items-center gap-1.5 transition-colors hover:text-[var(--ink)]"
        >
          ← {back.label}
        </Link>
      )}

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="min-w-0">
          {eyebrow && <p className="admin-label-caps mb-1.5">{eyebrow}</p>}
          <h1 className="admin-h1">{title}</h1>
          {description && <p className="admin-meta mt-1 max-w-[68ch]">{description}</p>}
        </div>

        {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
      </div>
    </div>
  );
}
