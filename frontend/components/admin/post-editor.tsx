"use client";

import { useCallback, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { RichTextEditor } from "@/components/admin/rich-text-editor";
import { SeoRail } from "@/components/admin/seo-rail";
import { CommissionBrief } from "@/components/admin/commission-brief";
import { MediaField } from "@/components/admin/media-field";
import { savePostAction, deletePostAction, type PostFormValues } from "@/app/admin/actions";
import type { Draft } from "@/lib/ai-draft";

type Props = {
  initial: PostFormValues;
  siteUrl: string;
  defaultTone: string;
  defaultWords: string;
  isNew: boolean;
};

function slugify(input: string): string {
  return input
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export function PostEditor({ initial, siteUrl, defaultTone, defaultWords, isNew }: Props) {
  const router = useRouter();
  const [values, setValues] = useState<PostFormValues>(initial);
  const [slugTouched, setSlugTouched] = useState(!isNew);
  const [saving, startSaving] = useTransition();
  const [message, setMessage] = useState<{ kind: "ok" | "error"; text: string } | null>(null);
  const [dirty, setDirty] = useState(false);

  const set = useCallback(<K extends keyof PostFormValues>(key: K, value: PostFormValues[K]) => {
    setValues((current) => ({ ...current, [key]: value }));
    setDirty(true);
    setMessage(null);
  }, []);

  const applyDraft = useCallback((draft: Draft) => {
    setValues((current) => ({
      ...current,
      title: draft.title,
      slug: draft.slug || slugify(draft.title),
      excerpt: draft.excerpt,
      content: draft.contentHtml,
      metaTitle: draft.metaTitle,
      metaDescription: draft.metaDescription,
      focusKeyword: draft.focusKeyword,
      tags: draft.tags,
    }));
    setSlugTouched(true);
    setDirty(true);
    setMessage({ kind: "ok", text: "Draft loaded. Read it through before publishing." });
  }, []);

  function save(status: "draft" | "published") {
    const payload = { ...values, status };

    startSaving(async () => {
      const result = await savePostAction(payload);

      if (result.error) {
        setMessage({ kind: "error", text: result.error });
        return;
      }

      setValues(payload);
      setDirty(false);
      setMessage({
        kind: "ok",
        text: status === "published" ? "Published." : "Draft saved.",
      });

      if (isNew && result.id) {
        router.replace(`/admin/posts/${result.id}`);
      } else {
        router.refresh();
      }
    });
  }

  function remove() {
    if (!values.id) return;
    if (!window.confirm("Delete this article? This cannot be undone.")) return;

    startSaving(async () => {
      await deletePostAction(values.id!);
      router.push("/admin/posts");
    });
  }

  return (
    <div>
      {/* The visible title is an input, so the document still needs a heading. */}
      <h1 className="sr-only">
        {isNew ? "New article" : `Editing: ${values.title || "Untitled article"}`}
      </h1>

      {/* Command bar */}
      <header
        className="sticky top-0 z-20 flex flex-wrap items-center gap-3 border-b px-4 py-2.5 backdrop-blur sm:px-5"
        style={{ borderColor: "var(--line)", background: "rgba(244,246,250,0.94)" }}
      >
        <Link
          href="/admin/posts"
          className="text-sm transition-colors hover:text-[var(--ink)]"
          style={{ color: "var(--ink-3)" }}
        >
          ← Articles
        </Link>

        <span className="admin-badge" data-tone={values.status}>
          {values.status === "published" ? "Published" : "Draft"}
        </span>

        {dirty && (
          <span className="admin-mono text-xs" style={{ color: "var(--warn)" }}>
            Unsaved
          </span>
        )}

        {message && (
          <span
            role="status"
            className="admin-mono text-xs"
            style={{ color: message.kind === "ok" ? "var(--good)" : "var(--bad)" }}
          >
            {message.text}
          </span>
        )}

        <div className="ml-auto flex items-center gap-2">
          {!isNew && values.status === "published" && (
            <a
              href={`/en/blog/${values.slug}`}
              target="_blank"
              rel="noreferrer"
              className="admin-btn admin-btn-outline"
            >
              View ↗
            </a>
          )}
          <button
            type="button"
            className="admin-btn admin-btn-outline"
            disabled={saving}
            onClick={() => save("draft")}
          >
            Save draft
          </button>
          <button
            type="button"
            className="admin-btn admin-btn-primary"
            disabled={saving}
            onClick={() => save("published")}
          >
            {saving ? "Saving…" : values.status === "published" ? "Update" : "Publish"}
          </button>
        </div>
      </header>

      <div className="grid gap-5 p-4 sm:p-5 xl:grid-cols-[minmax(0,1fr)_21rem]">
        <div className="min-w-0 space-y-4">
          {isNew && (
            <CommissionBrief
              defaultTone={defaultTone}
              defaultWords={defaultWords}
              onDraft={applyDraft}
            />
          )}

          <div>
            <label className="sr-only" htmlFor="title">
              Title
            </label>
            <input
              id="title"
              className="admin-h1 w-full bg-transparent text-[28px] outline-none"
              style={{ color: "var(--ink)" }}
              placeholder="Untitled article"
              value={values.title}
              onChange={(event) => {
                set("title", event.target.value);
                if (!slugTouched) set("slug", slugify(event.target.value));
              }}
            />

            <div className="mt-2 flex items-center gap-1 text-xs" style={{ color: "var(--ink-4)" }}>
              <span className="admin-mono">{siteUrl.replace(/^https?:\/\//, "")}/en/blog/</span>
              <input
                aria-label="URL slug"
                className="admin-mono min-w-0 flex-1 bg-transparent outline-none"
                style={{ color: "var(--blue-deep)" }}
                value={values.slug}
                placeholder="url-slug"
                onChange={(event) => {
                  setSlugTouched(true);
                  set("slug", slugify(event.target.value));
                }}
              />
            </div>
          </div>

          <RichTextEditor value={values.content} onChange={(html) => set("content", html)} />

          {/* Details below the page, where they belong once the writing is done. */}
          <details className="admin-card p-5" open={!isNew}>
            <summary className="admin-h2 cursor-pointer select-none">
              Metadata &amp; SEO
            </summary>

            <div className="mt-4 space-y-4">
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label className="admin-label" htmlFor="focusKeyword">
                    Focus keyword
                  </label>
                  <input
                    id="focusKeyword"
                    className="admin-field"
                    value={values.focusKeyword}
                    onChange={(event) => set("focusKeyword", event.target.value)}
                    placeholder="What phrase should this rank for?"
                  />
                </div>
                <div>
                  <label className="admin-label" htmlFor="tags">
                    Tags
                  </label>
                  <input
                    id="tags"
                    className="admin-field"
                    value={values.tags.join(", ")}
                    onChange={(event) =>
                      set(
                        "tags",
                        event.target.value.split(",").map((tag) => tag.trim()).filter(Boolean),
                      )
                    }
                    placeholder="digital rights, media literacy"
                  />
                </div>
              </div>

              <div>
                <label className="admin-label" htmlFor="metaTitle">
                  SEO title
                </label>
                <input
                  id="metaTitle"
                  className="admin-field"
                  value={values.metaTitle}
                  onChange={(event) => set("metaTitle", event.target.value)}
                  placeholder="Leave blank to use the article title"
                />
              </div>

              <div>
                <label className="admin-label" htmlFor="metaDescription">
                  Meta description
                </label>
                <textarea
                  id="metaDescription"
                  rows={2}
                  className="admin-field resize-y"
                  value={values.metaDescription}
                  onChange={(event) => set("metaDescription", event.target.value)}
                />
                <p className="admin-hint">
                  This is the sentence under the blue link in search results. Write it to earn the
                  click.
                </p>
              </div>

              <div>
                <label className="admin-label" htmlFor="excerpt">
                  Excerpt
                </label>
                <textarea
                  id="excerpt"
                  rows={2}
                  className="admin-field resize-y"
                  value={values.excerpt}
                  onChange={(event) => set("excerpt", event.target.value)}
                  placeholder="Shown on the blog index and social shares"
                />
              </div>

              <MediaField
                label="Cover image"
                url={values.coverImageUrl}
                alt={values.coverImageAlt}
                onUrlChange={(url) => set("coverImageUrl", url)}
                onAltChange={(alt) => set("coverImageAlt", alt)}
                hint="Shown at the top of the article, on the blog index and when the link is shared."
              />

              <div>
                <div>
                  <label className="admin-label" htmlFor="canonicalUrl">
                    Canonical URL
                  </label>
                  <input
                    id="canonicalUrl"
                    className="admin-field"
                    value={values.canonicalUrl}
                    onChange={(event) => set("canonicalUrl", event.target.value)}
                    placeholder="Only if this was published elsewhere first"
                  />
                </div>
              </div>


              <label className="flex items-center gap-2 text-sm" style={{ color: "var(--ink-2)" }}>
                <input
                  type="checkbox"
                  checked={values.noindex}
                  onChange={(event) => set("noindex", event.target.checked)}
                />
                Hide from search engines and the sitemap
              </label>

              {!isNew && (
                <div className="border-t pt-4" style={{ borderColor: "var(--line)" }}>
                  <button type="button" className="admin-btn admin-btn-danger" onClick={remove}>
                    Delete article
                  </button>
                </div>
              )}
            </div>
          </details>
        </div>

        <div className="xl:sticky xl:top-[4.5rem] xl:self-start">
          <SeoRail
            siteUrl={siteUrl}
            title={values.title}
            slug={values.slug}
            content={values.content}
            excerpt={values.excerpt}
            metaTitle={values.metaTitle}
            metaDescription={values.metaDescription}
            focusKeyword={values.focusKeyword}
            coverImageAlt={values.coverImageAlt}
          />
        </div>
      </div>
    </div>
  );
}
