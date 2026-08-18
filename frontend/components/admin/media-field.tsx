"use client";

import { useRef, useState } from "react";
import { PhotoIcon, XMarkIcon, RectangleStackIcon } from "@heroicons/react/24/outline";
import { MediaPicker } from "@/components/admin/media-picker";

/** Upload-or-paste image field, shared by the article and content editors. */
export function MediaField({
  label,
  url,
  alt,
  onUrlChange,
  onAltChange,
  shape = "landscape",
  hint,
}: {
  label: string;
  url: string;
  alt: string;
  onUrlChange: (url: string) => void;
  onAltChange: (alt: string) => void;
  /** A profile photo is cropped to a circle everywhere it appears, so the
   *  preview has to be a circle too — a landscape thumbnail hides the crop. */
  shape?: "landscape" | "avatar";
  hint?: string;
}) {
  const fileInput = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);

  async function upload(file: File) {
    setUploading(true);
    setError(null);

    try {
      const body = new FormData();
      body.append("file", file);

      const response = await fetch("/api/admin/media", { method: "POST", body });
      const payload = (await response.json()) as { url?: string; error?: string };

      if (!response.ok || !payload.url) throw new Error(payload.error ?? "Upload failed.");
      onUrlChange(payload.url);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Upload failed.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div>
      <p className="admin-label">{label}</p>

      <div className="flex flex-wrap items-start gap-4">
        <div
          className={`flex shrink-0 items-center justify-center overflow-hidden border ${
            shape === "avatar" ? "h-24 w-24 rounded-full" : "h-28 w-40 rounded-xl"
          }`}
          style={{ borderColor: "var(--line)", background: "var(--sunken)" }}
          onDragOver={(event) => event.preventDefault()}
          onDrop={(event) => {
            event.preventDefault();
            const file = event.dataTransfer.files?.[0];
            if (file) void upload(file);
          }}
        >
          {url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={url} alt={alt} className="h-full w-full object-cover" />
          ) : (
            <PhotoIcon className="h-7 w-7" style={{ color: "var(--ink-4)" }} aria-hidden="true" />
          )}
        </div>

        <div className="min-w-[14rem] flex-1 space-y-2">
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className="admin-btn admin-btn-outline admin-btn-sm"
              onClick={() => setPickerOpen(true)}
            >
              <RectangleStackIcon aria-hidden="true" />
              {url ? "Replace" : "Choose image"}
            </button>

            <button
              type="button"
              className="admin-btn admin-btn-ghost admin-btn-sm"
              disabled={uploading}
              onClick={() => fileInput.current?.click()}
            >
              {uploading ? "Uploading…" : "Upload new"}
            </button>

            {url && (
              <button
                type="button"
                className="admin-btn admin-btn-ghost admin-btn-sm"
                onClick={() => onUrlChange("")}
              >
                <XMarkIcon aria-hidden="true" />
                Remove
              </button>
            )}
          </div>

          <input
            className="admin-field admin-mono text-xs"
            value={url}
            placeholder="/media/2026/08/…"
            aria-label={`${label} path`}
            onChange={(event) => onUrlChange(event.target.value)}
          />

          {shape !== "avatar" && (
            <input
              className="admin-field"
              value={alt}
              placeholder="Describe the image for screen readers"
              aria-label={`${label} description`}
              onChange={(event) => onAltChange(event.target.value)}
            />
          )}

          {hint && <p className="admin-hint">{hint}</p>}
        </div>
      </div>

      {error && (
        <p role="alert" className="admin-alert mt-3" data-tone="error">
          {error}
        </p>
      )}

      <MediaPicker
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        mode="select"
        title={`Choose ${label.toLowerCase()}`}
        confirmLabel="Use this image"
        onInsert={(asset) => {
          onUrlChange(asset.url);
          if (asset.alt) onAltChange(asset.alt);
          setPickerOpen(false);
        }}
      />

      {/* Visually hidden trigger — "Upload new" is the real control, so name
          it for assistive tech and keep it out of the tab order. */}
      <input
        ref={fileInput}
        type="file"
        accept="image/*"
        aria-label={`Upload ${label.toLowerCase()}`}
        tabIndex={-1}
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) void upload(file);
          event.target.value = "";
        }}
      />
    </div>
  );
}
