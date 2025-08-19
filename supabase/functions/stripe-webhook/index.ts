// @ts-expect-error -- Deno runtime environment
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
// @ts-expect-error -- Deno runtime environment
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
// @ts-expect-error -- Deno runtime environment
import Stripe from 'https://esm.sh/stripe@14.21.0?target=deno'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Update the type definition to include trial fields
type StripeSubscriptionPayload = {
  id: string
  customer: string
  status: string
  current_period_start: number
  current_period_end: number
  cancel_at_period_end: boolean
  metadata?: { profile_id?: string }
  trial_start?: number
  trial_end?: number
}

type StripeInvoicePayload = {
  id: string
  subscription: string
  amount_paid?: number
  amount_due?: number
  currency: string
  due_date?: number
}

type StripeCustomerPayload = {
  id: string
  email?: string
  metadata?: { profile_id?: string }
}

type StripeCheckoutSessionPayload = {
  id: string
  customer?: string
  subscription?: string
  metadata?: { profile_id?: string }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const signature = req.headers.get('stripe-signature')
    if (!signature) {
      console.error('❌ No Stripe signature found in headers')
      throw new Error('No Stripe signature found')
    }
    
    const body = await req.text()
    console.log('📨 Received webhook body length:', body.length)
    
    // @ts-expect-error -- Deno runtime environment
    const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')
    
    if (!webhookSecret) {
      console.error('❌ STRIPE_WEBHOOK_SECRET not configured')
      throw new Error('Stripe webhook secret not configured')
    }

    // Verify webhook signature (IMPORTANT for production)
    let event
    try {
      // @ts-expect-error -- Deno runtime environment
      const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY')
      if (!stripeSecretKey) {
        console.error('❌ STRIPE_SECRET_KEY not configured')
        throw new Error('Stripe secret key not configured')
      }
      
      const stripe = new Stripe(stripeSecretKey)
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
      console.log('✅ Webhook signature verified successfully')
    } catch (err) {
      console.error('❌ Webhook signature verification failed:', err.message)
      throw new Error('Invalid webhook signature')
    }

    console.log(' Processing webhook event:', {
      type: event.type,
      id: event.id,
      created: event.created
    })

    // Initialize Supabase client
    // @ts-expect-error -- Deno runtime environment
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    // @ts-expect-error -- Deno runtime environment
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('❌ Supabase environment variables not configured')
      throw new Error('Supabase configuration missing')
    }
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    console.log('🔗 Supabase client initialized')

    // Process the event
    let processingResult = { success: false, message: '' }
    
    switch (event.type) {
      case 'checkout.session.completed':
        processingResult = await handleCheckoutSessionCompleted(event.data.object, supabase)
        break
        
      case 'customer.created':
        processingResult = await handleCustomerCreated(event.data.object, supabase)
        break
        
      case 'customer.subscription.created':
        processingResult = await handleSubscriptionCreated(event.data.object, supabase)
        break
      
      case 'customer.subscription.updated':
        processingResult = await handleSubscriptionUpdated(event.data.object, supabase)
        break
      
      case 'customer.subscription.deleted':
        processingResult = await handleSubscriptionDeleted(event.data.object, supabase)
        break
      
      case 'invoice.payment_succeeded':
        processingResult = await handleInvoicePaymentSucceeded(event.data.object, supabase)
        break
      
      case 'invoice.payment_failed':
        processingResult = await handleInvoicePaymentFailed(event.data.object, supabase)
        break
      
      default:
        console.log(`⚠️ Unhandled event type: ${event.type}`)
        processingResult = { success: true, message: `Unhandled event type: ${event.type}` }
    }

    console.log('✅ Webhook processing completed:', processingResult)

    return new Response(
      JSON.stringify({ 
        received: true, 
        processed: true,
        result: processingResult 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('❌ Webhook error:', {
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    })
    
    return new Response(
      JSON.stringify({ 
        error: error.message,
        timestamp: new Date().toISOString()
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})

// Enhanced handler functions with better error handling and logging
async function handleSubscriptionCreated(
  subscription: StripeSubscriptionPayload, 
  supabase: ReturnType<typeof createClient>
): Promise<{ success: boolean; message: string }> {
  try {
    const profileId = subscription.metadata?.profile_id
    
    if (!profileId) {
      const errorMsg = 'No profile_id in subscription metadata'
      console.error('❌', errorMsg, {
        subscriptionId: subscription.id,
        metadata: subscription.metadata
      })
      return { success: false, message: errorMsg }
    }

    console.log(`🔧 Processing subscription created for profile ${profileId}`)

    // Create subscription record
    const { data: subData, error: subError } = await supabase
      .from('subscriptions')
      .insert({
        profile_id: profileId,
        stripe_subscription_id: subscription.id,
        stripe_customer_id: subscription.customer,
        status: subscription.status,
        current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
        current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
        cancel_at_period_end: subscription.cancel_at_period_end,
        trial_start: subscription.trial_start ? new Date(subscription.trial_start * 1000).toISOString() : null,
        trial_end: subscription.trial_end ? new Date(subscription.trial_end * 1000).toISOString() : null,
      })
      .select()
      .single()

    if (subError) {
      console.error('❌ Error creating subscription record:', {
        error: subError,
        profileId,
        subscriptionId: subscription.id
      })
      return { success: false, message: `Subscription creation failed: ${subError.message}` }
    }

    console.log('✅ Subscription record created:', subData.id)

    // Update profile status to published and active
    const { error: profileError } = await supabase
      .from('profiles')
      .update({
        status: 'published',
        subscription_id: subData.id,
        subscription_status: subscription.status,
        stripe_customer_id: subscription.customer,
        trial_start_date: subscription.trial_start ? new Date(subscription.trial_start * 1000).toISOString() : null,
        trial_end_date: subscription.trial_end ? new Date(subscription.trial_end * 1000).toISOString() : null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', profileId)

    if (profileError) {
      console.error('❌ Error updating profile status:', {
        error: profileError,
        profileId,
        subscriptionId: subscription.id
      })
      return { success: false, message: `Profile update failed: ${profileError.message}` }
    }

    console.log(`✅ Profile ${profileId} is now published with active subscription`)
    return { success: true, message: `Profile ${profileId} published successfully` }

  } catch (error) {
    console.error('❌ Unexpected error in handleSubscriptionCreated:', error)
    return { success: false, message: `Unexpected error: ${error.message}` }
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function handleSubscriptionUpdated(subscription: StripeSubscriptionPayload, supabase: ReturnType<typeof createClient>): Promise<{ success: boolean; message: string }> {
  const profileId = subscription.metadata?.profile_id
  
  if (!profileId) {
    console.error('No profile_id in subscription metadata')
    return { success: false, message: 'No profile_id in subscription metadata' }
  }

  // Update subscription record
  const { error } = await supabase
    .from('subscriptions')
    .update({
      status: subscription.status,
      current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
      current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
      cancel_at_period_end: subscription.cancel_at_period_end,
    })
    .eq('stripe_subscription_id', subscription.id)

  if (error) {
    console.error('Error updating subscription record:', error)
    return { success: false, message: `Error updating subscription record: ${error.message}` }
  }

  // Update profile status based on subscription status
  let profileStatus = 'draft'
  if (subscription.status === 'active') {
    profileStatus = 'published'
  } else if (['past_due', 'unpaid'].includes(subscription.status)) {
    // Profile will go offline after 3 days grace period
    profileStatus = 'published'
  }

  await supabase
    .from('profiles')
    .update({
      subscription_status: subscription.status,
      stripe_customer_id: subscription.customer,
      onboarding_completed: subscription.status === 'active' ? true : undefined,
      onboarding_step: subscription.status === 'active' ? 8 : undefined,
      status: profileStatus,
    })
    .eq('id', profileId)

  console.log(`Subscription updated for profile ${profileId}, status: ${subscription.status}`)
  return { success: true, message: 'Subscription updated' }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function handleSubscriptionDeleted(subscription: StripeSubscriptionPayload, supabase: ReturnType<typeof createClient>): Promise<{ success: boolean; message: string }> {
  const profileId = subscription.metadata?.profile_id
  
  if (!profileId) {
    console.error('No profile_id in subscription metadata')
    return { success: false, message: 'No profile_id in subscription metadata' }
  }

  console.log(`🔧 Processing subscription deleted for profile ${profileId}`)

  // Update subscription record
  const { error: subError } = await supabase
    .from('subscriptions')
    .update({
      status: 'canceled',
      updated_at: new Date().toISOString(),
    })
    .eq('stripe_subscription_id', subscription.id)

  if (subError) {
    console.error('Error updating subscription record:', subError)
    return { success: false, message: `Error updating subscription record: ${subError.message}` }
  }

  // Set profile to draft (offline) and clear subscription data
  const { error: profileError } = await supabase
    .from('profiles')
    .update({
      subscription_status: 'canceled',
      status: 'draft',
      grace_period_ends_at: null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', profileId)

  if (profileError) {
    console.error('Error updating profile status:', profileError)
    return { success: false, message: `Error updating profile status: ${profileError.message}` }
  } else {
    console.log(`✅ Profile ${profileId} set to draft and subscription data cleared`)
    return { success: true, message: 'Subscription deleted' }
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function handleInvoicePaymentSucceeded(invoice: StripeInvoicePayload, supabase: ReturnType<typeof createClient>): Promise<{ success: boolean; message: string }> {
  const subscriptionId = invoice.subscription
  
  if (!subscriptionId) return { success: false, message: 'No subscription ID in invoice' }

  console.log(`🔧 Processing invoice payment succeeded for subscription ${subscriptionId}`)

  // Get subscription to find profile_id
  const { data: subscription, error: subError } = await supabase
    .from('subscriptions')
    .select('profile_id')
    .eq('stripe_subscription_id', subscriptionId)
    .single()

  if (subError || !subscription) {
    console.error('Error finding subscription for invoice:', subError)
    return { success: false, message: `Error finding subscription for invoice: ${subError?.message || 'Unknown error'}` }
  }

  // Create invoice record
  const { error: invoiceError } = await supabase
    .from('invoices')
    .insert({
      profile_id: subscription.profile_id,
      stripe_invoice_id: invoice.id,
      amount: invoice.amount_paid,
      currency: invoice.currency,
      status: 'paid',
      paid_at: new Date().toISOString(),
    })

  if (invoiceError) {
    console.error('Error creating invoice record:', invoiceError)
    return { success: false, message: `Error creating invoice record: ${invoiceError.message}` }
  }

  // Update profile status to active if payment succeeded
  const { error: profileError } = await supabase
    .from('profiles')
    .update({
      subscription_status: 'active',
      status: 'published',
      updated_at: new Date().toISOString(),
    })
    .eq('id', subscription.profile_id)

  if (profileError) {
    console.error('Error updating profile status:', profileError)
    return { success: false, message: `Error updating profile status: ${profileError.message}` }
  } else {
    console.log(`✅ Profile ${subscription.profile_id} status updated to active after successful payment`)
    return { success: true, message: 'Invoice payment succeeded' }
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function handleInvoicePaymentFailed(invoice: StripeInvoicePayload, supabase: ReturnType<typeof createClient>): Promise<{ success: boolean; message: string }> {
  const subscriptionId = invoice.subscription
  
  if (!subscriptionId) return { success: false, message: 'No subscription ID in invoice' }

  console.log(`🔧 Processing invoice payment failed for subscription ${subscriptionId}`)

  // Get subscription to find profile_id
  const { data: subscription, error: subError } = await supabase
    .from('subscriptions')
    .select('profile_id')
    .eq('stripe_subscription_id', subscriptionId)
    .single()

  if (subError || !subscription) {
    console.error('Error finding subscription for invoice:', subError)
    return { success: false, message: `Error finding subscription for invoice: ${subError?.message || 'Unknown error'}` }
  }

  // Create invoice record
  const { error: invoiceError } = await supabase
    .from('invoices')
    .insert({
      profile_id: subscription.profile_id,
      stripe_invoice_id: invoice.id,
      amount: invoice.amount_due,
      currency: invoice.currency,
      status: 'open',
      due_date: invoice.due_date ? new Date(invoice.due_date * 1000).toISOString() : undefined,
    })

  if (invoiceError) {
    console.error('Error creating invoice record:', invoiceError)
    return { success: false, message: `Error creating invoice record: ${invoiceError.message}` }
  }

  // Schedule profile to go offline after 3 days grace period
  const gracePeriodEnd = new Date()
  gracePeriodEnd.setDate(gracePeriodEnd.getDate() + 3)
  
  const { error: profileError } = await supabase
    .from('profiles')
    .update({
      subscription_status: 'past_due',
      grace_period_ends_at: gracePeriodEnd.toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', subscription.profile_id)

  if (profileError) {
    console.error('Error updating profile grace period:', profileError)
    return { success: false, message: `Error updating profile grace period: ${profileError.message}` }
  } else {
    console.log(`✅ Profile ${subscription.profile_id} grace period set until ${gracePeriodEnd.toISOString()}`)
    return { success: true, message: 'Invoice payment failed' }
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function handleCheckoutSessionCompleted(session: StripeCheckoutSessionPayload, supabase: ReturnType<typeof createClient>): Promise<{ success: boolean; message: string }> {
  const profileId = session.metadata?.profile_id
  
  if (!profileId) {
    console.error('No profile_id in checkout session metadata')
    return { success: false, message: 'No profile_id in checkout session metadata' }
  }

  console.log(`🔧 Processing checkout session completed for profile ${profileId}`)

  // Update profile with customer ID from checkout session
  if (session.customer) {
    const { error: profileError } = await supabase
      .from('profiles')
      .update({
        stripe_customer_id: session.customer,
        updated_at: new Date().toISOString(),
      })
      .eq('id', profileId)

    if (profileError) {
      console.error('Error updating profile with customer ID:', profileError)
      return { success: false, message: `Error updating profile with customer ID: ${profileError.message}` }
    } else {
      console.log(`✅ Profile ${profileId} updated with customer ID from checkout`)
    }
  }

  // If there's a subscription in the checkout session, process it
  if (session.subscription) {
    console.log(`🔧 Checkout session contains subscription ${session.subscription}`)
    
    // Get the full subscription object from Stripe
    try {
      // @ts-expect-error -- Deno runtime environment
      const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY')
      if (!stripeSecretKey) {
        console.error('STRIPE_SECRET_KEY not configured')
        return { success: false, message: 'STRIPE_SECRET_KEY not configured' }
      }
      
      const stripe = new Stripe(stripeSecretKey)
      const subscription = await stripe.subscriptions.retrieve(session.subscription)
      
      // Process the subscription as if it was created
      const subscriptionPayload: StripeSubscriptionPayload = {
        id: subscription.id,
        customer: typeof subscription.customer === 'string' ? subscription.customer : subscription.customer?.id || '',
        status: subscription.status,
        current_period_start: subscription.current_period_start,
        current_period_end: subscription.current_period_end,
        cancel_at_period_end: !!subscription.cancel_at_period_end,
        metadata: { profile_id: profileId },
      }
      
      await handleSubscriptionCreated(subscriptionPayload, supabase)
      
    } catch (error) {
      console.error('Error processing subscription from checkout session:', error)
      return { success: false, message: `Error processing subscription from checkout session: ${error.message}` }
    }
  }
  return { success: true, message: 'Checkout session processed' }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function handleCustomerCreated(customer: StripeCustomerPayload, supabase: ReturnType<typeof createClient>): Promise<{ success: boolean; message: string }> {
  const profileId = customer.metadata?.profile_id
  
  if (!profileId) {
    console.log('No profile_id in customer metadata, skipping')
    return { success: true, message: 'Customer created (skipped due to missing profile_id)' }
  }

  console.log(`🔧 Processing customer created for profile ${profileId}`)

  // Update profile with customer ID
  const { error: profileError } = await supabase
    .from('profiles')
    .update({
      stripe_customer_id: customer.id,
      updated_at: new Date().toISOString(),
    })
    .eq('id', profileId)

  if (profileError) {
    console.error('Error updating profile with customer ID:', profileError)
    return { success: false, message: `Error updating profile with customer ID: ${profileError.message}` }
  } else {
    console.log(`✅ Profile ${profileId} updated with new customer ID`)
    return { success: true, message: 'Customer created' }
  }
}


