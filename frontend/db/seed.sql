-- Default site settings. Safe to re-run: existing values are preserved.
-- Apply with:  npx wrangler d1 execute olga-db --file=db/seed.sql --remote

INSERT OR IGNORE INTO settings (key, value) VALUES
  ('site_title',            'Olga Emma Elume'),
  ('site_tagline',          'Professional Communications & Digital Rights'),
  ('site_description',      'Communications strategist specialising in digital rights advocacy, media literacy and humanitarian storytelling.'),
  ('site_url',              'https://olgaemma.com'),
  ('default_author',        'Olga Emma Elume'),
  ('posts_per_page',        '12'),
  ('contact_email',         'contact@olgaemma.com'),
  ('social_linkedin',       ''),
  ('social_x',              ''),
  ('social_instagram',      ''),
  ('seo_title_template',    '%s | Olga Emma Elume'),
  ('seo_default_og_image',  ''),
  ('seo_twitter_handle',    ''),
  ('ai_default_tone',       'Warm, authoritative, plain-spoken. Written for practitioners and policy audiences, not marketers.'),
  ('ai_default_words',      '1200'),
  ('analytics_html',        '');
