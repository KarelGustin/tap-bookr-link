import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getProfileByUserId } from '@/integrations/firebase/db';
import { useNavigate } from 'react-router-dom';

export const useOnboardingStatus = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [onboardingCompleted, setOnboardingCompleted] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  useEffect(() => {
    const checkOnboardingStatus = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }

      console.log('🔧 Checking onboarding status for user:', user.id);

      try {
        const profile = await getProfileByUserId(user.id);

        if (profile) {
          console.log('🔧 Profile found:', { 
            onboarding_completed: profile.onboarding_completed, 
            onboarding_step: profile.onboarding_step 
          });
          setOnboardingCompleted(profile.onboarding_completed || false);
          setCurrentStep(profile.onboarding_step || 1);
        } else {
          console.log('🔧 No profile found, defaulting to step 1');
          setOnboardingCompleted(false);
          setCurrentStep(1);
        }
      } catch (error) {
        console.error('🔧 Error checking onboarding status:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkOnboardingStatus();
  }, [user?.id]);

  return { 
    isLoading, 
    onboardingCompleted, 
    currentStep,
    redirectToOnboarding: () => navigate(`/onboarding?step=${currentStep}`)
  };
};
