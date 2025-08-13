-- Add footer column to profiles table for storing business footer information
-- This includes business hours, policies, and display options

alter table public.profiles 
add column if not exists footer jsonb not null default '{}'::jsonb;

-- Add comment to document the footer column structure
comment on column public.profiles.footer is 'JSON object containing footer information: business hours, policies, contact info, and display options';

-- Update the updated_at trigger to include footer column changes
-- (The existing trigger will automatically handle this)
