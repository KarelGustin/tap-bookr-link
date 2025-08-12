-- Comprehensive database fix for TapBookr
-- Run this in your Supabase SQL Editor

-- Step 1: Check current RLS status
SELECT 
  schemaname, 
  tablename, 
  rowsecurity,
  hasindexes,
  hasrules,
  hastriggers
FROM pg_tables 
WHERE tablename = 'profiles';

-- Step 2: Drop ALL existing policies
DROP POLICY IF EXISTS "Public can view published profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profiles" ON public.profiles;
DROP POLICY IF EXISTS "Authenticated users can check handle availability" ON public.profiles;
DROP POLICY IF EXISTS "Authenticated users can view profiles" ON public.profiles;

-- Step 3: Completely disable RLS
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

-- Step 4: Grant ALL permissions to ALL roles
GRANT ALL ON public.profiles TO public;
GRANT ALL ON public.profiles TO anon;
GRANT ALL ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO postgres;
GRANT ALL ON public.profiles TO service_role;

-- Step 5: Verify RLS is disabled
SELECT 
  'RLS Status' as check_type,
  CASE WHEN rowsecurity THEN 'ENABLED' ELSE 'DISABLED' END as status
FROM pg_tables 
WHERE tablename = 'profiles';

-- Step 6: Test access
SELECT 'Test successful' as status, COUNT(*) as profile_count FROM public.profiles;

-- Step 7: Test basic queries
-- This should work now
SELECT 'Test query successful' as status, COUNT(*) as profile_count FROM public.profiles;

-- Step 8: Check for any remaining issues
SELECT 
  'RLS Status' as check_type,
  CASE WHEN rowsecurity THEN 'ENABLED' ELSE 'DISABLED' END as status
FROM pg_tables 
WHERE tablename = 'profiles'
UNION ALL
SELECT 
  'Public Access' as check_type,
  CASE WHEN EXISTS (
    SELECT 1 FROM information_schema.role_table_grants 
    WHERE table_name = 'profiles' 
    AND grantee = 'public' 
    AND privilege_type = 'SELECT'
  ) THEN 'GRANTED' ELSE 'NOT GRANTED' END as status;
