// @ts-expect-error - Deno import
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
// @ts-expect-error - Deno import
import Stripe from 'https://esm.sh/stripe@14.21.0?target=deno'
// @ts-expect-error - Deno import
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-user-email',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const requestId = Math.random().toString(36).substring(7)
  console.log(`🚀 [${requestId}] Stripe checkout request started at ${new Date().toISOString()}`)

  try {
    // Get the request body
    const { profileId, successUrl, cancelUrl } = await req.json()

    console.log(`🔧 [${requestId}] Request body:`, { 
      profileId, 
      successUrl, 
      cancelUrl,
      origin: req.headers.get('origin'),
      userAgent: req.headers.get('user-agent')
    })

    if (!profileId) {
      throw new Error('Profile ID is required')
    }

    // Initialize Supabase with service role for database operations
    // @ts-expect-error -- Deno runtime environment
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    // @ts-expect-error -- Deno runtime environment  
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Supabase configuration missing')
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false }
    });
    console.log('🔧 Supabase client initialized with service role')

    // Get profile to find user email
    console.log('🔧 Looking for profile with ID:', profileId)
    
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('user_id, stripe_customer_id')
      .eq('id', profileId)
      .maybeSingle()

    console.log('🔧 Profile query result:', { profile, profileError })

    if (profileError) {
      console.error('🔧 Database error when fetching profile:', profileError)
      throw new Error(`Database error: ${profileError.message}`)
    }

    if (!profile) {
      console.error('🔧 No profile found with ID:', profileId)
      throw new Error(`No profile found with ID: ${profileId}`)
    }

    // Get user email from auth.users
    const { data: { user }, error: userError } = await supabase.auth.admin.getUserById(profile.user_id)
    
    if (userError || !user?.email) {
      throw new Error('User email not found')
    }

    console.log('🔧 Found user email:', user.email)

    // Get environment variables - €7 per month price
    const priceId = 'price_1RyGZDFR5NTFUA4SSuJ0yKEw' // €7/month
    console.log('🔧 Price ID (€7/month):', priceId)

    // @ts-expect-error -- Deno runtime environment
    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY')
    console.log('🔧 Stripe Secret Key exists:', !!stripeSecretKey)
    
    if (!stripeSecretKey) {
      throw new Error('STRIPE_SECRET_KEY is not configured')
    }

    // Initialize Stripe
    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2023-10-16',
    })

    // Find or create Stripe customer
    let customerId = profile.stripe_customer_id;
    
    if (!customerId) {
      console.log('🔧 Creating new Stripe customer for:', user.email)
      
      // Check if customer already exists in Stripe
      const existingCustomers = await stripe.customers.list({
        email: user.email,
        limit: 1
      })
      
      if (existingCustomers.data.length > 0) {
        customerId = existingCustomers.data[0].id
        console.log('🔧 Found existing Stripe customer:', customerId)
      } else {
        // Create new customer
        const customer = await stripe.customers.create({
          email: user.email,
          metadata: {
            profile_id: profileId,
            user_id: profile.user_id
          }
        })
        customerId = customer.id
        console.log('🔧 Created new Stripe customer:', customerId)
      }
      
      // Save customer ID to profile
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ stripe_customer_id: customerId })
        .eq('id', profileId)
        
      if (updateError) {
        console.error('🔧 Error saving customer ID to profile:', updateError)
        throw new Error('Failed to save customer ID')
      }
      
      console.log('🔧 Saved customer ID to profile')
    } else {
      console.log('🔧 Using existing customer ID:', customerId)
    }

    console.log('🔧 Creating checkout session with params:', {
      priceId,
      profileId,
      customerId,
      successUrl,
      cancelUrl
    })

    // Hardcoded success/cancel URLs voor betrouwbaarheid
    const baseUrl = 'https://tapbookr.com'
    const finalSuccessUrl = successUrl || `${baseUrl}/dashboard?success=true&subscription=active`
    const finalCancelUrl = cancelUrl || `${baseUrl}/onboarding?step=7`

    console.log(`🔧 [${requestId}] Final URLs:`, {
      success: finalSuccessUrl,
      cancel: finalCancelUrl
    })

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: finalSuccessUrl,
      cancel_url: finalCancelUrl,
      
      // Add discount coupon for first month €1
      discounts: [
        {
          coupon: 'PRY6QV9M',
        },
      ],
      
      // Metadata voor profile_id
      metadata: {
        profile_id: profileId,
      },
      
      // Subscription metadata
      subscription_data: {
        metadata: {
          profile_id: profileId,
        },
      },
    })

    console.log('🔧 Checkout session created successfully:', session.id)

    return new Response(
      JSON.stringify({ sessionId: session.id, url: session.url }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('🔧 Error creating checkout session:', error)
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    const errorStack = error instanceof Error ? error.stack : undefined
    
    console.error('🔧 Error details:', {
      message: errorMessage,
      stack: errorStack,
      timestamp: new Date().toISOString()
    })
    
    return new Response(
      JSON.stringify({ 
        error: errorMessage,
        details: errorStack,
        timestamp: new Date().toISOString()
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})