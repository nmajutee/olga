"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { bootstrapAction, loginAction, type ActionState } from "@/app/admin/actions";

const INITIAL: ActionState = { error: null };

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();

  return (
    <button type="submit" className="admin-btn admin-btn-primary w-full" disabled={pending}>
      {pending ? "Working…" : label}
    </button>
  );
}

export function SignInForm({ mode }: { mode: "login" | "bootstrap" }) {
  const [state, formAction] = useActionState(
    mode === "bootstrap" ? bootstrapAction : loginAction,
    INITIAL,
  );

  return (
    <form action={formAction} className="admin-card space-y-4 p-5">
      {mode === "bootstrap" && (
        <div>
          <label className="admin-label" htmlFor="name">
            Your name
          </label>
          <input
            id="name"
            name="name"
            className="admin-field"
            autoComplete="name"
            required
            defaultValue="Olga Emma Elume"
          />
          <p className="admin-hint">Shown as the author byline on every article.</p>
        </div>
      )}

      <div>
        <label className="admin-label" htmlFor="email">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          className="admin-field"
          autoComplete="username"
          required
        />
      </div>

      <div>
        <label className="admin-label" htmlFor="password">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          className="admin-field"
          autoComplete={mode === "bootstrap" ? "new-password" : "current-password"}
          required
          minLength={mode === "bootstrap" ? 12 : undefined}
        />
        {mode === "bootstrap" && (
          <p className="admin-hint">At least 12 characters. Use a password manager.</p>
        )}
      </div>

      {state.error && (
        <p
          role="alert"
          className="admin-alert" data-tone="error"
        >
          {state.error}
        </p>
      )}

      <SubmitButton label={mode === "bootstrap" ? "Create account" : "Sign in"} />
    </form>
  );
}
