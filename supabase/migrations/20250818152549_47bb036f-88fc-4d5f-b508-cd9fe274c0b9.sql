-- Drop the trigger first, then the function, then recreate both
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

-- Create updated handle_new_user function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.profiles (
    user_id,
    handle,
    name,
    is_business,
    onboarding_completed,
    onboarding_step,
    subscription_status,
    status,
    theme_mode,
    accent_color,
    booking_mode,
    about,
    media,
    socials,
    contact,
    banner,
    footer,
    testimonials,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id,
    -- Keep handle NULL until user fills it in
    NULL,
    -- Keep name NULL until user fills it in (no more "Nieuwe gebruiker")
    NULL,
    true, -- Default to business since this is a business platform
    false, -- Onboarding not completed yet
    1, -- Start at step 1
    'inactive', -- Default subscription status
    'draft', -- Default status
    'light', -- Default theme
    '#6E56CF', -- Default accent color
    'embed', -- Default booking mode
    '{}', -- Empty about object
    '{"items": []}', -- Empty media array
    '{}', -- Empty socials object
    '{}', -- Empty contact object
    '{}', -- Empty banner object
    '{}', -- Empty footer object
    '[]', -- Empty testimonials array
    NOW(),
    NOW()
  );
  RETURN NEW;
END;
$function$;

-- Recreate the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Add banner_url column to profiles if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'profiles' AND column_name = 'banner_url') THEN
        ALTER TABLE public.profiles ADD COLUMN banner_url text;
    END IF;
END $$;