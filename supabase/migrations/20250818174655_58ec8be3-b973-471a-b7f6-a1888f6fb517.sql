-- Update the prevent_handle_change function to include proper search_path
CREATE OR REPLACE FUNCTION public.prevent_handle_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  -- Allow setting handle when it's currently NULL (first time setup)
  IF OLD.handle IS NULL AND NEW.handle IS NOT NULL THEN
    RETURN NEW;
  END IF;
  
  -- Allow handle changes when profile status is still 'draft'
  IF OLD.status = 'draft' THEN
    RETURN NEW;
  END IF;
  
  -- Prevent handle changes for published profiles
  IF TG_OP = 'UPDATE' AND NEW.handle IS DISTINCT FROM OLD.handle THEN
    RAISE EXCEPTION 'Handle cannot be changed once profile is published';
  END IF;
  
  RETURN NEW;
END;
$function$;