import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { OnboardingLayout } from '../OnboardingLayout';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Info } from 'lucide-react';

interface Step1HandleProps {
  onNext: (data: { handle: string; businessName?: string; isBusiness: boolean }) => void;
  existingData?: {
    handle?: string;
    businessName?: string;
    isBusiness?: boolean;
  };
  handle?: string;
}

export const Step1Handle = ({ onNext, existingData }: Step1HandleProps) => {
  const { t } = useLanguage();
  const [handle, setHandle] = useState(existingData?.handle || '');
  const [businessName, setBusinessName] = useState(existingData?.businessName || '');
  const [isBusiness, setIsBusiness] = useState(existingData?.isBusiness || false);
  const [handleAvailable, setHandleAvailable] = useState(true);
  const [isChecking, setIsChecking] = useState(false);
  const [userHandle, setUserHandle] = useState<string | null>(null);
  const [isLoadingUserHandle, setIsLoadingUserHandle] = useState(true);
  const [useExistingHandle, setUseExistingHandle] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  // If user already has a handle, mark it as locked and available
  const [isHandleLocked, setIsHandleLocked] = useState(false);

  // Set initial state based on existing data
  useEffect(() => {
    if (existingData?.handle) {
      setHandle(existingData.handle);
      setIsHandleLocked(true);
    }
  }, [existingData?.handle]);

  // Fetch user's existing handle from database
  useEffect(() => {
    const fetchUserHandle = async () => {
      if (!user) return;
      
      try {
        setIsLoadingUserHandle(true);
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('handle')
          .eq('user_id', user.id)
          .single();
        
        if (error && error.code !== 'PGRST116') {
          console.error('Error fetching user handle:', error);
          return;
        }
        
        if (profile?.handle && !existingData?.handle) {
          setUserHandle(profile.handle);
          setHandle(profile.handle);
          setUseExistingHandle(true);
          setIsHandleLocked(true);
        }
      } catch (error) {
        console.error('Error fetching user handle:', error);
      } finally {
        setIsLoadingUserHandle(false);
      }
    };
    
    fetchUserHandle();
  }, [user, existingData?.handle]);

  useEffect(() => {
    if (handle.length >= 3 && !isHandleLocked) {
      checkHandleAvailability();
    }
  }, [handle, isHandleLocked]);

  const checkHandleAvailability = async () => {
    if (handle.length < 3) return;
    
    setIsChecking(true);
    try {
      // Simulate API call - replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Simple availability check (you can enhance this with actual API call)
      const isAvailable = !['admin', 'login', 'signup', 'www', 'api', 'help', 'support'].includes(handle.toLowerCase());
      setHandleAvailable(isAvailable);
    } catch (error) {
      console.error('Error checking handle availability:', error);
      setHandleAvailable(false);
    } finally {
      setIsChecking(false);
    }
  };

  const handleNext = () => {
    if (handle.length < 3) {
      toast({
        title: t('common.error'),
        description: t('validation.minLength').replace('{min}', '3'),
        variant: "destructive",
      });
      return;
    }

    if (!handleAvailable && !isHandleLocked && !useExistingHandle) {
      toast({
        title: t('common.error'),
        description: t('validation.handleExists'),
        variant: "destructive",
      });
      return;
    }

    onNext({
      handle: handle.toLowerCase(),
      businessName: businessName.trim() || undefined,
      isBusiness,
    });
  };

  const handleUseExistingHandle = () => {
    if (userHandle) {
      setHandle(userHandle);
      setUseExistingHandle(true);
      setHandleAvailable(true); // Mark as available since it's the user's own handle
    }
  };

  const handleChooseNewHandle = () => {
    setHandle('');
    setUseExistingHandle(false);
    setHandleAvailable(true);
  };

  const sanitizeHandle = (value: string) => {
    return value.toLowerCase().replace(/[^a-z0-9-_]/g, '');
  };

  return (
    <OnboardingLayout
      currentStep={1}
      totalSteps={7}
      onNext={handleNext}
      canGoNext={handle.length >= 3 && (handleAvailable || isHandleLocked || useExistingHandle)}
      title={t('onboarding.step1.title')}
      subtitle={t('onboarding.step1.subtitle')}
      handle={handle || userHandle}
    >
      <div className="space-y-6">
        {/* Existing Handle Box */}
        {userHandle && !existingData?.handle && (
          <Card className="bg-blue-50 border-blue-200">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-blue-600" />
                <CardTitle className="text-blue-900 text-lg">Je hebt al een handle!</CardTitle>
              </div>
              <CardDescription className="text-blue-800">
                Wil je verder gaan met je bestaande handle: <strong>@{userHandle}</strong>?
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex gap-3">
                <Button 
                  onClick={handleUseExistingHandle}
                  variant="default"
                  className="flex-1"
                >
                  Ja, gebruik mijn bestaande handle
                </Button>
                <Button 
                  onClick={handleChooseNewHandle}
                  variant="outline"
                  className="flex-1"
                >
                  Nee, kies een nieuwe handle
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Handle Limit Info */}
        <Card className="bg-amber-50 border-amber-200">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-amber-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-amber-900 mb-1">Belangrijke informatie</h4>
                <p className="text-sm text-amber-800">
                  Elke gebruiker kan maar <strong>één handle claimen</strong>. Zodra je een handle kiest, 
                  kun je deze niet meer wijzigen. Kies dus zorgvuldig!
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Handle input */}
        <div className="space-y-2">
          <Label htmlFor="handle" className="text-base font-medium">
            {t('onboarding.step1.handle.label')}
          </Label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
              {t('common.urlPrefix')}
            </span>
            <Input
              id="handle"
              value={handle}
              onChange={(e) => setHandle(sanitizeHandle(e.target.value))}
              className="pl-32 rounded-lg h-12"
              placeholder={t('onboarding.step1.handle.placeholder')}
              disabled={isHandleLocked}
            />
          </div>
          <p className="text-sm text-muted-foreground">
            {t('onboarding.step1.handle.description', { urlPrefix: t('common.urlPrefix') })}
          </p>
          {handle.length > 0 && !isHandleLocked && !useExistingHandle && (
            <div className={`text-sm ${handleAvailable ? 'text-green-600' : 'text-red-600'}`}>
              {isChecking ? t('common.loading') : (handleAvailable ? '✓ ' + t('common.available') : '✗ ' + t('common.unavailable'))}
            </div>
          )}
          {isHandleLocked && (
            <div className="text-sm text-blue-600">
              ✓ {t('common.handleLocked')}
            </div>
          )}
          {useExistingHandle && userHandle && (
            <div className="text-sm text-green-600">
              ✓ Je gebruikt je bestaande handle: @{userHandle}
            </div>
          )}
        </div>

        {/* Business Name */}
        {/* <div className="space-y-2">
          <Label htmlFor="businessName" className="text-base font-medium">
            {t('onboarding.step1.businessName.label')}
          </Label>
          <Input
            id="businessName"
            value={businessName}
            onChange={(e) => setBusinessName(e.target.value)}
            className="rounded-lg h-12"
            placeholder={t('onboarding.step1.businessName.placeholder')}
          />
        </div> */}

        {/* Is Business Checkbox */}
        {/* <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="isBusiness"
              checked={isBusiness}
              onCheckedChange={(checked) => setIsBusiness(checked as boolean)}
            />
            <Label htmlFor="isBusiness" className="text-base font-medium">
              {t('onboarding.step1.isBusiness.label')}
            </Label>
          </div>
          <p className="text-sm text-muted-foreground">
            {t('onboarding.step1.isBusiness.description')}
          </p>
        </div> */}
      </div>
    </OnboardingLayout>
  );
};