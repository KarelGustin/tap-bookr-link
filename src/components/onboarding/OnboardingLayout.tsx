import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, X } from 'lucide-react';
import { OnboardingProgress } from './OnboardingProgress';
import { LanguageSelector } from '@/components/ui/language-selector';

interface OnboardingLayoutProps {
  children: React.ReactNode;
  currentStep: number;
  totalSteps: number;
  onNext?: () => void;
  onBack?: () => void;
  canGoNext?: boolean;
  canGoBack?: boolean;
  isLastStep?: boolean;
  isLoading?: boolean;
  title?: string;
  subtitle?: string;
  handle?: string;
  stepColor?: string;
}

// Step color mapping
const getStepColors = (step: number) => {
  const colorMap: Record<number, { bg: string; text: string }> = {
    1: { bg: 'bg-step-yellow', text: 'text-step-yellow-foreground' },
    2: { bg: 'bg-step-teal', text: 'text-step-teal-foreground' },
    3: { bg: 'bg-step-pink', text: 'text-step-pink-foreground' },
    4: { bg: 'bg-step-lavender', text: 'text-step-lavender-foreground' },
    5: { bg: 'bg-step-mint', text: 'text-step-mint-foreground' },
    6: { bg: 'bg-step-peach', text: 'text-step-peach-foreground' },
    7: { bg: 'bg-step-blue', text: 'text-step-blue-foreground' },
  };
  return colorMap[step] || { bg: 'bg-background', text: 'text-foreground' };
};

export const OnboardingLayout = ({ 
  children, 
  currentStep, 
  totalSteps, 
  onNext, 
  onBack, 
  canGoNext = true,
  canGoBack = true,
  isLastStep = false,
  isLoading = false,
  title,
  subtitle,
  handle,
  stepColor
}: OnboardingLayoutProps) => {
  const colors = getStepColors(currentStep);
  
  return (
    <div className={`min-h-screen ${colors.bg} animate-fade-in`}>
      {/* Simplified Header - only progress */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b">
        <OnboardingProgress currentStep={currentStep} totalSteps={totalSteps} />
      </div>

      {/* Mobile-first card layout */}
      <div className="pt-16 pb-safe">
        <div className="min-h-[calc(100vh-4rem)] flex flex-col">
          {/* Skip button (top right) */}
          <div className="absolute top-20 right-4 z-40 md:right-6">
            <LanguageSelector />
          </div>

          {/* Back button (top left) - only show if can go back */}
          {onBack && canGoBack && (
            <button
              onClick={onBack}
              disabled={isLoading}
              className={`absolute top-20 left-4 z-40 w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm border border-white/20 flex items-center justify-center shadow-soft button-press ${colors.text} hover:bg-white md:left-6`}
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}

          {/* Main content card */}
          <div className="flex-1 px-4 md:px-6 lg:px-8 flex items-center justify-center">
            <div className="w-full max-w-md mx-auto">
              <div className="bg-white/95 backdrop-blur-sm rounded-3xl p-6 md:p-8 shadow-card animate-slide-up">
                {/* Title Section */}
                {title && (
                  <div className="text-center mb-6">
                    <h1 className={`text-2xl md:text-3xl font-bold mb-3 ${colors.text}`}>
                      {title}
                    </h1>
                    {subtitle && (
                      <p className="text-base text-muted-foreground leading-relaxed">
                        {subtitle}
                      </p>
                    )}
                  </div>
                )}
                
                {/* Content */}
                <div className="space-y-6">
                  {children}
                </div>
              </div>
            </div>
          </div>

          {/* Fixed bottom navigation */}
          <div className="p-4 md:p-6 lg:p-8">
            <div className="max-w-md mx-auto">
              {onNext && (
                <Button
                  onClick={canGoNext ? onNext : undefined}
                  disabled={isLoading || !canGoNext}
                  className={`w-full h-14 text-lg font-semibold rounded-2xl shadow-button button-press animate-bounce-in ${
                    canGoNext 
                      ? 'bg-gray-900 hover:bg-gray-800 text-white' 
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
                  size="lg"
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                      Bezig...
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-2">
                      {isLastStep ? 'Live Preview Starten' : 'Volgende'}
                      <ArrowRight className="w-5 h-5" />
                    </div>
                  )}
                </Button>
              )}
              
              {/* Helper text for disabled state */}
              {onNext && !canGoNext && !isLoading && (
                <p className="text-center text-sm text-muted-foreground mt-3">
                  Vul alle vereiste velden in om door te gaan
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Desktop centering - hide mobile elements, show centered layout */}
      <style>{`
        @media (min-width: 1024px) {
          .min-h-screen {
            display: flex;
            align-items: center;
            justify-content: center;
          }
        }
      `}</style>
    </div>
  );
};