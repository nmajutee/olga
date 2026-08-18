-- Adds everything the dashboard needs to manage the site itself, not just
-- articles: reusable content collections, menus, and homepage sections.
-- Apply with: npx wrangler d1 execute olga-db --file=db/migrations/001-site-management.sql --remote

PRAGMA foreign_keys = ON;

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
ALTER TABLE posts ADD COLUMN view_count INTEGER NOT NULL DEFAULT 0;
