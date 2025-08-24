// @ts-expect-error -- Deno runtime environment
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
// @ts-expect-error -- Deno runtime environment
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// @ts-expect-error -- Deno runtime environment
import Stripe from 'https://esm.sh/stripe@14.21.0?target=deno';
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
};
serve(async (req)=>{
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: corsHeaders
    });
  }
  try {
    const signature = req.headers.get('stripe-signature');
    if (!signature) {
      console.error('❌ No Stripe signature found in headers');
      throw new Error('No Stripe signature found');
    }
    // lees raw body als bytes
    const rawBody = new Uint8Array(await req.arrayBuffer());
    console.log('📨 Received webhook body length:', rawBody.byteLength);
    // @ts-expect-error -- Deno runtime environment
    const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');
    if (!webhookSecret) {
      console.error('❌ STRIPE_WEBHOOK_SECRET not configured');
      throw new Error('Stripe webhook secret not configured');
    }
    // Verify webhook signature (IMPORTANT for production)
    let event;
    try {
      // @ts-expect-error -- Deno runtime environment
      const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY');
      if (!stripeSecretKey) {
        console.error('❌ STRIPE_SECRET_KEY not configured');
        throw new Error('Stripe secret key not configured');
      }
      const stripe = new Stripe(stripeSecretKey);
      // async verificatie met bytes
      event = await stripe.webhooks.constructEventAsync(
        rawBody,
        signature,
        webhookSecret
      );
      console.log('✅ Webhook signature verified successfully');
    } catch (err) {
      console.error('❌ Webhook signature verification failed:', err.message);
      throw new Error('Invalid webhook signature');
    }
    console.log(' Processing webhook event:', {
      type: event.type,
      id: event.id,
      created: event.created
    });
    // Initialize Supabase client
    // @ts-expect-error -- Deno runtime environment
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    // @ts-expect-error -- Deno runtime environment
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('❌ Supabase environment variables not configured');
      throw new Error('Supabase configuration missing');
    }
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    console.log('🔗 Supabase client initialized');
    // Process the event
    let processingResult = {
      success: false,
      message: ''
    };
    switch(event.type){
      // case 'checkout.session.completed':
      //   processingResult = await handleCheckoutSessionCompleted(event.data.object, supabase);
      //   break;
      // case 'customer.created':
      //   processingResult = await handleCustomerCreated(event.data.object, supabase);
      //   break;
      case 'customer.subscription.created':
        processingResult = await handleSubscriptionCreated(event.data.object, supabase);
        break;
      // case 'customer.subscription.updated':
      //   processingResult = await handleSubscriptionUpdated(event.data.object, supabase);
      //   break;
      case 'customer.subscription.deleted':
        processingResult = await handleSubscriptionDeleted(event.data.object, supabase);
        break;
      // case 'invoice.payment_succeeded':
      //   processingResult = await handleInvoicePaymentSucceeded(event.data.object, supabase);
      //   break;
      // case 'invoice.payment_failed':
      //   processingResult = await handleInvoicePaymentFailed(event.data.object, supabase);
      //   break;
      default:
        console.log(`⚠️ Unhandled event type: ${event.type}`);
        processingResult = {
          success: true,
          message: `Unhandled event type: ${event.type}`
        };
    }
    console.log('✅ Webhook processing completed:', processingResult);
    return new Response(JSON.stringify({
      received: true,
      processed: true,
      result: processingResult
    }), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      },
      status: 200
    });
  } catch (error) {
    console.error('❌ Webhook error:', {
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });
    return new Response(JSON.stringify({
      error: error.message,
      timestamp: new Date().toISOString()
    }), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      },
      status: 400
    });
  }
});
// Enhanced handler functions with better error handling and logging
async function handleSubscriptionCreated(subscription, supabase) {
  try {
    // Find or create profile based on customer ID
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, stripe_customer_id')
      .eq('stripe_customer_id', subscription.customer)
      .single();

    if (profileError || !profile) {
      console.error('[WEBHOOK] Error finding or creating profile:', profileError);
      return {
        success: false,
        message: `Error finding or creating profile: ${profileError?.message || 'Unknown error'}`
      };
    }

    // Normalize subscription status
    const normalizedSubscriptionStatus = subscription.status === 'active' || subscription.status === 'trialing' ? 'active' : 'inactive';

    // Upsert subscription (idempotent on stripe_subscription_id)
    const { error: upsertError } = await supabase
      .from('subscriptions')
      .upsert({
        stripe_subscription_id: subscription.id,
        profile_id: profile.id,
        stripe_customer_id: subscription.customer,
        status: normalizedSubscriptionStatus,
        current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
        current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
        cancel_at_period_end: subscription.cancel_at_period_end,
        onboarding_completed: true,
        updated_at: new Date().toISOString(),
        onboarding_step: 8,
        subscription_id: subscription.id,
        subscription_status: normalizedSubscriptionStatus,
      }, { onConflict: 'stripe_subscription_id' });

    if (upsertError) {
      console.error('[WEBHOOK] Error upserting subscription:', upsertError);
      return {
        success: false,
        message: `Error upserting subscription: ${upsertError.message}`
      };
    }

    // Update profile flags
    const isActive = ['active', 'trialing'].includes(subscription.status);
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        subscription_status: isActive ? 'active' : 'inactive',
        status: isActive ? 'published' : 'draft',
        onboarding_completed: true,
        subscription_id: subscription.id,
        onboarding_step: 8,
        updated_at: new Date().toISOString()
      })
      .eq('id', profile.id);

    if (updateError) {
      console.error('[WEBHOOK] Error updating profile:', updateError);
      return {
        success: false,
        message: `Error updating profile: ${updateError.message}`
      };
    }

    console.log(`[WEBHOOK] Subscription linked to profile ${profile.id} and profile flags updated`);
    return {
      success: true,
      message: 'Subscription created/updated successfully'
    };
  } catch (error) {
    console.error('[WEBHOOK] Error in handleSubscriptionCreated:', error);
    return {
      success: false,
      message: `Error processing subscription: ${error}`
    };
  }
}
// Subscription updated handler intentionally disabled per current requirements
async function handleSubscriptionDeleted(subscription, supabase) {
  console.log(`🔧 Processing subscription deleted for subscription ${subscription.id}`);
  // Update subscription record
  const { error: subError } = await supabase.from('subscriptions').update({
    status: 'canceled',
    updated_at: new Date().toISOString()
  }).eq('stripe_subscription_id', subscription.id);
  if (subError) {
    console.error('Error updating subscription record:', subError);
    return {
      success: false,
      message: `Error updating subscription record: ${subError.message}`
    };
  }
  // Set profile to draft (offline) and clear subscription data
  const { error: profileError } = await supabase.from('profiles').update({
    subscription_status: 'inactive',
    status: 'draft',
    grace_period_ends_at: null,
    onboarding_completed: true,
    onboarding_step: 8,
    updated_at: new Date().toISOString()
  }).eq('stripe_customer_id', subscription.customer);
  if (profileError) {
    console.error('Error updating profile status:', profileError);
    return {
      success: false,
      message: `Error updating profile status: ${profileError.message}`
    };
  } else {
    console.log(`✅ Profile for customer ${subscription.customer} set to draft and subscription data cleared`);
    return {
      success: true,
      message: 'Subscription deleted'
    };
  }
}
/* async function handleInvoicePaymentSucceeded(invoice, supabase) {
  const subscriptionId = invoice.subscription;
  if (!subscriptionId) return {
    success: false,
    message: 'No subscription ID in invoice'
  };
} */