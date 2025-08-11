-- Quick fix: Disable RLS to restore functionality
-- Run this in your Supabase dashboard SQL Editor

-- Disable RLS on profiles table
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

-- Grant all permissions to public (temporary fix)
GRANT ALL ON public.profiles TO public;
GRANT ALL ON public.profiles TO anon;
GRANT ALL ON public.profiles TO authenticated;

-- Verify RLS is disabled
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE tablename = 'profiles';

-- Test basic access
SELECT 'RLS disabled and permissions granted!' as status;
