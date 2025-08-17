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
    })

  if (subError) {
    console.error('Error creating subscription record:', subError)
    return
  }

  // Update profile status to published and active
  const { error: profileError } = await supabase
    .from('profiles')
    .update({
      subscription_status: 'active',
      subscription_id: subscription.id,
      stripe_customer_id: subscription.customer, // Add stripe_customer_id
      // Store subscription dates for better frontend display
      trial_start_date: new Date(subscription.current_period_start * 1000).toISOString(),
      trial_end_date: new Date(subscription.current_period_end * 1000).toISOString(),
      status: 'published', // Set profile to published
      onboarding_completed: true,
      onboarding_step: 8,
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
      stripe_customer_id: subscription.customer, // Keep stripe_customer_id updated
      subscription_id: subscription.id,
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

  // Update subscription record
  await supabase
    .from('subscriptions')
    .update({
      status: 'canceled',
    })
    .eq('stripe_subscription_id', subscription.id)

  // Set profile to draft (offline)
  await supabase
    .from('profiles')
    .update({
      subscription_status: 'canceled',
      status: 'draft',
    })
    .eq('id', profileId)

  console.log(`Subscription canceled for profile ${profileId}`)
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function handleInvoicePaymentSucceeded(invoice: StripeInvoicePayload, supabase: any) {
  const subscriptionId = invoice.subscription
  
  if (!subscriptionId) return

  // Get subscription to find profile_id
  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('profile_id')
    .eq('stripe_subscription_id', subscriptionId)
    .single()

  if (!subscription) return

  // Create invoice record
  await supabase
    .from('invoices')
    .insert({
      profile_id: subscription.profile_id,
      stripe_invoice_id: invoice.id,
      amount: invoice.amount_paid,
      currency: invoice.currency,
      status: 'paid',
      paid_at: new Date().toISOString(),
    })

  console.log(`Invoice payment succeeded for profile ${subscription.profile_id}`)
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function handleInvoicePaymentFailed(invoice: StripeInvoicePayload, supabase: any) {
  const subscriptionId = invoice.subscription
  
  if (!subscriptionId) return

  // Get subscription to find profile_id
  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('profile_id')
    .eq('stripe_subscription_id', subscriptionId)
    .single()

  if (!subscription) return

  // Create invoice record
  await supabase
    .from('invoices')
    .insert({
      profile_id: subscription.profile_id,
      stripe_invoice_id: invoice.id,
      amount: invoice.amount_due,
      currency: invoice.currency,
      status: 'open',
      due_date: invoice.due_date ? new Date(invoice.due_date * 1000).toISOString() : undefined,
    })

  // Schedule profile to go offline after 3 days grace period
  const gracePeriodEnd = new Date()
  gracePeriodEnd.setDate(gracePeriodEnd.getDate() + 3)
  
  await supabase
    .from('profiles')
    .update({
      subscription_status: 'past_due',
      grace_period_ends_at: gracePeriodEnd.toISOString(),
    })
    .eq('id', subscription.profile_id)

  console.log(`Invoice payment failed for profile ${subscription.profile_id}, grace period until ${gracePeriodEnd.toISOString()}`)
}


