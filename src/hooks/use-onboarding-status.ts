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

      try {
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('onboarding_completed, onboarding_step, status')
          .eq('user_id', user.id)
          .single();

        if (error) {
          console.error('Error checking onboarding status:', error);
          setIsLoading(false);
          return;
        }

        if (profile) {
          setOnboardingCompleted(profile.onboarding_completed || false);
          setCurrentStep(profile.onboarding_step || 1);
          
          // Als onboarding niet is voltooid, redirect naar onboarding
          if (!profile.onboarding_completed) {
            navigate(`/onboarding?step=${profile.onboarding_step || 1}`);
          }
        }
      } catch (error) {
        console.error('Error checking onboarding status:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkOnboardingStatus();
  }, [user, navigate]);

  return { 
    isLoading, 
    onboardingCompleted, 
    currentStep,
    redirectToOnboarding: () => navigate(`/onboarding?step=${currentStep}`)
  };
};
