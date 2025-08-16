import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { OnboardingLayout } from '@/components/onboarding/OnboardingLayout';
import { OnboardingProgress } from '@/components/onboarding/OnboardingProgress';
import { Step1Handle } from '@/components/onboarding/steps/Step1Handle';
import { Step2Booking } from '@/components/onboarding/steps/Step2Booking';
import { Step3Branding } from '@/components/onboarding/steps/Step3Branding';
import { Step4Extras } from '@/components/onboarding/steps/Step4Extras';
import { Step4PersonalImage } from '@/components/onboarding/steps/Step4PersonalImage';
import { Step5SocialTestimonials } from '@/components/onboarding/steps/Step5SocialTestimonials';
import { Step6Footer } from '@/components/onboarding/steps/Step6Footer';
import { Step7Preview } from '@/components/onboarding/steps/Step7Preview';
import { Json } from '@/integrations/supabase/types';
import StripeService from '@/services/stripeService';
import { useOnboardingData, OnboardingData } from '@/hooks/use-onboarding-data';
import { Skeleton } from '@/components/ui/skeleton';

export default function Onboarding() {
  const [searchParams] = useSearchParams();
  const [currentStep, setCurrentStep] = useState(1);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isLivePreviewActive, setIsLivePreviewActive] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  // Use optimized data hook
  const { 
    data: onboardingData, 
    setData: setOnboardingData, 
    isLoading: isInitialLoading, 
    profileId, 
    refreshData,
    cleanTestimonials 
  } = useOnboardingData();

  // Manual refresh function for testimonials data - simplified
  const refreshTestimonialsData = async () => {
    if (!profileId) return;
    await refreshData();
  };

  // Onboarding save function - simplified
  const saveOnboardingData = async (data: OnboardingData, forceCreate: boolean = false) => {
    if (!user?.id) return;

    try {
      const isUpdate = !forceCreate && (profileId || data.profileId);
      
      const profileData = {
        user_id: user.id,
        handle: data.handle,
        name: data.name || '',
        slogan: data.slogan || '',
        category: data.category || '',
        avatar_url: data.avatar_url || '',
        banner: data.banner || {},
        booking_url: data.bookingUrl || '',
        booking_mode: data.bookingMode || 'embed',
        use_whatsapp: data.useWhatsApp || false,
        whatsapp_number: data.whatsappNumber || '',
        about: {
          title: data.aboutTitle || '',
          description: data.aboutDescription || '',
          alignment: data.aboutAlignment || 'center',
          socialLinks: data.socialLinks || [],
        },
        media: data.media || { items: [] },
        socials: data.socials || {},
        testimonials: cleanTestimonials(data.testimonials || []),
        footer_business_name: data.footerBusinessName || '',
        footer_address: data.footerAddress || '',
        footer_email: data.footerEmail || '',
        footer_phone: data.footerPhone || '',
        footer_hours: data.footerHours || null,
        footer_next_available: data.footerNextAvailable || '',
        footer_cancellation_policy: data.footerCancellationPolicy || '',
        footer_privacy_policy: data.footerPrivacyPolicy || '',
        footer_terms_of_service: data.footerTermsOfService || '',
        footer_show_maps: data.footerShowMaps ?? true,
        footer_show_attribution: data.footerShowAttribution ?? true,
        footer: {},
        status: data.status || 'draft',
        onboarding_step: currentStep,
        onboarding_completed: currentStep >= 7,
      };

      if (isUpdate) {
        const { error } = await supabase
          .from('profiles')
          .update(profileData)
          .eq('id', profileId || data.profileId);

        if (error) throw error;
      } else {
        const { data: newProfile, error } = await supabase
          .from('profiles')
          .insert(profileData)
          .select('id')
          .single();

        if (error) throw error;
        if (newProfile) {
          setOnboardingData({ ...data, profileId: newProfile.id });
        }
      }
    } catch (error) {
      console.error('Error saving onboarding data:', error);
      toast({
        title: "Error",
        description: "Failed to save data",
        variant: "destructive",
      });
    }
  };

  // Initialize step from URL
  useEffect(() => {
    const stepFromUrl = parseInt(searchParams.get('step') || '1');
    if (stepFromUrl >= 1 && stepFromUrl <= 7) {
      setCurrentStep(stepFromUrl);
    }
  }, [searchParams]);

  // Check live preview status
  useEffect(() => {
    if (onboardingData.preview_expires_at) {
      const expiresAt = new Date(onboardingData.preview_expires_at);
      setIsLivePreviewActive(expiresAt > new Date());
    }
  }, [onboardingData.preview_expires_at]);

  const handleBack = () => {
    if (currentStep > 1) {
      const newStep = currentStep - 1;
      setCurrentStep(newStep);
      navigate(`/onboarding?step=${newStep}`);
    }
  };

  const handleNext = async () => {
    await saveOnboardingData(onboardingData);
    
    if (currentStep < 7) {
      const newStep = currentStep + 1;
      setCurrentStep(newStep);
      navigate(`/onboarding?step=${newStep}`);
    }
  };

  const handleStartLivePreview = async () => {
    if (!profileId && !onboardingData.profileId) {
      toast({
        title: "Error",
        description: "Please save your profile first",
        variant: "destructive",
      });
      return;
    }

    try {
      const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
      
      const { error } = await supabase
        .from('profiles')
        .update({
          preview_expires_at: expiresAt.toISOString(),
          preview_started_at: new Date().toISOString(),
        })
        .eq('id', profileId || onboardingData.profileId);

      if (error) throw error;

      setOnboardingData({ 
        ...onboardingData, 
        preview_expires_at: expiresAt.toISOString(),
        preview_started_at: new Date().toISOString(),
      });
      setIsLivePreviewActive(true);
      
      toast({
        title: "Live Preview Started",
        description: "Your profile is now live for 5 minutes",
      });
    } catch (error) {
      console.error('Error starting live preview:', error);
      toast({
        title: "Error",
        description: "Failed to start live preview",
        variant: "destructive",
      });
    }
  };

  const handlePublish = async () => {
    setIsPublishing(true);
    
    try {
      await saveOnboardingData({
        ...onboardingData,
        status: 'published'
      });

      const { error } = await supabase
        .from('profiles')
        .update({
          status: 'published',
          onboarding_completed: true,
          onboarding_step: 7
        })
        .eq('id', profileId || onboardingData.profileId);

      if (error) throw error;

      toast({
        title: "Profile Published!",
        description: "Your profile is now live and accessible to everyone.",
      });

      navigate('/dashboard');
    } catch (error) {
      console.error('Error publishing profile:', error);
      toast({
        title: "Error",
        description: "Failed to publish profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsPublishing(false);
    }
  };

  const handleSubscribe = async () => {
    if (!profileId && !onboardingData.profileId) {
      toast({
        title: "Error",
        description: "Please save your profile first",
        variant: "destructive",
      });
      return;
    }

    try {
      const { url } = await StripeService.createCheckoutSession({
        profileId: profileId || onboardingData.profileId!
      });
      window.location.href = url;
    } catch (error) {
      console.error('Error creating checkout session:', error);
      toast({
        title: "Error",
        description: "Failed to start subscription process",
        variant: "destructive",
      });
    }
  };

  // Show loading skeleton
  if (isInitialLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-2xl">
          <CardHeader>
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-64" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-6">
        <div className="mb-6">
          <OnboardingProgress currentStep={currentStep} totalSteps={7} />
        </div>

        <OnboardingLayout currentStep={currentStep} totalSteps={7}>
          {currentStep === 1 && (
            <Step1Handle
              onNext={(stepData) => {
                setOnboardingData({ ...onboardingData, ...stepData });
                handleNext();
              }}
              onBack={handleBack}
              existingData={onboardingData}
            />
          )}

          {currentStep === 2 && (
            <Step2Booking
              onNext={(stepData) => {
                setOnboardingData({ ...onboardingData, ...stepData });
                handleNext();
              }}
              onBack={handleBack}
              existingData={onboardingData}
            />
          )}

          {currentStep === 3 && (
            <Step3Branding
              onNext={(stepData) => {
                setOnboardingData({ ...onboardingData, ...stepData });
                handleNext();
              }}
              onBack={handleBack}
              existingData={onboardingData}
              requiresName={false}
            />
          )}

          {currentStep === 4 && (
            <Step4Extras
              onNext={(stepData) => {
                setOnboardingData({ ...onboardingData, ...stepData });
                handleNext();
              }}
              onBack={handleBack}
              existingData={onboardingData}
            />
          )}

          {currentStep === 5 && (
            <Step5SocialTestimonials
              onNext={(stepData) => {
                setOnboardingData({ ...onboardingData, ...stepData });
                handleNext();
              }}
              onBack={handleBack}
              existingData={onboardingData}
            />
          )}

          {currentStep === 6 && (
            <Step6Footer
              onNext={(stepData: any) => {
                setOnboardingData({ ...onboardingData, ...stepData });
                handleNext();
              }}
              onBack={handleBack}
              existingData={onboardingData}
            />
          )}

          {currentStep === 7 && (
            <Step7Preview
              profileData={onboardingData}
              onStartLivePreview={handleStartLivePreview}
              onPublish={handlePublish}
              onSubscribe={handleSubscribe}
              isLivePreviewActive={isLivePreviewActive}
              isPublishing={isPublishing}
            />
          )}
        </OnboardingLayout>
      </div>
    </div>
  );
}