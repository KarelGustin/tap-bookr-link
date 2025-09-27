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
    console.log('🔧 Starting expired previews check');

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

    // Find profiles with expired previews that are still published
    const { data: expiredProfiles, error: queryError } = await supabase
      .from('profiles')
      .select('id, user_id, handle, stripe_customer_id, preview_expires_at')
      .eq('status', 'published')
      .lt('preview_expires_at', new Date().toISOString())
      .not('preview_expires_at', 'is', null);

    if (queryError) {
      console.error('❌ Error querying expired profiles:', queryError);
      throw queryError;
    }

    console.log(`🔧 Found ${expiredProfiles?.length || 0} expired preview profiles`);

    if (!expiredProfiles || expiredProfiles.length === 0) {
      return new Response(JSON.stringify({ 
        message: 'No expired previews found',
        processed: 0 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    let keptPublished = 0;
    let revertedToDraft = 0;

    // Check each expired profile for active subscription
    for (const profile of expiredProfiles) {
      console.log(`🔧 Checking profile ${profile.handle} (${profile.id})`);
      
      let hasActiveSubscription = false;

      // Check if profile has active subscription via Stripe
      if (profile.stripe_customer_id) {
        try {
          const subscriptions = await stripe.subscriptions.list({
            customer: profile.stripe_customer_id,
            status: 'active',
            limit: 1,
          });
          
          hasActiveSubscription = subscriptions.data.length > 0;
          console.log(`🔧 Profile ${profile.handle} has active subscription: ${hasActiveSubscription}`);
        } catch (stripeError) {
          console.error(`❌ Error checking Stripe subscription for ${profile.handle}:`, stripeError);
          // Continue without Stripe check - will fall back to draft
        }
      }

      // Update profile status based on subscription
      if (hasActiveSubscription) {
        // Keep published, clear preview expiration since they have subscription
        const { error: updateError } = await supabase
          .from('profiles')
          .update({
            preview_expires_at: null,
            preview_started_at: null,
            subscription_status: 'active',
            updated_at: new Date().toISOString()
          })
          .eq('id', profile.id);

        if (updateError) {
          console.error(`❌ Error updating profile ${profile.handle} to keep published:`, updateError);
        } else {
          console.log(`✅ Kept profile ${profile.handle} published (has active subscription)`);
          keptPublished++;
        }
      } else {
        // Revert to draft - preview expired and no subscription
        const { error: updateError } = await supabase
          .from('profiles')
          .update({
            status: 'draft',
            preview_expires_at: null,
            preview_started_at: null,
            subscription_status: 'inactive',
            updated_at: new Date().toISOString()
          })
          .eq('id', profile.id);

        if (updateError) {
          console.error(`❌ Error reverting profile ${profile.handle} to draft:`, updateError);
        } else {
          console.log(`✅ Reverted profile ${profile.handle} to draft (no active subscription)`);
          revertedToDraft++;
        }
      }
    }

    console.log(`🔧 Expired previews check completed. Kept published: ${keptPublished}, Reverted to draft: ${revertedToDraft}`);

    return new Response(JSON.stringify({
      message: 'Expired previews check completed',
      processed: expiredProfiles.length,
      keptPublished,
      revertedToDraft
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    console.error('❌ Error in check-expired-previews:', error);
    return new Response(JSON.stringify({ 
      error: (error as Error).message || 'Internal server error' 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
