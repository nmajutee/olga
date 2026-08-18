"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  XMarkIcon,
  ArrowUpTrayIcon,
  PhotoIcon,
  CheckCircleIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";

export type MediaAsset = {
  id: string;
  url: string;
  filename: string;
  contentType: string;
  size: number;
  width: number | null;
  height: number | null;
  alt: string;
  createdAt: string;
};

export type InsertOptions = {
  align: "none" | "left" | "center" | "right" | "wide";
  size: "thumbnail" | "medium" | "full";
  caption: string;
};

type Props = {
  open: boolean;
  onClose: () => void;
  onInsert: (asset: MediaAsset, options: InsertOptions) => void;
  /** "insert" shows alignment/size/caption; "select" is a plain file chooser. */
  mode?: "insert" | "select";
  title?: string;
  confirmLabel?: string;
};

const SIZE_WIDTHS: Record<InsertOptions["size"], number | null> = {
  thumbnail: 300,
  medium: 640,
  full: null,
};

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

/** Reads intrinsic dimensions before upload so the library can show them. */
function measure(file: File): Promise<{ width: number | null; height: number | null }> {
  return new Promise((resolve) => {
    if (!file.type.startsWith("image/")) return resolve({ width: null, height: null });

    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve({ width: image.naturalWidth, height: image.naturalHeight });
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      resolve({ width: null, height: null });
    };
    image.src = url;
  });
}

export async function uploadAsset(file: File): Promise<MediaAsset> {
  const { width, height } = await measure(file);

  const body = new FormData();
  body.append("file", file);
  if (width) body.append("width", String(width));
  if (height) body.append("height", String(height));

  const response = await fetch("/api/admin/media", { method: "POST", body });
  const payload = (await response.json()) as Partial<MediaAsset> & { error?: string };

  if (!response.ok || !payload.url) throw new Error(payload.error ?? "Upload failed.");
  return payload as MediaAsset;
}

