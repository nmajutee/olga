import { getDb } from "@/lib/db";
import { MediaLibrary, type MediaItem } from "@/components/admin/media-library";

export const dynamic = "force-dynamic";

export default async function MediaPage() {
  const db = await getDb();
  const { results } = await db
    .prepare(
      `SELECT id, r2_key, filename, content_type, size_bytes, alt_text, created_at
         FROM media ORDER BY created_at DESC LIMIT 300`,
    )
    .all<{
      id: string;
      r2_key: string;
      filename: string;
      content_type: string;
      size_bytes: number;
      alt_text: string;
      created_at: string;
    }>();

  const items: MediaItem[] = (results ?? []).map((row) => ({
    id: row.id,
    url: `/media/${row.r2_key}`,
    filename: row.filename,
    contentType: row.content_type,
    size: row.size_bytes,
    alt: row.alt_text,
    createdAt: row.created_at,
  }));

  return <MediaLibrary items={items} />;
}
