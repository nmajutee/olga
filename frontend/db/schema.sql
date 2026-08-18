-- Olga Emma — D1 schema (replaces WordPress as the content backend)
-- Apply with:  npx wrangler d1 execute olga-db --file=db/schema.sql --remote

PRAGMA foreign_keys = ON;

-- ── Users ──────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id            TEXT PRIMARY KEY,
  email         TEXT NOT NULL UNIQUE,
  name          TEXT NOT NULL,
  password_hash TEXT NOT NULL,          -- pbkdf2$<iterations>$<salt_b64>$<hash_b64>
  role          TEXT NOT NULL DEFAULT 'admin' CHECK (role IN ('admin', 'editor')),

  -- Author profile. Drives the article byline, the author box and the
  -- Person schema on the public site.
  title         TEXT NOT NULL DEFAULT '',
  bio           TEXT NOT NULL DEFAULT '',
  avatar_url    TEXT,
  location      TEXT NOT NULL DEFAULT '',
  website       TEXT NOT NULL DEFAULT '',
  linkedin      TEXT NOT NULL DEFAULT '',
  social_x      TEXT NOT NULL DEFAULT '',
  instagram     TEXT NOT NULL DEFAULT '',
  created_at    TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at    TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ── Sessions ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS sessions (
  id         TEXT PRIMARY KEY,          -- sha256 of the raw cookie token
  user_id    TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires_at INTEGER NOT NULL,          -- unix seconds
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  user_agent TEXT
);
CREATE INDEX IF NOT EXISTS idx_sessions_user    ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_expires ON sessions(expires_at);

