import { cookies } from "next/headers";
import { getDb, newId } from "@/lib/db";

const COOKIE_NAME = "olga_session";
const SESSION_DAYS = 7;
// Workers caps PBKDF2 at 100k iterations: `deriveBits` rejects anything higher
// and the request 500s. Miniflare does not enforce the cap, so a larger value
// passes locally and fails only once deployed. This is the platform maximum —
// raising it breaks login, and any hash already stored above it can never
// verify, since verifyPassword reads the count back out of the hash.
const PBKDF2_ITERATIONS = 100_000;

export type AdminUser = {
  id: string;
  email: string;
  name: string;
  role: "admin" | "editor";
};

// ── Password hashing ────────────────────────────────────────────────────────

function toBase64(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
}

function fromBase64(value: string): Uint8Array {
  const binary = atob(value);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

async function pbkdf2(
  password: string,
  salt: Uint8Array,
  iterations: number,
): Promise<Uint8Array> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(password),
    "PBKDF2",
    false,
    ["deriveBits"],
  );

  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", salt: salt as BufferSource, iterations, hash: "SHA-256" },
    key,
    256,
  );

  return new Uint8Array(bits);
}

/** Encodes as `pbkdf2$<iterations>$<salt_b64>$<hash_b64>`. */
export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const hash = await pbkdf2(password, salt, PBKDF2_ITERATIONS);
  return `pbkdf2$${PBKDF2_ITERATIONS}$${toBase64(salt)}$${toBase64(hash)}`;
}

/** Constant-time comparison so a wrong password leaks no timing signal. */
function timingSafeEqual(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i += 1) diff |= a[i] ^ b[i];
  return diff === 0;
}

export async function verifyPassword(
  password: string,
  encoded: string,
): Promise<boolean> {
  const [scheme, iterationsRaw, saltB64, hashB64] = encoded.split("$");
  if (scheme !== "pbkdf2" || !iterationsRaw || !saltB64 || !hashB64) return false;

  const iterations = Number.parseInt(iterationsRaw, 10);
  if (!Number.isFinite(iterations) || iterations < 1) return false;

  const candidate = await pbkdf2(password, fromBase64(saltB64), iterations);
  return timingSafeEqual(candidate, fromBase64(hashB64));
}

// ── Sessions ────────────────────────────────────────────────────────────────

/**
 * The cookie carries a raw token; D1 stores only its SHA-256. A leaked
 * database dump therefore cannot be replayed as a valid session.
 */
async function hashToken(token: string): Promise<string> {
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(token),
  );
  return toBase64(new Uint8Array(digest));
}

export async function createSession(
  userId: string,
  userAgent: string | null,
): Promise<void> {
  const db = await getDb();
  const token = newId();
  const id = await hashToken(token);
  const expiresAt = Math.floor(Date.now() / 1000) + SESSION_DAYS * 86_400;

  await db
    .prepare(
      "INSERT INTO sessions (id, user_id, expires_at, user_agent) VALUES (?, ?, ?, ?)",
    )
    .bind(id, userId, expiresAt, userAgent)
    .run();

  const store = await cookies();
  store.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_DAYS * 86_400,
  });
}

export async function destroySession(): Promise<void> {
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value;

  if (token) {
    const db = await getDb();
    await db
      .prepare("DELETE FROM sessions WHERE id = ?")
      .bind(await hashToken(token))
      .run();
  }

  store.delete(COOKIE_NAME);
}

/** Returns the signed-in user, or null. Expired rows are cleaned up on read. */
export async function getCurrentUser(): Promise<AdminUser | null> {
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value;
  if (!token) return null;

  const db = await getDb();
  const id = await hashToken(token);

  const row = await db
    .prepare(
      `SELECT u.id, u.email, u.name, u.role, s.expires_at
         FROM sessions s
         JOIN users u ON u.id = s.user_id
        WHERE s.id = ?`,
    )
    .bind(id)
    .first<{
      id: string;
      email: string;
      name: string;
      role: "admin" | "editor";
      expires_at: number;
    }>();

  if (!row) return null;

  if (row.expires_at < Math.floor(Date.now() / 1000)) {
    await db.prepare("DELETE FROM sessions WHERE id = ?").bind(id).run();
    return null;
  }

  return { id: row.id, email: row.email, name: row.name, role: row.role };
}

/** Use in every admin route handler and server action. */
export async function requireUser(): Promise<AdminUser> {
  const user = await getCurrentUser();
  if (!user) throw new Error("UNAUTHORIZED");
  return user;
}

/** True when no account exists yet, which unlocks the one-time setup screen. */
export async function needsBootstrap(): Promise<boolean> {
  const db = await getDb();
  const row = await db
    .prepare("SELECT COUNT(*) AS count FROM users")
    .first<{ count: number }>();
  return (row?.count ?? 0) === 0;
}
