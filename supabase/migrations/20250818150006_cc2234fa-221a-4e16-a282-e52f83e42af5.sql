-- Enable RLS on all tables that need it
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_methods ENABLE ROW LEVEL SECURITY; 
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- The profiles table should already have RLS enabled, but let's make sure
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;