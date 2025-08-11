-- Check current RLS status and policies
-- Run this in your Supabase dashboard SQL Editor

-- Check if RLS is enabled on profiles table
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE tablename = 'profiles';

-- Check current RLS policies
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'profiles';

-- Check table permissions
SELECT 
  grantee,
  table_name,
  privilege_type,
  is_grantable
FROM information_schema.table_privileges 
WHERE table_name = 'profiles';

-- Check if the table exists and is accessible
SELECT 
  table_name,
  table_schema,
  table_type
FROM information_schema.tables 
WHERE table_name = 'profiles';
