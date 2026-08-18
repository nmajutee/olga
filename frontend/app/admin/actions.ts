"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import {
  createSession,
  destroySession,
  hashPassword,
  needsBootstrap,
  requireUser,
  verifyPassword,
} from "@/lib/auth";
import { getDb, getMediaBucket, newId, slugify } from "@/lib/db";
import { createPost, deletePost, updatePost, type PostInput } from "@/lib/posts";
import { sanitizeHtml, htmlToText } from "@/lib/sanitize-html";
import { analyzeSeo } from "@/lib/seo-score";
import { updateSettings, SETTING_DEFAULTS } from "@/lib/settings";
import { getCollection, saveItem, deleteItem, reorderItems } from "@/lib/collections";
import { replaceNav } from "@/lib/navigation";
import { markRead, deleteMessage } from "@/lib/messages";
import { logActivity } from "@/lib/activity";
import { updateProfile } from "@/lib/profile";
import { saveRedirect, deleteRedirect, normalisePath } from "@/lib/redirects";

export type ActionState = { error: string | null };

// ── Authentication ──────────────────────────────────────────────────────────

export async function bootstrapAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  if (!(await needsBootstrap())) {
    return { error: "An account already exists. Sign in instead." };
  }

  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!name || !email || password.length < 12) {
    return { error: "Name, email, and a password of at least 12 characters are required." };
  }

  const db = await getDb();
  const id = newId("usr");

  await db
    .prepare(
      "INSERT INTO users (id, email, name, password_hash, role) VALUES (?, ?, ?, ?, 'admin')",
    )
    .bind(id, email, name, await hashPassword(password))
    .run();

  const userAgent = (await headers()).get("user-agent");
  await createSession(id, userAgent);
  redirect("/admin");
}

export async function loginAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  const db = await getDb();
  const user = await db
    .prepare("SELECT id, password_hash FROM users WHERE email = ?")
    .bind(email)
    .first<{ id: string; password_hash: string }>();

  // Same message either way — never reveal which accounts exist.
  const failure = { error: "Incorrect email or password." };

  if (!user) {
    // Burn comparable time so a missing account is not detectably faster.
    await hashPassword(password || "placeholder");
    return failure;
  }

  if (!(await verifyPassword(password, user.password_hash))) return failure;

  await createSession(user.id, (await headers()).get("user-agent"));
  redirect("/admin");
}

export async function logoutAction(): Promise<void> {
  await destroySession();
  redirect("/admin/login");
}

// ── Posts ───────────────────────────────────────────────────────────────────

export type PostFormValues = {
  id?: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  status: "draft" | "published";
  coverImageUrl: string;
  coverImageAlt: string;
  metaTitle: string;
  metaDescription: string;
  focusKeyword: string;
  canonicalUrl: string;
  noindex: boolean;
  tags: string[];
};

export async function savePostAction(
  values: PostFormValues,
): Promise<{ error: string | null; id?: string; slug?: string }> {
  let user;
  try {
    user = await requireUser();
  } catch {
    return { error: "Your session expired. Sign in again." };
  }

  const title = values.title.trim();
  if (!title) return { error: "A title is required." };

  const content = sanitizeHtml(values.content);
  const excerpt =
    values.excerpt.trim() || `${htmlToText(content).slice(0, 180).trim()}…`;

  const analysis = analyzeSeo({
    title,
    slug: values.slug || slugify(title),
    content,
    excerpt,
    metaTitle: values.metaTitle,
    metaDescription: values.metaDescription,
    focusKeyword: values.focusKeyword,
    coverImageAlt: values.coverImageAlt,
  });

  const input: PostInput = {
    title,
    slug: values.slug.trim() || slugify(title),
    excerpt,
    content,
    status: values.status,
    authorName: user.name,
    coverImageUrl: values.coverImageUrl.trim() || null,
    coverImageAlt: values.coverImageAlt.trim() || null,
    metaTitle: values.metaTitle.trim() || null,
    metaDescription: values.metaDescription.trim() || null,
    focusKeyword: values.focusKeyword.trim() || null,
    canonicalUrl: values.canonicalUrl.trim() || null,
    noindex: values.noindex,
    seoScore: analysis.score,
    tags: values.tags,
  };

  try {
    const id = values.id
      ? (await updatePost(values.id, input), values.id)
      : await createPost(input, user.id);

    revalidatePath("/admin/posts");
    revalidatePath("/[locale]/blog", "page");
    revalidatePath("/[locale]/blog/[slug]", "page");

    return { error: null, id, slug: input.slug };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not save the post.";
    console.error(`[admin:save-post] ${message}`);
    return { error: message };
  }
}

