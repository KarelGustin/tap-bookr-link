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
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false }
    });
    console.log('🔗 Supabase client initialized with service role');
    // Process the event
    let processingResult = {
      success: false,
      message: ''
    };
    switch(event.type){
      case 'customer.subscription.created':
        processingResult = await handleSubscriptionCreated(event.data.object, supabase);
        break;
      case 'customer.subscription.updated':
        processingResult = await handleSubscriptionUpdated(event.data.object, supabase);
        break;
      case 'customer.subscription.deleted':
        processingResult = await handleSubscriptionDeleted(event.data.object, supabase);
        break;
      case 'invoice.payment_succeeded':
        processingResult = await handleInvoicePaymentSucceeded(event.data.object, supabase);
        break;
      case 'invoice.payment_failed':
        processingResult = await handleInvoicePaymentFailed(event.data.object, supabase);
        break;
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

    // Insert/update subscription record in subscriptions table
    const { error: subscriptionError } = await supabase
      .from('subscriptions')
      .upsert({
        stripe_subscription_id: subscription.id,
        profile_id: profile.id,
        stripe_customer_id: subscription.customer,
        status: normalizedSubscriptionStatus,
        current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
        current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
        cancel_at_period_end: subscription.cancel_at_period_end,
        trial_start: subscription.trial_start ? new Date(subscription.trial_start * 1000).toISOString() : null,
        trial_end: subscription.trial_end ? new Date(subscription.trial_end * 1000).toISOString() : null,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'stripe_subscription_id' });

    if (subscriptionError) {
      console.error('[WEBHOOK] Error upserting subscription:', subscriptionError);
      return {
        success: false,
        message: `Error upserting subscription: ${subscriptionError.message}`
      };
    }

    // Update profile flags and clear preview fields when subscription becomes active
    const isActive = ['active', 'trialing'].includes(subscription.status);
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        subscription_status: isActive ? 'active' : 'inactive',
        status: isActive ? 'published' : 'draft',
        onboarding_completed: true,
        subscription_id: subscription.id,
        onboarding_step: 8,
        preview_expires_at: null, // Clear preview fields when subscription is active
        preview_started_at: null, // Clear preview fields when subscription is active
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

async function handleSubscriptionUpdated(subscription, supabase) {
  console.log(`🔧 Processing subscription updated for subscription ${subscription.id}, status: ${subscription.status}`);
  
  try {
    // Update subscription record
    const { error: subError } = await supabase
      .from('subscriptions')
      .update({
        status: subscription.status,
        current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
        current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
        cancel_at_period_end: subscription.cancel_at_period_end,
        updated_at: new Date().toISOString()
      })
      .eq('stripe_subscription_id', subscription.id);

    if (subError) {
      console.error('Error updating subscription:', subError);
      return {
        success: false,
        message: `Error updating subscription: ${subError.message}`
      };
    }

    // Update profile based on subscription status
    const isActive = ['active', 'trialing'].includes(subscription.status);
    const profileStatus = isActive ? 'published' : 'draft';
    const subscriptionStatus = isActive ? 'active' : 'inactive';

    const { error: profileError } = await supabase
      .from('profiles')
      .update({
        subscription_status: subscriptionStatus,
        status: profileStatus,
        updated_at: new Date().toISOString()
      })
      .eq('stripe_customer_id', subscription.customer);

    if (profileError) {
      console.error('Error updating profile:', profileError);
      return {
        success: false,
        message: `Error updating profile: ${profileError.message}`
      };
    }

    console.log(`✅ Subscription ${subscription.id} updated, profile set to ${profileStatus}`);
    return {
      success: true,
      message: 'Subscription updated successfully'
    };
  } catch (error) {
    console.error('[WEBHOOK] Error in handleSubscriptionUpdated:', error);
    return {
      success: false,
      message: `Error processing subscription update: ${error}`
    };
  }
}

async function handleInvoicePaymentSucceeded(invoice, supabase) {
  console.log(`🔧 Processing payment succeeded for customer ${invoice.customer}`);
  
  try {
    // Only process subscription invoices
    if (!invoice.subscription) {
      return {
        success: true,
        message: 'Skipping non-subscription invoice'
      };
    }

    // Update profile to published status and clear preview fields when payment succeeds
    const { error: profileError } = await supabase
      .from('profiles')
      .update({
        subscription_status: 'active',
        status: 'published',
        preview_expires_at: null, // Clear preview fields when subscription payment succeeds
        preview_started_at: null, // Clear preview fields when subscription payment succeeds
        updated_at: new Date().toISOString()
      })
      .eq('stripe_customer_id', invoice.customer);

    if (profileError) {
      console.error('Error updating profile after payment succeeded:', profileError);
      return {
        success: false,
        message: `Error updating profile: ${profileError.message}`
      };
    }

    console.log(`✅ Profile for customer ${invoice.customer} set to published after successful payment`);
    return {
      success: true,
      message: 'Payment success processed'
    };
  } catch (error) {
    console.error('[WEBHOOK] Error in handleInvoicePaymentSucceeded:', error);
    return {
      success: false,
      message: `Error processing payment success: ${error}`
    };
  }
}

async function handleInvoicePaymentFailed(invoice, supabase) {
  console.log(`🔧 Processing payment failed for customer ${invoice.customer}`);
  
  try {
    // Update profile to draft status when payment fails
    const { error: profileError } = await supabase
      .from('profiles')
      .update({
        subscription_status: 'inactive',
        status: 'draft',
        updated_at: new Date().toISOString()
      })
      .eq('stripe_customer_id', invoice.customer);

    if (profileError) {
      console.error('Error updating profile after payment failed:', profileError);
      return {
        success: false,
        message: `Error updating profile: ${profileError.message}`
      };
    }

    console.log(`✅ Profile for customer ${invoice.customer} set to draft after failed payment`);
    return {
      success: true,
      message: 'Payment failure processed'
    };
  } catch (error) {
    console.error('[WEBHOOK] Error in handleInvoicePaymentFailed:', error);
    return {
      success: false,
      message: `Error processing payment failure: ${error}`
    };
  }
}