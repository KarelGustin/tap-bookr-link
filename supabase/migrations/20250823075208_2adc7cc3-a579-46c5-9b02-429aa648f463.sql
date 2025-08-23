-- Create function to check handle availability
CREATE OR REPLACE FUNCTION is_handle_available(handle_to_check TEXT, user_id_to_exclude UUID DEFAULT NULL)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if handle exists, excluding the current user's profile if provided
  RETURN NOT EXISTS (
    SELECT 1 
    FROM public.profiles 
    WHERE handle = handle_to_check 
    AND (user_id_to_exclude IS NULL OR user_id != user_id_to_exclude)
  );
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION is_handle_available(TEXT, UUID) TO authenticated;