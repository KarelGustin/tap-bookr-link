// @ts-expect-error -- Deno runtime environment
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
// @ts-expect-error -- Deno runtime environment
import Stripe from 'https://esm.sh/stripe@14.21.0?target=deno'
// @ts-expect-error -- Deno runtime environment
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const requestId = Math.random().toString(36).substring(7)
  console.log(`🔄 [${requestId}] Manual subscription sync started at ${new Date().toISOString()}`)

  try {
    // Initialize Supabase client with service role
    // @ts-expect-error -- Deno runtime environment
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    // @ts-expect-error -- Deno runtime environment
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Supabase configuration missing')
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false }
    })

    // Get user from auth header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('No authorization header provided')
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: userData, error: userError } = await supabase.auth.getUser(token)
    if (userError) throw new Error(`Authentication error: ${userError.message}`)
    
    const user = userData.user
    if (!user?.id) throw new Error('User not authenticated')

    console.log(`🔄 [${requestId}] Syncing subscription for user: ${user.id} (${user.email})`)

    // Get profile data
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (profileError || !profile) {
      throw new Error(`Profile not found: ${profileError?.message}`)
    }

    if (!profile.stripe_customer_id) {
      console.log(`🔄 [${requestId}] No Stripe customer ID found`)
      return new Response(JSON.stringify({
        success: true,
        message: 'No Stripe customer to sync',
        status: 'no_customer'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      })
    }

    // Initialize Stripe
    // @ts-expect-error -- Deno runtime environment
    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY')
    if (!stripeSecretKey) {
      throw new Error('STRIPE_SECRET_KEY is not configured')
    }

    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2023-10-16',
    })

    console.log(`🔄 [${requestId}] Fetching subscriptions from Stripe for customer: ${profile.stripe_customer_id}`)

    // Get active subscriptions from Stripe
    const subscriptions = await stripe.subscriptions.list({
      customer: profile.stripe_customer_id,
      status: 'active',
      limit: 1,
    })

    const hasActiveSubscription = subscriptions.data.length > 0
    let subscriptionData = null

    if (hasActiveSubscription) {
      const subscription = subscriptions.data[0]
      subscriptionData = subscription

      console.log(`🔄 [${requestId}] Found active subscription: ${subscription.id}`)

      // Update or create subscription record
      const { error: subError } = await supabase
        .from('subscriptions')
        .upsert({
          stripe_subscription_id: subscription.id,
          profile_id: profile.id,
          stripe_customer_id: profile.stripe_customer_id,
          status: subscription.status,
          current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
          current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
          cancel_at_period_end: subscription.cancel_at_period_end,
          trial_start: subscription.trial_start ? new Date(subscription.trial_start * 1000).toISOString() : null,
          trial_end: subscription.trial_end ? new Date(subscription.trial_end * 1000).toISOString() : null,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'stripe_subscription_id' })

      if (subError) {
        console.error(`🔄 [${requestId}] Error updating subscription record:`, subError)
        throw new Error(`Failed to update subscription record: ${subError.message}`)
      }

      // Update profile status
      const { error: profileUpdateError } = await supabase
        .from('profiles')
        .update({
          subscription_status: 'active',
          status: 'published',
          subscription_id: subscription.id,
          onboarding_completed: true,
          onboarding_step: 8,
          preview_expires_at: null,
          preview_started_at: null,
          updated_at: new Date().toISOString()
        })
        .eq('id', profile.id)

      if (profileUpdateError) {
        console.error(`🔄 [${requestId}] Error updating profile:`, profileUpdateError)
        throw new Error(`Failed to update profile: ${profileUpdateError.message}`)
      }

      console.log(`🔄 [${requestId}] Profile updated to published status`)
    } else {
      console.log(`🔄 [${requestId}] No active subscription found`)

      // Update profile to inactive status
      const { error: profileUpdateError } = await supabase
        .from('profiles')
        .update({
          subscription_status: 'inactive',
          status: 'draft',
          updated_at: new Date().toISOString()
        })
        .eq('id', profile.id)

      if (profileUpdateError) {
        console.error(`🔄 [${requestId}] Error updating profile to inactive:`, profileUpdateError)
        throw new Error(`Failed to update profile: ${profileUpdateError.message}`)
      }

      console.log(`🔄 [${requestId}] Profile updated to inactive status`)
    }

    const result = {
      success: true,
      message: hasActiveSubscription ? 'Subscription synced successfully' : 'No active subscription found',
      status: hasActiveSubscription ? 'active' : 'inactive',
      subscription: subscriptionData ? {
        id: subscriptionData.id,
        status: subscriptionData.status,
        current_period_end: new Date(subscriptionData.current_period_end * 1000).toISOString()
      } : null
    }

    console.log(`🔄 [${requestId}] Sync completed:`, result)

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error) {
    console.error(`❌ [${requestId}] Sync error:`, error)
    
    return new Response(JSON.stringify({ 
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})