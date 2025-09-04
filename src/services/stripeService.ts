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
   * Redirect to Stripe checkout with fallback strategies for Dutch banks
   */
  static async redirectToCheckout(params: StripeCheckoutParams): Promise<void> {
    try {
      console.log('🔧 Creating checkout session via Supabase Edge Function...');
      
      // Create checkout session
      const { url } = await this.createCheckoutSession(params)
      
      console.log('✅ Checkout session created, redirecting to:', url);

      // Detecteer Nederlandse banken en gebruik verschillende redirect strategieën
      const userAgent = navigator.userAgent.toLowerCase()
      const isKnab = userAgent.includes('knab') || document.referrer.includes('knab')
      const isDutchBank = isKnab || userAgent.includes('ideal') || userAgent.includes('rabobank') || userAgent.includes('ing')
      
      if (isDutchBank) {
        console.log('🏦 Dutch bank detected, using popup strategy')
        // Voor Nederlandse banken: gebruik popup window
        const popup = window.open(url, '_blank', 'width=800,height=600,scrollbars=yes,resizable=yes')
        
        // Check if popup was blocked
        if (!popup || popup.closed || typeof popup.closed === 'undefined') {
          console.log('🚫 Popup blocked, falling back to same window redirect')
          window.location.href = url
        } else {
          // Monitor popup for completion
          const checkClosed = setInterval(() => {
            if (popup.closed) {
              clearInterval(checkClosed)
              console.log('💳 Payment window closed, checking status...')
              // Kleine delay voor webhook processing
              setTimeout(() => {
                window.location.reload()
              }, 2000)
            }
          }, 1000)
          
          // Cleanup after 30 minutes
          setTimeout(() => {
            clearInterval(checkClosed)
            if (!popup.closed) {
              popup.close()
            }
          }, 30 * 60 * 1000)
        }
      } else {
        // Voor andere browsers: normale redirect
        window.location.href = url
      }
      
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
