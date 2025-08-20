import { NextApiRequest, NextApiResponse } from 'next'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-07-30.basil'
})

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    const { profileId, successUrl, cancelUrl } = req.body

    if (!profileId) {
      return res.status(400).json({ error: 'Profile ID is required' })
    }

    const priceId = process.env.STRIPE_PRICE_ID
    if (!priceId) {
      return res.status(500).json({ error: 'STRIPE_PRICE_ID not configured' })
    }

    // Maak checkout session aan
    const session = await stripe.checkout.sessions.create({
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription', // ✅ Belangrijk: subscription mode
      success_url: successUrl || `${req.headers.origin}/dashboard?success=true`,
      cancel_url: cancelUrl || `${req.headers.origin}/onboarding?step=7`,
      
      // ✅ Metadata voor profile_id
      metadata: {
        profile_id: profileId,
      },
      
      // ✅ Subscription metadata
      subscription_data: {
        metadata: {
          profile_id: profileId,
        },
      },
      
      customer_creation: 'always',
    })

    res.status(200).json({ 
      sessionId: session.id, 
      url: session.url 
    })

  } catch (error) {
    console.error('Error creating checkout session:', error)
    res.status(500).json({ 
      error: (error as Error).message 
    })
  }
}
