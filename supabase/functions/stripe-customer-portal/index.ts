import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-user-email',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { profileId, returnUrl, section } = await req.json()
    const userEmail = req.headers.get('x-user-email') || undefined
    
    if (!profileId) {
      throw new Error('Profile ID is required')
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY')!
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    const stripe = new Stripe(stripeSecretKey)
    
    // Read profile details
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('stripe_customer_id, subscription_id')
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

    let customerId = profile?.stripe_customer_id as string | null

    // If no customer on profile, try to derive from subscription
    if (!customerId && profile?.subscription_id) {
      try {
        const subscription = await stripe.subscriptions.retrieve(profile.subscription_id)
        customerId = subscription.customer as string

        if (customerId) {
          await supabase
            .from('profiles')
            .update({ stripe_customer_id: customerId })
            .eq('id', profileId)
        }
      } catch (e) {
        console.error('Error retrieving subscription from Stripe:', e)
        // Fall through to customer creation
      }
    }

    // If still no customer, create one using the user's email
    if (!customerId) {
      if (!userEmail) {
        return new Response(
          JSON.stringify({ error: 'No Stripe customer found and no user email provided' }),
          { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }

      try {
        const customer = await stripe.customers.create({
          email: userEmail,
          metadata: { profile_id: profileId },
        })
        customerId = customer.id

        await supabase
          .from('profiles')
          .update({ stripe_customer_id: customerId })
          .eq('id', profileId)
      } catch (e) {
        console.error('Error creating Stripe customer:', e)
        return new Response(
          JSON.stringify({ error: 'Unable to create Stripe customer' }),
          { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }
    }

    // Prepare portal session parameters (allow regardless of subscription status)
    const portalParams: { customer: string; return_url: string } = {
      customer: customerId!,
      return_url: returnUrl || `${req.headers.get('origin')}/dashboard`,
    }

    if (section === 'cancel') {
      portalParams.return_url = `${returnUrl || req.headers.get('origin')}/dashboard?cancellation=initiated`
    } else if (section === 'billing') {
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
      JSON.stringify({ error: (error as Error).message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})

// Minimal Stripe API wrapper
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
      if (!response.ok) throw new Error(`Stripe API error: ${response.status}`)
      return await response.json()
    }
  }

  customers = {
    create: async (params: { email?: string; metadata?: Record<string, string> }) => {
      const formData = new URLSearchParams()
      if (params.email) formData.append('email', params.email)
      if (params.metadata) {
        for (const [k, v] of Object.entries(params.metadata)) {
          formData.append(`metadata[${k}]`, String(v))
        }
      }
      const response = await fetch(`${this.baseURL}/customers`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.secretKey}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData,
      })
      if (!response.ok) throw new Error(`Stripe API error: ${response.status}`)
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
