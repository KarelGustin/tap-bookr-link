import React from 'react';
import { Progress } from '@/components/ui/progress';
import { useLanguage } from '@/contexts/LanguageContext';

interface OnboardingProgressProps {
  currentStep: number;
  totalSteps: number;
}

export const OnboardingProgress = ({ currentStep, totalSteps }: OnboardingProgressProps) => {
  const progress = (currentStep / totalSteps) * 100;
  
  return (
    <div className="p-3">
      <div className="max-w-md mx-auto">
        {/* Progress bar only */}
        <div className="flex items-center gap-3">
          <span className="text-xs font-medium text-muted-foreground min-w-fit">
            {currentStep}/{totalSteps}
          </span>
          <div className="flex-1">
            <Progress value={progress} className="h-2" />
          </div>
          <span className="text-xs font-medium text-muted-foreground">
            {Math.round(progress)}%
          </span>
        </div>
      </div>
    </div>
  );
};