export function MediaPicker({
  open,
  onClose,
  onInsert,
  mode = "insert",
  title = "Add media",
  confirmLabel = "Insert into article",
}: Props) {
  const [tab, setTab] = useState<"library" | "upload">("library");
  const [assets, setAssets] = useState<MediaAsset[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);

  const [options, setOptions] = useState<InsertOptions>({
    align: "center",
    size: "full",
    caption: "",
  });
  const [altDraft, setAltDraft] = useState("");

  const fileInput = useRef<HTMLInputElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  const selected = assets.find((a) => a.id === selectedId) ?? null;

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/admin/media");
      const payload = (await response.json()) as { items?: MediaAsset[]; error?: string };
      if (!response.ok) throw new Error(payload.error ?? "Could not load the library.");
      setAssets(payload.items ?? []);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not load the library.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!open) return;
    void load();
    setTab("library");
    setSelectedId(null);
    setQuery("");
  }, [open, load]);

  // Escape closes; focus moves into the dialog so the keyboard works.
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    dialogRef.current?.focus();
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  useEffect(() => {
    if (selected) setAltDraft(selected.alt);
  }, [selected]);

  async function handleFiles(files: FileList | File[]) {
    const list = Array.from(files);
    if (!list.length) return;

    setError(null);
    setUploading(list.length);
    const uploaded: MediaAsset[] = [];

    try {
      for (const file of list) {
        uploaded.push(await uploadAsset(file));
        setUploading((n) => n - 1);
      }
      setAssets((current) => [...uploaded, ...current]);
      setSelectedId(uploaded[uploaded.length - 1]?.id ?? null);
      setTab("library");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Upload failed.");
    } finally {
      setUploading(0);
    }
  }

  /** Alt text is a property of the file, so it is saved back to the library. */
  async function persistAlt(asset: MediaAsset, alt: string) {
    setAssets((current) => current.map((a) => (a.id === asset.id ? { ...a, alt } : a)));
    try {
      await fetch("/api/admin/media", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ id: asset.id, alt }),
      });
    } catch {
      // A failed alt save must not block the insert.
    }
  }

  if (!open) return null;

  const visible = query.trim()
    ? assets.filter((a) =>
        `${a.filename} ${a.alt}`.toLowerCase().includes(query.trim().toLowerCase()),
      )
    : assets;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4"
      style={{ background: "rgba(16, 24, 40, 0.55)" }}
      onClick={onClose}
      role="presentation"
    >
      <div
        ref={dialogRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="admin-card flex h-[min(46rem,90vh)] w-full max-w-5xl flex-col overflow-hidden outline-none"
        onClick={(event) => event.stopPropagation()}
      >
        {/* Header */}
        <div className="admin-card-head shrink-0">
          <div className="flex items-center gap-4">
            <h2 className="admin-h2">{title}</h2>
            <div className="admin-segment" role="tablist" aria-label="Media source">
              <button
                type="button"
                role="tab"
                aria-current={tab === "library"}
                className="admin-segment-item"
                onClick={() => setTab("library")}
              >
                Media library
                <span className="admin-segment-count">{assets.length}</span>
              </button>
              <button
                type="button"
                role="tab"
                aria-current={tab === "upload"}
                className="admin-segment-item"
                onClick={() => setTab("upload")}
              >
                Upload files
              </button>
            </div>
          </div>

          <button type="button" className="admin-tool" aria-label="Close" onClick={onClose}>
            <XMarkIcon aria-hidden="true" />
          </button>
        </div>

        <div className="flex min-h-0 flex-1">
          {/* Browse / upload */}
          <div className="flex min-w-0 flex-1 flex-col">
            {tab === "library" && assets.length > 0 && (
              <div className="shrink-0 border-b p-3" style={{ borderColor: "var(--line-soft)" }}>
                <div className="admin-searchbox max-w-none">
                  <MagnifyingGlassIcon
                    className="h-[17px] w-[17px] shrink-0"
                    style={{ color: "var(--ink-4)" }}
                    aria-hidden="true"
                  />
                  <input
                    type="search"
                    placeholder="Search by file name or description"
                    aria-label="Search the media library"
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                  />
                </div>
              </div>
            )}

            <div
              className="min-h-0 flex-1 overflow-y-auto p-4"
              onDragOver={(event) => {
                event.preventDefault();
                setDragging(true);
              }}
              onDragLeave={() => setDragging(false)}
              onDrop={(event) => {
                event.preventDefault();
                setDragging(false);
                if (event.dataTransfer.files.length) void handleFiles(event.dataTransfer.files);
              }}
            >
              {tab === "upload" || assets.length === 0 ? (
                <div
                  className="flex h-full min-h-[18rem] flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 text-center transition-colors"
                  style={{
                    borderColor: dragging ? "var(--blue)" : "var(--line-strong)",
                    background: dragging ? "var(--blue-soft)" : "var(--raised)",
                  }}
                >
                  <span className="admin-empty-icon">
                    <ArrowUpTrayIcon />
                  </span>
                  <p className="admin-h2">Drop files here</p>
                  <p className="admin-micro mx-auto mt-1.5 max-w-[36ch]">
                    Or choose them from your computer. JPG, PNG, WebP, GIF, SVG and PDF, up to
                    10MB each.
                  </p>
                  <button
                    type="button"
                    className="admin-btn admin-btn-primary mt-5"
                    disabled={uploading > 0}
                    onClick={() => fileInput.current?.click()}
                  >
                    {uploading > 0 ? `Uploading ${uploading}…` : "Select files"}
                  </button>
                </div>
              ) : loading ? (
                <p className="admin-meta p-6 text-center">Loading library…</p>
              ) : visible.length === 0 ? (
                <p className="admin-meta p-6 text-center">Nothing matches “{query}”.</p>
              ) : (
                <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-5">
                  {visible.map((asset) => {
                    const active = asset.id === selectedId;
                    return (
                      <button
                        key={asset.id}
                        type="button"
                        aria-pressed={active}
                        onClick={() => setSelectedId(asset.id)}
                        onDoubleClick={() => onInsert(asset, options)}
                        className="group relative overflow-hidden rounded-lg border text-left transition-all"
                        style={{
                          borderColor: active ? "var(--blue)" : "var(--line)",
                          boxShadow: active ? "0 0 0 3px var(--blue-soft)" : "none",
                        }}
                      >
                        <span
                          className="flex aspect-square items-center justify-center"
                          style={{ background: "var(--sunken)" }}
                        >
                          {asset.contentType.startsWith("image/") ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={asset.url}
                              alt={asset.alt || asset.filename}
                              loading="lazy"
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <PhotoIcon
                              className="h-6 w-6"
                              style={{ color: "var(--ink-4)" }}
                              aria-hidden="true"
                            />
                          )}
                        </span>

                        {active && (
                          <span
                            className="absolute right-1.5 top-1.5 rounded-full"
                            style={{ background: "#fff", color: "var(--blue)" }}
                          >
                            <CheckCircleIcon className="h-5 w-5" aria-hidden="true" />
                          </span>
                        )}

                        {!asset.alt && asset.contentType.startsWith("image/") && (
                          <span
                            className="absolute bottom-1.5 left-1.5 rounded px-1.5 py-0.5 text-[10px] font-semibold"
                            style={{ background: "var(--warn-soft)", color: "var(--warn)" }}
                          >
                            No alt
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Attachment details */}
          <aside
            className="hidden w-[19rem] shrink-0 overflow-y-auto border-l p-4 lg:block"
            style={{ borderColor: "var(--line)", background: "var(--raised)" }}
            aria-label="Attachment details"
          >
            {selected ? (
              <div className="space-y-4">
                <div
                  className="overflow-hidden rounded-lg border"
                  style={{ borderColor: "var(--line)", background: "var(--sunken)" }}
                >
                  {selected.contentType.startsWith("image/") ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={selected.url}
                      alt={selected.alt || selected.filename}
                      className="max-h-40 w-full object-contain"
                    />
                  ) : (
                    <div className="flex h-24 items-center justify-center">
                      <PhotoIcon className="h-7 w-7" style={{ color: "var(--ink-4)" }} aria-hidden="true" />
                    </div>
                  )}
                </div>

                <div>
                  <p className="truncate text-[13px] font-semibold">{selected.filename}</p>
                  <p className="admin-micro mt-0.5">
                    {formatSize(selected.size)}
                    {selected.width && selected.height
                      ? ` · ${selected.width}×${selected.height}`
                      : ""}
                  </p>
                </div>

                <div>
                  <label className="admin-label" htmlFor="picker-alt">
                    Alt text
                  </label>
                  <textarea
                    id="picker-alt"
                    rows={2}
                    className="admin-field"
                    placeholder="Describe the image"
                    value={altDraft}
                    onChange={(event) => setAltDraft(event.target.value)}
                    onBlur={() => void persistAlt(selected, altDraft)}
                  />
                  <p className="admin-hint">Saved to the file, so it is reused everywhere.</p>
                </div>

                {mode === "insert" && (
                  <>
                    <div>
                      <label className="admin-label" htmlFor="picker-caption">
                        Caption
                      </label>
                      <input
                        id="picker-caption"
                        className="admin-field"
                        placeholder="Optional, shown under the image"
                        value={options.caption}
                        onChange={(event) =>
                          setOptions((o) => ({ ...o, caption: event.target.value }))
                        }
                      />
                    </div>

                    <div>
                      <span className="admin-label">Alignment</span>
                      <div className="grid grid-cols-4 gap-1">
                        {(["left", "center", "right", "wide"] as const).map((value) => (
                          <button
                            key={value}
                            type="button"
                            className="admin-btn admin-btn-sm capitalize"
                            aria-pressed={options.align === value}
                            style={
                              options.align === value
                                ? { background: "var(--blue-soft)", color: "var(--blue-deep)" }
                                : { border: "1px solid var(--line)", color: "var(--ink-2)" }
                            }
                            onClick={() => setOptions((o) => ({ ...o, align: value }))}
                          >
                            {value}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="admin-label" htmlFor="picker-size">
                        Size
                      </label>
                      <select
                        id="picker-size"
                        className="admin-field"
                        value={options.size}
                        onChange={(event) =>
                          setOptions((o) => ({
                            ...o,
                            size: event.target.value as InsertOptions["size"],
                          }))
                        }
                      >
                        <option value="thumbnail">Thumbnail — 300px</option>
                        <option value="medium">Medium — 640px</option>
                        <option value="full">Full width</option>
                      </select>
                    </div>
                  </>
                )}

                <div>
                  <label className="admin-label" htmlFor="picker-url">
                    File path
                  </label>
                  <input
                    id="picker-url"
                    readOnly
                    className="admin-field admin-mono"
                    value={selected.url}
                    onFocus={(event) => event.target.select()}
                  />
                </div>
              </div>
            ) : (
              <p className="admin-meta pt-8 text-center">Select a file to see its details.</p>
            )}
          </aside>
        </div>

        {/* Footer */}
        <div
          className="flex shrink-0 items-center gap-3 border-t p-4"
          style={{ borderColor: "var(--line)" }}
        >
          {error && (
            <p role="alert" className="admin-alert flex-1" data-tone="error">
              {error}
            </p>
          )}

          {!error && selected && (
            <p className="admin-micro flex-1 truncate">
              {selected.filename} selected · double-click a file to insert it straight away
            </p>
          )}

          <div className="ml-auto flex items-center gap-2">
            <button type="button" className="admin-btn admin-btn-outline" onClick={onClose}>
              Cancel
            </button>
            <button
              type="button"
              className="admin-btn admin-btn-primary"
              disabled={!selected}
              onClick={() => selected && onInsert(selected, options)}
            >
              {confirmLabel}
            </button>
          </div>
        </div>

        <input
          ref={fileInput}
          type="file"
          multiple
          accept="image/*,application/pdf"
          aria-label="Choose files to upload"
          tabIndex={-1}
          className="hidden"
          onChange={(event) => {
            if (event.target.files?.length) void handleFiles(event.target.files);
            event.target.value = "";
          }}
        />
      </div>
    </div>
  );
}

export { SIZE_WIDTHS };
