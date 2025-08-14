import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
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
}

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
  handle
}: OnboardingLayoutProps) => {
  return (
    <div className="min-h-screen bg-background">
      {/* Header met taalselector */}
      <div className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center gap-2">
            {/* <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">B</span>
            </div> */}
            <span className="font-semibold text-lg text-gray-900">TapBookr</span>
            {handle && (
              <div className="ml-4 px-3 py-1 bg-gray-100 rounded-full">
                <span className="text-sm text-gray-600">@{handle}</span>
              </div>
            )}
          </div>
          <LanguageSelector />
        </div>
      </div>

      {/* Progress bar */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b">
        <OnboardingProgress currentStep={currentStep} totalSteps={totalSteps} />
      </div>

      {/* Main content */}
      <div className="pt-20 pb-8">
        <div className="container mx-auto px-4 max-w-2xl">
          {title && (
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{title}</h1>
              {subtitle && <p className="text-lg text-gray-600">{subtitle}</p>}
            </div>
          )}
          
          {children}
          
          {/* Navigation buttons */}
          {(onNext || onBack) && (
            <div className="flex justify-between mt-8 pt-6 border-t">
              <div>
                {onBack && canGoBack && (
                  <Button
                    variant="outline"
                    onClick={onBack}
                    disabled={isLoading}
                    className="flex items-center gap-2"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Terug
                  </Button>
                )}
              </div>
              
              <div>
                {onNext && canGoNext && (
                  <Button
                    onClick={onNext}
                    disabled={isLoading}
                    className="flex items-center gap-2"
                  >
                    {isLastStep ? 'Live Preview Inschakelen (15 min)' : 'Volgende'}
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};