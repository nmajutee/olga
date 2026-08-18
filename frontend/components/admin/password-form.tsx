"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { changePasswordAction, type ActionState } from "@/app/admin/actions";

const INITIAL: ActionState = { error: null };

function Submit() {
  const { pending } = useFormStatus();

  return (
    <button type="submit" className="admin-btn admin-btn-outline" disabled={pending}>
      {pending ? "Changing…" : "Change password"}
    </button>
  );
}

export function PasswordForm({ email }: { email: string }) {
  const [state, formAction] = useActionState(changePasswordAction, INITIAL);

  return (
    /* Same card anatomy as every other panel: a bordered head, then padded
       body. It was the only card building its own header. */
    <form action={formAction} className="admin-card">
      <div className="admin-card-head">
        <div className="min-w-0">
          <h2 className="admin-h2">Your account</h2>
          <p className="admin-micro mt-0.5 truncate">{email}</p>
        </div>
      </div>

      <div className="admin-card-pad space-y-4">
        <div>
          <label className="admin-label" htmlFor="current_password">
            Current password
          </label>
          <input
            id="current_password"
            name="current_password"
            type="password"
            autoComplete="current-password"
            className="admin-field"
            required
          />
        </div>

        <div>
          <label className="admin-label" htmlFor="new_password">
            New password
          </label>
          <input
            id="new_password"
            name="new_password"
            type="password"
            autoComplete="new-password"
            className="admin-field"
            minLength={12}
            required
          />
          <p className="admin-hint">At least 12 characters. Signs you out everywhere else.</p>
        </div>

        {state.error && (
          <p role="alert" className="admin-alert" data-tone="error">
            {state.error}
          </p>
        )}

        <Submit />
      </div>
    </form>
  );
}
