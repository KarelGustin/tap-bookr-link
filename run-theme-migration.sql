-- Run this SQL to add the theme_palette column to your profiles table

-- Add theme_palette column to profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS theme_palette VARCHAR(50) DEFAULT 'elegant-rose';

-- Update existing profiles to use default theme
UPDATE public.profiles SET theme_palette = 'elegant-rose' WHERE theme_palette IS NULL;

-- Verify the column was added
SELECT column_name, data_type, column_default, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'profiles' AND column_name = 'theme_palette';
