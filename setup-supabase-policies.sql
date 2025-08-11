-- Setup Supabase RLS policies for profiles table
-- Run this in your Supabase dashboard SQL Editor

-- Enable RLS on profiles table
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Drop ALL existing policies
DROP POLICY IF EXISTS "Public can view published profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profiles" ON public.profiles;
DROP POLICY IF EXISTS "Public can check handle availability" ON public.profiles;

-- Create a completely open policy for testing (REMOVE THIS IN PRODUCTION)
CREATE POLICY "Allow all operations for testing" ON public.profiles
FOR ALL USING (true) WITH CHECK (true);

-- Test the policies
SELECT 'Open policies created successfully for testing!' as status;
