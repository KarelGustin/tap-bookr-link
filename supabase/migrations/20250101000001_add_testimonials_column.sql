-- Add testimonials column to profiles table
-- This column will store testimonials as a JSON array for better performance and easier querying

ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS testimonials JSONB DEFAULT '[]'::jsonb;

-- Add comment to describe the column
COMMENT ON COLUMN profiles.testimonials IS 'Array of customer testimonials with customer_name, review_title, review_text, and image_url';

-- Create an index on the testimonials column for better query performance
CREATE INDEX IF NOT EXISTS idx_profiles_testimonials ON profiles USING GIN (testimonials);

-- Update existing profiles to have an empty testimonials array if they don't have one
UPDATE profiles 
SET testimonials = '[]'::jsonb 
WHERE testimonials IS NULL;
