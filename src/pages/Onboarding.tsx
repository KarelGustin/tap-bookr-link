import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useOnboardingAutoSave } from '@/hooks/use-onboarding-auto-save';
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

interface BusinessHours {
  monday: { open: string; close: string; closed: boolean };
  tuesday: { open: string; close: string; closed: boolean };
  wednesday: { open: string; close: string; closed: boolean };
  thursday: { open: string; close: string; closed: boolean };
  friday: { open: string; close: string; closed: boolean };
  saturday: { open: string; close: string; closed: boolean };
  sunday: { open: string; close: string; closed: boolean };
  [key: string]: { open: string; close: string; closed: boolean };
}

interface OnboardingData {
  // Step 1
  handle: string;
  status?: string;
  
  // Step 2
  bookingUrl?: string;
  bookingMode?: 'embed' | 'new_tab';
  useWhatsApp?: boolean;
  whatsappNumber?: string;
  
  // Step 3 - Enhanced Branding
  name?: string;
  slogan?: string;
  avatarFile?: File;
  avatarUrl?: string;
  category?: string;
  accentColor?: string;
  themeMode?: 'light' | 'dark';
  
  // Step 4 - Media/Extras
  bannerType?: 'image' | 'video';
  bannerFile?: File;
  bannerUrl?: string;
  socialProofs?: Array<{
    id: string;
    type: 'featured_in' | 'client_logo' | 'certification';
    imageUrl?: string;
    imageFile?: File;
    title?: string;
    subtitle?: string;
  }>;
  
  // Social Testimonials (Step 5)
  testimonials?: Array<{
    id: string;
    name: string;
    avatar?: string;
    avatarFile?: File;
    review: string;
    rating: number;
    platform?: 'google' | 'facebook' | 'linkedin' | 'custom';
    verified?: boolean;
  }>;
  
  // Footer (Step 6)
  footerBusinessName?: string;
  footerEmail?: string;
  footerPhone?: string;
  footerAddress?: string;
  footerHours?: BusinessHours;
  footerNextAvailable?: string;
  footerCancellationPolicy?: string;
  footerPrivacyPolicy?: string;
  footerTermsOfService?: string;
  footerShowMaps?: boolean;
  footerShowAttribution?: boolean;
  
  // Social links
  socials?: {
    website?: string;
    instagram?: string;
    facebook?: string;
    linkedin?: string;
    twitter?: string;
    youtube?: string;
    tiktok?: string;
    whatsapp?: string;
  };
  
  // Internal tracking
  profileId?: string;
}

