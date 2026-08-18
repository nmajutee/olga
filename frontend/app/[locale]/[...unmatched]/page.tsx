import { notFound, redirect } from "next/navigation";
import { resolveRedirect } from "@/lib/redirects";

export const dynamic = "force-dynamic";

/**
 * Catch-all for paths no other route claims.
 *
 * It exists so an admin-managed redirect can rescue any URL, not only article
 * slugs — old campaign links, renamed pages, paths carried over from the
 * previous site. Anything without a rule falls through to the normal 404.
 *
 * This never shadows a real route: Next matches catch-all segments last.
 */
export default async function UnmatchedPage({
  params,
}: {
  params: Promise<{ locale: string; unmatched: string[] }>;
}) {
  const { locale, unmatched } = await params;
  const path = `/${unmatched.join("/")}`;

  const moved = await resolveRedirect(path);
  if (moved) redirect(`/${locale}${moved.target}`);

  notFound();
}
