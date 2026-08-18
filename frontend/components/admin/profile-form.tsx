"use client";

import { useState, useTransition } from "react";
import { CheckCircleIcon } from "@heroicons/react/24/outline";
import { MediaField } from "@/components/admin/media-field";
import { saveProfileAction } from "@/app/admin/actions";
import type { AuthorProfile } from "@/lib/profile";

export function ProfileForm({ profile }: { profile: AuthorProfile }) {
  const [values, setValues] = useState({
    name: profile.name,
    email: profile.email,
    title: profile.title,
    bio: profile.bio,
    avatarUrl: profile.avatarUrl ?? "",
    location: profile.location,
    website: profile.website,
    linkedin: profile.linkedin,
    socialX: profile.socialX,
    instagram: profile.instagram,
  });

  const [saving, startSaving] = useTransition();
  const [message, setMessage] = useState<{ tone: "ok" | "error"; text: string } | null>(null);

  function set<K extends keyof typeof values>(key: K, value: string) {
    setValues((current) => ({ ...current, [key]: value }));
    setMessage(null);
  }

  function save() {
    startSaving(async () => {
      const result = await saveProfileAction(values);
      setMessage(
        result.error
          ? { tone: "error", text: result.error }
          : { tone: "ok", text: "Profile saved. It is live on the site now." },
      );
    });
  }

  const field = (
    key: keyof typeof values,
    label: string,
    options: { type?: string; placeholder?: string; hint?: string } = {},
  ) => (
    <div>
      <label className="admin-label" htmlFor={key}>
        {label}
      </label>
      <input
        id={key}
        type={options.type ?? "text"}
        className="admin-field"
        placeholder={options.placeholder}
        value={values[key]}
        onChange={(event) => set(key, event.target.value)}
      />
      {options.hint && <p className="admin-hint">{options.hint}</p>}
    </div>
  );

  return (
    <div className="admin-stack">
      <section className="admin-card">
        <div className="admin-card-head">
          <h2 className="admin-h2">Identity</h2>
        </div>

        <div className="admin-card-pad admin-stack">
          <MediaField
            label="Photo"
            shape="avatar"
            url={values.avatarUrl}
            alt={values.name}
            onUrlChange={(url) => set("avatarUrl", url)}
            onAltChange={() => undefined}
            hint="Shown in the dashboard header, on your article bylines and in the author box. A square image works best."
          />

          <div className="grid gap-5 sm:grid-cols-2">
            {field("name", "Name", {
              hint: "Your byline. Changing it updates every article you have written.",
            })}
            {field("title", "Role", { placeholder: "Communications strategist" })}
            {field("email", "Email", {
              type: "email",
              hint: "Used to sign in. Not published.",
            })}
            {field("location", "Location", { placeholder: "Buea, Cameroon" })}
          </div>

          <div>
            <label className="admin-label" htmlFor="bio">
              Short bio
            </label>
            <textarea
              id="bio"
              rows={3}
              className="admin-field"
              placeholder="Two or three sentences, written in the third person."
              value={values.bio}
              onChange={(event) => set("bio", event.target.value)}
            />
            <p className="admin-hint">
              Shown in the author box under every article. {values.bio.trim().length} characters.
            </p>
          </div>
        </div>
      </section>

      <section className="admin-card">
        <div className="admin-card-head">
          <h2 className="admin-h2">Links</h2>
          <span className="admin-micro">Shown in the author box and in search results</span>
        </div>

        <div className="admin-card-pad">
          <div className="grid gap-5 sm:grid-cols-2">
            {field("website", "Website", { type: "url", placeholder: "https://" })}
            {field("linkedin", "LinkedIn", { type: "url", placeholder: "https://linkedin.com/in/…" })}
            {field("socialX", "X", { type: "url", placeholder: "https://x.com/…" })}
            {field("instagram", "Instagram", { type: "url", placeholder: "https://instagram.com/…" })}
          </div>
        </div>
      </section>

      <div className="admin-card flex flex-wrap items-center gap-3 p-4">
        {message && (
          <span
            role="status"
            className="flex items-center gap-1.5 text-[13px] font-medium"
            style={{ color: message.tone === "ok" ? "var(--good)" : "var(--bad)" }}
          >
            {message.tone === "ok" && <CheckCircleIcon className="h-4 w-4" aria-hidden="true" />}
            {message.text}
          </span>
        )}

        <button
          type="button"
          className="admin-btn admin-btn-primary ml-auto"
          disabled={saving}
          onClick={save}
        >
          {saving ? "Saving…" : "Save profile"}
        </button>
      </div>
    </div>
  );
}
