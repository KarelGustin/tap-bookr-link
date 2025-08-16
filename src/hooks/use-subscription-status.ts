import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/integrations/supabase/client'

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
				const { data: profile, error } = await supabase
					.from('profiles')
					.select('status, subscription_status, grace_period_ends_at')
					.eq('user_id', user.id)
					.maybeSingle()

				if (error) {
					console.error('Error loading subscription status:', error)
					setAllowed(false)
					return
				}

				// Access rules:
				// - Page must be published AND
				// - subscription_status must be 'active' OR
				// - 'past_due' while grace_period_ends_at is in the future (3 day grace period)
				const nowIso = new Date().toISOString()
				const isPublished = profile?.status === 'published'
				const isActive = profile?.subscription_status === 'active'
				const isPastDueInGrace =
					profile?.subscription_status === 'past_due' &&
					profile?.grace_period_ends_at &&
					profile.grace_period_ends_at > nowIso

				const isAccessAllowed = Boolean(isPublished && (isActive || isPastDueInGrace))
				
				console.log('Subscription access check:', {
					isPublished,
					subscriptionStatus: profile?.subscription_status,
					isActive,
					isPastDueInGrace,
					gracePeriodEndsAt: profile?.grace_period_ends_at,
					currentTime: nowIso,
					finalAccess: isAccessAllowed
				})

				setAllowed(isAccessAllowed)
			} catch (e) {
				console.error('Subscription status check failed:', e)
				setAllowed(false)
			} finally {
				setIsLoading(false)
			}
		}
		check()
	}, [user?.id])

	return { isLoading, allowed }
}
