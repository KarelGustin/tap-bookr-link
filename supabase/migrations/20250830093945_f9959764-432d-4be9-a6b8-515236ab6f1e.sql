-- First, clean up any potential duplicate handles by making them unique
-- Update any duplicate handles by appending a number
WITH duplicates AS (
  SELECT handle, user_id, 
         ROW_NUMBER() OVER (PARTITION BY lower(handle) ORDER BY created_at) as rn
  FROM profiles 
  WHERE handle IS NOT NULL
),
updates AS (
  SELECT user_id, handle || '_' || rn as new_handle
  FROM duplicates 
  WHERE rn > 1
)
UPDATE profiles 
SET handle = updates.new_handle
FROM updates 
WHERE profiles.user_id = updates.user_id;

-- Add unique constraint on handle column (case-insensitive)
CREATE UNIQUE INDEX IF NOT EXISTS profiles_handle_unique_lower 
ON profiles (lower(handle)) 
WHERE handle IS NOT NULL;

-- Verify the existing is_handle_available function works correctly
-- This function already exists and should work, but let's make sure it's optimal
CREATE OR REPLACE FUNCTION public.is_handle_available(
  handle_to_check text,
  user_id_to_exclude uuid DEFAULT NULL
) RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT NOT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE lower(handle) = lower(trim(handle_to_check))
      AND handle IS NOT NULL
      AND (user_id_to_exclude IS NULL OR user_id != user_id_to_exclude)
  );
$$;