import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
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
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('onboarding_completed, onboarding_step, status')
          .eq('user_id', user.id)
          .maybeSingle(); // Use maybeSingle to handle case where profile might not exist yet

        if (error) {
          console.error('🔧 Error checking onboarding status:', error);
          setIsLoading(false);
          return;
        }

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
  }, [user?.id]); // Only depend on user.id, not navigate

  return { 
    isLoading, 
    onboardingCompleted, 
    currentStep,
    redirectToOnboarding: () => navigate(`/onboarding?step=${currentStep}`)
  };
};
