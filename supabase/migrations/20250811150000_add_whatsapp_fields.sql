-- Add WhatsApp fields to profiles table for alternative booking method
-- This allows users to choose between booking URL or WhatsApp contact

alter table public.profiles 
add column if not exists use_whatsapp boolean default false;

alter table public.profiles 
add column if not exists whatsapp_number text;

-- Add comment to document the new fields
comment on column public.profiles.use_whatsapp is 'Whether the profile uses WhatsApp instead of a booking URL';
comment on column public.profiles.whatsapp_number is 'WhatsApp phone number for direct contact (when use_whatsapp is true)';
