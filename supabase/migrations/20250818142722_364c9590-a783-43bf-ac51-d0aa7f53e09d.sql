-- Fix Stripe webhook table references and subscription data structure
-- Update subscriptions table to include all necessary Stripe fields
ALTER TABLE public.subscriptions ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT;
ALTER TABLE public.subscriptions ADD COLUMN IF NOT EXISTS trial_start TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.subscriptions ADD COLUMN IF NOT EXISTS trial_end TIMESTAMP WITH TIME ZONE;

-- Add unique constraint on handle (if not exists)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'profiles_handle_unique'
    ) THEN
        ALTER TABLE public.profiles ADD CONSTRAINT profiles_handle_unique UNIQUE (handle);
    END IF;
END $$;

-- Update profiles table to ensure proper column types and constraints
ALTER TABLE public.profiles ALTER COLUMN name TYPE TEXT;
ALTER TABLE public.profiles ALTER COLUMN footer_business_name TYPE TEXT;
ALTER TABLE public.profiles ALTER COLUMN footer_address TYPE TEXT;
ALTER TABLE public.profiles ALTER COLUMN footer_email TYPE TEXT;
ALTER TABLE public.profiles ALTER COLUMN footer_phone TYPE TEXT;
ALTER TABLE public.profiles ALTER COLUMN footer_next_available TYPE TEXT;
ALTER TABLE public.profiles ALTER COLUMN footer_cancellation_policy TYPE TEXT;
ALTER TABLE public.profiles ALTER COLUMN footer_privacy_policy TYPE TEXT;
ALTER TABLE public.profiles ALTER COLUMN footer_terms_of_service TYPE TEXT;

-- Add missing footer columns if they don't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='footer_hours') THEN
        ALTER TABLE public.profiles ADD COLUMN footer_hours JSONB;
    END IF;
END $$;

-- Create function to clean up old subscription records and ensure consistency
CREATE OR REPLACE FUNCTION public.cleanup_subscription_data()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Update any profiles that have subscription data but no matching subscription record
    UPDATE public.profiles 
    SET subscription_status = 'inactive',
        subscription_id = NULL
    WHERE subscription_id IS NOT NULL 
    AND subscription_id NOT IN (
        SELECT stripe_subscription_id FROM public.subscriptions WHERE stripe_subscription_id IS NOT NULL
    );
    
    -- Log the cleanup
    RAISE NOTICE 'Subscription data cleanup completed';
END;
$$;

-- Run the cleanup function
SELECT public.cleanup_subscription_data();

-- Create trigger to auto-update profile subscription status when subscription changes
CREATE OR REPLACE FUNCTION public.sync_profile_subscription_status()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Update the profile's subscription status to match the subscription
    UPDATE public.profiles 
    SET subscription_status = NEW.status,
        updated_at = now()
    WHERE id = NEW.profile_id;
    
    RETURN NEW;
END;
$$;

-- Create trigger if it doesn't exist
DROP TRIGGER IF EXISTS sync_subscription_status ON public.subscriptions;
CREATE TRIGGER sync_subscription_status
    AFTER INSERT OR UPDATE ON public.subscriptions
    FOR EACH ROW
    EXECUTE FUNCTION public.sync_profile_subscription_status();

-- Ensure handle check function is working correctly
CREATE OR REPLACE FUNCTION public.is_handle_available(in_handle text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE 
  normalized text;
BEGIN
  normalized := lower(trim(in_handle));
  IF normalized IS NULL OR length(normalized) < 3 THEN
    RETURN false;
  END IF;
  RETURN NOT EXISTS (
    SELECT 1 FROM public.profiles WHERE lower(handle) = normalized
  );
END;
$$;