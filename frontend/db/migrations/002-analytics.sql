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
