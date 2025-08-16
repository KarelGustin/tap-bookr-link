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
  payment_method_types: string[]
  line_items: Array<{
    price: string
    quantity: number
  }>
  mode: string
  subscription_data: {
    metadata: Record<string, string>
  }
  success_url: string
  cancel_url: string
  customer_email?: string
  metadata: Record<string, string>
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

    if (!profileId) {
      throw new Error('Profile ID is required')
    }

    // @ts-expect-error - Deno environment
    const priceId = Deno.env.get('STRIPE_PRICE_ID')
    if (!priceId) {
      throw new Error('STRIPE_PRICE_ID is not configured')
    }

    // Initialize Stripe (shim)
    // @ts-expect-error - Deno environment
    const stripe = Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
      apiVersion: '2023-10-16',
    })

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card', 'ideal'],
      line_items: [
        {
          price: priceId, // €9/month subscription price ID
          quantity: 1,
        },
      ],
      mode: 'subscription',
      subscription_data: {
        metadata: {
          profile_id: profileId,
        },
      },
      success_url: successUrl || `${req.headers.get('origin')}/dashboard?success=true`,
      cancel_url: cancelUrl || `${req.headers.get('origin')}/dashboard?canceled=true`,
      customer_email: req.headers.get('x-user-email') || undefined,
      metadata: {
        profile_id: profileId,
      },
    })

    return new Response(
      JSON.stringify({ sessionId: session.id, url: session.url }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('Error creating checkout session:', error)
    return new Response(
      JSON.stringify({ error: (error as Error).message }),
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
          // Multiple payment methods must be appended individually
          ;(params.payment_method_types || []).forEach((pm: string) => {
            form.append('payment_method_types[]', pm)
          })
          form.append('line_items[0][price]', params.line_items[0].price)
          form.append('line_items[0][quantity]', String(params.line_items[0].quantity))
          form.append('mode', params.mode)
          form.append('success_url', params.success_url)
          form.append('cancel_url', params.cancel_url)
          // Put metadata at both session and subscription level
          if (params.metadata?.profile_id) {
            form.append('metadata[profile_id]', params.metadata.profile_id)
            form.append('subscription_data[metadata][profile_id]', params.metadata.profile_id)
          }
          if (params.customer_email) {
            form.append('customer_email', params.customer_email)
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
