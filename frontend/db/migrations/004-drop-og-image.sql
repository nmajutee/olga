-- The per-article social share image is gone: sharing now uses the article's
-- cover image, falling back to the site-wide share image in SEO settings.
-- One image to set instead of two, and no way for them to disagree.
--
-- Apply with: npx wrangler d1 execute olga-db --file=db/migrations/004-drop-og-image.sql --remote

ALTER TABLE posts DROP COLUMN og_image_url;
