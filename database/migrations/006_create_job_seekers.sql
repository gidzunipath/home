-- Job Seekers (Careers applications) table and storage bucket setup
-- Run this SQL in your Supabase SQL Editor

CREATE TABLE IF NOT EXISTS job_seekers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  position TEXT NOT NULL,
  resume_url TEXT NOT NULL,
  resume_path TEXT NOT NULL,
  resume_filename TEXT,
  deleted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_job_seekers_deleted_at ON job_seekers(deleted_at);
CREATE INDEX IF NOT EXISTS idx_job_seekers_created_at ON job_seekers(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_job_seekers_position ON job_seekers(position);

ALTER TABLE job_seekers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public insert job seekers" ON job_seekers;
CREATE POLICY "Allow public insert job seekers" ON job_seekers
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow read job seekers" ON job_seekers;
CREATE POLICY "Allow read job seekers" ON job_seekers
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow update job seekers" ON job_seekers;
CREATE POLICY "Allow update job seekers" ON job_seekers
  FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Allow delete job seekers" ON job_seekers;
CREATE POLICY "Allow delete job seekers" ON job_seekers
  FOR DELETE USING (true);

-- Storage bucket for resume uploads (Supabase Dashboard > Storage also works)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'career_resumes',
  'career_resumes',
  true,
  5242880,
  ARRAY[
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ]::text[]
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

DROP POLICY IF EXISTS "Public read career resumes" ON storage.objects;
CREATE POLICY "Public read career resumes" ON storage.objects
  FOR SELECT USING (bucket_id = 'career_resumes');

DROP POLICY IF EXISTS "Service role upload career resumes" ON storage.objects;
CREATE POLICY "Service role upload career resumes" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'career_resumes');

DROP POLICY IF EXISTS "Service role delete career resumes" ON storage.objects;
CREATE POLICY "Service role delete career resumes" ON storage.objects
  FOR DELETE USING (bucket_id = 'career_resumes');
