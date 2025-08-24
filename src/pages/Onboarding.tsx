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
import { Step4PersonalImage } from '@/components/onboarding/steps/Step4PersonalImage';
import { Step4Extras } from '@/components/onboarding/steps/Step4Extras';
import { Step5SocialTestimonials } from '@/components/onboarding/steps/Step5SocialTestimonials';
import { Step6Footer } from '@/components/onboarding/steps/Step6Footer';
import { Step7Preview } from '@/components/onboarding/steps/Step7Preview';
import { Json } from '@/integrations/supabase/types';
import StripeService from '@/services/stripeService';
import { useImageUpload } from '@/hooks/use-image-upload';

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
  category?: string;
  banner?: {
    type?: 'image';
    imageUrl?: string;
    textColor?: string;
  };
  accentColor?: string;
  themeMode?: 'light' | 'dark';
  
  // Step 4 - Personal Image & About
  avatarFile?: File;
  avatarUrl?: string;
  aboutTitle?: string;
  aboutDescription?: string;
  
  // Step 5 - Media & Social
  socials?: {
    instagram?: string;
    facebook?: string;
    linkedin?: string;
    youtube?: string;
    whatsapp?: string;
  };
  media?: {
    items: Array<{
      type: 'image';
      imageUrl: string;
      description?: string;
    }>;
  };
  mediaFiles?: File[];
  
  // Step 6 - Social Links & Testimonials
  socialLinks?: Array<{
    id: string;
    title: string;
    platform?: string;
    url: string;
  }>;
  testimonials?: Array<{
    customer_name: string;
    review_title: string;
    review_text: string;
    image_url?: string;
    _file?: File;
  }>;
  
  // Step 7 - Footer
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
  

}

