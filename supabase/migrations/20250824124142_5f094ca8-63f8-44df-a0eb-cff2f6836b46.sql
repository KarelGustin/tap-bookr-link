-- Create trigger function to automatically create profile when user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
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
    NULL, -- Will be set in onboarding step 1
    NEW.raw_user_meta_data ->> 'name',
    true,
    false,
    1,
    'inactive',
    'draft',
    'light',
    '#6E56CF',
    'embed',
    '{}',
    '{"items": []}',
    '{}',
    '{}',
    '{}',
    '{}',
    '[]',
    NOW(),
    NOW()
  );
  RETURN NEW;
END;
$$;

-- Create trigger to execute function when user is created
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();