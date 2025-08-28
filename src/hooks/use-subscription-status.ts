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
				// 1) Load profile to obtain profile id and flags
				const { data: profile, error: profileError } = await supabase
					.from('profiles')
					.select('id, status, subscription_status, grace_period_ends_at')
					.eq('user_id', user.id)
					.maybeSingle()

				if (profileError) {
					console.error('Error loading subscription status:', profileError)
					setAllowed(false)
					return
				}

				// 2) Prefer real source of truth: subscriptions table
				let hasActiveSubscription = false
				if (profile?.id) {
					const { data: subActive, error: subError } = await supabase
						.from('subscriptions')
						.select('id')
						.eq('profile_id', profile.id)
						.eq('status', 'active')
						.maybeSingle()

					if (subError && subError.code !== 'PGRST116') {
						console.error('Error checking active subscription:', subError)
					}
					hasActiveSubscription = Boolean(subActive?.id)
				}

				// 3) Fallback to profile flags (published + active or grace)
				const nowIso = new Date().toISOString()
				const isPublished = profile?.status === 'published'
				const isProfileActive = profile?.subscription_status === 'active'
				const isPastDueInGrace =
					profile?.subscription_status === 'past_due' &&
					profile?.grace_period_ends_at &&
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

		// Set up real-time subscription for profile changes
		const channel = supabase
			.channel('subscription-status-changes')
			.on(
				'postgres_changes',
				{
					event: '*',
					schema: 'public',
					table: 'profiles',
					filter: `user_id=eq.${user?.id}`
				},
				() => {
					console.log('🔄 Profile subscription status changed, rechecking...')
					check()
				}
			)
			.on(
				'postgres_changes',
				{
					event: '*',
					schema: 'public',
					table: 'subscriptions'
				},
				() => {
					console.log('🔄 Subscription table changed, rechecking...')
					check()
				}
			)
			.subscribe()

		return () => {
			supabase.removeChannel(channel)
		}
	}, [user?.id])

	return { isLoading, allowed }
}
