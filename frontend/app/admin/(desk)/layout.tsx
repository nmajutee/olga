import { redirect } from "next/navigation";
import Link from "next/link";
import {
  ArrowRightStartOnRectangleIcon,
  ArrowTopRightOnSquareIcon,
} from "@heroicons/react/24/outline";
import { getCurrentUser } from "@/lib/auth";
import { getNavCounts } from "@/lib/dashboard";
import { getProfile } from "@/lib/profile";
import { getSettings } from "@/lib/settings";
import { logoutAction } from "@/app/admin/actions";
import { DeskNav, DeskNavMobile } from "@/components/admin/desk-nav";
import { Topbar } from "@/components/admin/topbar";

export default async function DeskLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/admin/login");

  const [counts, settings, profile] = await Promise.all([
    getNavCounts(),
    getSettings(),
    getProfile(user.id),
  ]);
  const initials = (settings.site_title || "O").charAt(0).toUpperCase();

  return (
    <div className="admin-shell">
      <aside className="admin-rail" aria-label="Dashboard sections">
        <Link href="/admin" className="admin-brand">
          <span className="admin-brand-mark" aria-hidden="true">
            {initials}
          </span>
          <span className="min-w-0">
            <span className="admin-h2 block truncate">{settings.site_title}</span>
            <span className="admin-micro block truncate">Editorial desk</span>
          </span>
        </Link>

        <DeskNav counts={counts} />

        <div className="admin-rail-foot">
          {/* The rail's tail was dead space. It now carries the one fact you
              want before publishing: what is actually live right now. */}
          <div className="admin-railcard">
            <div className="flex items-center justify-between gap-2">
              <span className="admin-label-caps">Live site</span>
              <span className="admin-railcard-dot" aria-hidden="true" />
            </div>
            <p className="admin-micro mt-1.5">
              <strong style={{ color: "var(--ink)" }}>
                {counts.posts - counts.drafts}
              </strong>{" "}
              articles published
              {counts.drafts > 0 && (
                <>
                  {" · "}
                  <strong style={{ color: "var(--ink)" }}>{counts.drafts}</strong> in draft
                </>
              )}
            </p>
            <a
              href="/"
              target="_blank"
              rel="noreferrer"
              className="admin-btn admin-btn-outline admin-btn-sm mt-2.5 w-full"
            >
              <ArrowTopRightOnSquareIcon aria-hidden="true" />
              Open the site
            </a>
          </div>

          <form action={logoutAction} className="mt-2">
            <button type="submit" className="admin-nav-link w-full">
              <ArrowRightStartOnRectangleIcon aria-hidden="true" />
              Sign out
            </button>
          </form>
        </div>
      </aside>

      <div className="admin-work">
        <Topbar
          userName={profile?.name ?? user.name}
          userEmail={user.email}
          avatarUrl={profile?.avatarUrl ?? null}
          unreadMessages={counts.unreadMessages}
          hasDrafts={counts.drafts > 0}
        />
        <DeskNavMobile counts={counts} />
        <main>{children}</main>
      </div>
    </div>
  );
}
