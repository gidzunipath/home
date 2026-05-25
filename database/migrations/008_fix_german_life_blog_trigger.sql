-- Fix updated_at trigger if 007 failed on EXECUTE FUNCTION (older Postgres)
-- Safe to run multiple times

CREATE OR REPLACE FUNCTION update_german_life_blog_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS german_life_blog_posts_updated_at ON german_life_blog_posts;
CREATE TRIGGER german_life_blog_posts_updated_at
  BEFORE UPDATE ON german_life_blog_posts
  FOR EACH ROW
  EXECUTE PROCEDURE update_german_life_blog_updated_at();
