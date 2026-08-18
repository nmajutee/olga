import Link from "next/link";
import { ArrowUpRightIcon } from "@heroicons/react/24/outline";
import { COLLECTION_LIST, countItems } from "@/lib/collections";
import { PageHeader } from "@/components/admin/page-header";

export const dynamic = "force-dynamic";

export default async function CollectionsIndexPage() {
  const collections = await Promise.all(
    COLLECTION_LIST.map(async (definition) => ({
      ...definition,
      count: await countItems(definition.slug),
    })),
  );

  return (
    <div className="admin-page">
      <PageHeader
        title="Pages & work"
        description="Everything on the site that is not an article: portfolio pieces, services, case studies and testimonials."
      />

      <div className="grid gap-5 sm:grid-cols-2">
        {collections.map((collection) => (
          <Link
            key={collection.slug}
            href={`/admin/collections/${collection.slug}`}
            className="admin-card admin-card-pad transition-colors hover:border-[var(--line-strong)]"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h2 className="admin-h2">{collection.plural}</h2>
                <p className="admin-meta mt-1">
                  {collection.description}
                </p>
              </div>
              <ArrowUpRightIcon
                className="h-4 w-4 shrink-0"
                style={{ color: "var(--ink-4)" }}
                aria-hidden="true"
              />
            </div>

            <div className="mt-4 flex items-baseline gap-2">
              <span className="admin-figure text-[28px] leading-none">{collection.count}</span>
              <span className="admin-micro">
                {collection.count === 1 ? "entry" : "entries"}
              </span>
            </div>

            <p className="admin-micro mt-3">
              {collection.publicPath
                ? `Appears on ${collection.publicPath}`
                : "Used across the site"}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
