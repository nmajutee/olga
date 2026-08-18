-- Author profile. The public site's Person schema, article bylines and author
-- box were all hardcoded to one name; these columns make them editable and
-- keep the site's identity in one place.
--
-- Apply with: npx wrangler d1 execute olga-db --file=db/migrations/003-profile.sql --remote

ALTER TABLE users ADD COLUMN title      TEXT NOT NULL DEFAULT '';
ALTER TABLE users ADD COLUMN bio        TEXT NOT NULL DEFAULT '';
ALTER TABLE users ADD COLUMN avatar_url TEXT;
ALTER TABLE users ADD COLUMN location   TEXT NOT NULL DEFAULT '';
ALTER TABLE users ADD COLUMN website    TEXT NOT NULL DEFAULT '';
ALTER TABLE users ADD COLUMN linkedin   TEXT NOT NULL DEFAULT '';
ALTER TABLE users ADD COLUMN social_x   TEXT NOT NULL DEFAULT '';
ALTER TABLE users ADD COLUMN instagram  TEXT NOT NULL DEFAULT '';
