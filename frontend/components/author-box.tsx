import Link from "next/link";
import type { AuthorProfile } from "@/lib/profile";
import { profileLinks } from "@/lib/profile";

/**
 * The author box under an article. Renders only what the profile actually
 * has — an empty bio or a missing photo collapses rather than leaving a hole.
 */
export function AuthorBox({
  profile,
  label,
}: {
  profile: AuthorProfile;
  label: string;
}) {
  const links = profileLinks(profile);
  const initial = profile.name.charAt(0).toUpperCase();

  return (
    <aside className="author-box" aria-label={label}>
      <div className="author-box-avatar" aria-hidden="true">
        {profile.avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={profile.avatarUrl} alt="" />
        ) : (
          <span>{initial}</span>
        )}
      </div>

      <div className="author-box-body">
        <p className="author-box-label">{label}</p>
        <p className="author-box-name">{profile.name}</p>

        {(profile.title || profile.location) && (
          <p className="author-box-role">
            {[profile.title, profile.location].filter(Boolean).join(" · ")}
          </p>
        )}

        {profile.bio && <p className="author-box-bio">{profile.bio}</p>}

        {links.length > 0 && (
          <div className="author-box-links">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer me"
                className="author-box-link"
              >
                {link.label}
              </Link>
            ))}
          </div>
        )}
      </div>
    </aside>
  );
}
