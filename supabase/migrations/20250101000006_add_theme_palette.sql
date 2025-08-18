-- Add theme_palette column to profiles table
ALTER TABLE public.profiles ADD COLUMN theme_palette VARCHAR(50) DEFAULT 'elegant-rose';

-- Update existing profiles to use default theme
UPDATE public.profiles SET theme_palette = 'elegant-rose' WHERE theme_palette IS NULL;
