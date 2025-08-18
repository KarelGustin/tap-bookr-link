-- Create a function to handle new user profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
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
    -- Generate a temporary handle based on email prefix
    LOWER(REGEXP_REPLACE(SPLIT_PART(NEW.email, '@', 1), '[^a-z0-9]', '', 'g')),
    -- Extract name from metadata if available
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', 'Nieuwe gebruiker'),
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
$$;

-- Create trigger to automatically create profile on user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Update RLS policies to allow proper profile management
DROP POLICY IF EXISTS "Users can manage own profile" ON public.profiles;
DROP POLICY IF EXISTS "Allow all operations" ON public.profiles;
DROP POLICY IF EXISTS "Allow anon handle availability check" ON public.profiles;
DROP POLICY IF EXISTS "Allow public handle check" ON public.profiles;

-- Create comprehensive RLS policies
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Allow public profile viewing for published profiles" ON public.profiles
  FOR SELECT USING (status = 'published');

CREATE POLICY "Allow anonymous handle availability check" ON public.profiles
  FOR SELECT USING (true);

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated, anon;
GRANT ALL ON public.profiles TO authenticated;
GRANT SELECT ON public.profiles TO anon;