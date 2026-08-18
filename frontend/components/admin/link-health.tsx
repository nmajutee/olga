"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import {
  PlusIcon,
  TrashIcon,
  ArrowRightIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import { saveRedirectAction, deleteRedirectAction } from "@/app/admin/actions";
import type { Redirect } from "@/lib/redirects";
import type { LinkAudit } from "@/lib/link-audit";

export function LinkHealth({
  redirects,
  audit,
}: {
  redirects: Redirect[];
  audit: LinkAudit;
}) {
  const [source, setSource] = useState("");
  const [target, setTarget] = useState("");
  const [status, setStatus] = useState(301);
  const [message, setMessage] = useState<{ tone: "ok" | "error"; text: string } | null>(null);
  const [pending, startTransition] = useTransition();

  function add() {
    startTransition(async () => {
      const result = await saveRedirectAction({
        sourcePath: source,
        targetPath: target,
        statusCode: status,
      });

      if (result.error) {
        setMessage({ tone: "error", text: result.error });
        return;
      }

      setSource("");
      setTarget("");
      setMessage({ tone: "ok", text: "Redirect saved and live." });
    });
  }

  return (
    <div className="admin-stack">
      {/* ── Broken links ── */}
      <section className="admin-card">
        <div className="admin-card-head">
          <div className="min-w-0">
            <h2 className="admin-h2">Broken internal links</h2>
            <p className="admin-micro mt-0.5">
              {audit.internal} internal links across {audit.checked} published articles
            </p>
          </div>
          <span
            className="admin-badge shrink-0"
            data-tone={audit.broken.length ? "bad" : "good"}
          >
            {audit.broken.length || "None"}
          </span>
        </div>

        {audit.broken.length === 0 ? (
          <div className="admin-empty">
            <span
              className="admin-empty-icon"
              style={{ background: "var(--good-soft)", color: "var(--good)" }}
            >
              <CheckCircleIcon />
            </span>
            <p className="admin-h2">Every internal link resolves</p>
            <p className="admin-micro mx-auto mt-1.5 max-w-[46ch]">
              Checked on every load. A link counts as working if it matches a page, a published
              article, or a redirect rule below.
            </p>
          </div>
        ) : (
          <div>
            {audit.broken.map((link, index) => (
              <div key={`${link.postId}-${link.href}-${index}`} className="admin-row">
                <span
                  className="admin-row-icon"
                  style={{ background: "var(--bad-soft)", color: "var(--bad)" }}
                  aria-hidden="true"
                >
                  <ExclamationTriangleIcon />
                </span>

                <span className="min-w-0 flex-1">
                  <span className="admin-mono block truncate text-[13px] font-semibold">
                    {link.href}
                  </span>
                  <span className="admin-micro block truncate">
                    {link.reason} · in “{link.postTitle}”
                  </span>
                </span>

                <span className="flex shrink-0 items-center gap-2">
                  <button
                    type="button"
                    className="admin-btn admin-btn-outline admin-btn-sm"
                    onClick={() => {
                      setSource(link.href);
                      setMessage(null);
                    }}
                  >
                    Redirect it
                  </button>
                  <Link
                    href={`/admin/posts/${link.postId}`}
                    className="admin-btn admin-btn-ghost admin-btn-sm"
                  >
                    Edit article
                  </Link>
                </span>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ── Redirects ── */}
      <section className="admin-card">
        <div className="admin-card-head">
          <div className="min-w-0">
            <h2 className="admin-h2">Redirects</h2>
            <p className="admin-micro mt-0.5">
              Old paths that should send visitors somewhere else. Renaming an article&rsquo;s slug
              adds one automatically.
            </p>
          </div>
          <span className="admin-badge admin-badge-plain shrink-0" data-tone="neutral">
            {redirects.length}
          </span>
        </div>

        <div className="admin-card-pad">
          <div className="grid gap-3 sm:grid-cols-[1fr_1fr_auto_auto] sm:items-end">
            <div>
              <label className="admin-label" htmlFor="redirect-source">
                Old path
              </label>
              <input
                id="redirect-source"
                className="admin-field admin-mono"
                placeholder="/blog/old-slug"
                value={source}
                onChange={(event) => setSource(event.target.value)}
              />
            </div>

            <div>
              <label className="admin-label" htmlFor="redirect-target">
                Send to
              </label>
              <input
                id="redirect-target"
                className="admin-field admin-mono"
                placeholder="/blog/new-slug"
                value={target}
                onChange={(event) => setTarget(event.target.value)}
              />
            </div>

            <div>
              <label className="admin-label" htmlFor="redirect-status">
                Type
              </label>
              <select
                id="redirect-status"
                className="admin-field"
                style={{ minWidth: "10.5rem" }}
                value={status}
                onChange={(event) => setStatus(Number(event.target.value))}
              >
                <option value={301}>301 permanent</option>
                <option value={302}>302 temporary</option>
              </select>
            </div>

            <button
              type="button"
              className="admin-btn admin-btn-primary"
              disabled={pending || !source.trim() || !target.trim()}
              onClick={add}
            >
              <PlusIcon aria-hidden="true" />
              Add
            </button>
          </div>

          <p className="admin-hint">
            Leave the language prefix off — one rule covers both /en and /fr. Use 301 unless the
            move is genuinely temporary; only 301 passes ranking to the new URL.
          </p>

          {message && (
            <p role="status" className="admin-alert mt-3" data-tone={message.tone === "ok" ? "ok" : "error"}>
              {message.text}
            </p>
          )}
        </div>

        {redirects.length > 0 && (
          <div className="border-t" style={{ borderColor: "var(--line-soft)" }}>
            {redirects.map((redirect) => (
              <div key={redirect.id} className="admin-row">
                <span className="admin-mono min-w-0 flex-1 truncate text-[13px]">
                  {redirect.sourcePath}
                </span>
                <ArrowRightIcon
                  className="h-3.5 w-3.5 shrink-0"
                  style={{ color: "var(--ink-4)" }}
                  aria-hidden="true"
                />
                <span className="admin-mono min-w-0 flex-1 truncate text-[13px]">
                  {redirect.targetPath}
                </span>
                <span className="admin-badge admin-badge-plain shrink-0" data-tone="neutral">
                  {redirect.statusCode}
                </span>
                <button
                  type="button"
                  className="admin-tool shrink-0"
                  style={{ color: "var(--bad)" }}
                  aria-label={`Delete redirect from ${redirect.sourcePath}`}
                  disabled={pending}
                  onClick={() =>
                    startTransition(async () => {
                      await deleteRedirectAction(redirect.id);
                    })
                  }
                >
                  <TrashIcon aria-hidden="true" />
                </button>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
