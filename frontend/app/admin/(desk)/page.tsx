import Link from "next/link";
import {
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  PlusIcon,
  PhotoIcon,
  EyeIcon,
  DocumentTextIcon,
  ChartBarIcon,
  InboxIcon,
  ArrowRightIcon,
  GlobeAltIcon,
  SignalSlashIcon,
} from "@heroicons/react/24/outline";
import { getDashboardData, delta } from "@/lib/dashboard";
import { getAnalytics } from "@/lib/analytics";
import { getSettings } from "@/lib/settings";
import { TrafficChart, RankBar, ScoreMeter } from "@/components/admin/charts";

export const dynamic = "force-dynamic";

function Trend({ current, previous }: { current: number; previous: number }) {
  // Nothing to compare against yet — say so rather than inventing a percentage
  // from a zero baseline.
  if (previous === 0) {
    return <span>No comparison yet</span>;
  }

  const { pct, tone } = delta(current, previous);
  const Icon = tone === "down" ? ArrowTrendingDownIcon : ArrowTrendingUpIcon;

  return (
    <>
      <span className="admin-delta" data-tone={tone}>
        {tone !== "flat" && <Icon aria-hidden="true" />}
        {tone === "flat" ? "No change" : `${pct}%`}
      </span>
      <span>vs previous 30 days</span>
    </>
  );
}

