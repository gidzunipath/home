-- Step6 was "Successful"; Interview is now Step6 and Successful is Step7.
-- Run in Supabase SQL Editor. Execute block 1, then block 2 (separate runs).
-- PostgreSQL cannot use a new enum value in the same transaction it was added.

-- Block 1: extend enum (run this first)
ALTER TYPE status ADD VALUE IF NOT EXISTS 'Step7';

-- Block 2: migrate old "Successful" rows (run after block 1 commits)
UPDATE applications
SET status = 'Step7'
WHERE status = 'Step6';
