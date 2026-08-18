import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getProfile } from "@/lib/profile";
import { PageHeader } from "@/components/admin/page-header";
import { ProfileForm } from "@/components/admin/profile-form";
import { PasswordForm } from "@/components/admin/password-form";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/admin/login");

  const profile = await getProfile(user.id);
  if (!profile) redirect("/admin/login");

  return (
    <div className="admin-page">
      <PageHeader
        title="Your profile"
        description="This is the author identity readers see: the byline on every article, the author box beneath each post, and the person search engines associate with the site."
      />

      <div className="admin-grid">
        <div className="admin-col-wide">
          <ProfileForm profile={profile} />
        </div>
        <div className="admin-col-side">
          <PasswordForm email={profile.email} />
        </div>
      </div>
    </div>
  );
}
