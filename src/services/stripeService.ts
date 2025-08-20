import { supabase } from '@/integrations/supabase/client'

export interface StripeCheckoutParams {
  profileId: string
  successUrl?: string
  cancelUrl?: string
}

export interface StripeCustomerPortalParams {
  profileId: string
  returnUrl?: string
  section?: 'manage' | 'cancel' | 'billing'
}

export class StripeService {
  private static async callEdgeFunction<T>(
    functionName: string,
    params: Record<string, unknown>
  ): Promise<T> {
    const { data: auth } = await supabase.auth.getUser()
    const email = auth?.user?.email || undefined

    const { data, error } = await supabase.functions.invoke(functionName, {
      body: params,
      headers: email ? { 'x-user-email': email } : undefined,
    })

    if (error) {
      // Surface detailed error returned by the Edge Function
      let detailedMessage = error.message || `Edge Function returned a non-2xx status code`
      const ctx: { response?: Response } | undefined = (error as unknown as { context?: { response?: Response } }).context
      const resp = ctx?.response
      if (resp && typeof resp.text === 'function') {
        try {
          const text = await resp.text()
          try {
            const json = JSON.parse(text)
            detailedMessage = json?.error || detailedMessage
            console.error(`Edge Function '${functionName}' error:`, { status: resp.status, body: json })
          } catch {
            detailedMessage = text || detailedMessage
            console.error(`Edge Function '${functionName}' error:`, { status: resp.status, body: text })
          }
        } catch {
          // no-op
        }
      } else {
        console.error(`Edge Function '${functionName}' error:`, error)
      }
      throw new Error(detailedMessage)
    }

    return data as T
  }

  /**
   * Create a Stripe checkout session for subscription
   */
  static async createCheckoutSession(params: StripeCheckoutParams): Promise<{ sessionId: string; url: string }> {
    try {
      const result = await this.callEdgeFunction<{ sessionId: string; url: string }>(
        'stripe-create-checkout',
        params as unknown as Record<string, unknown>
      )
      return result
    } catch (error) {
      console.error('Error creating checkout session:', error)
      throw error
    }
  }

  /**
   * Create a customer portal session for managing subscription
   */
  static async createCustomerPortalSession(params: StripeCustomerPortalParams): Promise<{ url: string }> {
    try {
      const result = await this.callEdgeFunction<{ url: string }>(
        'stripe-customer-portal',
        params as unknown as Record<string, unknown>
      )
      return result
    } catch (error) {
      console.error('Error creating customer portal session:', error)
      throw error
    }
  }

  /**
   * Redirect to Stripe checkout
   */
  static async redirectToCheckout(params: StripeCheckoutParams): Promise<void> {
    try {
      console.log('🔧 Creating checkout session via Supabase Edge Function...');
      
      // ✅ Gebruik de verbeterde Supabase Edge Function
      const { url } = await this.createCheckoutSession(params)
      
      console.log('✅ Checkout session created, redirecting to:', url);
      window.location.href = url
      
    } catch (error) {
      console.error('❌ Error redirecting to checkout:', error)
      throw error
    }
  }

  /**
   * Redirect to Stripe customer portal
   */
  static async redirectToCustomerPortal(params: StripeCustomerPortalParams): Promise<void> {
    try {
      // Use fixed Stripe Customer Portal login URL provided by project owner
      // Open in a new tab to avoid losing the current session/context
      void params
      const portalUrl = 'https://billing.stripe.com/p/login/6oU28rfsE8nG5aUaSU7kc00'
      window.open(portalUrl, '_blank', 'noopener,noreferrer')
    } catch (error) {
      console.error('Error redirecting to customer portal:', error)
      throw error
    }
  }
}

export default StripeService
