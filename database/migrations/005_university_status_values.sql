-- University application status: canonical values in `universities.status`
-- Run in Supabase SQL Editor (or your Postgres client) once.
--
-- Maps legacy admin UI values to the new set:
--   progress / "In Progress" → submitted
--   yes → accepted
--   no → rejected

UPDATE universities
SET status = 'submitted'
WHERE LOWER(TRIM(status)) IN ('progress', 'in progress');

UPDATE universities
SET status = 'accepted'
WHERE LOWER(TRIM(status)) IN ('yes', 'approved');

UPDATE universities
SET status = 'rejected'
WHERE LOWER(TRIM(status)) IN ('no', 'declined');
