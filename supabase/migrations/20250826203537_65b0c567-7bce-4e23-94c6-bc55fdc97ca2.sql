-- Fix the handle column to allow NULL values during signup
-- The handle will be set during onboarding step 1
ALTER TABLE public.profiles ALTER COLUMN handle DROP NOT NULL;