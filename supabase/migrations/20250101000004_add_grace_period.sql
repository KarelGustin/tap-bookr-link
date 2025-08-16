-- Add grace period column to profiles table
-- This column tracks when a profile should go offline after failed payments

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'grace_period_ends_at') THEN
    ALTER TABLE profiles ADD COLUMN grace_period_ends_at TIMESTAMPTZ;
  END IF;
END $$;

-- Create index for efficient grace period queries
CREATE INDEX IF NOT EXISTS idx_profiles_grace_period ON profiles(grace_period_ends_at) WHERE grace_period_ends_at IS NOT NULL;

-- Add comment to explain the column
COMMENT ON COLUMN profiles.grace_period_ends_at IS 'Timestamp when profile should go offline after failed payment (3-day grace period)';
