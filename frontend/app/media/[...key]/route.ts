import { getMediaBucket } from "@/lib/db";

export const runtime = "nodejs";

const CONTENT_TYPES: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  gif: "image/gif",
  svg: "image/svg+xml",
  pdf: "application/pdf",
};

/**
 * Public read path for uploaded media. Serving through the Worker rather than
 * a public bucket keeps one origin, so cache rules, redirects and the CSP all
 * apply uniformly.
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ key: string[] }> },
) {
  const { key } = await params;
  const objectKey = key.join("/");

  if (!objectKey || objectKey.includes("..")) {
    return new Response("Not found", { status: 404 });
  }

  const bucket = await getMediaBucket();
  const object = await bucket.get(objectKey);

  if (!object) return new Response("Not found", { status: 404 });

  // Headers are built by hand rather than with `object.writeHttpMetadata()`.
  // That helper mutates a Headers instance in place, which cannot cross the
  // dev-server RPC boundary to the bindings process — it throws
  // "Cannot stringify arbitrary non-POJOs" and every image 500s.
  const extension = objectKey.split(".").pop()?.toLowerCase() ?? "";
  const contentType =
    object.httpMetadata?.contentType ??
    CONTENT_TYPES[extension] ??
    "application/octet-stream";

  const headers = new Headers({
    "content-type": contentType,
    etag: object.httpEtag,
    "cache-control": "public, max-age=31536000, immutable",
    // Uploads are attacker-controlled bytes served from our own origin.
    "x-content-type-options": "nosniff",
  });

  if (object.size !== undefined) headers.set("content-length", String(object.size));

  // An SVG opened directly is a document, and a document on this origin can
  // run script against the admin session. Neuter it.
  if (contentType === "image/svg+xml") {
    headers.set("content-security-policy", "default-src 'none'; style-src 'unsafe-inline'; sandbox");
  }

  if (request.headers.get("if-none-match") === object.httpEtag) {
    return new Response(null, { status: 304, headers });
  }

  return new Response(object.body as ReadableStream, { headers });
}
