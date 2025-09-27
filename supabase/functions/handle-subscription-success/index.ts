import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import Stripe from "https://esm.sh/stripe@14.21.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { profileId } = await req.json();
    console.log('🔧 Handling subscription success for profile:', profileId);

    if (!profileId) {
      throw new Error('Profile ID is required');
    }

    // Initialize Supabase client with service role key
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { persistSession: false } }
    );

    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
      apiVersion: '2023-10-16',
    });

    // Get the profile to check current status and Stripe customer
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, handle, status, stripe_customer_id, preview_expires_at, preview_started_at')
      .eq('id', profileId)
      .maybeSingle();

    if (profileError) {
      console.error('❌ Error fetching profile:', profileError);
      throw profileError;
    }

    if (!profile) {
      throw new Error('Profile not found');
    }

    console.log('🔧 Profile current status:', profile.status);
    console.log('🔧 Profile had preview expires at:', profile.preview_expires_at);

    // Check if the profile has an active Stripe subscription
    let hasActiveSubscription = false;
    if (profile.stripe_customer_id) {
      try {
        const subscriptions = await stripe.subscriptions.list({
          customer: profile.stripe_customer_id,
          status: 'active',
          limit: 1,
        });
        
        hasActiveSubscription = subscriptions.data.length > 0;
        console.log('🔧 Profile has active Stripe subscription:', hasActiveSubscription);
      } catch (stripeError) {
        console.error('❌ Error checking Stripe subscription:', stripeError);
      }
    }

    // If subscription is active, make the profile permanently published
    if (hasActiveSubscription) {
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          status: 'published',
          subscription_status: 'active',
          preview_expires_at: null, // Clear preview expiration
          preview_started_at: null, // Clear preview start time  
          updated_at: new Date().toISOString()
        })
        .eq('id', profileId);

      if (updateError) {
        console.error('❌ Error updating profile to permanent published status:', updateError);
        throw updateError;
      }

      console.log('✅ Profile set to permanently published (active subscription)');

      return new Response(JSON.stringify({
        success: true,
        status: 'published',
        subscription_status: 'active',
        permanent: true,
        message: 'Profile set to permanently published with active subscription'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    } else {
      console.log('⚠️ No active subscription found, keeping current status');
      
      return new Response(JSON.stringify({
        success: true,
        status: profile.status,
        subscription_status: 'inactive',
        permanent: false,
        message: 'No active subscription found'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }
  } catch (error) {
    console.error('❌ Error in handle-subscription-success:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'Internal server error' 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});