export async function deletePostAction(id: string): Promise<void> {
  await requireUser();
  await deletePost(id);
  revalidatePath("/admin/posts");
  revalidatePath("/[locale]/blog", "page");
}

// ── Media ───────────────────────────────────────────────────────────────────

export async function deleteMediaAction(id: string): Promise<void> {
  await requireUser();

  const db = await getDb();
  const row = await db
    .prepare("SELECT r2_key FROM media WHERE id = ?")
    .bind(id)
    .first<{ r2_key: string }>();

  if (row) {
    const bucket = await getMediaBucket();
    await bucket.delete(row.r2_key);
    await db.prepare("DELETE FROM media WHERE id = ?").bind(id).run();
  }

  revalidatePath("/admin/media");
}

export async function updateMediaAltAction(id: string, alt: string): Promise<void> {
  await requireUser();
  const db = await getDb();
  await db.prepare("UPDATE media SET alt_text = ? WHERE id = ?").bind(alt, id).run();
  revalidatePath("/admin/media");
}

// ── Settings ────────────────────────────────────────────────────────────────

export async function saveSettingsAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    await requireUser();
  } catch {
    return { error: "Your session expired. Sign in again." };
  }

  const values: Record<string, string> = {};
  for (const key of Object.keys(SETTING_DEFAULTS)) {
    const value = formData.get(key);
    if (value !== null) values[key] = String(value);
  }

  try {
    await updateSettings(values);
    revalidatePath("/admin/settings");
    revalidatePath("/", "layout");
    return { error: null };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not save settings.";
    console.error(`[admin:settings] ${message}`);
    return { error: message };
  }
}

// ── Account ─────────────────────────────────────────────────────────────────

export async function changePasswordAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  let user;
  try {
    user = await requireUser();
  } catch {
    return { error: "Your session expired. Sign in again." };
  }

  const current = String(formData.get("current_password") ?? "");
  const next = String(formData.get("new_password") ?? "");

  if (next.length < 12) {
    return { error: "The new password must be at least 12 characters." };
  }

  const db = await getDb();
  const row = await db
    .prepare("SELECT password_hash FROM users WHERE id = ?")
    .bind(user.id)
    .first<{ password_hash: string }>();

  if (!row || !(await verifyPassword(current, row.password_hash))) {
    return { error: "Your current password is incorrect." };
  }

  await db
    .prepare("UPDATE users SET password_hash = ?, updated_at = datetime('now') WHERE id = ?")
    .bind(await hashPassword(next), user.id)
    .run();

  // Force every other device to sign in again.
  await db.prepare("DELETE FROM sessions WHERE user_id = ?").bind(user.id).run();
  redirect("/admin/login?changed=1");
}

// ── Content collections ─────────────────────────────────────────────────────

export async function saveContentAction(input: {
  id?: string;
  collection: string;
  title: string;
  slug: string;
  summary: string;
  body: string;
  imageUrl: string;
  imageAlt: string;
  extra: Record<string, string>;
  status: "draft" | "published";
}): Promise<{ error: string | null; id?: string }> {
  let user;
  try {
    user = await requireUser();
  } catch {
    return { error: "Your session expired. Sign in again." };
  }

  if (!getCollection(input.collection)) {
    return { error: `Unknown collection: ${input.collection}` };
  }

  if (!input.title.trim()) return { error: "A title is required." };

  try {
    const id = await saveItem(
      {
        collection: input.collection,
        title: input.title.trim(),
        slug: input.slug.trim(),
        summary: input.summary,
        body: input.body,
        imageUrl: input.imageUrl.trim(),
        imageAlt: input.imageAlt.trim(),
        extra: input.extra,
        status: input.status,
      },
      input.id,
    );

    await logActivity({
      userId: user.id,
      userName: user.name,
      action: input.id ? "updated" : "created",
      subject: input.title.trim(),
      targetHref: `/admin/collections/${input.collection}/${id}`,
    });

    revalidatePath(`/admin/collections/${input.collection}`);
    revalidatePath("/", "layout");
    return { error: null, id };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not save.";
    console.error(`[admin:content] ${message}`);
    return { error: message };
  }
}

