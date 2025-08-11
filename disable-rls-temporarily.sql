-- Temporarily disable RLS for testing (REMOVE THIS IN PRODUCTION)
-- Run this in your Supabase dashboard SQL Editor

-- Disable RLS on profiles table
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

-- Test that RLS is disabled
SELECT 'RLS disabled successfully for testing!' as status;
