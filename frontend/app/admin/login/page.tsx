import { redirect } from "next/navigation";
import { getCurrentUser, needsBootstrap } from "@/lib/auth";
import { SignInForm } from "@/components/admin/sign-in-form";

export const dynamic = "force-dynamic";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ changed?: string }>;
}) {
  if (await getCurrentUser()) redirect("/admin");

  const { changed } = await searchParams;
  const bootstrap = await needsBootstrap();

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-16">
      <div className="w-full max-w-sm">
        <span
          className="mb-6 flex h-11 w-11 items-center justify-center rounded-2xl text-lg font-bold text-white"
          style={{ background: "linear-gradient(140deg, var(--blue) 0%, var(--blue-dark) 100%)" }}
          aria-hidden="true"
        >
          O
        </span>
        <div className="mb-7">
          <p className="admin-label-caps">olgaemma.com</p>
          <h1 className="admin-h1 mt-2">
            {bootstrap ? "Set up the desk" : "The Desk"}
          </h1>
          <p className="admin-meta mt-2">
            {bootstrap
              ? "No account exists yet. Create the first one — this screen closes itself afterwards."
              : "Sign in to write, publish, and manage the site."}
          </p>
        </div>

        {changed && !bootstrap && (
          <p className="admin-alert mb-4" data-tone="ok">
            Password changed. Sign in again.
          </p>
        )}

        <SignInForm mode={bootstrap ? "bootstrap" : "login"} />
      </div>
    </div>
  );
}
