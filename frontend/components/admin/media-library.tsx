"use client";

import { useRef, useState, useTransition } from "react";
import { ArrowUpTrayIcon, PhotoIcon, DocumentIcon } from "@heroicons/react/24/outline";
import { deleteMediaAction, updateMediaAltAction } from "@/app/admin/actions";

export type MediaItem = {
  id: string;
  url: string;
  filename: string;
  contentType: string;
  size: number;
  alt: string;
  createdAt: string;
};

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export function MediaLibrary({ items }: { items: MediaItem[] }) {
  const fileInput = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [selected, setSelected] = useState<MediaItem | null>(null);
  const [pending, startTransition] = useTransition();

  async function upload(files: FileList) {
    setUploading(true);
    setError(null);

    try {
      for (const file of Array.from(files)) {
        const body = new FormData();
        body.append("file", file);

        const response = await fetch("/api/admin/media", { method: "POST", body });
        if (!response.ok) {
          const payload = (await response.json()) as { error?: string };
          throw new Error(payload.error ?? `Upload failed for ${file.name}.`);
        }
      }
      window.location.reload();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Upload failed.");
    } finally {
      setUploading(false);
    }
  }

  async function copyPath(item: MediaItem) {
    await navigator.clipboard.writeText(item.url);
    setCopied(item.id);
    window.setTimeout(() => setCopied(null), 1600);
  }

  return (
    <div className="admin-page">
      <div className="flex flex-wrap items-center justify-between gap-4 pb-6 pt-7">
        <div className="min-w-0">
          <h1 className="admin-h1">Media</h1>
          <p className="admin-meta mt-1">
            {items.length === 0
              ? "Images and files used across the site."
              : `${items.length} ${items.length === 1 ? "file" : "files"} stored in Cloudflare R2.`}
          </p>
        </div>

        <button
          type="button"
          className="admin-btn admin-btn-primary"
          disabled={uploading}
          onClick={() => fileInput.current?.click()}
        >
          <ArrowUpTrayIcon aria-hidden="true" />
          {uploading ? "Uploading…" : "Upload files"}
        </button>

        <input
          ref={fileInput}
          type="file"
          aria-label="Upload files to the media library"
          tabIndex={-1}
          multiple
          accept="image/*,application/pdf"
          className="hidden"
          onChange={(event) => {
            if (event.target.files?.length) void upload(event.target.files);
            event.target.value = "";
          }}
        />
      </div>

      {error && (
        <p
          role="alert"
          className="mb-4 admin-alert" data-tone="error"
        >
          {error}
        </p>
      )}

      {items.length === 0 ? (
        <div
          className="admin-card admin-empty"
          onDragOver={(event) => event.preventDefault()}
          onDrop={(event) => {
            event.preventDefault();
            if (event.dataTransfer.files.length) void upload(event.dataTransfer.files);
          }}
        >
          <span className="admin-empty-icon">
            <PhotoIcon />
          </span>
          <p className="admin-h2">No files yet</p>
          <p className="admin-micro mx-auto mt-1.5 max-w-[46ch]">
            Drop images here, or upload them. Every file gets a permanent path you can paste into
            an article.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-6">
          {items.map((item) => (
            <button
              key={item.id}
              type="button"
              className="admin-card group overflow-hidden text-left transition-colors hover:border-[var(--blue)]"
              onClick={() => setSelected(item)}
            >
              <div className="flex aspect-[4/3] items-center justify-center" style={{ background: "var(--sunken)" }}>
                {item.contentType.startsWith("image/") ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={item.url}
                    alt={item.alt || item.filename}
                    loading="lazy"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <DocumentIcon className="h-6 w-6" style={{ color: "var(--ink-4)" }} aria-hidden="true" />
                )}
              </div>

              <div className="px-2.5 py-2">
                <p className="truncate text-[13px] font-semibold">{item.filename}</p>
                <p className="admin-micro mt-0.5">
                  {formatSize(item.size)}
                  {!item.alt && item.contentType.startsWith("image/") && (
                    <span style={{ color: "var(--warn)" }}> · no alt text</span>
                  )}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}

      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          role="dialog"
          aria-modal="true"
          aria-label={selected.filename}
          onClick={() => setSelected(null)}
        >
          <div
            className="admin-card w-full max-w-lg admin-card-pad"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-4 flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="admin-h2 truncate">{selected.filename}</p>
                <p className="admin-micro mt-0.5">
                  {formatSize(selected.size)} · {selected.contentType}
                </p>
              </div>
              <button
                type="button"
                className="admin-btn admin-btn-ghost admin-btn-sm"
                onClick={() => setSelected(null)}
              >
                Close
              </button>
            </div>

            {selected.contentType.startsWith("image/") && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={selected.url}
                alt={selected.alt || selected.filename}
                className="mb-4 max-h-64 w-full rounded-lg object-contain" style={{ background: "var(--sunken)" }}
              />
            )}

            <label className="admin-label" htmlFor="alt">
              Description (alt text)
            </label>
            <input
              id="alt"
              className="admin-field"
              defaultValue={selected.alt}
              onBlur={(event) =>
                startTransition(async () => {
                  await updateMediaAltAction(selected.id, event.target.value);
                })
              }
            />
            <p className="admin-hint">
              Describe what the image shows. Screen readers read this aloud, and search engines
              index it.
            </p>

            <div className="mt-4 flex flex-wrap items-center gap-2">
              <button
                type="button"
                className="admin-btn admin-btn-outline"
                onClick={() => void copyPath(selected)}
              >
                {copied === selected.id ? "Copied" : "Copy path"}
              </button>
              <a
                href={selected.url}
                target="_blank"
                rel="noreferrer"
                className="admin-btn admin-btn-outline"
              >
                Open ↗
              </a>
              <button
                type="button"
                className="admin-btn admin-btn-danger ml-auto"
                disabled={pending}
                onClick={() => {
                  if (!window.confirm(`Delete ${selected.filename}? Articles using it will break.`))
                    return;
                  startTransition(async () => {
                    await deleteMediaAction(selected.id);
                    setSelected(null);
                    window.location.reload();
                  });
                }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
