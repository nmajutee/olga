import Link from "next/link";
import {
  PlusIcon,
  DocumentTextIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";
import { listAllPosts, formatPublishDate } from "@/lib/posts";
import { relativeTime } from "@/lib/activity";
import { PageHeader } from "@/components/admin/page-header";
import { ScoreMeter } from "@/components/admin/charts";

export const dynamic = "force-dynamic";

type SearchParams = Promise<{ q?: string; status?: string }>;

export default async function PostsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { q = "", status = "all" } = await searchParams;
  const all = await listAllPosts();

  const query = q.trim().toLowerCase();
  const posts = all.filter((post) => {
    const matchesStatus = status === "all" || post.status === status;
    const matchesQuery =
      !query ||
      post.title.toLowerCase().includes(query) ||
      post.slug.toLowerCase().includes(query);
    return matchesStatus && matchesQuery;
  });

  const filters = [
    { key: "all", label: "All", count: all.length },
    { key: "published", label: "Published", count: all.filter((p) => p.status === "published").length },
    { key: "draft", label: "Drafts", count: all.filter((p) => p.status === "draft").length },
  ];

  const href = (nextStatus: string) => {
    const params = new URLSearchParams();
    if (nextStatus !== "all") params.set("status", nextStatus);
    if (q) params.set("q", q);
    const search = params.toString();
    return search ? `/admin/posts?${search}` : "/admin/posts";
  };

  return (
    <div className="admin-page">
      <PageHeader
        eyebrow={`${all.length} total`}
        title="Articles"
        description="Everything on the blog, drafts included."
        actions={
          <Link href="/admin/posts/new" className="admin-btn admin-btn-primary">
            <PlusIcon aria-hidden="true" />
            New article
          </Link>
        }
      />

      <div className="admin-card overflow-hidden">
        <div
          className="flex flex-wrap items-center gap-2 border-b p-3"
          style={{ borderColor: "var(--line)" }}
        >
          {filters.map((filter) => (
            <Link
              key={filter.key}
              href={href(filter.key)}
              className="admin-btn admin-btn-sm"
              style={
                status === filter.key
                  ? { background: "var(--blue-soft)", color: "var(--blue-deep)" }
                  : { color: "var(--ink-3)" }
              }
            >
              {filter.label}
              <span className="admin-mono opacity-60">{filter.count}</span>
            </Link>
          ))}

          {query && (
            <span className="admin-badge ml-auto" data-tone="info">
              <MagnifyingGlassIcon className="h-3 w-3" aria-hidden="true" />
              “{q}”
              <Link href={href(status)} className="ml-1 font-bold" aria-label="Clear search">
                ×
              </Link>
            </span>
          )}
        </div>

        {posts.length === 0 ? (
          <div className="admin-empty">
            <span className="admin-empty-icon">
              <DocumentTextIcon />
            </span>
            <p className="admin-h2">
              {all.length === 0 ? "Nothing written yet" : "No articles match"}
            </p>
            <p className="admin-micro mx-auto mt-1.5 max-w-[46ch]">
              {all.length === 0
                ? "Write one from scratch, or give Claude a brief and edit the draft it returns."
                : "Try a different filter or search term."}
            </p>
            {all.length === 0 && (
              <Link href="/admin/posts/new" className="admin-btn admin-btn-primary mt-5">
                Write the first article
              </Link>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Article</th>
                  <th className="hidden md:table-cell">Status</th>
                  <th className="hidden lg:table-cell">SEO</th>
                  <th className="hidden sm:table-cell">Read</th>
                  <th>Updated</th>
                </tr>
              </thead>
              <tbody>
                {posts.map((post) => (
                  <tr key={post.id}>
                    <td>
                      <Link href={`/admin/posts/${post.id}`} className="flex items-center gap-3">
                        <span
                          className="admin-row-icon"
                          style={
                            post.coverImageUrl
                              ? { padding: 0, overflow: "hidden" }
                              : post.status === "published"
                                ? { background: "var(--good-soft)", color: "var(--chart-good)" }
                                : { background: "var(--sunken)", color: "var(--ink-3)" }
                          }
                          aria-hidden="true"
                        >
                          {post.coverImageUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={post.coverImageUrl} alt="" className="h-full w-full object-cover" />
                          ) : (
                            <DocumentTextIcon />
                          )}
                        </span>
                        <span className="min-w-0">
                          <span className="block max-w-[22rem] truncate font-semibold">
                            {post.title || "Untitled"}
                          </span>
                          <span
                            className="admin-mono block max-w-[22rem] truncate text-xs"
                            style={{ color: "var(--ink-4)" }}
                          >
                            /{post.slug}
                          </span>
                        </span>
                      </Link>
                    </td>

                    <td className="hidden md:table-cell">
                      <span className="admin-badge" data-tone={post.status}>
                        {post.status === "published" ? "Published" : "Draft"}
                      </span>
                    </td>

                    <td className="hidden lg:table-cell">
                      <span className="flex items-center gap-2">
                        <ScoreMeter value={post.seoScore} />
                        <span className="admin-mono text-xs font-semibold">{post.seoScore}</span>
                      </span>
                    </td>

                    <td className="admin-micro admin-mono hidden sm:table-cell">
                      {post.readingMinutes} min
                    </td>

                    <td className="admin-micro  ">
                      {post.status === "published"
                        ? formatPublishDate(post.date)
                        : relativeTime(post.updatedAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
