import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { getProfileByUserId, getActiveSubscription, watchProfileByUserId } from '@/integrations/firebase/db'

export const useSubscriptionStatus = () => {
	const { user } = useAuth()
	const [isLoading, setIsLoading] = useState(true)
	const [allowed, setAllowed] = useState(false)

	useEffect(() => {
		const check = async () => {
			if (!user?.id) {
				setAllowed(false)
				setIsLoading(false)
				return
			}

			try {
				// 1) Load profile to obtain profile id and flags
				const profile = await getProfileByUserId(user.id)

				if (!profile) {
					setAllowed(false)
					setIsLoading(false)
					return
				}

				// 2) Check for active subscription
				let hasActiveSubscription = false
				if (profile.id) {
					const activeSub = await getActiveSubscription(profile.id)
					hasActiveSubscription = Boolean(activeSub)
				}

				// 3) Fallback to profile flags (published + active or grace)
				const nowIso = new Date().toISOString()
				const isPublished = profile.status === 'published'
				const isProfileActive = profile.subscription_status === 'active'
				const isPastDueInGrace =
					profile.subscription_status === 'past_due' &&
					profile.grace_period_ends_at &&
					profile.grace_period_ends_at > nowIso

				setAllowed(
					hasActiveSubscription || Boolean(isPublished && (isProfileActive || isPastDueInGrace))
				)
			} catch (e) {
				console.error('Subscription status check failed:', e)
				setAllowed(false)
			} finally {
				setIsLoading(false)
			}
		}

		check()

		// Set up real-time listener for profile changes
		if (user?.id) {
			const unsubscribe = watchProfileByUserId(user.id, () => {
				console.log('🔄 Profile subscription status changed, rechecking...')
				check()
			})

			return () => {
				unsubscribe()
			}
		}
	}, [user?.id])

	return { isLoading, allowed }
}
