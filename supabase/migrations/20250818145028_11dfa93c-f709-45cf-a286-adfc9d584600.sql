-- Fix the is_handle_available function permissions
CREATE OR REPLACE FUNCTION public.is_handle_available(in_handle text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE 
  normalized text;
BEGIN
  normalized := lower(trim(in_handle));
  IF normalized IS NULL OR length(normalized) < 3 THEN
    RETURN false;
  END IF;
  RETURN NOT EXISTS (
    SELECT 1 FROM public.profiles WHERE lower(handle) = normalized
  );
END;
$function$;

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION public.is_handle_available(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_handle_available(text) TO anon;