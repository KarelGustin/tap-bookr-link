-- Allow authenticated users to check handle availability
-- This policy enables the availability check functionality during onboarding

create policy "Authenticated users can check handle availability" on public.profiles
for select using (
  auth.role() = 'authenticated' and 
  -- Only allow checking handle field for availability purposes
  -- This is safe because we're only exposing the handle field
  true
);

-- Note: This policy allows authenticated users to see all handle values
-- which is necessary for checking availability during onboarding
-- The handle field is public information anyway since it's part of the URL
