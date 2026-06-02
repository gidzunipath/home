-- Add optional testimonial photo for approved feedbacks (admin upload)
ALTER TABLE feedbacks
ADD COLUMN IF NOT EXISTS image_url TEXT;
