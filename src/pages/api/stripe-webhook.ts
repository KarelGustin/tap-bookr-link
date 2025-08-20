import { NextApiRequest, NextApiResponse } from 'next'
import { createClient } from '@supabase/supabase-js'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-07-30.basil'
})

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY!
)

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  const signature = req.headers['stripe-signature']
  const body = req.body

  try {
    // Verificeer webhook signature
    const event = stripe.webhooks.constructEvent(
      body,
      signature!,
      process.env.STRIPE_WEBHOOK_SECRET!
    )

    console.log('Received event:', event.type)

    // Verwerk het event
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event.data.object)
        break
      case 'customer.subscription.created':
        await handleSubscriptionCreated(event.data.object)
        break
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object)
        break
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object)
        break
      case 'invoice.payment_succeeded':
        await handleInvoicePaymentSucceeded(event.data.object)
        break
      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(event.data.object)
        break
      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    res.status(200).json({ received: true })
  } catch (error) {
    console.error('Webhook error:', error)
    res.status(400).json({ error: 'Webhook signature verification failed' })
  }
}

// ✅ Checkout session completed
async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  const profileId = session.metadata?.profile_id
  
  if (!profileId) {
    console.error('No profile_id in session metadata')
    return
  }

  console.log(`Processing checkout session for profile ${profileId}`)

  // Update profile met customer ID
  if (session.customer) {
    await supabase
      .from('profiles')
      .update({
        stripe_customer_id: session.customer as string,
        updated_at: new Date().toISOString(),
      })
      .eq('id', profileId)
  }

  // Als er een subscription is, verwerk deze
  if (session.subscription) {
    console.log(`Checkout contains subscription ${session.subscription}`)
    const subscription = await stripe.subscriptions.retrieve(session.subscription as string)
    await handleSubscriptionCreated(subscription)
  }
}

// ✅ Subscription created - Profile wordt published
async function handleSubscriptionCreated(subscription: Stripe.Subscription) {
  const profileId = subscription.metadata?.profile_id
  
  if (!profileId) {
    console.error('No profile_id in subscription metadata')
    return
  }

  console.log(`Creating subscription for profile ${profileId}`)

  // Maak subscription record aan
  const { data: subData, error: subError } = await supabase
    .from('subscriptions')
    .insert({
      profile_id: profileId,
      stripe_subscription_id: subscription.id,
      stripe_customer_id: subscription.customer as string,
      status: subscription.status,
      current_period_start: new Date((subscription as Stripe.Subscription & { current_period_start: number }).current_period_start * 1000).toISOString(),
      current_period_end: new Date((subscription as Stripe.Subscription & { current_period_end: number }).current_period_end * 1000).toISOString(),
      cancel_at_period_end: subscription.cancel_at_period_end,
      trial_start: subscription.trial_start ? new Date(subscription.trial_start * 1000).toISOString() : null,
      trial_end: subscription.trial_end ? new Date(subscription.trial_end * 1000).toISOString() : null,
    })
    .select()
    .single()

  if (subError) {
    console.error('Error creating subscription:', subError)
    return
  }

  // ✅ Profile wordt published
  await supabase
    .from('profiles')
    .update({
      status: 'published', // ✅ Belangrijk: profile wordt published
      subscription_id: subData.id,
      subscription_status: subscription.status,
      stripe_customer_id: subscription.customer as string,
      trial_start_date: subscription.trial_start ? new Date(subscription.trial_start * 1000).toISOString() : null,
      trial_end_date: subscription.trial_end ? new Date(subscription.trial_end * 1000).toISOString() : null,
      onboarding_completed: true,
      onboarding_step: 8,
    })
    .eq('id', profileId)

  console.log(`✅ Profile ${profileId} is now published with active subscription`)
}

// ✅ Subscription updated
async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const profileId = subscription.metadata?.profile_id
  
  if (!profileId) {
    console.error('No profile_id in subscription metadata')
    return
  }

  // Update subscription record
  await supabase
    .from('subscriptions')
    .update({
      status: subscription.status,
      current_period_start: new Date((subscription as Stripe.Subscription & { current_period_start: number }).current_period_start * 1000).toISOString(),
      current_period_end: new Date((subscription as Stripe.Subscription & { current_period_end: number }).current_period_end * 1000).toISOString(),
      cancel_at_period_end: subscription.cancel_at_period_end,
    })
    .eq('stripe_subscription_id', subscription.id)

  // Update profile status
  let profileStatus = 'draft'
  if (subscription.status === 'active') {
    profileStatus = 'published'
  } else if (['past_due', 'unpaid'].includes(subscription.status)) {
    profileStatus = 'published' // Blijf online tijdens grace period
  }

  await supabase
    .from('profiles')
    .update({
      subscription_status: subscription.status,
      status: profileStatus,
    })
    .eq('id', profileId)

  console.log(`Subscription updated for profile ${profileId}, status: ${subscription.status}`)
}

// ✅ Subscription deleted - Profile gaat naar draft
async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const profileId = subscription.metadata?.profile_id
  
  if (!profileId) {
    console.error('No profile_id in subscription metadata')
    return
  }

  console.log(`🔧 Processing subscription deleted for profile ${profileId}`)

  // Update subscription record
  await supabase
    .from('subscriptions')
    .update({
      status: 'canceled',
      updated_at: new Date().toISOString(),
    })
    .eq('stripe_subscription_id', subscription.id)

  // ✅ Profile gaat naar draft (offline)
  await supabase
    .from('profiles')
    .update({
      subscription_status: 'canceled',
      status: 'draft', // ✅ Belangrijk: profile wordt draft/offline
      updated_at: new Date().toISOString(),
    })
    .eq('id', profileId)

  console.log(`✅ Profile ${profileId} set to draft (offline) after subscription cancellation`)
}

// ✅ Invoice payment succeeded
async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
  const subscriptionId = (invoice as Stripe.Invoice & { subscription: string }).subscription
  
  if (!subscriptionId) return

  console.log(`�� Processing invoice payment succeeded for subscription ${subscriptionId}`)

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

  // Update profile status to active
  await supabase
    .from('profiles')
    .update({
      subscription_status: 'active',
      status: 'published',
      updated_at: new Date().toISOString(),
    })
    .eq('id', subscription.profile_id)

  console.log(`✅ Profile ${subscription.profile_id} status updated to active after successful payment`)
}

// ✅ Invoice payment failed
async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  const subscriptionId = (invoice as Stripe.Invoice & { subscription: string }).subscription
  
  if (!subscriptionId) return

  console.log(` Processing invoice payment failed for subscription ${subscriptionId}`)

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

  // Schedule profile to go offline after grace period
  const gracePeriodEnd = new Date()
  gracePeriodEnd.setDate(gracePeriodEnd.getDate() + 3)
  
  await supabase
    .from('profiles')
    .update({
      subscription_status: 'past_due',
      updated_at: new Date().toISOString(),
    })
    .eq('id', subscription.profile_id)

  console.log(`✅ Profile ${subscription.profile_id} marked as past_due`)
}
