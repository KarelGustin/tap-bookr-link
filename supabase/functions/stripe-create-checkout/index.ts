// @ts-expect-error - Deno import
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
// @ts-expect-error - Deno import
import Stripe from 'https://esm.sh/stripe@14.21.0?target=deno'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-user-email',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Get the request body
    const { profileId, successUrl, cancelUrl } = await req.json()

    console.log('🔧 Request body:', { profileId, successUrl, cancelUrl })

    if (!profileId) {
      throw new Error('Profile ID is required')
    }

    // Get environment variables
    // @ts-expect-error -- Deno runtime environment
    const priceId = Deno.env.get('STRIPE_PRICE_ID')
    console.log('🔧 Price ID:', priceId)
    
    if (!priceId) {
      throw new Error('STRIPE_PRICE_ID is not configured')
    }

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

    console.log('🔧 Creating checkout session with params:', {
      priceId,
      profileId,
      successUrl,
      cancelUrl
    })

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: successUrl || `${req.headers.get('origin')}/dashboard?success=true`,
      cancel_url: cancelUrl || `${req.headers.get('origin')}/onboarding?step=7`,
      
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
    
    // ✅ Betere error logging
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
