import { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { OnboardingProgress } from './OnboardingProgress';

interface OnboardingLayoutProps {
  children: ReactNode;
  currentStep: number;
  totalSteps: number;
  onBack?: () => void;
  onSkip?: () => void;
  canSkip?: boolean;
  title: string;
  subtitle?: string;
}

export const OnboardingLayout = ({ 
  children, 
  currentStep, 
  totalSteps, 
  onBack, 
  onSkip, 
  canSkip = false,
  title,
  subtitle
}: OnboardingLayoutProps) => {
  return (
    <div className="min-h-screen bg-background">
      {/* Progress bar */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b">
        <OnboardingProgress currentStep={currentStep} totalSteps={totalSteps} />
        
        {/* Navigation */}
        <div className="flex items-center justify-between p-4 max-w-2xl mx-auto">
          {onBack ? (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onBack}
              className="text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          ) : (
            <div />
          )}
          
          {canSkip && onSkip && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onSkip}
              className="text-muted-foreground hover:text-foreground"
            >
              Skip
            </Button>
          )}
        </div>
      </div>
      
      {/* Main content */}
      <div className="pt-24 px-3 pb-8 max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            {title}
          </h1>
          {subtitle && (
            <p className="text-muted-foreground text-lg">
              {subtitle}
            </p>
          )}
        </div>
        
        {children}
      </div>
    </div>
  );
};