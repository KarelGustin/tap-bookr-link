import { supabase } from '@/integrations/supabase/client'

export interface StripeCheckoutParams {
  profileId: string
  successUrl?: string
  cancelUrl?: string
}

export interface StripeCustomerPortalParams {
  profileId: string
}

export class StripeService {
  private static async callEdgeFunction<T>(
    functionName: string,
    params: any
  ): Promise<T> {
    const { data, error } = await supabase.functions.invoke(functionName, {
      body: params,
    })

    if (error) {
      throw new Error(error.message)
    }

    return data
  }

  /**
   * Create a Stripe checkout session for subscription
   */
  static async createCheckoutSession(params: StripeCheckoutParams): Promise<{ sessionId: string; url: string }> {
    try {
      const result = await this.callEdgeFunction<{ sessionId: string; url: string }>(
        'stripe-create-checkout',
        params
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
        params
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
      const { url } = await this.createCheckoutSession(params)
      window.location.href = url
    } catch (error) {
      console.error('Error redirecting to checkout:', error)
      throw error
    }
  }

  /**
   * Redirect to Stripe customer portal
   */
  static async redirectToCustomerPortal(params: StripeCustomerPortalParams): Promise<void> {
    try {
      const { url } = await this.createCustomerPortalSession(params)
      window.location.href = url
    } catch (error) {
      console.error('Error redirecting to customer portal:', error)
      throw error
    }
  }
}

export default StripeService
