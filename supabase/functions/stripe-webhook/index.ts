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
      case 'checkout.session.completed':
        processingResult = await handleCheckoutSessionCompleted(event.data.object, supabase);
        break;
      // case 'customer.created':
      //   processingResult = await handleCustomerCreated(event.data.object, supabase);
      //   break;
      case 'customer.subscription.created':
        processingResult = await handleSubscriptionCreated(event.data.object, supabase);
        break;
      case 'customer.subscription.updated':
        processingResult = await handleSubscriptionUpdated(event.data.object, supabase);
        break;
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
    console.log(`[WEBHOOK] Processing subscription created: ${subscription.id}`);
    // Find the profile by customer ID
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, user_id')
      .eq('stripe_customer_id', subscription.customer)
      .single();
    if (profileError || !profile) {
      console.error('[WEBHOOK] Profile not found for customer:', subscription.customer, profileError);
      return {
        success: false,
        message: `Profile not found for customer ${subscription.customer}`
      };
    }
    console.log(`[WEBHOOK] Found profile: ${profile.id} for user: ${profile.user_id}`);
    // Normalize subscription status for our DB
    const normalizedSubscriptionStatus = ['active', 'trialing', 'past_due', 'canceled', 'unpaid'].includes(subscription.status)
      ? subscription.status
      : 'unpaid';
    // Create subscription record
    const { error: insertError } = await supabase.from('subscriptions').insert({
      stripe_subscription_id: subscription.id,
      profile_id: profile.id,
      stripe_customer_id: subscription.customer,
      status: normalizedSubscriptionStatus,
      current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
      current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
      // trial_start: subscription.trial_start ? new Date(subscription.trial_start * 1000).toISOString() : null,
      // trial_end: subscription.trial_end ? new Date(subscription.trial_end * 1000).toISOString() : null,
      cancel_at_period_end: subscription.cancel_at_period_end,
      onboarding_completed: true,
      updated_at: new Date().toISOString(),
      onboarding_step: 8,
      subscription_id: subscription.id,
      subscription_status: normalizedSubscriptionStatus,
    });
    if (insertError) {
      console.error('[WEBHOOK] Error creating subscription:', insertError);
      return {
        success: false,
        message: `Error creating subscription: ${insertError.message}`
      };
    }
    // Update profile with subscription details
    const isActive = ['active', 'trialing'].includes(subscription.status);
    const profileStatus = isActive ? 'published' : 'draft';
    const profileSubscriptionStatus = isActive ? 'active' : 'inactive';
    const { error: updateError } = await supabase.from('profiles').update({
      subscription_status: profileSubscriptionStatus,
      status: profileStatus,
      onboarding_completed: true,
      subscription_id: subscription.id,
      onboarding_step: 8,
      updated_at: new Date().toISOString()
    }).eq('id', profile.id);
    if (updateError) {
      console.error('[WEBHOOK] Error updating profile:', updateError);
      return {
        success: false,
        message: `Error updating profile: ${updateError.message}`
      };
    }
    console.log(`[WEBHOOK] Successfully created subscription and updated profile`);
    return {
      success: true,
      message: 'Subscription created successfully'
    };
  } catch (error) {
    console.error('[WEBHOOK] Error in handleSubscriptionCreated:', error);
    return {
      success: false,
      message: `Error processing subscription: ${error}`
    };
  }
}
async function handleSubscriptionUpdated(subscription, supabase) {
  console.log(`[WEBHOOK] Processing subscription updated: ${subscription.id}`);
  // Find profile by customer ID first (more reliable than metadata)
  const { data: profile, error: profileError } = await supabase.from('profiles').select('id, user_id').eq('stripe_customer_id', subscription.customer).single();
  if (profileError || !profile) {
    console.error('[WEBHOOK] Profile not found for customer:', subscription.customer, profileError);
    return {
      success: false,
      message: `Profile not found for customer ${subscription.customer}`
    };
  }
  // Map Stripe status to allowed database values
  const allowedStatus = [
    'active',
    'past_due',
    'canceled',
    'unpaid'
  ].includes(subscription.status) ? subscription.status : 'unpaid';
  // Update subscription record
  const { error } = await supabase.from('subscriptions').update({
    status: allowedStatus,
    current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
    current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
    cancel_at_period_end: subscription.cancel_at_period_end
  }).eq('stripe_subscription_id', subscription.id);
  if (error) {
    console.error('[WEBHOOK] Error updating subscription record:', error);
    return {
      success: false,
      message: `Error updating subscription record: ${error.message}`
    };
  }
  // Update profile status based on subscription status
  let profileStatus = 'draft';
  let profileSubscriptionStatus = 'inactive';
  if ([
    'active',
    'trialing'
  ].includes(subscription.status)) {
    profileStatus = 'published';
    profileSubscriptionStatus = 'active';
  } else if ([
    'past_due',
    'unpaid'
  ].includes(subscription.status)) {
    // Keep published during grace period
    profileStatus = 'published';
    profileSubscriptionStatus = 'past_due';
  } else {
    // For canceled, incomplete, etc. - go to draft
    profileStatus = 'draft';
    profileSubscriptionStatus = 'inactive';
  }
  const { error: profileUpdateError } = await supabase.from('profiles').update({
    subscription_status: profileSubscriptionStatus,
    status: profileStatus,
    updated_at: new Date().toISOString()
  }).eq('id', profile.id);
  if (profileUpdateError) {
    console.error('[WEBHOOK] Error updating profile:', profileUpdateError);
    return {
      success: false,
      message: `Error updating profile: ${profileUpdateError.message}`
    };
  }
  console.log(`[WEBHOOK] Subscription updated for profile ${profile.id}, status: ${subscription.status} -> profile status: ${profileStatus}`);
  return {
    success: true,
    message: 'Subscription updated successfully'
  };
}
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
async function handleInvoicePaymentSucceeded(invoice, supabase) {
  const subscriptionId = invoice.subscription;
  if (!subscriptionId) return {
    success: false,
    message: 'No subscription ID in invoice'
  };
  console.log(`🔧 Processing invoice payment succeeded for subscription ${subscriptionId}`);
  // Get subscription to find profile_id
  const { data: subscription, error: subError } = await supabase.from('subscriptions').select('profile_id').eq('stripe_subscription_id', subscriptionId).single();
  if (subError || !subscription) {
    console.error('Error finding subscription for invoice:', subError);
    return {
      success: false,
      message: `Error finding subscription for invoice: ${subError?.message || 'Unknown error'}`
    };
  }
  // Create invoice record
  const { error: invoiceError } = await supabase.from('invoices').insert({
    profile_id: subscription.profile_id,
    stripe_invoice_id: invoice.id,
    amount: invoice.amount_paid,
    currency: invoice.currency,
    status: 'paid',
    paid_at: new Date().toISOString()
  });
  if (invoiceError) {
    console.error('Error creating invoice record:', invoiceError);
    return {
      success: false,
      message: `Error creating invoice record: ${invoiceError.message}`
    };
  }
  // Update profile status to active if payment succeeded
  const { error: profileError } = await supabase.from('profiles').update({
    subscription_status: 'active',
    status: 'published',
    updated_at: new Date().toISOString()
  }).eq('id', subscription.profile_id);
  if (profileError) {
    console.error('Error updating profile status:', profileError);
    return {
      success: false,
      message: `Error updating profile status: ${profileError.message}`
    };
  } else {
    console.log(`✅ Profile ${subscription.profile_id} status updated to active after successful payment`);
    return {
      success: true,
      message: 'Invoice payment succeeded'
    };
  }
}
async function handleInvoicePaymentFailed(invoice, supabase) {
  const subscriptionId = invoice.subscription;
  if (!subscriptionId) return {
    success: false,
    message: 'No subscription ID in invoice'
  };
  console.log(`🔧 Processing invoice payment failed for subscription ${subscriptionId}`);
  // Get subscription to find profile_id
  const { data: subscription, error: subError } = await supabase.from('subscriptions').select('profile_id').eq('stripe_subscription_id', subscriptionId).single();
  if (subError || !subscription) {
    console.error('Error finding subscription for invoice:', subError);
    return {
      success: false,
      message: `Error finding subscription for invoice: ${subError?.message || 'Unknown error'}`
    };
  }
  // Create invoice record
  const { error: invoiceError } = await supabase.from('invoices').insert({
    profile_id: subscription.profile_id,
    stripe_invoice_id: invoice.id,
    amount: invoice.amount_due,
    currency: invoice.currency,
    status: 'open',
    due_date: invoice.due_date ? new Date(invoice.due_date * 1000).toISOString() : undefined
  });
  if (invoiceError) {
    console.error('Error creating invoice record:', invoiceError);
    return {
      success: false,
      message: `Error creating invoice record: ${invoiceError.message}`
    };
  }
  // Schedule profile to go offline after 3 days grace period
  const gracePeriodEnd = new Date();
  gracePeriodEnd.setDate(gracePeriodEnd.getDate() + 3);
  const { error: profileError } = await supabase.from('profiles').update({
    subscription_status: 'past_due',
    grace_period_ends_at: gracePeriodEnd.toISOString(),
    updated_at: new Date().toISOString()
  }).eq('id', subscription.profile_id);
  if (profileError) {
    console.error('Error updating profile grace period:', profileError);
    return {
      success: false,
      message: `Error updating profile grace period: ${profileError.message}`
    };
  } else {
    console.log(`✅ Profile ${subscription.profile_id} grace period set until ${gracePeriodEnd.toISOString()}`);
    return {
      success: true,
      message: 'Invoice payment failed'
    };
  }
}
async function handleCheckoutSessionCompleted(session, supabase) {
  const profileIdFromMetadata = session.metadata?.profile_id || null;
  const profileIdFromClientRef = session.client_reference_id || null;
  const profileId = profileIdFromMetadata || profileIdFromClientRef;
  if (!profileId && !session.customer) {
    console.error('No profile_id or customer available to link checkout session');
    return {
      success: false,
      message: 'No profile_id or customer available in checkout session'
    };
  }
  console.log(`🔧 Processing checkout session completed. profileId=${profileId || 'unknown'} customer=${session.customer || 'unknown'}`);
  // Update profile with customer ID and set to published after payment
  if (session.customer) {
    // Try to update by explicit profile id if present, otherwise by customer id
    let profileError = null;
    if (profileId) {
      const result = await supabase.from('profiles').update({
        stripe_customer_id: session.customer,
        subscription_status: 'active',
        status: 'published',
        onboarding_completed: true,
        onboarding_step: 8,
        updated_at: new Date().toISOString()
      }).eq('id', profileId);
      profileError = result.error;
    } else {
      const result = await supabase.from('profiles').update({
        subscription_status: 'active',
        status: 'published',
        onboarding_completed: true,
        onboarding_step: 8,
        updated_at: new Date().toISOString()
      }).eq('stripe_customer_id', session.customer);
      profileError = result.error;
    }
    if (profileError) {
      console.error('Error updating profile with customer ID:', profileError);
      return {
        success: false,
        message: `Error updating profile with customer ID: ${typeof profileError === 'object' && profileError && 'message' in profileError ? (profileError as { message?: string }).message : String(profileError)}`
      };
    } else {
      console.log(`✅ Profile updated with checkout completion`);
    }
  }
  // If there's a subscription in the checkout session, process it
  if (session.subscription) {
    console.log(`🔧 Checkout session contains subscription ${session.subscription}`);
    // Get the full subscription object from Stripe
    try {
      // @ts-expect-error -- Deno runtime environment
      const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY');
      if (!stripeSecretKey) {
        console.error('STRIPE_SECRET_KEY not configured');
        return {
          success: false,
          message: 'STRIPE_SECRET_KEY not configured'
        };
      }
      const stripe = new Stripe(stripeSecretKey);
      const subscription = await stripe.subscriptions.retrieve(session.subscription);
      // Process the subscription as if it was created
      const subscriptionPayload = {
        id: subscription.id,
        customer: typeof subscription.customer === 'string' ? subscription.customer : subscription.customer?.id || '',
        status: subscription.status,
        current_period_start: subscription.current_period_start,
        current_period_end: subscription.current_period_end,
        cancel_at_period_end: !!subscription.cancel_at_period_end,
        metadata: {
          profile_id: profileId
        }
      };
      await handleSubscriptionCreated(subscriptionPayload, supabase);
    } catch (error) {
      const message = (error && typeof error === 'object' && 'message' in error) ? (error as { message?: string }).message : String(error);
      console.error('Error processing subscription from checkout session:', error);
      return {
        success: false,
        message: `Error processing subscription from checkout session: ${message}`
      };
    }
  }
  return {
    success: true,
    message: 'Checkout session processed'
  };
}
async function handleCustomerCreated(customer, supabase) {
  const profileId = customer.metadata?.profile_id;
  if (!profileId) {
    console.log('No profile_id in customer metadata, skipping');
    return {
      success: true,
      message: 'Customer created (skipped due to missing profile_id)'
    };
  }
  console.log(`🔧 Processing customer created for profile ${profileId}`);
  // Update profile with customer ID
  const { error: profileError } = await supabase.from('profiles').update({
    stripe_customer_id: customer.id,
    updated_at: new Date().toISOString()
  }).eq('id', profileId);
  if (profileError) {
    console.error('Error updating profile with customer ID:', profileError);
    return {
      success: false,
      message: `Error updating profile with customer ID: ${profileError.message}`
    };
  } else {
    console.log(`✅ Profile ${profileId} updated with new customer ID`);
    return {
      success: true,
      message: 'Customer created'
    };
  }
}
