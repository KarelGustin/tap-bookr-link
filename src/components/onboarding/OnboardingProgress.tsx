import { Progress } from '@/components/ui/progress';

interface OnboardingProgressProps {
  currentStep: number;
  totalSteps: number;
}

export const OnboardingProgress = ({ currentStep, totalSteps }: OnboardingProgressProps) => {
  const progress = (currentStep / totalSteps) * 100;
  
  return (
    <div className="w-full">
      <Progress 
        value={progress} 
        className="h-1 bg-muted"
      />
    </div>
  );
};