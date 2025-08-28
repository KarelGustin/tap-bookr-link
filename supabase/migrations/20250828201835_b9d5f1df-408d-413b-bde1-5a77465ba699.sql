-- Fix RLS policies for webhook functions to allow service role access
-- Update existing policies to explicitly allow service role operations

-- Drop existing policies that might conflict
DROP POLICY IF EXISTS "Allow service role full access to profiles" ON public.profiles;
DROP POLICY IF EXISTS "Allow service role full access to subscriptions" ON public.subscriptions;
DROP POLICY IF EXISTS "Allow service role full access to invoices" ON public.invoices;
DROP POLICY IF EXISTS "Allow service role full access to payment_methods" ON public.payment_methods;

-- Create comprehensive service role policies
CREATE POLICY "service_role_full_access_profiles" ON public.profiles
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

CREATE POLICY "service_role_full_access_subscriptions" ON public.subscriptions
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

CREATE POLICY "service_role_full_access_invoices" ON public.invoices
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

CREATE POLICY "service_role_full_access_payment_methods" ON public.payment_methods
FOR ALL
TO service_role
USING (true)  
WITH CHECK (true);