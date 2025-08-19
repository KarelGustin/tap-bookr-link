// @ts-expect-error - Deno import
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
// @ts-expect-error - Deno import
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-user-email',
}

// Stripe checkout session parameters interface
interface StripeCheckoutParams {
  line_items: Array<{
    price: string
    quantity: number
  }>
  mode: string
  subscription_data?: {
    metadata: Record<string, string>
  }
  success_url: string
  cancel_url: string
  customer_email?: string
  metadata: Record<string, string>
  payment_method_configuration?: string
  discounts?: Array<{
    coupon: string  // ✅ 'coupon' in plaats van 'promotion_code'
  }>
}

// Stripe response interface
interface StripeCheckoutResponse {
  id: string
  url: string
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

    // deno-lint-ignore no-undef
    const priceId = (globalThis as unknown as { Deno?: { env: { get: (k: string) => string | undefined }}}).Deno?.env.get('STRIPE_PRICE_ID')
    console.log('🔧 Price ID:', priceId)
    
    if (!priceId) {
      throw new Error('STRIPE_PRICE_ID is not configured')
    }

    // Get Payment Method Configuration ID from environment
    // deno-lint-ignore no-undef
    const paymentMethodConfigurationId = (globalThis as unknown as { Deno?: { env: { get: (k: string) => string | undefined }}}).Deno?.env.get('STRIPE_PAYMENT_METHOD_CONFIG_ID')
    console.log('🔧 Payment Method Config ID:', paymentMethodConfigurationId)
    
    if (!paymentMethodConfigurationId) {
      throw new Error('STRIPE_PAYMENT_METHOD_CONFIG_ID is not configured')
    }

    // Get Discount ID from environment
    // deno-lint-ignore no-undef
    const discountId = (globalThis as unknown as { Deno?: { env: { get: (k: string) => string | undefined }}}).Deno?.env.get('STRIPE_DISCOUNT_ID')
    console.log('🔧 Discount ID:', discountId)

    // deno-lint-ignore no-undef
    const stripeSecretKey = (globalThis as unknown as { Deno?: { env: { get: (k: string) => string | undefined }}}).Deno?.env.get('STRIPE_SECRET_KEY')
    console.log('🔧 Stripe Secret Key exists:', !!stripeSecretKey)

    // Initialize Stripe (shim)
    const stripe = Stripe(stripeSecretKey || '', {
      apiVersion: '2023-10-16',
    })

    console.log('🔧 Creating checkout session with params:', {
      priceId,
      paymentMethodConfigurationId,
      profileId,
      successUrl,
      cancelUrl
    })

    // Create checkout session with Payment Method Configuration
    const session = await stripe.checkout.sessions.create({
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: successUrl || `${req.headers.get('origin')}/dashboard?success=true&subscription=active`,
      cancel_url: cancelUrl || `${req.headers.get('origin')}/onboarding?step=7&cancelled=true`,
      customer_email: req.headers.get('x-user-email') || undefined,
      // Ensure the created subscription carries the profile_id as metadata
      subscription_data: {
        metadata: {
          profile_id: String(profileId),
        },
      },
      metadata: {
        profile_id: profileId,
      },
      payment_method_configuration: paymentMethodConfigurationId,
      // Voeg automatische discount toe als deze is geconfigureerd
      ...(discountId && {
        discounts: [
          {
            coupon: discountId  // ✅ Gebruik 'coupon' in plaats van 'promotion_code'
          }
        ]
      }),
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
    return new Response(
      JSON.stringify({ 
        error: (error as Error).message,
        stack: (error as Error).stack 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})

// Stripe type definitions
interface Stripe {
  checkout: {
    sessions: {
      create: (params: StripeCheckoutParams) => Promise<StripeCheckoutResponse>
    }
  }
}

const Stripe = (secretKey: string, _config: Record<string, unknown>): Stripe => {
  // Simplified Stripe client for Deno using fetch
  return {
    checkout: {
      sessions: {
        create: async (params: StripeCheckoutParams): Promise<StripeCheckoutResponse> => {
          const form = new URLSearchParams()
          
                     // Add payment method configuration if provided
           if (params.payment_method_configuration) {
             form.append('payment_method_configuration', params.payment_method_configuration)
           }
           form.append('line_items[0][price]', params.line_items[0].price)
           form.append('line_items[0][quantity]', String(params.line_items[0].quantity))
           form.append('mode', params.mode)
           form.append('success_url', params.success_url)
           form.append('cancel_url', params.cancel_url)
           // Put metadata at session level only
           if (params.metadata?.profile_id) {
             form.append('metadata[profile_id]', params.metadata.profile_id)
           }
           // Ensure subscription_data metadata is attached to the created subscription
           if (params.subscription_data?.metadata?.profile_id) {
             form.append('subscription_data[metadata][profile_id]', params.subscription_data.metadata.profile_id)
           }
           if (params.customer_email) {
             form.append('customer_email', params.customer_email)
           }
           // Add discount if provided
           if (params.discounts && params.discounts.length > 0) {
             form.append('discounts[0][coupon]', params.discounts[0].coupon)  // ✅ 'coupon' in plaats van 'promotion_code'
           }

          const response = await fetch('https://api.stripe.com/v1/checkout/sessions', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${secretKey}`,
              'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: form,
          })

          if (!response.ok) {
            const txt = await response.text()
            throw new Error(`Stripe API error: ${response.status} ${response.statusText} - ${txt}`)
          }

          return response.json()
        }
      }
    }
  }
}