const Onboarding = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [currentStep, setCurrentStep] = useState(1);
  const [onboardingData, setOnboardingData] = useState<OnboardingData>({
    handle: '',
    bookingUrl: '',
    bookingMode: 'embed',
    useWhatsApp: false,
    whatsappNumber: '',
    bannerType: 'image',
    socials: {},
    testimonials: [],
    socialProofs: [],
    footerShowMaps: true,
    footerShowAttribution: true,
    accentColor: '#6E56CF',
    themeMode: 'light',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const hasInitializedRef = useRef(false);

  // Load existing profile data
  useEffect(() => {
    const loadExistingProfile = async () => {
      if (!user?.id || hasInitializedRef.current) return;
      
      setIsLoading(true);
      
      try {
        const { data: existingProfile, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (error && error.code !== 'PGRST116') {
          console.error('Error loading profile:', error);
          return;
        }

        if (existingProfile) {
          setOnboardingData(prev => ({
            ...prev,
            profileId: existingProfile.id,
            handle: existingProfile.handle || prev.handle,
            name: existingProfile.name || prev.name,
            slogan: existingProfile.slogan || prev.slogan,
            category: existingProfile.category || prev.category,
            status: existingProfile.status || prev.status,
            bookingUrl: existingProfile.booking_url || prev.bookingUrl,
            bookingMode: (existingProfile.booking_mode as 'embed' | 'new_tab') || prev.bookingMode,
            useWhatsApp: existingProfile.use_whatsapp || prev.useWhatsApp,
            whatsappNumber: existingProfile.whatsapp_number || prev.whatsappNumber,
            avatarUrl: existingProfile.avatar_url || prev.avatarUrl,
            accentColor: existingProfile.accent_color || prev.accentColor,
            themeMode: (existingProfile.theme_mode as 'light' | 'dark') || prev.themeMode,
            footerBusinessName: existingProfile.footer_business_name || prev.footerBusinessName,
            footerEmail: existingProfile.footer_email || prev.footerEmail,
            footerPhone: existingProfile.footer_phone || prev.footerPhone,
            footerAddress: existingProfile.footer_address || prev.footerAddress,
            footerNextAvailable: existingProfile.footer_next_available || prev.footerNextAvailable,
            footerCancellationPolicy: existingProfile.footer_cancellation_policy || prev.footerCancellationPolicy,
            footerPrivacyPolicy: existingProfile.footer_privacy_policy || prev.footerPrivacyPolicy,
            footerTermsOfService: existingProfile.footer_terms_of_service || prev.footerTermsOfService,
            footerShowMaps: existingProfile.footer_show_maps ?? prev.footerShowMaps,
            footerShowAttribution: existingProfile.footer_show_attribution ?? prev.footerShowAttribution,
          }));
          
          // Navigate to correct step if onboarding is in progress
          if (existingProfile.onboarding_step && existingProfile.onboarding_step > 1) {
            setCurrentStep(existingProfile.onboarding_step);
          }
        }
        
        hasInitializedRef.current = true;
      } catch (error) {
        console.error('Error in loadExistingProfile:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadExistingProfile();
  }, [user?.id]);

  // Update step based on URL parameter
  useEffect(() => {
    const step = parseInt(searchParams.get('step') || '1');
    if (step >= 1 && step <= 8) {
      setCurrentStep(step);
    }
  }, [searchParams]);

  // Auto-save functionality
  useOnboardingAutoSave(onboardingData.profileId || '', onboardingData, {
    enabled: hasInitializedRef.current && !!onboardingData.profileId,
    delay: 2000,
  });

  const updateStep = useCallback((step: number) => {
    setCurrentStep(step);
    const url = new URL(window.location.href);
    url.searchParams.set('step', step.toString());
    window.history.replaceState({}, '', url.toString());
  }, []);

  const goBack = useCallback(() => {
    if (currentStep > 1) {
      updateStep(currentStep - 1);
    } else {
      navigate('/');
    }
  }, [currentStep, updateStep, navigate]);

  // Database update functions
  const patchFieldToDatabase = async (field: string, value: any) => {
    if (!onboardingData.profileId) return;

    const fieldMapping: Record<string, string> = {
      'handle': 'handle',
      'name': 'name',
      'slogan': 'slogan',
      'category': 'category',
      'bookingUrl': 'booking_url',
      'bookingMode': 'booking_mode',
      'useWhatsApp': 'use_whatsapp',
      'whatsappNumber': 'whatsapp_number',
      'avatarUrl': 'avatar_url',
      'accentColor': 'accent_color',
      'themeMode': 'theme_mode',
      'footerBusinessName': 'footer_business_name',
      'footerEmail': 'footer_email',
      'footerPhone': 'footer_phone',
      'footerAddress': 'footer_address',
      'footerNextAvailable': 'footer_next_available',
      'footerCancellationPolicy': 'footer_cancellation_policy',
      'footerPrivacyPolicy': 'footer_privacy_policy',
      'footerTermsOfService': 'footer_terms_of_service',
      'footerShowMaps': 'footer_show_maps',
      'footerShowAttribution': 'footer_show_attribution',
    };

    const dbField = fieldMapping[field] || field;
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ [dbField]: value, updated_at: new Date().toISOString() })
        .eq('id', onboardingData.profileId);

      if (error) throw error;
    } catch (error) {
      console.error(`Error updating ${field}:`, error);
      toast({
        title: "Save Failed",
        description: `Error saving ${field}. Please try again.`,
        variant: "destructive",
      });
    }
  };

  // Step handlers
  const handleStep1 = async (data: { handle: string }) => {
    console.log('🔧 Step 1 data received:', data);
    
    try {
      // Profile should already exist since it's created automatically on signup
      // Just update the handle
      const updatedData = { ...onboardingData, ...data };
      setOnboardingData(updatedData);
      
      // Update the profile with the new handle
      if (onboardingData.profileId) {
        await patchFieldToDatabase('handle', data.handle);
      } else {
        // If for some reason profileId is missing, fetch the profile
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('id')
          .eq('user_id', user?.id)
          .single();
          
        if (profile) {
          setOnboardingData(prev => ({ ...prev, profileId: profile.id }));
          await patchFieldToDatabase('handle', data.handle);
        } else {
          console.error('No profile found for user:', error);
          toast({
            title: "Profile Error",
            description: "Could not find your profile. Please try refreshing the page.",
            variant: "destructive",
          });
          return;
        }
      }
      
      // Go to next step
      updateStep(2);
      
    } catch (error) {
      console.error('Error in handleStep1:', error);
      toast({
        title: "Error",
        description: "Failed to save handle. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleStep2 = async (data: { 
    bookingUrl?: string; 
    bookingMode?: 'embed' | 'new_tab';
    useWhatsApp?: boolean;
    whatsappNumber?: string;
  }) => {
    console.log('🔧 Step 2 data received:', data);
    console.log('🔧 Step 2 data received:', data);
    
    const updatedData = { ...onboardingData, ...data };
    setOnboardingData(updatedData);
    
    // Save each field
    if (data.bookingUrl !== undefined) {
      await patchFieldToDatabase('bookingUrl', data.bookingUrl);
    }
    if (data.bookingMode !== undefined) {
      await patchFieldToDatabase('bookingMode', data.bookingMode);
    }
    if (data.useWhatsApp !== undefined) {
      await patchFieldToDatabase('useWhatsApp', data.useWhatsApp);
    }
    if (data.whatsappNumber !== undefined) {
      await patchFieldToDatabase('whatsappNumber', data.whatsappNumber);
    }
    
    updateStep(3);
  };

  const handleStep3 = async (data: {
    businessName?: string;
    slogan?: string;
    category?: string;
    banner?: { 
      type: 'image'; 
      imageUrl?: string; 
      textColor?: string; 
    };
  }) => {
    console.log('🔧 Step 3 data received:', data);
    
    const updatedData = { ...onboardingData, name: data.businessName, slogan: data.slogan, category: data.category };
    setOnboardingData(updatedData);
    
    // Save each field
    if (data.businessName !== undefined) {
      await patchFieldToDatabase('name', data.businessName);
    }
    if (data.slogan !== undefined) {
      await patchFieldToDatabase('slogan', data.slogan);
    }
    if (data.category !== undefined) {
      await patchFieldToDatabase('category', data.category);
    }
    
    updateStep(4);
  };

  const handleStep4 = async (data: {
    aboutAlignment?: 'center' | 'left';
    aboutPhotoFile?: File;
    socials: {
      instagram?: string;
      facebook?: string;
      linkedin?: string;
      youtube?: string;
      whatsapp?: string;
    };
    mediaFiles: File[];
  }) => {
    console.log('🔧 Step 4 data received:', data);
    
    const updatedData = { ...onboardingData, socials: data.socials };
    setOnboardingData(updatedData);
    
    updateStep(5);
  };

  const handleStep5 = async (data: {
    socialLinks: Array<{
      id: string;
      title: string;
      platform?: string;
      url: string;
    }>;
    testimonials: Array<{
      customer_name: string;
      review_title: string;
      review_text: string;
      image_url?: string;
      _file?: File;
    }>;
  }) => {
    console.log('🔧 Step 5 data received:', data);
    
    setOnboardingData(prev => ({ ...prev }));
    
    updateStep(6);
  };

  const handleStep6 = async (data: {
    footerBusinessName?: string;
    footerEmail?: string;
    footerPhone?: string;
    footerAddress?: string;
    footerHours?: BusinessHours;
    footerNextAvailable?: string;
    footerCancellationPolicy?: string;
    footerPrivacyPolicy?: string;
    footerTermsOfService?: string;
    footerShowMaps?: boolean;
    footerShowAttribution?: boolean;
    socials?: {
      website?: string;
      instagram?: string;
      facebook?: string;
      linkedin?: string;
      twitter?: string;
      youtube?: string;
      tiktok?: string;
      whatsapp?: string;
    };
  }) => {
    console.log('🔧 Step 6 data received:', data);
    
    const updatedData = { ...onboardingData, ...data };
    setOnboardingData(updatedData);
    
    // Save footer fields
    if (data.footerBusinessName) {
      await patchFieldToDatabase('footerBusinessName', data.footerBusinessName);
    }
    if (data.footerEmail) {
      await patchFieldToDatabase('footerEmail', data.footerEmail);
    }
    if (data.footerPhone) {
      await patchFieldToDatabase('footerPhone', data.footerPhone);
    }
    if (data.footerAddress) {
      await patchFieldToDatabase('footerAddress', data.footerAddress);
    }
    if (data.footerNextAvailable) {
      await patchFieldToDatabase('footerNextAvailable', data.footerNextAvailable);
    }
    if (data.footerCancellationPolicy) {
      await patchFieldToDatabase('footerCancellationPolicy', data.footerCancellationPolicy);
    }
    if (data.footerPrivacyPolicy) {
      await patchFieldToDatabase('footerPrivacyPolicy', data.footerPrivacyPolicy);
    }
    if (data.footerTermsOfService) {
      await patchFieldToDatabase('footerTermsOfService', data.footerTermsOfService);
    }
    if (data.footerShowMaps !== undefined) {
      await patchFieldToDatabase('footerShowMaps', data.footerShowMaps);
    }
    if (data.footerShowAttribution !== undefined) {
      await patchFieldToDatabase('footerShowAttribution', data.footerShowAttribution);
    }
    
    updateStep(7);
  };

  const handleFinish = async () => {
    try {
      setIsLoading(true);
      
      // Mark onboarding as completed
      const { error } = await supabase
        .from('profiles')
        .update({ 
          onboarding_completed: true,
          onboarding_step: 8,
          updated_at: new Date().toISOString()
        })
        .eq('id', onboardingData.profileId);

      if (error) throw error;

      toast({
        title: "Onboarding Complete!",
        description: "Your profile has been created successfully.",
      });

      // Redirect to dashboard
      navigate('/dashboard');
    } catch (error) {
      console.error('Error completing onboarding:', error);
      toast({
        title: "Error",
        description: "Failed to complete onboarding. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p>Loading onboarding...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <Step1Handle 
            onNext={handleStep1} 
            onBack={() => navigate('/')}
            existingData={{
              handle: onboardingData.handle,
              status: onboardingData.status,
              profileId: onboardingData.profileId,
            }}
            handle={onboardingData.handle}
          />
        );
      
      case 2:
        return (
          <Step2Booking 
            onNext={handleStep2} 
            onBack={goBack}
            existingData={{
              bookingUrl: onboardingData.bookingUrl,
              bookingMode: onboardingData.bookingMode,
              useWhatsApp: onboardingData.useWhatsApp,
              whatsappNumber: onboardingData.whatsappNumber,
            }}
          />
        );
        
      case 3:
        return (
          <Step3Branding 
            onNext={handleStep3} 
            onBack={goBack}
            requiresName={true}
            existingData={{
              name: onboardingData.name,
              slogan: onboardingData.slogan,
              category: onboardingData.category,
            }}
          />
        );

      case 4:
        return (
          <Step4Extras 
            onNext={handleStep4} 
            onBack={goBack}
            existingData={{
              socials: onboardingData.socials,
              mediaFiles: [],
            }}
          />
        );

      case 5:
        return (
          <Step5SocialTestimonials 
            onNext={handleStep5} 
            onBack={goBack}
            existingData={{
              socialLinks: [],
              testimonials: [],
            }}
          />
        );

      case 6:
        return (
          <Step6Footer 
            onNext={handleStep6} 
            onBack={goBack}
            existingData={{
              footerBusinessName: onboardingData.footerBusinessName,
              footerEmail: onboardingData.footerEmail,
              footerPhone: onboardingData.footerPhone,
              footerAddress: onboardingData.footerAddress,
              footerHours: onboardingData.footerHours,
              footerNextAvailable: onboardingData.footerNextAvailable,
              footerCancellationPolicy: onboardingData.footerCancellationPolicy,
              footerPrivacyPolicy: onboardingData.footerPrivacyPolicy,
              footerTermsOfService: onboardingData.footerTermsOfService,
              footerShowMaps: onboardingData.footerShowMaps,
              footerShowAttribution: onboardingData.footerShowAttribution,
            }}
          />
        );

      case 7:
        return (
          <Step7Preview 
            onPublish={handleFinish}
            onSaveDraft={async () => {}}
            onBack={goBack}
            onStartLivePreview={async () => {}}
            handle={onboardingData.handle || ''}
            canPublish={true}
            isPublishing={isLoading}
            profileData={{
              handle: onboardingData.handle || '',
              name: onboardingData.name,
              slogan: onboardingData.slogan,
              category: onboardingData.category,
              avatar_url: onboardingData.avatarUrl,
            }}
          />
        );

      default:
        return <div>Invalid step</div>;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      {renderStep()}
    </div>
  );
};

export default Onboarding;