const Onboarding = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { uploadImage } = useImageUpload();
  const [currentStep, setCurrentStep] = useState(1);
  const [onboardingData, setOnboardingData] = useState<OnboardingData>({
    handle: '',
    bookingUrl: '',
    bookingMode: 'embed',
    useWhatsApp: false,
    whatsappNumber: '',
    socials: {},
    socialLinks: [],
    testimonials: [],
    media: { items: [] },
    footerShowMaps: true,
    footerShowAttribution: true,
    accentColor: '#6E56CF',
    themeMode: 'light',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const hasInitializedRef = useRef(false);

  // Load existing profile data and store profileId
  const [profileId, setProfileId] = useState<string | null>(null);
  
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
          // Store the profile ID for use in child components
          setProfileId(existingProfile.id);
          
          // Extract about data
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const aboutData = existingProfile.about as any;
          
          setOnboardingData(prev => ({
            ...prev,
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
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            banner: existingProfile.banner as any || prev.banner,
            aboutTitle: aboutData?.title || prev.aboutTitle,
            aboutDescription: aboutData?.description || prev.aboutDescription,
            accentColor: existingProfile.accent_color || prev.accentColor,
            themeMode: (existingProfile.theme_mode as 'light' | 'dark') || prev.themeMode,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            socials: existingProfile.socials as any || prev.socials,
            socialLinks: aboutData?.socialLinks || prev.socialLinks,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            media: existingProfile.media as any || prev.media,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            testimonials: existingProfile.testimonials as any || prev.testimonials,
            footerBusinessName: existingProfile.footer_business_name || prev.footerBusinessName,
            footerEmail: existingProfile.footer_email || prev.footerEmail,
            footerPhone: existingProfile.footer_phone || prev.footerPhone,
            footerAddress: existingProfile.footer_address || prev.footerAddress,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            footerHours: existingProfile.footer_hours as any || prev.footerHours, 
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
        } else {
          // No profile exists, but trigger should have created one
          console.log('🔧 No profile found after trigger should have created it, checking again...');
          
          // Wait a bit and try again in case the trigger is slow
          setTimeout(async () => {
            const { data: retryProfile, error: retryError } = await supabase
              .from('profiles')
              .select('*')
              .eq('user_id', user.id)
              .single();
            
            if (retryProfile) {
              console.log('✅ Profile found on retry:', retryProfile.id);
              setProfileId(retryProfile.id);
              setOnboardingData(prev => ({
                ...prev,
                handle: retryProfile.handle || prev.handle,
              }));
            } else {
              console.error('❌ Still no profile found after trigger, manual creation needed');
              // Manual fallback creation
              const { data: newProfile, error: createError } = await supabase
                .from('profiles')
                .insert({
                  user_id: user.id,
                  handle: null,
                  name: null,
                  is_business: true,
                  onboarding_completed: false,
                  onboarding_step: 1,
                  subscription_status: 'inactive',
                  status: 'draft',
                  theme_mode: 'light',
                  accent_color: '#6E56CF',
                  booking_mode: 'embed',
                  about: {},
                  media: { items: [] },
                  socials: {},
                  contact: {},
                  banner: {},
                  footer: {},
                  testimonials: [],
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString(),
                })
                .select()
                .single();

              if (createError) {
                console.error('❌ Failed to create profile manually:', createError);
                toast({
                  title: "Profiel aanmaken mislukt",
                  description: "Er is een fout opgetreden bij het aanmaken van je profiel. Probeer het opnieuw.",
                  variant: "destructive",
                });
                return;
              }

              console.log('✅ Manual profile created:', newProfile.id);
              setProfileId(newProfile.id);
            }
          }, 1000);
        }
        
        hasInitializedRef.current = true;
      } catch (error) {
        console.error('Error in loadExistingProfile:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadExistingProfile();
  }, [user?.id, toast]);

  // Update step based on URL parameter
  useEffect(() => {
    const step = parseInt(searchParams.get('step') || '1');
    if (step >= 1 && step <= 8) {
      setCurrentStep(step);
    }
  }, [searchParams]);

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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const patchFieldToDatabase = async (field: string, value: any, step?: number) => {
    if (!user?.id || !profileId) return;
    
    try {
      // Map the field names to database column names
      const fieldMappings: Record<string, string> = {
        bookingUrl: 'booking_url',
        bookingMode: 'booking_mode',
        useWhatsApp: 'use_whatsapp',
        whatsappNumber: 'whatsapp_number',
        name: 'name',
        slogan: 'slogan',
        category: 'category',
        banner: 'banner',
        accentColor: 'accent_color',
        themeMode: 'theme_mode',
        avatar_url: 'avatar_url',
        about: 'about',
        socials: 'socials',
        media: 'media',
        testimonials: 'testimonials',
        footerBusinessName: 'footer_business_name',
        footerEmail: 'footer_email',
        footerPhone: 'footer_phone',
        footerAddress: 'footer_address',
        footerHours: 'footer_hours',
        footerNextAvailable: 'footer_next_available',
        footerCancellationPolicy: 'footer_cancellation_policy',
        footerPrivacyPolicy: 'footer_privacy_policy',
        footerTermsOfService: 'footer_terms_of_service',
        footerShowMaps: 'footer_show_maps',
        footerShowAttribution: 'footer_show_attribution',
      };
      
      const dbFieldName = fieldMappings[field] || field;
      
      // Prepare update data
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const updateData: any = { 
        [dbFieldName]: value,
        updated_at: new Date().toISOString()
      };
      
      // Add onboarding step if provided
      if (step) {
        updateData.onboarding_step = step;
      }
      
      const { error } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', profileId);
      
      if (error) {
        console.error(`Error updating ${field}:`, error);
        throw error;
      }
      
      console.log(`✅ Successfully updated ${field}${step ? ` and onboarding_step to ${step}` : ''}`);
    } catch (error) {
      console.error(`❌ Failed to update ${field}:`, error);
      toast({
        title: "Opslaan mislukt",
        description: `Kon ${field} niet opslaan. Probeer het opnieuw.`,
        variant: "destructive",
      });
    }
  };

  // Step handlers
  const handleStep1 = async (data: { handle: string }) => {
    console.log('🔧 Step 1 data received:', data);
    
    try {
      // Update local state first
      const updatedData = { ...onboardingData, ...data };
      setOnboardingData(updatedData);
      
      // Note: Handle is already saved in Step1Handle component before this function is called
      // So we don't need to save it again here to avoid duplicate database calls
      console.log('✅ Handle data processed, proceeding to next step');
      
      // Go to next step
      updateStep(2);
      
    } catch (error) {
      console.error('Error in handleStep1:', error);
      toast({
        title: "Error",
        description: "Failed to process handle. Please try again.",
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
    
        const updatedData = { ...onboardingData, ...data };
        setOnboardingData(updatedData);
        
        setIsLoading(true);
        
        // Save each field with step update
        if (data.bookingUrl !== undefined) {
          await patchFieldToDatabase('bookingUrl', data.bookingUrl, 3);
        }
        if (data.bookingMode !== undefined) {
          await patchFieldToDatabase('bookingMode', data.bookingMode, 3);
        }
        if (data.useWhatsApp !== undefined) {
          await patchFieldToDatabase('useWhatsApp', data.useWhatsApp, 3);
        }
        if (data.whatsappNumber !== undefined) {
          await patchFieldToDatabase('whatsappNumber', data.whatsappNumber, 3);
        }
        
        setIsLoading(false);
        updateStep(3);
  };

    const handleStep3 = async (data: {
    name?: string;
    slogan?: string;
    category?: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    banner?: any;
    accentColor?: string;
    themeMode?: 'light' | 'dark';
  }) => {
    console.log('🔧 Step 3 data received:', data);
    
    setIsLoading(true);
    const updatedData = { ...onboardingData, ...data };
    setOnboardingData(updatedData);
    
    // Save each field with step update
    if (data.name !== undefined) {
      await patchFieldToDatabase('name', data.name, 4);
    }
    if (data.slogan !== undefined) {
      await patchFieldToDatabase('slogan', data.slogan, 4);
    }
    if (data.category !== undefined) {
      await patchFieldToDatabase('category', data.category, 4);
    }
    if (data.banner !== undefined) {
      await patchFieldToDatabase('banner', data.banner, 4);
    }
    if (data.accentColor !== undefined) {
      await patchFieldToDatabase('accentColor', data.accentColor, 4);
    }
    if (data.themeMode !== undefined) {
      await patchFieldToDatabase('themeMode', data.themeMode, 4);
    }
    
    setIsLoading(false);
    updateStep(4);
  };

  const handleStep4 = async (data: {
    avatarFile?: File;
    avatarUrl?: string;
    aboutTitle?: string;
    aboutDescription?: string;
  }) => {
    console.log('🔧 Step 4 data received:', data);
    
    setIsLoading(true);
    const updatedData = { ...onboardingData, ...data };
    setOnboardingData(updatedData);
    
    // Save each field with step update
    if (data.avatarUrl !== undefined) {
      await patchFieldToDatabase('avatar_url', data.avatarUrl, 5);
    }
    if (data.aboutTitle !== undefined || data.aboutDescription !== undefined) {
      const aboutData = {
        title: data.aboutTitle || onboardingData.aboutTitle || '',
        description: data.aboutDescription || onboardingData.aboutDescription || '',
        alignment: 'center',
        socialLinks: onboardingData.socialLinks || [],
      };
      await patchFieldToDatabase('about', aboutData, 5);
    }
    
    setIsLoading(false);
    updateStep(5);
  };

  const handleStep5 = async (data: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    socials?: any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    media?: any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    testimonials?: any;
  }) => {
    console.log('🔧 Step 5 data received:', data);
    
    setIsLoading(true);
    const updatedData = { ...onboardingData, ...data };
    setOnboardingData(updatedData);
    
    // Save each field with step update
    if (data.socials !== undefined) {
      await patchFieldToDatabase('socials', data.socials, 6);
    }
    if (data.media !== undefined) {
      await patchFieldToDatabase('media', data.media, 6);
    }
    if (data.testimonials !== undefined) {
      await patchFieldToDatabase('testimonials', data.testimonials, 6);
    }
    
    setIsLoading(false);
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
  }) => {
    console.log('🔧 Step 6 data received:', data);
    
    setIsLoading(true);
    const updatedData = { ...onboardingData, ...data };
    setOnboardingData(updatedData);
    
    // Save each field with step update
    if (data.footerBusinessName !== undefined) {
      await patchFieldToDatabase('footerBusinessName', data.footerBusinessName, 7);
    }
    if (data.footerEmail !== undefined) {
      await patchFieldToDatabase('footerEmail', data.footerEmail, 7);
    }
    if (data.footerPhone !== undefined) {
      await patchFieldToDatabase('footerPhone', data.footerPhone, 7);
    }
    if (data.footerAddress !== undefined) {
      await patchFieldToDatabase('footerAddress', data.footerAddress, 7);
    }
    if (data.footerHours !== undefined) {
      await patchFieldToDatabase('footerHours', data.footerHours, 7);
    }
    if (data.footerNextAvailable !== undefined) {
      await patchFieldToDatabase('footerNextAvailable', data.footerNextAvailable, 7);
    }
    if (data.footerCancellationPolicy !== undefined) {
      await patchFieldToDatabase('footerCancellationPolicy', data.footerCancellationPolicy, 7);
    }
    if (data.footerPrivacyPolicy !== undefined) {
      await patchFieldToDatabase('footerPrivacyPolicy', data.footerPrivacyPolicy, 7);
    }
    if (data.footerTermsOfService !== undefined) {
      await patchFieldToDatabase('footerTermsOfService', data.footerTermsOfService, 7);
    }
    if (data.footerShowMaps !== undefined) {
      await patchFieldToDatabase('footerShowMaps', data.footerShowMaps, 7);
    }
    if (data.footerShowAttribution !== undefined) {
      await patchFieldToDatabase('footerShowAttribution', data.footerShowAttribution, 7);
    }
    
    setIsLoading(false);
    updateStep(7);
  };

  const handleStep7 = async (data: {
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
    console.log('🔧 Step 7 data received:', data);
    
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
    
    updateStep(8);
  };

  const handleFinish = async () => {
    try {
      setIsLoading(true);
      
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

  const handlePreview = async () => {
    if (!profileId) {
      toast({
        title: "Fout",
        description: "Profiel niet gevonden. Probeer de pagina te verversen.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Call the start-live-preview edge function
      const { error } = await supabase.functions.invoke('start-live-preview', {
        body: { profileId }
      });

      if (error) {
        throw error;
      }

      toast({
        title: "Live preview gestart!",
        description: "Je pagina is nu live en zichtbaar voor 15 minuten.",
      });

    } catch (error) {
      console.error('❌ Error in handlePreview:', error);
      toast({
        title: "Preview mislukt",
        description: "Er is een fout opgetreden bij het starten van de live preview.",
        variant: "destructive",
      });
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
              profileId: profileId || undefined
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
              banner: onboardingData.banner,
            }}
            handle={onboardingData.handle}
          />
        );

      case 4:
        return (
          <Step4PersonalImage 
            onNext={handleStep4} 
            onBack={goBack}
            handle={onboardingData.handle}
            existingData={{
              avatarFile: onboardingData.avatarFile,
              aboutTitle: onboardingData.aboutTitle,
              aboutDescription: onboardingData.aboutDescription,
              avatar_url: onboardingData.avatarUrl,
            }}
          />
        );

      case 5:
        return (
          <Step4Extras 
            onNext={handleStep5} 
            onBack={goBack}
            handle={onboardingData.handle}
            existingData={{
              socials: onboardingData.socials,
              mediaFiles: onboardingData.mediaFiles || [],
              media: onboardingData.media,
              aboutTitle: onboardingData.aboutTitle,
              aboutDescription: onboardingData.aboutDescription,
              avatar_url: onboardingData.avatarUrl,
            }}
          />
        );

      case 6:
        return (
          <Step5SocialTestimonials 
            onNext={handleStep5}  // Changed from handleStep6
            onBack={goBack}
            handle={onboardingData.handle}
            existingData={{
              socialLinks: onboardingData.socialLinks || [],
              testimonials: onboardingData.testimonials || [],
            }}
          />
        );

      case 7:
        return (
          <Step6Footer 
            onNext={handleStep6}  // Changed from handleStep7
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

      case 8:
        return (
          <Step7Preview 
            onPublish={handleFinish}
            onSaveDraft={async () => {}}
            onStartLivePreview={handlePreview}
            onBack={goBack}
            handle={onboardingData.handle || ''}
            canPublish={true}
            isPublishing={isLoading}
            profileData={{
              handle: onboardingData.handle || '',
              name: onboardingData.name,
              slogan: onboardingData.slogan,
              category: onboardingData.category,
              avatar_url: onboardingData.avatarUrl,
              banner: onboardingData.banner,
              aboutTitle: onboardingData.aboutTitle,
              aboutDescription: onboardingData.aboutDescription,
              socials: onboardingData.socials,
              socialLinks: onboardingData.socialLinks,
              testimonials: onboardingData.testimonials,
              bookingUrl: onboardingData.bookingUrl,
              bookingMode: onboardingData.bookingMode,
              footer: {
                businessName: onboardingData.footerBusinessName,
                address: onboardingData.footerAddress,
                email: onboardingData.footerEmail,
                phone: onboardingData.footerPhone,
                hours: onboardingData.footerHours,
                nextAvailable: onboardingData.footerNextAvailable,
                cancellationPolicy: onboardingData.footerCancellationPolicy,
                privacyPolicy: onboardingData.footerPrivacyPolicy,
                termsOfService: onboardingData.footerTermsOfService,
                showMaps: onboardingData.footerShowMaps,
                showAttribution: onboardingData.footerShowAttribution,
              }
            }}
          />
        );

      default:
        return <div>Invalid step</div>;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      <OnboardingProgress currentStep={currentStep} totalSteps={8} />
      {renderStep()}
    </div>
  );
};

export default Onboarding;