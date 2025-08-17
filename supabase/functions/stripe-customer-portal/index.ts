// @ts-expect-error - Deno runtime imports
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
// @ts-expect-error - Deno runtime imports  
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { profileId, returnUrl, section } = await req.json()
    
    if (!profileId) {
      throw new Error('Profile ID is required')
    }

    // Get profile data to find stripe_customer_id
    // @ts-expect-error -- Deno runtime environment
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    // @ts-expect-error -- Deno runtime environment
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('stripe_customer_id, subscription_status, subscription_id')
      .eq('id', profileId)
      .single()

    if (profileError) {
      return new Response(
        JSON.stringify({ error: 'Profile not found' }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Allow access to the customer portal even if subscription is not active,
    // so users can manage/cancel or view billing history.

    // Get customer ID from profile or fetch from Stripe if needed
    let customerId = profile.stripe_customer_id
    
    if (!customerId && profile.subscription_id) {
      // If no customer ID in profile, fetch from Stripe using subscription ID
      // @ts-expect-error -- Deno runtime environment
      const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY')!
      const stripe = new Stripe(stripeSecretKey)
      
      try {
        const subscription = await stripe.subscriptions.retrieve(profile.subscription_id)
        customerId = subscription.customer
        
        // Update profile with customer ID for future use
        await supabase
          .from('profiles')
          .update({ stripe_customer_id: customerId })
          .eq('id', profileId)
      } catch (stripeError) {
        console.error('Error fetching customer ID from Stripe:', stripeError)
        return new Response(
          JSON.stringify({ error: 'Unable to fetch customer information' }),
          { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }
    }

    if (!customerId) {
      return new Response(
        JSON.stringify({ error: 'No Stripe customer found' }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Get Stripe customer portal session
    // @ts-expect-error -- Deno runtime environment
    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY')!
    const stripe = new Stripe(stripeSecretKey)

    // Prepare portal session parameters
    const portalParams: {
      customer: string;
      return_url: string;
    } = {
      customer: customerId,
      return_url: returnUrl || `${req.headers.get('origin')}/dashboard`,
    }

    // Add section-specific parameters
    if (section === 'cancel') {
      // For cancellation, focus on subscription management
      portalParams.return_url = `${returnUrl || req.headers.get('origin')}/dashboard?cancellation=initiated`
    } else if (section === 'billing') {
      // For billing, focus on invoice history
      portalParams.return_url = `${returnUrl || req.headers.get('origin')}/dashboard?billing=viewed`
    }

    const session = await stripe.billingPortal.sessions.create(portalParams)
    
    return new Response(
      JSON.stringify({ url: session.url }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})

// Stripe class for API calls
class Stripe {
  private secretKey: string
  private baseURL = 'https://api.stripe.com/v1'

  constructor(secretKey: string) {
    this.secretKey = secretKey
  }

  subscriptions = {
    retrieve: async (subscriptionId: string) => {
      const response = await fetch(`${this.baseURL}/subscriptions/${subscriptionId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.secretKey}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      })

      if (!response.ok) {
        throw new Error(`Stripe API error: ${response.status}`)
      }

      return await response.json()
    }
  }

  billingPortal = {
    sessions: {
      create: async (params: { customer: string; return_url: string }) => {
        const formData = new URLSearchParams()
        formData.append('customer', params.customer)
        formData.append('return_url', params.return_url)

        const response = await fetch(`${this.baseURL}/billing_portal/sessions`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.secretKey}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: formData,
        })

        if (!response.ok) {
          throw new Error(`Stripe API error: ${response.status}`)
        }

        return await response.json()
      }
    }
  }
}
