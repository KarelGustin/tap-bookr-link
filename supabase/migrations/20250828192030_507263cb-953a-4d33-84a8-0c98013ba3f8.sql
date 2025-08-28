-- Add RLS policies for edge functions to access tables with service role key

-- Subscriptions table policies
CREATE POLICY "Allow service role full access to subscriptions" 
ON public.subscriptions 
FOR ALL 
USING (true) 
WITH CHECK (true);

-- Invoices table policies  
CREATE POLICY "Allow service role full access to invoices"
ON public.invoices
FOR ALL
USING (true)
WITH CHECK (true);

-- Payment methods table policies
CREATE POLICY "Allow service role full access to payment_methods"
ON public.payment_methods  
FOR ALL
USING (true)
WITH CHECK (true);

-- Stripe events table policies
CREATE POLICY "Allow service role full access to stripe_events"
ON public.stripe_events
FOR ALL  
USING (true)
WITH CHECK (true);

-- Also add user policies for subscriptions table
CREATE POLICY "Users can view their own subscriptions"
ON public.subscriptions
FOR SELECT
USING (profile_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can view their own invoices" 
ON public.invoices
FOR SELECT
USING (profile_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can view their own payment methods"
ON public.payment_methods
FOR SELECT  
USING (profile_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));