"use client";

import { useState, useTransition } from "react";
import {
  PlusIcon,
  TrashIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  EyeIcon,
  EyeSlashIcon,
} from "@heroicons/react/24/outline";
import { saveNavAction } from "@/app/admin/actions";

type Item = { labelEn: string; labelFr: string; href: string; visible: boolean };

export function NavEditor({
  location,
  title,
  blurb,
  items,
  isDefault,
}: {
  location: "header" | "footer";
  title: string;
  blurb: string;
  items: Item[];
  isDefault: boolean;
}) {
  const [rows, setRows] = useState<Item[]>(items);
  const [saving, startSaving] = useTransition();
  const [message, setMessage] = useState<{ tone: "ok" | "error"; text: string } | null>(null);

  function update(index: number, patch: Partial<Item>) {
    setRows((current) => current.map((row, i) => (i === index ? { ...row, ...patch } : row)));
    setMessage(null);
  }

  function move(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= rows.length) return;

    const next = [...rows];
    [next[index], next[target]] = [next[target], next[index]];
    setRows(next);
    setMessage(null);
  }

  function save() {
    startSaving(async () => {
      const result = await saveNavAction(location, rows);
      setMessage(
        result.error
          ? { tone: "error", text: result.error }
          : { tone: "ok", text: "Menu saved." },
      );
    });
  }

  return (
    <section className="admin-card">
      <div className="admin-card-head items-start">
        <div>
          <h2 className="admin-h2">{title}</h2>
          <p className="admin-meta mt-0.5">
            {blurb}
          </p>
        </div>
        {isDefault && (
          <span className="admin-badge shrink-0" data-tone="info">
            Using defaults
          </span>
        )}
      </div>

      <div className="space-y-3 px-5 pb-1">
        {rows.map((row, index) => (
          <div
            key={index}
            className="rounded-xl border p-3"
            style={{ borderColor: "var(--line)", background: row.visible ? "transparent" : "var(--sunken)" }}
          >
            <div className="grid gap-2 sm:grid-cols-2">
              <input
                className="admin-field"
                aria-label="Label (English)"
                placeholder="Label (English)"
                value={row.labelEn}
                onChange={(event) => update(index, { labelEn: event.target.value })}
              />
              <input
                className="admin-field"
                aria-label="Label (French)"
                placeholder="Label (French)"
                value={row.labelFr}
                onChange={(event) => update(index, { labelFr: event.target.value })}
              />
            </div>

            <div className="mt-2 flex items-center gap-2">
              <input
                className="admin-field admin-mono flex-1 text-xs"
                aria-label="Link"
                placeholder="/about"
                value={row.href}
                onChange={(event) => update(index, { href: event.target.value })}
              />

              <button
                type="button"
                className="admin-tool"
                aria-label={row.visible ? `Hide ${row.labelEn}` : `Show ${row.labelEn}`}
                onClick={() => update(index, { visible: !row.visible })}
              >
                {row.visible ? <EyeIcon aria-hidden="true" /> : <EyeSlashIcon aria-hidden="true" />}
              </button>
              <button
                type="button"
                className="admin-tool"
                aria-label={`Move ${row.labelEn} up`}
                disabled={index === 0}
                onClick={() => move(index, -1)}
              >
                <ChevronUpIcon aria-hidden="true" />
              </button>
              <button
                type="button"
                className="admin-tool"
                aria-label={`Move ${row.labelEn} down`}
                disabled={index === rows.length - 1}
                onClick={() => move(index, 1)}
              >
                <ChevronDownIcon aria-hidden="true" />
              </button>
              <button
                type="button"
                className="admin-tool"
                style={{ color: "var(--bad)" }}
                aria-label={`Remove ${row.labelEn}`}
                onClick={() => {
                  setRows((current) => current.filter((_, i) => i !== index));
                  setMessage(null);
                }}
              >
                <TrashIcon aria-hidden="true" />
              </button>
            </div>
          </div>
        ))}

        {rows.length === 0 && (
          <p className="py-6 text-center text-sm" style={{ color: "var(--ink-3)" }}>
            No links. The menu will be empty on the site.
          </p>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2 p-5">
        <button
          type="button"
          className="admin-btn admin-btn-outline"
          onClick={() =>
            setRows((current) => [...current, { labelEn: "", labelFr: "", href: "/", visible: true }])
          }
        >
          <PlusIcon aria-hidden="true" />
          Add link
        </button>

        {message && (
          <span
            role="status"
            className="text-sm font-semibold"
            style={{ color: message.tone === "ok" ? "var(--good)" : "var(--bad)" }}
          >
            {message.text}
          </span>
        )}

        <button
          type="button"
          className="admin-btn admin-btn-primary ml-auto"
          disabled={saving}
          onClick={save}
        >
          {saving ? "Saving…" : "Save menu"}
        </button>
      </div>
    </section>
  );
}
