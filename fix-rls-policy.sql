-- Fix RLS policy for handle availability checks
-- Run this in your Supabase SQL Editor

-- First, let's see what policies currently exist
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'profiles';

-- Drop the existing restrictive policies that are blocking access
DROP POLICY IF EXISTS "Public can view published profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profiles" ON public.profiles;

-- Create a more permissive policy for authenticated users
CREATE POLICY "Authenticated users can view profiles" ON public.profiles
FOR SELECT USING (
  auth.role() = 'authenticated'
);

-- Keep the insert/update policies as they are
-- (These should already exist and work fine)

-- Test the policy
-- This should now work for authenticated users
SELECT handle FROM public.profiles LIMIT 5;
