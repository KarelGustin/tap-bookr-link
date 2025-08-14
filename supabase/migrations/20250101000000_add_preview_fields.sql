-- Add preview fields to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS preview_expires_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS preview_started_at TIMESTAMP WITH TIME ZONE;
-- Add index for preview expiry queries
CREATE INDEX IF NOT EXISTS idx_profiles_preview_expires_at ON profiles(preview_expires_at);

-- Add index for preview status queries
CREATE INDEX IF NOT EXISTS idx_profiles_status ON profiles(status);

