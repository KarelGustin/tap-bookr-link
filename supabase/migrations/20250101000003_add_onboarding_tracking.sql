-- Add onboarding tracking columns to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT FALSE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS onboarding_step INTEGER DEFAULT 1;

-- Update existing profiles to mark them as completed if they have a handle and status is published
UPDATE profiles 
SET onboarding_completed = TRUE, onboarding_step = 8 
WHERE handle IS NOT NULL AND handle != '' AND status = 'published';

-- Update existing profiles to mark them as not completed if they don't have a handle
UPDATE profiles 
SET onboarding_completed = FALSE, onboarding_step = 1 
WHERE handle IS NULL OR handle = '';
