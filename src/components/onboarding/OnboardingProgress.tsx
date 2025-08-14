import React from 'react';
import { Progress } from '@/components/ui/progress';
import { useLanguage } from '@/contexts/LanguageContext';

interface OnboardingProgressProps {
  currentStep: number;
  totalSteps: number;
}

export const OnboardingProgress = ({ currentStep, totalSteps }: OnboardingProgressProps) => {
  const { t } = useLanguage();
  
  const steps = [
    { key: 1, label: t('onboarding.step1.title') },
    { key: 2, label: t('onboarding.step2.title') },
    { key: 3, label: t('onboarding.step3.title') },
    { key: 4, label: t('onboarding.step4.title') },
    { key: 5, label: t('onboarding.step5.title') },
    { key: 6, label: t('onboarding.step6.title') },
    { key: 7, label: t('onboarding.step7.title') },
  ];

  const progress = (currentStep / totalSteps) * 100;
  
  return (
    <div className="p-4">
      <div className="max-w-2xl mx-auto">
        {/* Progress bar */}
        <div className="mb-4">
          <Progress value={progress} className="h-2" />
        </div>
        
        {/* Step labels */}
        <div className="flex justify-between text-xs text-muted-foreground">
          {steps.map((step) => (
            <div
              key={step.key}
              className={`flex-1 text-center ${
                step.key <= currentStep ? 'text-foreground font-medium' : ''
              }`}
            >
              {step.label}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};