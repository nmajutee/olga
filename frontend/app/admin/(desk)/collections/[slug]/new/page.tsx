import { notFound } from "next/navigation";
import { getCollection } from "@/lib/collections";
import { PageHeader } from "@/components/admin/page-header";
import { ContentEditor } from "@/components/admin/content-editor";

export const dynamic = "force-dynamic";

export default async function NewContentPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const definition = getCollection(slug);
  if (!definition) notFound();

  return (
    <div className="admin-page">
      <PageHeader
        back={{ href: `/admin/collections/${slug}`, label: definition.plural }}
        title={`New ${definition.label.toLowerCase()}`}
      />
      <ContentEditor definition={definition} item={null} />
    </div>
  );
}
