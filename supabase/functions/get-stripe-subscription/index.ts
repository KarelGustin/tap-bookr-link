// @ts-expect-error - Deno runtime imports
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
// @ts-expect-error - Deno runtime imports
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
// @ts-expect-error - Deno runtime imports
import Stripe from 'https://esm.sh/stripe@14.21.0?target=deno'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  console.log('get-stripe-subscription function called')
  console.log('Request method:', req.method)
  console.log('Request URL:', req.url)

  try {
    const body = await req.json()
    console.log('Request body:', body)
    
    const { profileId } = body
    
    if (!profileId) {
      console.log('No profile ID provided')
      return new Response(
        JSON.stringify({ error: 'Profile ID is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log('Processing profile ID:', profileId)

    // Get profile data to find subscription_id
    // @ts-expect-error -- Deno runtime environment
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    // @ts-expect-error -- Deno runtime environment
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    
    console.log('Environment variables:', { 
      hasSupabaseUrl: !!supabaseUrl, 
      hasSupabaseServiceKey: !!supabaseServiceKey 
    })
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('Missing environment variables')
      return new Response(
        JSON.stringify({ error: 'Server configuration error' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    console.log('Supabase client created')
    
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('subscription_id, subscription_status')
      .eq('id', profileId)
      .single()

    console.log('Profile query result:', { profile, profileError })

    if (profileError) {
      console.error('Profile error:', profileError)
      return new Response(
        JSON.stringify({ error: 'Profile not found' }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    if (!profile?.subscription_id) {
      console.log('No subscription ID found in profile')
      return new Response(
        JSON.stringify({ error: 'No subscription found for this profile' }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log('Found subscription ID:', profile.subscription_id)

    // Get Stripe subscription data
    // @ts-expect-error -- Deno runtime environment
    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY')
    
    console.log('Has Stripe secret key:', !!stripeSecretKey)
    
    if (!stripeSecretKey) {
      console.error('Missing Stripe secret key')
      return new Response(
        JSON.stringify({ error: 'Server configuration error' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }
    
    const stripe = new Stripe(stripeSecretKey)
    console.log('Stripe client created')

    const subscription = await stripe.subscriptions.retrieve(profile.subscription_id)
    console.log('Stripe subscription retrieved:', subscription.id)
    
    const subscriptionData = {
      id: subscription.id,
      status: subscription.status,
      current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
      current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
      cancel_at_period_end: subscription.cancel_at_period_end,
      stripe_customer_id: typeof subscription.customer === 'string' ? subscription.customer : subscription.customer?.id,
    }

    console.log('Returning subscription data:', subscriptionData)

    return new Response(
      JSON.stringify(subscriptionData),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Error in get-stripe-subscription:', error)
    console.error('Error type:', typeof error)
    console.error('Error message:', error.message)
    console.error('Error stack:', error.stack)
    
    // Better error handling
    let errorMessage = 'Internal server error'
    let statusCode = 500
    
    if (error.message?.includes('No such subscription')) {
      errorMessage = 'Subscription not found'
      statusCode = 404
    } else if (error.message?.includes('Invalid API key')) {
      errorMessage = 'Server configuration error'
      statusCode = 500
    } else if (error.message) {
      errorMessage = error.message
    }
    
    console.log('Returning error response:', { errorMessage, statusCode })
    
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        status: statusCode, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
