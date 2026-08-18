import { notFound } from "next/navigation";
import { getCollection, getItem } from "@/lib/collections";
import { PageHeader } from "@/components/admin/page-header";
import { ContentEditor } from "@/components/admin/content-editor";

export const dynamic = "force-dynamic";

export default async function EditContentPage({
  params,
}: {
  params: Promise<{ slug: string; id: string }>;
}) {
  const { slug, id } = await params;
  const definition = getCollection(slug);
  if (!definition) notFound();

  const item = await getItem(id);
  if (!item || item.collection !== slug) notFound();

  return (
    <div className="admin-page">
      <PageHeader
        back={{ href: `/admin/collections/${slug}`, label: definition.plural }}
        eyebrow={definition.label}
        title={item.title}
      />
      <ContentEditor definition={definition} item={item} />
    </div>
  );
}
