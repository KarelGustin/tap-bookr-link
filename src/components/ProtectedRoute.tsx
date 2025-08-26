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
	const { user, loading, session } = useAuth();
	const { isLoading: onboardingLoading, onboardingCompleted, currentStep } = useOnboardingStatus();
	const { isLoading: subscriptionLoading, allowed } = useSubscriptionStatus();
	const navigate = useNavigate();

	console.log('🔧 ProtectedRoute state:', {
		hasUser: !!user,
		hasSession: !!session,
		authLoading: loading,
		onboardingLoading,
		onboardingCompleted,
		currentStep,
		subscriptionLoading,
		subscriptionAllowed: allowed,
		requireOnboarding,
		requireActiveSubscription,
		path: window.location.pathname
	});

	useEffect(() => {
		// Wait for auth to be ready first
		if (loading) return;
		
		if (!user || !session) {
			console.log('🔧 No user/session, redirecting to login');
			navigate('/login');
			return;
		}
		
		// Wait for other loading states to complete
		if (onboardingLoading || (requireActiveSubscription && subscriptionLoading)) {
			console.log('🔧 Still loading onboarding or subscription status');
			return;
		}

		const currentPath = window.location.pathname;
		console.log('🔧 Checking protection rules for path:', currentPath);

		// Onboarding guard - redirect incomplete onboarding users
		if (requireOnboarding && !onboardingCompleted) {
			console.log('🔧 Onboarding required but not completed, redirecting to step:', currentStep || 1);
			navigate(`/onboarding?step=${currentStep || 1}`, { replace: true });
			return;
		}

		// Subscription guard - redirect users without active subscription away from protected areas
		if (requireActiveSubscription && !allowed) {
			console.log('🔧 Active subscription required but not found, redirecting to payment');
			navigate('/onboarding?step=7&subscription_required=true', { replace: true });
			return;
		}

		// Main flow logic - handle root route and smart redirects
		if (currentPath === '/' || currentPath === '/login') {
			if (!onboardingCompleted) {
				// User needs to complete onboarding first
				console.log('🔧 Root redirect: onboarding incomplete, going to step:', currentStep || 1);
				navigate(`/onboarding?step=${currentStep || 1}`, { replace: true });
				return;
			} else if (onboardingCompleted && allowed) {
				// User has completed onboarding AND has active subscription → Dashboard
				console.log('🔧 Root redirect: auto-redirecting to dashboard - user has active subscription');
				navigate('/dashboard', { replace: true });
				return;
			} else if (onboardingCompleted && !allowed) {
				// User completed onboarding but NO active subscription → Payment step
				console.log('🔧 Root redirect: onboarding complete but no subscription, going to payment');
				navigate('/onboarding?step=7', { replace: true });
				return;
			}
		}

		// Handle onboarding page redirect for users with active subscription
		if (currentPath === '/onboarding' && onboardingCompleted && allowed) {
			console.log('🔧 Onboarding redirect: user already has subscription, going to dashboard');
			navigate('/dashboard', { replace: true });
			return;
		}
	}, [user, session, loading, onboardingLoading, onboardingCompleted, currentStep, subscriptionLoading, allowed, requireOnboarding, requireActiveSubscription, navigate]);

	// Show loading state
	if (loading || onboardingLoading || (requireActiveSubscription && subscriptionLoading)) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<div className="text-center">
					<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
					<p className="text-gray-600">Laden...</p>
				</div>
			</div>
		);
	}

	// If user is not logged in, redirect will be handled by useEffect
	if (!user || !session) {
		return null;
	}

	// If onboarding status doesn't match requirements, redirect will be handled by useEffect
	if (requireOnboarding && !onboardingCompleted) {
		return null;
	}

	// Subscription gating, redirect will be handled by useEffect
	if (requireActiveSubscription && !allowed) {
		return null;
	}

	return <>{children}</>;
};
