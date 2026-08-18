import { notFound } from "next/navigation";
import Link from "next/link";
import { PlusIcon, ArrowTopRightOnSquareIcon } from "@heroicons/react/24/outline";
import { getCollection, listItems } from "@/lib/collections";
import { PageHeader } from "@/components/admin/page-header";
import { CollectionList } from "@/components/admin/collection-list";

export const dynamic = "force-dynamic";

export default async function CollectionPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const definition = getCollection(slug);
  if (!definition) notFound();

  const items = await listItems(slug);

  return (
    <div className="admin-page">
      <PageHeader
        back={{ href: "/admin/collections", label: "Pages & work" }}
        eyebrow={`${items.length} ${items.length === 1 ? "entry" : "entries"}`}
        title={definition.plural}
        description={definition.description}
        actions={
          <>
            {definition.publicPath && (
              <a
                href={`/en${definition.publicPath}`}
                target="_blank"
                rel="noreferrer"
                className="admin-btn admin-btn-outline"
              >
                <ArrowTopRightOnSquareIcon aria-hidden="true" />
                View on site
              </a>
            )}
            <Link
              href={`/admin/collections/${slug}/new`}
              className="admin-btn admin-btn-primary"
            >
              <PlusIcon aria-hidden="true" />
              Add {definition.label.toLowerCase()}
            </Link>
          </>
        }
      />

      <CollectionList slug={slug} items={items} emptyHint={definition.emptyHint} label={definition.label} />
    </div>
  );
}
