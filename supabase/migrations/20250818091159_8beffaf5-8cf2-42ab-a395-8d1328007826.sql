-- Fix profiles table RLS policies for public access to published profiles
-- This allows public access to published profiles while keeping draft profiles private

-- Drop all existing RLS policies on profiles table
DROP POLICY IF EXISTS "Users can view their own profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profiles only" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can delete their own profiles" ON public.profiles;

-- Create new policies that allow public access to published profiles
-- 1. Anyone can view published profiles (including unauthenticated users)
CREATE POLICY "Anyone can view published profiles" 
ON public.profiles 
FOR SELECT 
USING (status = 'published');

-- 2. Users can view their own profiles regardless of status
CREATE POLICY "Users can view their own profiles" 
ON public.profiles 
FOR SELECT 
USING (auth.uid()::text = user_id);

-- 3. Users can only insert their own profiles
CREATE POLICY "Users can insert their own profiles" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid()::text = user_id);

-- 4. Users can only update their own profiles
CREATE POLICY "Users can update their own profiles" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid()::text = user_id)
WITH CHECK (auth.uid()::text = user_id);

-- 5. Users can only delete their own profiles
CREATE POLICY "Users can delete their own profiles" 
ON public.profiles 
FOR DELETE 
USING (auth.uid()::text = user_id);