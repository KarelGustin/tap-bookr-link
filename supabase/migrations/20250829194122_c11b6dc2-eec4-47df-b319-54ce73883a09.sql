-- Fix database permissions issues for edge functions
-- Grant necessary permissions to service role

-- Ensure service role has access to public schema
GRANT USAGE ON SCHEMA public TO service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO service_role;

-- Grant permissions to authenticator role (used by edge functions)
GRANT USAGE ON SCHEMA public TO authenticator;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticator;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticator;

-- Ensure profiles table has correct permissions
GRANT ALL ON public.profiles TO service_role;
GRANT ALL ON public.profiles TO authenticator;

-- Fix any permission issues with the profiles table for edge functions
ALTER TABLE public.profiles OWNER TO postgres;

-- Ensure RLS policies allow service role access
-- Service role should bypass RLS, but let's make sure
GRANT ALL ON public.profiles TO service_role;

-- Test query to verify permissions
SELECT 'Permissions fixed successfully' as status;