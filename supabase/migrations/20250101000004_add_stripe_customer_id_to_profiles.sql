-- Add stripe_customer_id column to profiles table
ALTER TABLE profiles 
ADD COLUMN stripe_customer_id TEXT;

-- Add index for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_stripe_customer_id ON profiles(stripe_customer_id);

-- Update existing profiles to have stripe_customer_id if they have a subscription
-- This will be populated by the webhook when subscriptions are created
COMMENT ON COLUMN profiles.stripe_customer_id IS 'Stripe customer ID for this profile';
