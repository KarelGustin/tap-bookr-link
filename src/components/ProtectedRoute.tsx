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
	const { isLoading: onboardingLoading, onboardingCompleted } = useOnboardingStatus();
	const { isLoading: subscriptionLoading, allowed } = useSubscriptionStatus();
	const navigate = useNavigate();

	useEffect(() => {
		if (!user) return;

		// Onboarding guard
		if (!onboardingLoading) {
			if (requireOnboarding && !onboardingCompleted) {
				navigate('/onboarding?step=7', { replace: true });
				return;
			}
			// Remove the aggressive auto-redirect to dashboard
			// Let users stay where they are, especially on onboarding page
		}

		// Subscription guard (for dashboard-like pages)
		if (requireActiveSubscription && !subscriptionLoading) {
			if (!allowed) {
				// Geen geldig abonnement of niet published: terug naar onboarding preview
				navigate('/onboarding?step=7', { replace: true });
				return;
			}
		}
	}, [user, onboardingLoading, onboardingCompleted, requireOnboarding, subscriptionLoading, requireActiveSubscription, allowed, navigate]);

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