export async function deleteContentAction(id: string, collection: string): Promise<void> {
  await requireUser();
  await deleteItem(id);
  revalidatePath(`/admin/collections/${collection}`);
  revalidatePath("/", "layout");
}

export async function reorderContentAction(collection: string, ids: string[]): Promise<void> {
  await requireUser();
  await reorderItems(ids);
  revalidatePath(`/admin/collections/${collection}`);
  revalidatePath("/", "layout");
}

// ── Navigation ──────────────────────────────────────────────────────────────

export async function saveNavAction(
  location: "header" | "footer",
  items: Array<{ labelEn: string; labelFr: string; href: string; visible: boolean }>,
): Promise<{ error: string | null }> {
  try {
    await requireUser();
  } catch {
    return { error: "Your session expired. Sign in again." };
  }

  const cleaned = items
    .map((item) => ({
      labelEn: item.labelEn.trim(),
      labelFr: item.labelFr.trim(),
      href: item.href.trim(),
      visible: item.visible,
    }))
    .filter((item) => item.labelEn && item.href);

  try {
    await replaceNav(location, cleaned);
    revalidatePath("/admin/navigation");
    revalidatePath("/", "layout");
    return { error: null };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not save the menu.";
    console.error(`[admin:nav] ${message}`);
    return { error: message };
  }
}

// ── Messages ────────────────────────────────────────────────────────────────

export async function markMessageAction(id: string, read: boolean): Promise<void> {
  await requireUser();
  await markRead(id, read);
  revalidatePath("/admin/messages");
  revalidatePath("/admin");
}

export async function deleteMessageAction(id: string): Promise<void> {
  await requireUser();
  await deleteMessage(id);
  revalidatePath("/admin/messages");
  revalidatePath("/admin");
}

// ── Author profile ──────────────────────────────────────────────────────────

export async function saveProfileAction(input: {
  name: string;
  email: string;
  title: string;
  bio: string;
  avatarUrl: string;
  location: string;
  website: string;
  linkedin: string;
  socialX: string;
  instagram: string;
}): Promise<{ error: string | null }> {
  let user;
  try {
    user = await requireUser();
  } catch {
    return { error: "Your session expired. Sign in again." };
  }

  const name = input.name.trim();
  const email = input.email.trim().toLowerCase();

  if (!name) return { error: "A name is required — it is your byline on every article." };
  if (!email.includes("@")) return { error: "Enter a valid email address." };

  try {
    await updateProfile(user.id, {
      name,
      email,
      title: input.title.trim(),
      bio: input.bio.trim(),
      avatarUrl: input.avatarUrl.trim() || null,
      location: input.location.trim(),
      website: input.website.trim(),
      linkedin: input.linkedin.trim(),
      socialX: input.socialX.trim(),
      instagram: input.instagram.trim(),
    });

    revalidatePath("/admin/profile");
    revalidatePath("/", "layout");
    return { error: null };
  } catch (error) {
    const message =
      error instanceof Error && error.message.includes("UNIQUE")
        ? "That email is already in use."
        : "Could not save your profile.";
    console.error(`[admin:profile] ${error instanceof Error ? error.message : error}`);
    return { error: message };
  }
}

// ── Redirects ───────────────────────────────────────────────────────────────

export async function saveRedirectAction(input: {
  sourcePath: string;
  targetPath: string;
  statusCode: number;
}): Promise<{ error: string | null }> {
  try {
    await requireUser();
  } catch {
    return { error: "Your session expired. Sign in again." };
  }

  const source = normalisePath(input.sourcePath);
  const target = normalisePath(input.targetPath);

  if (!source || source === "/") return { error: "Enter the old path, starting with /." };
  if (!target) return { error: "Enter where it should go." };
  if (source === target) return { error: "A path cannot redirect to itself." };

  try {
    await saveRedirect({ sourcePath: source, targetPath: target, statusCode: input.statusCode });
    revalidatePath("/admin/seo");
    revalidatePath("/", "layout");
    return { error: null };
  } catch (error) {
    console.error(`[admin:redirect] ${error instanceof Error ? error.message : error}`);
    return { error: "Could not save the redirect." };
  }
}

export async function deleteRedirectAction(id: string): Promise<void> {
  await requireUser();
  await deleteRedirect(id);
  revalidatePath("/admin/seo");
  revalidatePath("/", "layout");
}
