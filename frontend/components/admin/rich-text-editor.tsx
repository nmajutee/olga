"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { EditorContent, useEditor, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import { PhotoIcon } from "@heroicons/react/24/outline";
import { AlignedImage, FigureImage } from "@/components/admin/editor-image";
import {
  MediaPicker,
  uploadAsset,
  SIZE_WIDTHS,
  type MediaAsset,
  type InsertOptions,
} from "@/components/admin/media-picker";

type Props = {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
};

const TOOLS = [
  { id: "bold", label: "B", title: "Bold", className: "font-bold" },
  { id: "italic", label: "I", title: "Italic", className: "italic" },
  { id: "h2", label: "H2", title: "Section heading" },
  { id: "h3", label: "H3", title: "Subheading" },
  { id: "bulletList", label: "• List", title: "Bulleted list" },
  { id: "orderedList", label: "1. List", title: "Numbered list" },
  { id: "blockquote", label: "❝", title: "Quote" },
  { id: "code", label: "‹›", title: "Inline code" },
] as const;

function isActive(editor: Editor, id: (typeof TOOLS)[number]["id"]): boolean {
  switch (id) {
    case "h2":
      return editor.isActive("heading", { level: 2 });
    case "h3":
      return editor.isActive("heading", { level: 3 });
    default:
      return editor.isActive(id);
  }
}

function runTool(editor: Editor, id: (typeof TOOLS)[number]["id"]): void {
  const chain = editor.chain().focus();

  switch (id) {
    case "bold":
      chain.toggleBold().run();
      break;
    case "italic":
      chain.toggleItalic().run();
      break;
    case "h2":
      chain.toggleHeading({ level: 2 }).run();
      break;
    case "h3":
      chain.toggleHeading({ level: 3 }).run();
      break;
    case "bulletList":
      chain.toggleBulletList().run();
      break;
    case "orderedList":
      chain.toggleOrderedList().run();
      break;
    case "blockquote":
      chain.toggleBlockquote().run();
      break;
    case "code":
      chain.toggleCode().run();
      break;
  }
}

