-- Add is_business column to profiles table
ALTER TABLE profiles 
ADD COLUMN is_business BOOLEAN DEFAULT false;

-- Add index for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_is_business ON profiles(is_business);

-- Update existing profiles to have is_business = true if they have a name
UPDATE profiles 
SET is_business = true 
WHERE name IS NOT NULL AND name != '';

COMMENT ON COLUMN profiles.is_business IS 'Whether this profile represents a business (true) or individual (false)';
