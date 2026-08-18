"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { CheckCircleIcon } from "@heroicons/react/24/outline";
import { saveSettingsAction, type ActionState } from "@/app/admin/actions";
import type { SiteSettings } from "@/lib/settings";

const INITIAL: ActionState = { error: null };

export type SettingField = {
  key: string;
  label: string;
  hint?: string;
  type?: "text" | "textarea" | "number" | "email" | "url" | "color" | "toggle";
  placeholder?: string;
  full?: boolean;
};

export type SettingGroup = {
  title: string;
  blurb: string;
  fields: SettingField[];
};

function SaveBar() {
  const { pending } = useFormStatus();

  return (
    <div
      className="sticky bottom-0 z-10 -mx-5 -mb-5 mt-7 flex items-center gap-3 border-t px-5 py-3.5"
      style={{
        borderColor: "var(--line)",
        background: "var(--card)",
        borderRadius: "0 0 var(--r-lg) var(--r-lg)",
        // A sticky bar necessarily passes over the fields while scrolling; the
        // lift makes it read as a bar above the form rather than text floating
        // in the middle of a textarea.
        boxShadow: "0 -8px 16px -12px rgba(16, 24, 40, 0.25)",
      }}
    >
      <button type="submit" className="admin-btn admin-btn-primary" disabled={pending}>
        {pending ? "Saving…" : "Save changes"}
      </button>
      <span className="admin-micro">Changes go live immediately.</span>
    </div>
  );
}

function Field({ field, value }: { field: SettingField; value: string }) {
  if (field.type === "toggle") {
    return (
      <label className="flex items-start gap-3">
        <input
          type="checkbox"
          name={field.key}
          value="1"
          defaultChecked={value === "1"}
          className="mt-0.5 h-4 w-4 shrink-0 rounded"
          style={{ accentColor: "var(--blue)" }}
        />
        <span>
          <span className="block text-[14px] font-medium">{field.label}</span>
          {field.hint && <span className="admin-hint mt-0">{field.hint}</span>}
        </span>
      </label>
    );
  }

  return (
    <div>
      <label className="admin-label" htmlFor={field.key}>
        {field.label}
      </label>

      {field.type === "textarea" ? (
        <textarea
          id={field.key}
          name={field.key}
          rows={3}
          className="admin-field resize-y"
          placeholder={field.placeholder}
          defaultValue={value}
        />
      ) : field.type === "color" ? (
        <div className="flex items-center gap-2">
          <input
            type="color"
            aria-label={`${field.label} colour picker`}
            defaultValue={value || "#000000"}
            className="h-9 w-10 shrink-0 cursor-pointer rounded-lg border"
            style={{ borderColor: "var(--line)", background: "var(--card)" }}
            onChange={(event) => {
              const text = document.getElementById(field.key) as HTMLInputElement | null;
              if (text) text.value = event.target.value;
            }}
          />
          <input
            id={field.key}
            name={field.key}
            className="admin-field admin-mono"
            placeholder="#4A7FC1"
            defaultValue={value}
          />
        </div>
      ) : (
        <input
          id={field.key}
          name={field.key}
          type={field.type ?? "text"}
          className="admin-field"
          placeholder={field.placeholder}
          defaultValue={value}
        />
      )}

      {field.hint && <p className="admin-hint">{field.hint}</p>}
    </div>
  );
}

/**
 * One form component serves Settings, Appearance and SEO. Each page supplies
 * its own groups; the save action writes only the keys present in the form,
 * so the three pages never clobber each other's values.
 */
export function SettingsShell({
  groups,
  settings,
  children,
}: {
  groups: SettingGroup[];
  settings: SiteSettings;
  children?: React.ReactNode;
}) {
  const [state, formAction] = useActionState(saveSettingsAction, INITIAL);

  return (
    <form action={formAction} className="admin-card p-5">
      <div className="admin-settings-groups pb-4">
        {groups.map((group) => (
          <section key={group.title}>
            <h2 className="admin-h2">{group.title}</h2>
            <p className="admin-meta mb-5 mt-1 max-w-[68ch]">{group.blurb}</p>

            <div className="grid gap-5 sm:grid-cols-2">
              {group.fields.map((field) => (
                <div
                  key={field.key}
                  className={
                    field.full || field.type === "textarea" || field.type === "toggle"
                      ? "sm:col-span-2"
                      : undefined
                  }
                >
                  <Field field={field} value={settings[field.key] ?? ""} />
                </div>
              ))}
            </div>
          </section>
        ))}

        {children}
      </div>

      {state.error && (
        <p role="alert" className="admin-alert mt-5" data-tone="error">
          {state.error}
        </p>
      )}

      {state.error === null && state !== INITIAL && (
        <p role="status" className="admin-alert mt-5 flex items-center gap-2" data-tone="ok">
          <CheckCircleIcon className="h-4 w-4" aria-hidden="true" />
          Saved.
        </p>
      )}

      <SaveBar />
    </form>
  );
}
