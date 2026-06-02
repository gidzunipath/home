-- Feedbacks Table Migration
-- Run this SQL in your Supabase SQL Editor to create the feedbacks table

-- Drop table if exists (be careful with this in production!)
-- DROP TABLE IF EXISTS feedbacks CASCADE;

-- Create feedbacks table
CREATE TABLE IF NOT EXISTS feedbacks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  application_id UUID, -- Removed foreign key constraint for now to avoid issues
  client_name TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  program_type TEXT,
  university TEXT,
  allow_display_name BOOLEAN DEFAULT true,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  admin_notes TEXT,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_feedbacks_application_id ON feedbacks(application_id);
CREATE INDEX IF NOT EXISTS idx_feedbacks_status ON feedbacks(status);
CREATE INDEX IF NOT EXISTS idx_feedbacks_created_at ON feedbacks(created_at);

-- Enable RLS (Row Level Security)
ALTER TABLE feedbacks ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY IF NOT EXISTS "Users can view their own feedbacks" ON feedbacks
  FOR SELECT USING (true); -- Allow all for now, can be restricted later

CREATE POLICY IF NOT EXISTS "Users can insert their own feedbacks" ON feedbacks
  FOR INSERT WITH CHECK (true); -- Allow all for now

-- Admin policy (adjust based on your admin system)
CREATE POLICY IF NOT EXISTS "Admins can manage all feedbacks" ON feedbacks
  FOR ALL USING (true); -- Allow all for now

-- Test the table by inserting a sample record
INSERT INTO feedbacks (
  application_id,
  client_name,
  rating,
  title,
  message,
  program_type,
  university
) VALUES (
  gen_random_uuid(),
  'Test User',
  5,
  'Test Feedback',
  'This is a test feedback to verify the table works correctly.',
  'Computer Science',
  'Test University'
);

-- Verify the table works
SELECT * FROM feedbacks WHERE client_name = 'Test User';

-- Clean up test data
DELETE FROM feedbacks WHERE client_name = 'Test User';

-- Show table structure
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'feedbacks'
ORDER BY ordinal_position;