-- ── Posts ──────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS posts (
  id               TEXT PRIMARY KEY,
  slug             TEXT NOT NULL UNIQUE,
  title            TEXT NOT NULL,
  excerpt          TEXT NOT NULL DEFAULT '',
  content          TEXT NOT NULL DEFAULT '',   -- sanitized HTML from the editor
  status           TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  author_id        TEXT REFERENCES users(id) ON DELETE SET NULL,
  author_name      TEXT NOT NULL DEFAULT 'Olga Emma Elume',
  cover_image_url  TEXT,
  cover_image_alt  TEXT,

  -- SEO
  meta_title       TEXT,
  meta_description TEXT,
  focus_keyword    TEXT,
  canonical_url    TEXT,
  noindex          INTEGER NOT NULL DEFAULT 0,
  seo_score        INTEGER NOT NULL DEFAULT 0,

  reading_minutes  INTEGER NOT NULL DEFAULT 0,
  view_count       INTEGER NOT NULL DEFAULT 0,
  published_at     TEXT,
  created_at       TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at       TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_posts_status_pub ON posts(status, published_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_updated    ON posts(updated_at DESC);

-- ── Tags ───────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS tags (
  id   TEXT PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS post_tags (
  post_id TEXT NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  tag_id  TEXT NOT NULL REFERENCES tags(id)  ON DELETE CASCADE,
  PRIMARY KEY (post_id, tag_id)
);
CREATE INDEX IF NOT EXISTS idx_post_tags_tag ON post_tags(tag_id);

-- ── Media (bytes live in R2, metadata here) ────────────────────────────────
CREATE TABLE IF NOT EXISTS media (
  id            TEXT PRIMARY KEY,
  r2_key        TEXT NOT NULL UNIQUE,
  filename      TEXT NOT NULL,
  content_type  TEXT NOT NULL,
  size_bytes    INTEGER NOT NULL,
  width         INTEGER,
  height        INTEGER,
  alt_text      TEXT NOT NULL DEFAULT '',
  uploaded_by   TEXT REFERENCES users(id) ON DELETE SET NULL,
  created_at    TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_media_created ON media(created_at DESC);

-- ── Site settings (key/value, like wp_options) ─────────────────────────────
CREATE TABLE IF NOT EXISTS settings (
  key        TEXT PRIMARY KEY,
  value      TEXT NOT NULL DEFAULT '',
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ── Redirects ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS redirects (
  id          TEXT PRIMARY KEY,
  source_path TEXT NOT NULL UNIQUE,
  target_path TEXT NOT NULL,
  status_code INTEGER NOT NULL DEFAULT 301,
  created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ── Contact submissions (archive of the Resend contact form) ───────────────
CREATE TABLE IF NOT EXISTS contact_submissions (
  id         TEXT PRIMARY KEY,
  name       TEXT NOT NULL,
  email      TEXT NOT NULL,
  company    TEXT NOT NULL DEFAULT '',
  inquiry    TEXT NOT NULL DEFAULT '',
  message    TEXT NOT NULL,
  locale     TEXT NOT NULL DEFAULT 'en',
  page_url   TEXT NOT NULL DEFAULT '',
  emailed    INTEGER NOT NULL DEFAULT 0,
  read_at    TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_contact_created ON contact_submissions(created_at DESC);

-- ── Site management (see db/migrations/001-site-management.sql) ──
-- ── Content collections ────────────────────────────────────────────────────
-- One table serves portfolio pieces, services, case studies and testimonials.
-- They share a shape (title, summary, body, image, ordering); the differences
-- live in `extra`, a JSON blob whose fields are declared per collection in
-- lib/collections.ts. One table means one editor and one list screen.
CREATE TABLE IF NOT EXISTS content_items (
  id           TEXT PRIMARY KEY,
  collection   TEXT NOT NULL,
  slug         TEXT NOT NULL,
  title        TEXT NOT NULL,
  summary      TEXT NOT NULL DEFAULT '',
  body         TEXT NOT NULL DEFAULT '',
  image_url    TEXT,
  image_alt    TEXT NOT NULL DEFAULT '',
  extra        TEXT NOT NULL DEFAULT '{}',
  sort_order   INTEGER NOT NULL DEFAULT 0,
  status       TEXT NOT NULL DEFAULT 'published' CHECK (status IN ('draft', 'published')),
  created_at   TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at   TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE (collection, slug)
);
CREATE INDEX IF NOT EXISTS idx_content_collection ON content_items(collection, sort_order);

-- ── Menus ──────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS nav_items (
  id         TEXT PRIMARY KEY,
  location   TEXT NOT NULL DEFAULT 'header' CHECK (location IN ('header', 'footer')),
  label_en   TEXT NOT NULL,
  label_fr   TEXT NOT NULL DEFAULT '',
  href       TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  visible    INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_nav_location ON nav_items(location, sort_order);

-- ── Activity log ───────────────────────────────────────────────────────────
-- Powers the dashboard's recent-activity feed; there is no other record of
-- who changed what.
CREATE TABLE IF NOT EXISTS activity (
  id          TEXT PRIMARY KEY,
  user_id     TEXT REFERENCES users(id) ON DELETE SET NULL,
  user_name   TEXT NOT NULL DEFAULT '',
  action      TEXT NOT NULL,
  subject     TEXT NOT NULL DEFAULT '',
  target_href TEXT,
  created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_activity_created ON activity(created_at DESC);

-- Track post views so the dashboard can rank content by something real.
-- First-party, cookieless analytics.
--
-- Rows are pre-aggregated counters keyed by day, not one row per visit: no IP
-- address, no cookie, no identifier of any kind is stored, and the table stays
-- small enough to query on every dashboard load. This is deliberately less
-- than a full analytics product — it answers "which articles are read and
-- where do readers come from", and nothing about individuals.
--
-- Apply with: npx wrangler d1 execute olga-db --file=db/migrations/002-analytics.sql --remote

CREATE TABLE IF NOT EXISTS page_views (
  day      TEXT NOT NULL,               -- YYYY-MM-DD (UTC)
  path     TEXT NOT NULL,               -- locale-stripped, e.g. /blog/slug
  post_id  TEXT,                        -- set when the path is an article
  views    INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (day, path)
);
CREATE INDEX IF NOT EXISTS idx_views_day  ON page_views(day);
CREATE INDEX IF NOT EXISTS idx_views_post ON page_views(post_id);

CREATE TABLE IF NOT EXISTS referrers (
  day    TEXT NOT NULL,
  host   TEXT NOT NULL,                 -- "google.com", or "direct"
  views  INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (day, host)
);
CREATE INDEX IF NOT EXISTS idx_referrers_day ON referrers(day);
