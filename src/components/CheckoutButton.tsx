import { useState } from 'react'

export function CheckoutButton({ profileId }: { profileId: string }) {
  const [isLoading, setIsLoading] = useState(false)

  const handleCheckout = async () => {
    setIsLoading(true)
    
    try {
      const response = await fetch('/api/stripe-create-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          profileId: profileId,
          successUrl: `${window.location.origin}/dashboard?success=true`,
          cancelUrl: `${window.location.origin}/dashboard?canceled=true`,
        }),
      })

      if (!response.ok) {
        throw new Error('Checkout session creation failed')
      }

      const { url } = await response.json()
      window.location.href = url
      
    } catch (error) {
      console.error('Error:', error)
      alert('Er ging iets mis bij het starten van de checkout')
    } finally {
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