export default async function OverviewPage() {
  const [data, analytics, settings] = await Promise.all([
    getDashboardData(),
    getAnalytics(),
    getSettings(),
  ]);

  const { totals, seo } = data;

  const stats = [
    {
      label: "Views",
      value: analytics.hasData ? analytics.views30.toLocaleString() : "—",
      icon: EyeIcon,
      href: "/admin/posts",
      foot: analytics.hasData ? (
        <Trend current={analytics.views30} previous={analytics.viewsPrev30} />
      ) : (
        <span>Waiting for the first visit</span>
      ),
      feature: true,
    },
    {
      label: "Articles live",
      value: totals.published,
      icon: DocumentTextIcon,
      href: "/admin/posts?status=published",
      foot: (
        <span>
          {totals.drafts > 0 ? `${totals.drafts} in draft` : "Nothing in draft"}
        </span>
      ),
    },
    {
      label: "SEO health",
      value: totals.published ? `${seo.healthPct}%` : "—",
      icon: ChartBarIcon,
      href: "/admin/posts",
      foot: (
        <span>
          {totals.published ? "of articles score 70 or better" : "Publish to start scoring"}
        </span>
      ),
    },
    {
      label: "Enquiries",
      value: totals.messages,
      icon: InboxIcon,
      href: "/admin/messages",
      foot: totals.unread ? (
        <>
          <span className="admin-badge" data-tone="info">
            {totals.unread}
          </span>
          <span>awaiting a reply</span>
        </>
      ) : (
        <span>All read</span>
      ),
    },
  ];

  const topViews = Math.max(...analytics.topPosts.map((post) => post.views), 1);
  const topReferrerViews = Math.max(...analytics.topReferrers.map((r) => r.views), 1);

  return (
    <div className="admin-page">
      {/* ── Header ── */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-6 pt-7">
        <div className="min-w-0">
          <h1 className="admin-h1">Dashboard</h1>
          <p className="admin-meta mt-1">How {settings.site_title} is performing.</p>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/admin/media" className="admin-btn admin-btn-outline">
            <PhotoIcon aria-hidden="true" />
            <span className="hidden sm:inline">Upload media</span>
            <span className="sm:hidden">Upload</span>
          </Link>
          <Link href="/admin/posts/new" className="admin-btn admin-btn-primary">
            <PlusIcon aria-hidden="true" />
            New article
          </Link>
        </div>
      </div>

      <div className="admin-stack">
        {/* ── Four numbers, nothing more ── */}
        <div className="admin-statgrid">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Link
                key={stat.label}
                href={stat.href}
                className={`admin-stat${stat.feature ? " admin-stat-feature" : ""}`}
              >
                <div className="admin-stat-head">
                  <span className="admin-stat-label">{stat.label}</span>
                  <span className="admin-stat-icon" aria-hidden="true">
                    <Icon />
                  </span>
                </div>
                <p className="admin-figure admin-stat-value">{stat.value}</p>
                <p className="admin-stat-foot">{stat.foot}</p>
              </Link>
            );
          })}
        </div>

        {/* ── Traffic ── */}
        <section className="admin-card">
          <div className="admin-card-head">
            <div className="min-w-0">
              <h2 className="admin-h2">Traffic</h2>
              <p className="admin-micro mt-0.5">Page views, last 30 days</p>
            </div>
            {analytics.hasData && (
              <span className="admin-meta shrink-0">
                <strong style={{ color: "var(--ink)" }}>
                  {analytics.viewsToday.toLocaleString()}
                </strong>{" "}
                today
              </span>
            )}
          </div>

          <div className="p-5">
            {analytics.hasData ? (
              <TrafficChart data={analytics.daily} />
            ) : (
              <div className="admin-empty">
                <span className="admin-empty-icon">
                  <SignalSlashIcon />
                </span>
                <p className="admin-h2">No visits recorded yet</p>
                <p className="admin-micro mx-auto mt-1.5 max-w-[46ch]">
                  Traffic is counted on your own site, without cookies or third parties. Numbers
                  appear here as soon as someone reads a page.
                </p>
              </div>
            )}
          </div>
        </section>

        {/* ── What is working, and where readers come from ── */}
        <div className="admin-grid">
          <section className="admin-card admin-col-wide">
            <div className="admin-card-head">
              <h2 className="admin-h2">Top articles</h2>
              <Link href="/admin/posts" className="admin-btn admin-btn-ghost admin-btn-sm">
                All articles
                <ArrowRightIcon aria-hidden="true" />
              </Link>
            </div>

            {analytics.topPosts.length > 0 ? (
              <div>
                {analytics.topPosts.map((post) => (
                  <Link
                    key={post.path}
                    href={post.id ? `/admin/posts/${post.id}` : "/admin/posts"}
                    className="admin-row"
                  >
                    <span className="min-w-0 flex-1">
                      <span className="admin-clamp-2 block text-[14px] font-medium leading-snug">
                        {post.title}
                      </span>
                      <RankBar value={post.views} max={topViews} />
                    </span>

                    <span className="flex shrink-0 items-center gap-3">
                      {post.id && (
                        <span
                          className="hidden items-center gap-1.5 sm:flex"
                          title={`SEO score ${post.seoScore}`}
                        >
                          <ScoreMeter value={post.seoScore} />
                          <span className="admin-micro w-5 text-right">{post.seoScore}</span>
                        </span>
                      )}
                      <span className="admin-figure w-14 text-right text-[15px]">
                        {post.views.toLocaleString()}
                      </span>
                    </span>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="admin-empty">
                <span className="admin-empty-icon">
                  <DocumentTextIcon />
                </span>
                <p className="admin-h2">Nothing read yet</p>
                <p className="admin-micro mx-auto mt-1.5 max-w-[40ch]">
                  Once articles start getting views, the best performers rank here.
                </p>
              </div>
            )}
          </section>

          <section className="admin-card admin-col-side">
            <div className="admin-card-head">
              <h2 className="admin-h2">Where readers come from</h2>
            </div>

            {analytics.topReferrers.length > 0 ? (
              <div>
                {analytics.topReferrers.map((referrer) => (
                  <div key={referrer.host} className="admin-row">
                    <span className="admin-row-icon" aria-hidden="true">
                      <GlobeAltIcon />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[14px] font-medium">
                        {referrer.host === "direct" ? "Direct & bookmarks" : referrer.host}
                      </span>
                      <RankBar value={referrer.views} max={topReferrerViews} />
                    </span>
                    <span className="admin-figure w-12 shrink-0 text-right text-[15px]">
                      {referrer.views.toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="admin-empty">
                <span className="admin-empty-icon">
                  <GlobeAltIcon />
                </span>
                <p className="admin-h2">No sources yet</p>
                <p className="admin-micro mx-auto mt-1.5 max-w-[32ch]">
                  Search engines and social links will show up here.
                </p>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
