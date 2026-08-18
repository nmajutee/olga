"use client";

import { useRef, useState } from "react";
import type { Draft } from "@/lib/ai-draft";

type Props = {
  defaultTone: string;
  defaultWords: string;
  onDraft: (draft: Draft) => void;
};

type Status = "idle" | "writing" | "error";

/**
 * A commissioning brief, not a chat box. The fields are the ones an editor
 * would actually specify when assigning a piece, and they map directly onto
 * what the model needs to hit the SEO targets.
 */
export function CommissionBrief({ defaultTone, defaultWords, onDraft }: Props) {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<Status>("idle");
  const [characters, setCharacters] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  async function commission(formData: FormData) {
    setStatus("writing");
    setCharacters(0);
    setError(null);

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const response = await fetch("/api/admin/ai/draft", {
        method: "POST",
        headers: { "content-type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          topic: formData.get("topic"),
          focusKeyword: formData.get("focusKeyword"),
          audience: formData.get("audience"),
          tone: formData.get("tone"),
          words: Number(formData.get("words")),
          locale: formData.get("locale"),
        }),
      });

      if (!response.ok || !response.body) {
        const payload = (await response
          .json()
          .catch(() => ({}))) as { error?: string };
        throw new Error(payload.error ?? `Request failed (${response.status}).`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const frames = buffer.split("\n\n");
        buffer = frames.pop() ?? "";

        for (const frame of frames) {
          const eventLine = frame.split("\n").find((line) => line.startsWith("event: "));
          const dataLine = frame.split("\n").find((line) => line.startsWith("data: "));
          if (!eventLine || !dataLine) continue;

          const event = eventLine.slice(7).trim();
          const data = JSON.parse(dataLine.slice(6));

          if (event === "progress") setCharacters(data.characters as number);
          if (event === "error") throw new Error(data.message as string);
          if (event === "result") {
            onDraft(data as Draft);
            setStatus("idle");
            setOpen(false);
            return;
          }
        }
      }

      throw new Error("The connection closed before the draft finished.");
    } catch (caught) {
      if (caught instanceof DOMException && caught.name === "AbortError") {
        setStatus("idle");
        return;
      }
      setError(caught instanceof Error ? caught.message : "Drafting failed.");
      setStatus("error");
    }
  }

  if (!open) {
    return (
      <button
        type="button"
        className="admin-btn admin-btn-outline w-full justify-between"
        onClick={() => setOpen(true)}
      >
        <span>Commission a draft</span>
        <span className="admin-mono text-xs text-[var(--ink-4)]">Claude writes the first pass</span>
      </button>
    );
  }

  return (
    <div className="admin-card p-4">
      <div className="mb-3 flex items-center justify-between">
        <span className="admin-label-caps">Commissioning brief</span>
        <button
          type="button"
          className="text-xs text-[var(--ink-3)] hover:text-[var(--ink)]"
          onClick={() => {
            abortRef.current?.abort();
            setOpen(false);
            setStatus("idle");
          }}
        >
          Close
        </button>
      </div>

      <form
        action={commission}
        className="space-y-3"
        onSubmit={() => setStatus("writing")}
      >
        <div>
          <label className="admin-label" htmlFor="topic">
            What is the piece about?
          </label>
          <textarea
            id="topic"
            name="topic"
            rows={3}
            required
            className="admin-field resize-y"
            placeholder="How community radio stations in the Far North verify information during internet shutdowns"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="admin-label" htmlFor="focusKeyword">
              Focus keyword
            </label>
            <input
              id="focusKeyword"
              name="focusKeyword"
              className="admin-field"
              placeholder="internet shutdown reporting"
            />
          </div>
          <div>
            <label className="admin-label" htmlFor="audience">
              Written for
            </label>
            <input
              id="audience"
              name="audience"
              className="admin-field"
              placeholder="Journalists and civil-society staff"
            />
          </div>
        </div>

        <div>
          <label className="admin-label" htmlFor="tone">
            Voice
          </label>
          <input id="tone" name="tone" className="admin-field" defaultValue={defaultTone} />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="admin-label" htmlFor="words">
              Length
            </label>
            <input
              id="words"
              name="words"
              type="number"
              min={400}
              max={3000}
              step={100}
              className="admin-field"
              defaultValue={defaultWords}
            />
          </div>
          <div>
            <label className="admin-label" htmlFor="locale">
              Language
            </label>
            <select id="locale" name="locale" className="admin-field" defaultValue="en">
              <option value="en">English</option>
              <option value="fr">French</option>
            </select>
          </div>
        </div>

        {error && (
          <p
            role="alert"
            className="admin-alert" data-tone="error"
          >
            {error}
          </p>
        )}

        <div className="flex items-center gap-3">
          <button
            type="submit"
            className="admin-btn admin-btn-primary"
            disabled={status === "writing"}
          >
            {status === "writing" ? "Writing…" : "Write the draft"}
          </button>

          {status === "writing" && (
            <>
              <span className="admin-mono text-xs text-[var(--ink-3)]">
                {characters.toLocaleString()} characters
              </span>
              <button
                type="button"
                className="text-xs text-[var(--ink-3)] hover:text-[var(--ink)]"
                onClick={() => abortRef.current?.abort()}
              >
                Stop
              </button>
            </>
          )}
        </div>

        <p className="admin-hint">
          The draft lands in the editor and replaces what is there. It is a first pass — check
          every fact before publishing.
        </p>
      </form>
    </div>
  );
}
