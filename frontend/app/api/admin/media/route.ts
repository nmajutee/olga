import { getCurrentUser } from "@/lib/auth";
import { getDb, getMediaBucket, newId, slugify } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_BYTES = 10 * 1024 * 1024;
const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/svg+xml",
  "application/pdf",
]);

const EXTENSIONS: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/svg+xml": "svg",
  "application/pdf": "pdf",
};

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const form = await request.formData();
  const file = form.get("file");

  if (!(file instanceof File)) {
    return Response.json({ error: "No file provided." }, { status: 400 });
  }

  if (!ALLOWED_TYPES.has(file.type)) {
    return Response.json(
      { error: `Unsupported file type: ${file.type || "unknown"}.` },
      { status: 415 },
    );
  }

  if (file.size > MAX_BYTES) {
    return Response.json(
      { error: `File is larger than ${MAX_BYTES / 1024 / 1024}MB.` },
      { status: 413 },
    );
  }

  // The browser already knows the intrinsic size once it has decoded the
  // file, so it sends it rather than us re-parsing image headers on the edge.
  const width = Number(form.get("width")) || null;
  const height = Number(form.get("height")) || null;

  const id = newId("med");
  const stem = slugify(file.name.replace(/\.[^.]+$/, "")) || "upload";
  const extension = EXTENSIONS[file.type] ?? "bin";
  const now = new Date();
  const key = `${now.getUTCFullYear()}/${String(now.getUTCMonth() + 1).padStart(2, "0")}/${stem}-${id.slice(-8)}.${extension}`;

  const bucket = await getMediaBucket();
  await bucket.put(key, await file.arrayBuffer(), {
    httpMetadata: {
      contentType: file.type,
      cacheControl: "public, max-age=31536000, immutable",
    },
  });

  const db = await getDb();
  await db
    .prepare(
      `INSERT INTO media (id, r2_key, filename, content_type, size_bytes, width, height, alt_text, uploaded_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .bind(id, key, file.name, file.type, file.size, width, height, String(form.get("alt") ?? ""), user.id)
    .run();

  return Response.json({
    id,
    url: `/media/${key}`,
    filename: file.name,
    contentType: file.type,
    size: file.size,
    width,
    height,
    alt: String(form.get("alt") ?? ""),
    createdAt: new Date().toISOString(),
  });
}

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const db = await getDb();
  const { results } = await db
    .prepare(
      `SELECT id, r2_key, filename, content_type, size_bytes, width, height, alt_text, created_at
         FROM media ORDER BY created_at DESC LIMIT 200`,
    )
    .all<{
      id: string;
      r2_key: string;
      filename: string;
      content_type: string;
      size_bytes: number;
      width: number | null;
      height: number | null;
      alt_text: string;
      created_at: string;
    }>();

  return Response.json({
    items: (results ?? []).map((row) => ({
      id: row.id,
      url: `/media/${row.r2_key}`,
      filename: row.filename,
      contentType: row.content_type,
      size: row.size_bytes,
      width: row.width,
      height: row.height,
      alt: row.alt_text,
      createdAt: row.created_at,
    })),
  });
}

/** Alt text belongs to the file, so the picker saves it back to the library. */
export async function PATCH(request: Request) {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  let body: { id?: string; alt?: string };
  try {
    body = (await request.json()) as { id?: string; alt?: string };
  } catch {
    return Response.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  if (!body.id) return Response.json({ error: "An id is required." }, { status: 400 });

  const db = await getDb();
  await db
    .prepare("UPDATE media SET alt_text = ? WHERE id = ?")
    .bind(String(body.alt ?? "").slice(0, 500), body.id)
    .run();

  return Response.json({ ok: true });
}
