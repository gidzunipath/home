-- German Life blog posts and image storage
-- Run this SQL in your Supabase SQL Editor

CREATE TABLE IF NOT EXISTS german_life_blog_posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  short_description TEXT,
  thumbnail_url TEXT,
  thumbnail_path TEXT,
  cover_image_url TEXT,
  cover_image_path TEXT,
  content JSONB NOT NULL DEFAULT '{"type":"doc","content":[]}'::jsonb,
  tags TEXT[] DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  reading_time_minutes INTEGER NOT NULL DEFAULT 1,
  view_count INTEGER NOT NULL DEFAULT 0,
  published_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES admin_users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_german_life_blog_status ON german_life_blog_posts(status);
CREATE INDEX IF NOT EXISTS idx_german_life_blog_published_at ON german_life_blog_posts(published_at DESC NULLS LAST);
CREATE INDEX IF NOT EXISTS idx_german_life_blog_slug ON german_life_blog_posts(slug);
CREATE INDEX IF NOT EXISTS idx_german_life_blog_tags ON german_life_blog_posts USING GIN(tags);

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
  EXECUTE FUNCTION update_german_life_blog_updated_at();

ALTER TABLE german_life_blog_posts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow read published german life blog" ON german_life_blog_posts;
CREATE POLICY "Allow read published german life blog" ON german_life_blog_posts
  FOR SELECT USING (status = 'published' OR true);

DROP POLICY IF EXISTS "Allow insert german life blog" ON german_life_blog_posts;
CREATE POLICY "Allow insert german life blog" ON german_life_blog_posts
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow update german life blog" ON german_life_blog_posts;
CREATE POLICY "Allow update german life blog" ON german_life_blog_posts
  FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Allow delete german life blog" ON german_life_blog_posts;
CREATE POLICY "Allow delete german life blog" ON german_life_blog_posts
  FOR DELETE USING (true);

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'blog_images',
  'blog_images',
  true,
  10485760,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']::text[]
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

DROP POLICY IF EXISTS "Public read blog images" ON storage.objects;
CREATE POLICY "Public read blog images" ON storage.objects
  FOR SELECT USING (bucket_id = 'blog_images');

DROP POLICY IF EXISTS "Service role upload blog images" ON storage.objects;
CREATE POLICY "Service role upload blog images" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'blog_images');

DROP POLICY IF EXISTS "Service role delete blog images" ON storage.objects;
CREATE POLICY "Service role delete blog images" ON storage.objects
  FOR DELETE USING (bucket_id = 'blog_images');