export function RichTextEditor({ value, onChange, placeholder }: Props) {
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [dropActive, setDropActive] = useState(false);

  // editorProps are captured when the editor is created, before the upload
  // handler exists — the ref lets those handlers reach the current closure.
  const insertFilesRef = useRef<((files: File[]) => Promise<void>) | null>(null);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3, 4] },
        link: {
          openOnClick: false,
          autolink: true,
          HTMLAttributes: { rel: "noopener noreferrer" },
        },
      }),
      AlignedImage.configure({ HTMLAttributes: { loading: "lazy" } }),
      FigureImage,
      Placeholder.configure({
        placeholder: placeholder ?? "Start writing, or commission a draft above.",
      }),
    ],
    content: value,
    editorProps: {
      attributes: { class: "tiptap", spellcheck: "true" },
      handlePaste: (_view, event) => {
        const files = Array.from(event.clipboardData?.files ?? []).filter((f) =>
          f.type.startsWith("image/"),
        );
        if (!files.length) return false;
        event.preventDefault();
        void insertFilesRef.current?.(files);
        return true;
      },
      handleDrop: (_view, event) => {
        const files = Array.from(
          (event as DragEvent).dataTransfer?.files ?? [],
        ).filter((f) => f.type.startsWith("image/"));
        if (!files.length) return false;
        event.preventDefault();
        void insertFilesRef.current?.(files);
        return true;
      },
    },
    onUpdate: ({ editor: instance }) => onChange(instance.getHTML()),
  });

  // Keep the editor in sync when a generated draft replaces the content.
  useEffect(() => {
    if (!editor) return;
    if (value !== editor.getHTML()) {
      editor.commands.setContent(value, { emitUpdate: false });
    }
  }, [value, editor]);

  const setLink = useCallback(() => {
    if (!editor) return;

    const previous = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("Link URL", previous ?? "https://");

    if (url === null) return;

    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }

    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  }, [editor]);

  /** Places a chosen asset into the document with its alignment and size. */
  const insertAsset = useCallback(
    (asset: MediaAsset, options: InsertOptions) => {
      if (!editor) return;

      const width = SIZE_WIDTHS[options.size];
      const attrs = {
        src: asset.url,
        alt: asset.alt,
        align: options.align,
        width: width ? String(width) : null,
      };

      if (options.caption.trim()) {
        editor
          .chain()
          .focus()
          .insertContent({
            type: "figureImage",
            attrs,
            content: [{ type: "text", text: options.caption.trim() }],
          })
          .run();
      } else {
        editor.chain().focus().insertContent({ type: "image", attrs }).run();
      }

      setPickerOpen(false);
    },
    [editor],
  );

  /** Dropped and pasted files upload straight in, as they do in WordPress. */
  const insertFiles = useCallback(
    async (files: File[]) => {
      if (!editor || !files.length) return;

      setUploading(true);
      setUploadError(null);

      try {
        for (const file of files) {
          if (!file.type.startsWith("image/")) continue;
          const asset = await uploadAsset(file);
          editor
            .chain()
            .focus()
            .insertContent({
              type: "image",
              attrs: { src: asset.url, alt: "", align: "center", width: null },
            })
            .run();
        }
      } catch (caught) {
        setUploadError(caught instanceof Error ? caught.message : "Upload failed.");
      } finally {
        setUploading(false);
      }
    },
    [editor],
  );

  useEffect(() => {
    insertFilesRef.current = insertFiles;
  }, [insertFiles]);

  if (!editor) {
    return (
      <div className="admin-card p-8 text-sm" style={{ color: "var(--ink-3)" }}>
        Loading editor…
      </div>
    );
  }

  return (
    <div className="admin-card admin-editor overflow-hidden">
      <div
        className="sticky top-0 z-10 flex flex-wrap items-center gap-0.5 border-b px-3 py-1.5 backdrop-blur"
        style={{ borderColor: "var(--line)", background: "rgba(255,255,255,0.94)" }}
      >
        {TOOLS.map((tool) => (
          <button
            key={tool.id}
            type="button"
            title={tool.title}
            aria-label={tool.title}
            aria-pressed={isActive(editor, tool.id)}
            data-active={isActive(editor, tool.id)}
            className={`admin-tool ${"className" in tool ? tool.className : ""}`}
            onClick={() => runTool(editor, tool.id)}
          >
            {tool.label}
          </button>
        ))}

        <span className="mx-1 h-4 w-px" style={{ background: "var(--line)" }} />

        <button
          type="button"
          title="Link"
          className="admin-tool"
          data-active={editor.isActive("link")}
          onClick={setLink}
        >
          Link
        </button>

        <button
          type="button"
          title="Add media"
          aria-label="Add media"
          className="admin-tool"
          disabled={uploading}
          onClick={() => setPickerOpen(true)}
        >
          <PhotoIcon aria-hidden="true" />
          <span className="ml-1 hidden sm:inline">{uploading ? "Uploading…" : "Media"}</span>
        </button>

        <span className="mx-1 h-4 w-px" style={{ background: "var(--line)" }} />

        <button
          type="button"
          title="Undo"
          className="admin-tool"
          onClick={() => editor.chain().focus().undo().run()}
        >
          ↶
        </button>
        <button
          type="button"
          title="Redo"
          className="admin-tool"
          onClick={() => editor.chain().focus().redo().run()}
        >
          ↷
        </button>

      </div>

      {uploadError && (
        <p role="alert" className="admin-alert m-3" data-tone="error">
          {uploadError}
        </p>
      )}

      {/* Dropping anywhere on the canvas uploads and inserts, as in WordPress. */}
      <div
        className="relative px-5 py-7 sm:px-10 sm:py-10"
        onDragOver={(event) => {
          if (event.dataTransfer.types.includes("Files")) {
            event.preventDefault();
            setDropActive(true);
          }
        }}
        onDragLeave={(event) => {
          if (event.currentTarget === event.target) setDropActive(false);
        }}
        onDrop={() => setDropActive(false)}
      >
        <div className="mx-auto max-w-[65ch]">
          <EditorContent editor={editor} />
        </div>

        {dropActive && (
          <div
            className="pointer-events-none absolute inset-3 flex items-center justify-center rounded-xl border-2 border-dashed"
            style={{ borderColor: "var(--blue)", background: "var(--blue-soft)" }}
          >
            <p className="admin-h2" style={{ color: "var(--blue-dark)" }}>
              Drop to upload and insert
            </p>
          </div>
        )}
      </div>

      <MediaPicker
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onInsert={insertAsset}
      />
    </div>
  );
}
