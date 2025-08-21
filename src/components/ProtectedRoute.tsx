import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useOnboardingStatus } from '@/hooks/use-onboarding-status';
import { useSubscriptionStatus } from '@/hooks/use-subscription-status';
import { useNavigate } from 'react-router-dom';

interface ProtectedRouteProps {
	children: React.ReactNode;
	requireOnboarding?: boolean; // true = moet onboarding hebben, false = mag geen onboarding hebben
	requireActiveSubscription?: boolean; // true = alleen met actief/grace abonnement + published
}

export const ProtectedRoute = ({ 
	children, 
	requireOnboarding = true,
	requireActiveSubscription = false,
}: ProtectedRouteProps) => {
	const { user } = useAuth();
	const { isLoading: onboardingLoading, onboardingCompleted, currentStep } = useOnboardingStatus();
	const { isLoading: subscriptionLoading, allowed } = useSubscriptionStatus();
	const navigate = useNavigate();

	useEffect(() => {
		if (!user) return;
		
		// Wait for all loading states to complete
		if (onboardingLoading || subscriptionLoading) return;

		const currentPath = window.location.pathname;

		// Onboarding guard - redirect incomplete onboarding users
		if (requireOnboarding && !onboardingCompleted) {
			navigate(`/onboarding?step=${currentStep || 1}`, { replace: true });
			return;
		}

		// Subscription guard - redirect users without active subscription away from protected areas
		if (requireActiveSubscription && !allowed) {
			navigate('/onboarding?step=7&subscription_required=true', { replace: true });
			return;
		}

		// Smart redirect logic for completed users with active subscriptions
		if (onboardingCompleted && allowed) {
			// Redirect from login, root, or onboarding to dashboard
			if (currentPath === '/login' || currentPath === '/' || currentPath === '/onboarding') {
				console.log('🔧 Auto-redirecting to dashboard - user has active subscription');
				navigate('/dashboard', { replace: true });
				return;
			}
		} else if (onboardingCompleted && !allowed) {
			// User completed onboarding but no active subscription - send to preview/payment
			if (currentPath === '/login' || currentPath === '/') {
				navigate('/onboarding?step=7', { replace: true });
				return;
			}
		} else if (!onboardingCompleted) {
			// User needs to complete onboarding
			if (currentPath === '/login' || currentPath === '/') {
				navigate(`/onboarding?step=${currentStep || 1}`, { replace: true });
				return;
			}
		}
	}, [user, onboardingLoading, onboardingCompleted, currentStep, subscriptionLoading, allowed, requireOnboarding, requireActiveSubscription, navigate]);

	// Toon loading state
	
	if (onboardingLoading || (requireActiveSubscription && subscriptionLoading)) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<div className="text-center">
					<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
					<p className="text-gray-600">Laden...</p>
				</div>
			</div>
		);
	}

	// Als gebruiker niet is ingelogd
	if (!user) {
		navigate('/login');
		return null;
	}

	// Als onboarding status niet overeenkomt met vereiste
	if (requireOnboarding && !onboardingCompleted) {
		return null; // Redirect wordt afgehandeld door useEffect
	}

	// Subscription gating
	if (requireActiveSubscription && !allowed) {
		return null; // Redirect via effect
	}

	return <>{children}</>;
};
