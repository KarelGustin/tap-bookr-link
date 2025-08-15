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

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Get the request body and signature
    const body = await req.text()
    const signature = req.headers.get('stripe-signature')

    if (!signature) {
      return new Response(
        JSON.stringify({ error: 'Missing stripe signature' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Initialize Stripe
    // @ts-expect-error -- Deno runtime environment
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
      apiVersion: '2024-12-18.acacia',
    })

    // Verify webhook signature
    let event: Stripe.Event
    try {
      // @ts-expect-error -- Deno runtime environment
      const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret!)
    } catch (err) {
      console.error('Webhook signature verification failed:', err)
      return new Response(
        JSON.stringify({ error: 'Invalid signature' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Initialize Supabase client
    // @ts-expect-error -- Deno runtime environment
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    // @ts-expect-error -- Deno runtime environment
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Handle different event types
    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        await handleSubscriptionUpdate(event.data.object as Stripe.Subscription, supabase)
        break

      case 'customer.subscription.deleted':
        await handleSubscriptionDelete(event.data.object as Stripe.Subscription, supabase)
        break

      case 'invoice.payment_succeeded':
        await handlePaymentSuccess(event.data.object as Stripe.Invoice, supabase)
        break

      case 'invoice.payment_failed':
        await handlePaymentFailure(event.data.object as Stripe.Invoice, supabase)
        break



      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return new Response(
      JSON.stringify({ received: true }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Error processing webhook:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})

async function handleSubscriptionUpdate(subscription: Stripe.Subscription, supabase: ReturnType<typeof createClient>) {
  const profileId = subscription.metadata.profile_id
  
  if (!profileId) {
    console.error('No profile_id in subscription metadata')
    return
  }

  // Update or create subscription record
  const subscriptionData = {
    stripe_subscription_id: subscription.id,
    stripe_customer_id: subscription.customer as string,
    status: subscription.status,
    current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
    current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
    cancel_at_period_end: subscription.cancel_at_period_end,
    updated_at: new Date().toISOString()
  }

  // Check if subscription exists
  const { data: existingSubscription } = await supabase
    .from('subscriptions')
    .select('id')
    .eq('profile_id', profileId)
    .single()

  if (existingSubscription) {
    // Update existing subscription
    await supabase
      .from('subscriptions')
      .update(subscriptionData)
      .eq('id', existingSubscription.id)
  } else {
    // Create new subscription
    const { data: newSubscription, error } = await supabase
      .from('subscriptions')
      .insert({
        profile_id: profileId,
        ...subscriptionData
      })
      .select()
      .single()

    if (!error && newSubscription) {
      // Update profile with subscription_id
      await supabase
        .from('profiles')
        .update({ subscription_id: newSubscription.id })
        .eq('id', profileId)
    }
  }

  // Update profile status based on subscription status
  let profileStatus = 'draft'
  if (subscription.status === 'active') {
    profileStatus = 'published'
  }

  await supabase
    .from('profiles')
    .update({ status: profileStatus })
    .eq('id', profileId)
}

async function handleSubscriptionDelete(subscription: Stripe.Subscription, supabase: ReturnType<typeof createClient>) {
  const profileId = subscription.metadata.profile_id
  
  if (!profileId) return

  // Update subscription status
  await supabase
    .from('subscriptions')
    .update({ 
      status: 'canceled',
      updated_at: new Date().toISOString()
    })
    .eq('stripe_subscription_id', subscription.id)

  // Set profile to draft
  await supabase
    .from('profiles')
    .update({ status: 'draft' })
    .eq('id', profileId)
}

async function handlePaymentSuccess(invoice: Stripe.Invoice, supabase: ReturnType<typeof createClient>) {
  if (!invoice.subscription) return

  // Get subscription details
  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('id, profile_id')
    .eq('stripe_subscription_id', invoice.subscription as string)
    .single()

  if (!subscription) return

  // Create or update invoice record
  const invoiceData = {
    subscription_id: subscription.id,
    stripe_invoice_id: invoice.id,
    amount: invoice.amount_paid,
    currency: invoice.currency,
    status: invoice.status,
    invoice_pdf_url: invoice.invoice_pdf,
    hosted_invoice_url: invoice.hosted_invoice_url,
    due_date: invoice.due_date ? new Date(invoice.due_date * 1000).toISOString() : null
  }

  await supabase
    .from('invoices')
    .upsert(invoiceData, { onConflict: 'stripe_invoice_id' })

  // Ensure profile is published
  await supabase
    .from('profiles')
    .update({ status: 'published' })
    .eq('id', subscription.profile_id)
}

async function handlePaymentFailure(invoice: Stripe.Invoice, supabase: ReturnType<typeof createClient>) {
  if (!invoice.subscription) return

  // Get subscription details
  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('id, profile_id')
    .eq('stripe_subscription_id', invoice.subscription as string)
    .single()

  if (!subscription) return

  // Update invoice status
  await supabase
    .from('invoices')
    .update({ 
      status: invoice.status,
      updated_at: new Date().toISOString()
    })
    .eq('stripe_invoice_id', invoice.id)

  // Set profile to draft if payment failed
  if (['uncollectible', 'void'].includes(invoice.status)) {
    await supabase
      .from('profiles')
    .update({ status: 'draft' })
      .eq('id', subscription.profile_id)
  }
}


