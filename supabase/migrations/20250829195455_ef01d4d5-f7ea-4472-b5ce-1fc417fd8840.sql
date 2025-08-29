-- Add subscription_started_at column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN subscription_started_at TIMESTAMP WITH TIME ZONE;

-- Update existing profiles with subscription_started_at based on trial_start_date or created_at
UPDATE public.profiles 
SET subscription_started_at = COALESCE(trial_start_date, created_at)
WHERE subscription_status = 'active' AND subscription_started_at IS NULL;