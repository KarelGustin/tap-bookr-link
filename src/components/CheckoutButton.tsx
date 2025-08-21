import { useState } from 'react'
import { StripeService } from '@/services/stripeService'

export function CheckoutButton({ profileId }: { profileId: string }) {
  const [isLoading, setIsLoading] = useState(false)

  const handleCheckout = async () => {
    setIsLoading(true)
    
    try {
      await StripeService.redirectToCheckout({
        profileId: profileId,
        successUrl: `${window.location.origin}/dashboard?success=true&subscription=active`,
        cancelUrl: `${window.location.origin}/onboarding?step=7`,
      })
    } catch (error) {
      console.error('Error:', error)
      alert('Er ging iets mis bij het starten van de checkout')
      setIsLoading(false)
    }
  }

  return (
    <button 
      onClick={handleCheckout}
      disabled={isLoading}
      className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
    >
      {isLoading ? 'Laden...' : 'Start Abonnement'}
    </button>
  )
}
