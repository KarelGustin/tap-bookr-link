import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useOnboardingStatus } from '@/hooks/use-onboarding-status';
import { useNavigate } from 'react-router-dom';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireOnboarding?: boolean; // true = moet onboarding hebben, false = mag geen onboarding hebben
}

export const ProtectedRoute = ({ 
  children, 
  requireOnboarding = true 
}: ProtectedRouteProps) => {
  const { user } = useAuth();
  const { isLoading, onboardingCompleted } = useOnboardingStatus();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && user) {
      if (requireOnboarding && !onboardingCompleted) {
        // Gebruiker moet onboarding afmaken
        navigate('/onboarding');
      } else if (!requireOnboarding && onboardingCompleted) {
        // Gebruiker heeft onboarding al afgerond, redirect naar dashboard
        navigate('/dashboard');
      }
    }
  }, [isLoading, user, onboardingCompleted, requireOnboarding, navigate]);

  // Toon loading state
  if (isLoading) {
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

  if (!requireOnboarding && onboardingCompleted) {
    return null; // Redirect wordt afgehandeld door useEffect
  }

  return <>{children}</>;
};
