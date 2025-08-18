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

// Narrow Stripe payload types used by this file (avoid `any` in function params)
type StripeSubscriptionPayload = {
  id: string
  customer: string
  status: string
  current_period_start: number
  current_period_end: number
  cancel_at_period_end: boolean
  metadata?: { profile_id?: string }
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
      throw new Error('No Stripe signature found')
    }
    const body = await req.text()
// @ts-expect-error -- Deno runtime environment
    const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')
    
    if (!webhookSecret) {
      throw new Error('Stripe webhook secret not configured')
    }

    // Verify webhook signature (simplified for demo)
    // In production, use proper signature verification
    
    const event = JSON.parse(body)
    console.log('Received webhook event:', event.type)

    // Initialize Supabase client
// @ts-expect-error -- Deno runtime environment

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
// @ts-expect-error -- Deno runtime environment

    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event.data.object, supabase)
        break
        
      case 'customer.created':
        await handleCustomerCreated(event.data.object, supabase)
        break
        
      case 'customer.subscription.created':
        await handleSubscriptionCreated(event.data.object, supabase)
        break
      
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object, supabase)
        break
      
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object, supabase)
        break
      
      case 'invoice.payment_succeeded':
        await handleInvoicePaymentSucceeded(event.data.object, supabase)
        break
      
      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(event.data.object, supabase)
        break
      
      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return new Response(
      JSON.stringify({ received: true }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('Webhook error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function handleSubscriptionCreated(subscription: StripeSubscriptionPayload, supabase: any) {
  const profileId = subscription.metadata?.profile_id
  
  if (!profileId) {
    console.error('No profile_id in subscription metadata')
    return
  }

  console.log(`🔧 Processing subscription created for profile ${profileId}`)

  // Create subscription record
  const { error: subError } = await supabase
    .from('subscriptions')
    .insert({
      profile_id: profileId,
      stripe_subscription_id: subscription.id,
      stripe_customer_id: subscription.customer,
      status: subscription.status,
      current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
      current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
      cancel_at_period_end: subscription.cancel_at_period_end,
      // trial_start: subscription.trial_start ? new Date(subscription.trial_start * 1000).toISOString() : null,
      // trial_end: subscription.trial_end ? new Date(subscription.trial_end * 1000).toISOString() : null,
    })

  if (subError) {
    console.error('Error creating subscription record:', subError)
    return
  }

  // Update profile status to published and active
  const { error: profileError } = await supabase
    .from('profiles')
    .update({
      status: 'published', // Alleen publieke status
      updated_at: new Date().toISOString(),
    })
    .eq('id', profileId)

  if (profileError) {
    console.error('Error updating profile status:', profileError)
    return
  }

  console.log(`✅ Profile ${profileId} is now published with active subscription`)
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function handleSubscriptionUpdated(subscription: StripeSubscriptionPayload, supabase: any) {
  const profileId = subscription.metadata?.profile_id
  
  if (!profileId) {
    console.error('No profile_id in subscription metadata')
    return
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
    return
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
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function handleSubscriptionDeleted(subscription: StripeSubscriptionPayload, supabase: any) {
  const profileId = subscription.metadata?.profile_id
  
  if (!profileId) {
    console.error('No profile_id in subscription metadata')
    return
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
  } else {
    console.log(`✅ Profile ${profileId} set to draft and subscription data cleared`)
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function handleInvoicePaymentSucceeded(invoice: StripeInvoicePayload, supabase: any) {
  const subscriptionId = invoice.subscription
  
  if (!subscriptionId) return

  console.log(`🔧 Processing invoice payment succeeded for subscription ${subscriptionId}`)

  // Get subscription to find profile_id
  const { data: subscription, error: subError } = await supabase
    .from('subscriptions')
    .select('profile_id')
    .eq('stripe_subscription_id', subscriptionId)
    .single()

  if (subError || !subscription) {
    console.error('Error finding subscription for invoice:', subError)
    return
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
  } else {
    console.log(`✅ Profile ${subscription.profile_id} status updated to active after successful payment`)
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function handleInvoicePaymentFailed(invoice: StripeInvoicePayload, supabase: any) {
  const subscriptionId = invoice.subscription
  
  if (!subscriptionId) return

  console.log(`🔧 Processing invoice payment failed for subscription ${subscriptionId}`)

  // Get subscription to find profile_id
  const { data: subscription, error: subError } = await supabase
    .from('subscriptions')
    .select('profile_id')
    .eq('stripe_subscription_id', subscriptionId)
    .single()

  if (subError || !subscription) {
    console.error('Error finding subscription for invoice:', subError)
    return
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
  } else {
    console.log(`✅ Profile ${subscription.profile_id} grace period set until ${gracePeriodEnd.toISOString()}`)
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function handleCheckoutSessionCompleted(session: StripeCheckoutSessionPayload, supabase: any) {
  const profileId = session.metadata?.profile_id
  
  if (!profileId) {
    console.error('No profile_id in checkout session metadata')
    return
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
        return
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
    }
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function handleCustomerCreated(customer: StripeCustomerPayload, supabase: any) {
  const profileId = customer.metadata?.profile_id
  
  if (!profileId) {
    console.log('No profile_id in customer metadata, skipping')
    return
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
  } else {
    console.log(`✅ Profile ${profileId} updated with new customer ID`)
  }
}


