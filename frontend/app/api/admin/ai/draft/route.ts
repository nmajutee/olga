import { getCurrentUser } from "@/lib/auth";
import { generateDraft, type DraftRequest } from "@/lib/ai-draft";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Server-sent events. Drafting an article takes longer than an idle HTTP
 * connection reliably survives, so progress frames are flushed while Claude
 * writes; the finished draft arrives on the final `result` frame.
 */
export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: Partial<DraftRequest>;
  try {
    body = (await request.json()) as Partial<DraftRequest>;
  } catch {
    return Response.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const topic = (body.topic ?? "").trim();
  if (!topic) {
    return Response.json({ error: "A topic is required." }, { status: 400 });
  }

  const draftRequest: DraftRequest = {
    topic,
    focusKeyword: (body.focusKeyword ?? "").trim(),
    audience: (body.audience ?? "").trim(),
    tone: (body.tone ?? "").trim(),
    words: Math.min(Math.max(Number(body.words) || 1200, 400), 3000),
    locale: body.locale === "fr" ? "fr" : "en",
  };

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const send = (event: string, data: unknown) => {
        controller.enqueue(
          encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`),
        );
      };

      let written = 0;
      send("start", { topic: draftRequest.topic });

      try {
        const draft = await generateDraft(draftRequest, (chars) => {
          written += chars;
          send("progress", { characters: written });
        });

        send("result", draft);
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Article generation failed.";
        console.error(`[ai-draft] ${message}`);
        send("error", { message });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "content-type": "text/event-stream; charset=utf-8",
      "cache-control": "no-cache, no-transform",
      connection: "keep-alive",
    },
  });
}
