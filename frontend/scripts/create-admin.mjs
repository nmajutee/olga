#!/usr/bin/env node
/**
 * Creates or updates a dashboard account, bypassing the one-time setup screen.
 *
 * Also serves as the password reset: re-running it for an existing email
 * replaces the hash and signs that user out everywhere.
 *
 *   node scripts/create-admin.mjs --email you@example.com --local
 *   node scripts/create-admin.mjs --email you@example.com --name "Olga" --remote
 *   node scripts/create-admin.mjs --email you@example.com --password "…" --remote
 *
 * Omit --password and a strong one is generated and printed once.
 */

import { spawnSync } from "node:child_process";
import { writeFileSync, unlinkSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

const PBKDF2_ITERATIONS = 100_000; // must match lib/auth.ts (Workers caps PBKDF2 here)

function arg(name) {
  const index = process.argv.indexOf(`--${name}`);
  return index === -1 ? undefined : process.argv[index + 1];
}

const email = (arg("email") ?? "").trim().toLowerCase();
const name = arg("name") ?? "Olga Emma Elume";
const target = process.argv.includes("--remote") ? "--remote" : "--local";

if (!email || !email.includes("@")) {
  console.error("Usage: node scripts/create-admin.mjs --email <address> [--name <name>] [--password <pw>] [--local|--remote]");
  process.exit(1);
}

/** Four words plus digits: strong enough, and typeable during testing. */
function generatePassword() {
  const words = [
    "harbour", "lantern", "meridian", "thicket", "cobalt", "quarry", "pelican",
    "juniper", "anvil", "solstice", "marram", "kestrel", "bramble", "cinder",
  ];
  const pick = () => words[crypto.getRandomValues(new Uint32Array(1))[0] % words.length];
  const digits = String(crypto.getRandomValues(new Uint32Array(1))[0] % 10000).padStart(4, "0");
  return `${pick()}-${pick()}-${pick()}-${digits}`;
}

const password = arg("password") ?? generatePassword();
const generated = !arg("password");

if (password.length < 12) {
  console.error("Password must be at least 12 characters.");
  process.exit(1);
}

const toBase64 = (bytes) => {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
};

const newId = (prefix) =>
  `${prefix}_${[...crypto.getRandomValues(new Uint8Array(16))]
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")}`;

const salt = crypto.getRandomValues(new Uint8Array(16));
const key = await crypto.subtle.importKey(
  "raw",
  new TextEncoder().encode(password),
  "PBKDF2",
  false,
  ["deriveBits"],
);
const bits = new Uint8Array(
  await crypto.subtle.deriveBits(
    { name: "PBKDF2", salt, iterations: PBKDF2_ITERATIONS, hash: "SHA-256" },
    key,
    256,
  ),
);

const passwordHash = `pbkdf2$${PBKDF2_ITERATIONS}$${toBase64(salt)}$${toBase64(bits)}`;
const quote = (value) => `'${String(value).replaceAll("'", "''")}'`;

// Insert, or update the hash if the email already exists. Either way, existing
// sessions for that account are dropped so an old cookie cannot outlive the
// password it was issued against.
const sql = `
INSERT INTO users (id, email, name, password_hash, role)
VALUES (${quote(newId("usr"))}, ${quote(email)}, ${quote(name)}, ${quote(passwordHash)}, 'admin')
ON CONFLICT(email) DO UPDATE SET
  name = excluded.name,
  password_hash = excluded.password_hash,
  updated_at = datetime('now');

DELETE FROM sessions WHERE user_id = (SELECT id FROM users WHERE email = ${quote(email)});
`;

const sqlFile = path.join(tmpdir(), `create-admin-${Date.now()}.sql`);
writeFileSync(sqlFile, sql, { mode: 0o600 });

try {
  const result = spawnSync(
    "npx",
    ["wrangler", "d1", "execute", "olga-db", `--file=${sqlFile}`, target, "--yes"],
    { stdio: ["inherit", "pipe", "pipe"], encoding: "utf8" },
  );

  if (result.status !== 0) {
    console.error(result.stderr || result.stdout || "wrangler failed");
    process.exit(1);
  }
} finally {
  // The file holds only a hash, never the password — but do not leave it around.
  unlinkSync(sqlFile);
}

console.log(`\nAccount ready on the ${target.replace("--", "")} database.\n`);
console.log(`  Email     ${email}`);
console.log(`  Name      ${name}`);
console.log(`  Password  ${password}`);

if (generated) {
  console.log(`\nThis password is shown once and is not stored anywhere in plain text.`);
  console.log(`Save it now, or change it later under Settings → Your account.`);
}
