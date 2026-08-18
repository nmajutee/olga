"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { RichTextEditor } from "@/components/admin/rich-text-editor";
import { MediaField } from "@/components/admin/media-field";
import { saveContentAction, deleteContentAction } from "@/app/admin/actions";
import type { CollectionDef, ContentItem } from "@/lib/collections";

function slugify(input: string): string {
  return input
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

type Values = {
  title: string;
  slug: string;
  summary: string;
  body: string;
  imageUrl: string;
  imageAlt: string;
  extra: Record<string, string>;
  status: "draft" | "published";
};

export function ContentEditor({
  definition,
  item,
}: {
  definition: CollectionDef;
  item: ContentItem | null;
}) {
  const router = useRouter();
  const isNew = !item;

  const [values, setValues] = useState<Values>({
    title: item?.title ?? "",
    slug: item?.slug ?? "",
    summary: item?.summary ?? "",
    body: item?.body ?? "",
    imageUrl: item?.imageUrl ?? "",
    imageAlt: item?.imageAlt ?? "",
    extra: item?.extra ?? {},
    status: item?.status ?? "published",
  });

  const [slugTouched, setSlugTouched] = useState(!isNew);
  const [saving, startSaving] = useTransition();
  const [message, setMessage] = useState<{ tone: "ok" | "error"; text: string } | null>(null);

  function set<K extends keyof Values>(key: K, value: Values[K]) {
    setValues((current) => ({ ...current, [key]: value }));
    setMessage(null);
  }

  function setExtra(key: string, value: string) {
    setValues((current) => ({ ...current, extra: { ...current.extra, [key]: value } }));
    setMessage(null);
  }

  function save(status: "draft" | "published") {
    startSaving(async () => {
      const result = await saveContentAction({
        id: item?.id,
        collection: definition.slug,
        ...values,
        status,
      });

      if (result.error) {
        setMessage({ tone: "error", text: result.error });
        return;
      }

      setValues((current) => ({ ...current, status }));
      setMessage({ tone: "ok", text: status === "published" ? "Saved and live." : "Saved as draft." });

      if (isNew && result.id) {
        router.replace(`/admin/collections/${definition.slug}/${result.id}`);
      } else {
        router.refresh();
      }
    });
  }

  function remove() {
    if (!item) return;
    if (!window.confirm(`Delete “${item.title}”? This cannot be undone.`)) return;

    startSaving(async () => {
      await deleteContentAction(item.id, definition.slug);
      router.push(`/admin/collections/${definition.slug}`);
    });
  }

  return (
    <div className="space-y-4">
      <div className="admin-card admin-card-pad space-y-4">
        <div>
          <label className="admin-label" htmlFor="title">
            Title
          </label>
          <input
            id="title"
            className="admin-field"
            value={values.title}
            placeholder={`Name this ${definition.label.toLowerCase()}`}
            onChange={(event) => {
              set("title", event.target.value);
              if (!slugTouched) set("slug", slugify(event.target.value));
            }}
          />
        </div>

        <div>
          <label className="admin-label" htmlFor="slug">
            URL slug
          </label>
          <input
            id="slug"
            className="admin-field admin-mono"
            value={values.slug}
            placeholder="url-slug"
            onChange={(event) => {
              setSlugTouched(true);
              set("slug", slugify(event.target.value));
            }}
          />
        </div>

        {definition.uses.summary && (
          <div>
            <label className="admin-label" htmlFor="summary">
              {definition.summaryLabel}
            </label>
            <textarea
              id="summary"
              rows={2}
              className="admin-field resize-y"
              value={values.summary}
              onChange={(event) => set("summary", event.target.value)}
            />
          </div>
        )}

        {definition.extra.length > 0 && (
          <div className="grid gap-5 sm:grid-cols-2">
            {definition.extra.map((field) => (
              <div
                key={field.key}
                className={field.half ? undefined : "sm:col-span-2"}
              >
                <label className="admin-label" htmlFor={field.key}>
                  {field.label}
                </label>

                {field.type === "list" ? (
                  <textarea
                    id={field.key}
                    rows={3}
                    className="admin-field resize-y"
                    value={values.extra[field.key] ?? ""}
                    placeholder={field.placeholder}
                    onChange={(event) => setExtra(field.key, event.target.value)}
                  />
                ) : (
                  <input
                    id={field.key}
                    type={field.type === "url" ? "url" : field.type === "number" ? "number" : "text"}
                    className="admin-field"
                    value={values.extra[field.key] ?? ""}
                    placeholder={field.placeholder}
                    onChange={(event) => setExtra(field.key, event.target.value)}
                  />
                )}

                {field.hint && <p className="admin-hint">{field.hint}</p>}
              </div>
            ))}
          </div>
        )}
      </div>

      {definition.uses.image && (
        <div className="admin-card admin-card-pad">
          <MediaField
            label="Image"
            url={values.imageUrl}
            alt={values.imageAlt}
            onUrlChange={(url) => set("imageUrl", url)}
            onAltChange={(alt) => set("imageAlt", alt)}
          />
        </div>
      )}

      {definition.uses.body && (
        <div>
          <p className="admin-label">Body</p>
          <RichTextEditor
            value={values.body}
            onChange={(html) => set("body", html)}
            placeholder="Write the detail here."
          />
        </div>
      )}

      <div className="admin-card flex flex-wrap items-center gap-3 p-4">
        {message && (
          <span
            role="status"
            className="text-sm font-semibold"
            style={{ color: message.tone === "ok" ? "var(--good)" : "var(--bad)" }}
          >
            {message.text}
          </span>
        )}

        {item && (
          <button type="button" className="admin-btn admin-btn-danger" onClick={remove}>
            Delete
          </button>
        )}

        <div className="ml-auto flex items-center gap-2">
          <button
            type="button"
            className="admin-btn admin-btn-outline"
            disabled={saving}
            onClick={() => save("draft")}
          >
            Save as draft
          </button>
          <button
            type="button"
            className="admin-btn admin-btn-primary"
            disabled={saving}
            onClick={() => save("published")}
          >
            {saving ? "Saving…" : values.status === "published" && !isNew ? "Update" : "Publish"}
          </button>
        </div>
      </div>
    </div>
  );
}
