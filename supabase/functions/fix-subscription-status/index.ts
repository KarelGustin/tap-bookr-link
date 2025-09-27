import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
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
    // Initialize Supabase client with service role
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Supabase configuration missing')
    }
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

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

    console.log(`🔧 Fix subscription status for user: ${user.id} (${user.email})`)

    // Get profile data
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (profileError) {
      throw new Error(`Profile error: ${profileError.message}`)
    }

    if (!profile.stripe_customer_id) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'No Stripe customer ID found - user needs to complete checkout first' 
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        }
      )
    }

    // Initialize Stripe
    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY')
    if (!stripeSecretKey) {
      throw new Error('STRIPE_SECRET_KEY not configured')
    }
    
    const stripe = new Stripe(stripeSecretKey)

    // Get current subscription from Stripe
    const subscriptions = await stripe.subscriptions.list({
      customer: profile.stripe_customer_id,
      limit: 10,
    })

    console.log(`🔧 Found ${subscriptions.data.length} subscriptions in Stripe`)

    let activeSubscription = null
    for (const sub of subscriptions.data) {
      if (['active', 'trialing', 'past_due'].includes(sub.status)) {
        activeSubscription = sub
        break
      }
    }

    let newProfileStatus = 'draft'
    let newSubscriptionStatus = 'inactive'
    let updateMessage = ''

    if (activeSubscription) {
      console.log(`🔧 Found active subscription: ${activeSubscription.id} (${activeSubscription.status})`)

      // Map status to profile values
      if (['active', 'trialing'].includes(activeSubscription.status)) {
        newProfileStatus = 'published'
        newSubscriptionStatus = 'active'
        updateMessage = `Set to published with active subscription (${activeSubscription.status})`
      } else if (['past_due', 'unpaid'].includes(activeSubscription.status)) {
        newProfileStatus = 'published' // Keep published during grace period
        newSubscriptionStatus = 'past_due'
        updateMessage = `Set to published with past_due subscription (grace period)`
      }

      // Upsert subscription record in database
      const allowedStatus = ['active', 'past_due', 'canceled', 'unpaid'].includes(activeSubscription.status) 
        ? activeSubscription.status 
        : 'unpaid'

      const { error: subUpsertError } = await supabase
        .from('subscriptions')
        .upsert({
          stripe_subscription_id: activeSubscription.id,
          profile_id: profile.id,
          stripe_customer_id: profile.stripe_customer_id,
          status: allowedStatus,
          current_period_start: new Date(activeSubscription.current_period_start * 1000).toISOString(),
          current_period_end: new Date(activeSubscription.current_period_end * 1000).toISOString(),
          cancel_at_period_end: activeSubscription.cancel_at_period_end || false,
          trial_start: activeSubscription.trial_start ? new Date(activeSubscription.trial_start * 1000).toISOString() : null,
          trial_end: activeSubscription.trial_end ? new Date(activeSubscription.trial_end * 1000).toISOString() : null,
        }, {
          onConflict: 'stripe_subscription_id'
        })

      if (subUpsertError) {
        console.error('Error upserting subscription:', subUpsertError)
      } else {
        console.log('✅ Subscription record updated in database')
      }

    } else {
      console.log('🔧 No active subscription found in Stripe')
      updateMessage = 'No active subscription found - set to draft/inactive'
    }

    // Update profile
    const { error: profileUpdateError } = await supabase
      .from('profiles')
      .update({
        subscription_status: newSubscriptionStatus,
        status: newProfileStatus,
        subscription_id: activeSubscription?.id || null,
        updated_at: new Date().toISOString()
      })
      .eq('id', profile.id)

    if (profileUpdateError) {
      throw new Error(`Error updating profile: ${profileUpdateError.message}`)
    }

    console.log(`✅ Profile updated: status=${newProfileStatus}, subscription_status=${newSubscriptionStatus}`)

    const result = {
      success: true,
      message: updateMessage,
      before: {
        profile_status: profile.status,
        subscription_status: profile.subscription_status,
        subscription_id: profile.subscription_id
      },
      after: {
        profile_status: newProfileStatus,
        subscription_status: newSubscriptionStatus,
        subscription_id: activeSubscription?.id || null
      },
      stripe_subscription: activeSubscription ? {
        id: activeSubscription.id,
        status: activeSubscription.status,
        current_period_end: new Date(activeSubscription.current_period_end * 1000).toISOString()
      } : null
    }

    return new Response(
      JSON.stringify(result, null, 2),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('❌ Fix error:', error)
    
    return new Response(
      JSON.stringify({ 
        success: false,
        error: (error as Error).message,
        timestamp: new Date().toISOString()
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})