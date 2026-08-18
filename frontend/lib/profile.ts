import { getDb } from "@/lib/db";

export type AuthorProfile = {
  id: string;
  name: string;
  email: string;
  title: string;
  bio: string;
  avatarUrl: string | null;
  location: string;
  website: string;
  linkedin: string;
  socialX: string;
  instagram: string;
};

type Row = {
  id: string;
  name: string;
  email: string;
  title: string;
  bio: string;
  avatar_url: string | null;
  location: string;
  website: string;
  linkedin: string;
  social_x: string;
  instagram: string;
};

const toProfile = (row: Row): AuthorProfile => ({
  id: row.id,
  name: row.name,
  email: row.email,
  title: row.title,
  bio: row.bio,
  avatarUrl: row.avatar_url,
  location: row.location,
  website: row.website,
  linkedin: row.linkedin,
  socialX: row.social_x,
  instagram: row.instagram,
});

const COLUMNS =
  "id, name, email, title, bio, avatar_url, location, website, linkedin, social_x, instagram";

export async function getProfile(userId: string): Promise<AuthorProfile | null> {
  const db = await getDb();
  const row = await db
    .prepare(`SELECT ${COLUMNS} FROM users WHERE id = ?`)
    .bind(userId)
    .first<Row>();
  return row ? toProfile(row) : null;
}

/**
 * The profile the public site speaks as: the article's own author when it has
 * one, otherwise the site owner. Articles keep a denormalised `author_name`
 * snapshot so they survive a user being deleted, but the live profile is what
 * fills the author box.
 */
export async function getAuthorProfile(authorId?: string | null): Promise<AuthorProfile | null> {
  try {
    const db = await getDb();

    if (authorId) {
      const row = await db
        .prepare(`SELECT ${COLUMNS} FROM users WHERE id = ?`)
        .bind(authorId)
        .first<Row>();
      if (row) return toProfile(row);
    }

    const owner = await db
      .prepare(`SELECT ${COLUMNS} FROM users ORDER BY created_at ASC LIMIT 1`)
      .first<Row>();

    return owner ? toProfile(owner) : null;
  } catch (error) {
    console.error(
      `[profile] ${error instanceof Error ? error.message : "Unknown error."}`,
    );
    return null;
  }
}

export type ProfileInput = Omit<AuthorProfile, "id" | "email"> & { email: string };

export async function updateProfile(userId: string, input: ProfileInput): Promise<void> {
  const db = await getDb();
  await db
    .prepare(
      `UPDATE users SET
         name = ?, email = ?, title = ?, bio = ?, avatar_url = ?, location = ?,
         website = ?, linkedin = ?, social_x = ?, instagram = ?,
         updated_at = datetime('now')
       WHERE id = ?`,
    )
    .bind(
      input.name,
      input.email,
      input.title,
      input.bio,
      input.avatarUrl || null,
      input.location,
      input.website,
      input.linkedin,
      input.socialX,
      input.instagram,
      userId,
    )
    .run();

  // The byline is denormalised onto posts; keep past articles in step with the
  // name the author now goes by.
  await db
    .prepare("UPDATE posts SET author_name = ? WHERE author_id = ?")
    .bind(input.name, userId)
    .run();
}

/** Profile links, filtered to the ones actually set. */
export function profileLinks(profile: AuthorProfile) {
  return [
    { label: "Website", href: profile.website },
    { label: "LinkedIn", href: profile.linkedin },
    { label: "X", href: profile.socialX },
    { label: "Instagram", href: profile.instagram },
  ].filter((link) => link.href.trim().length > 0);
}
