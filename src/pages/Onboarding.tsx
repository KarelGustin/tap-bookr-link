import { useState, useEffect, useCallback, useRef } from 'react';
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
  businessName?: string;
  isBusiness: boolean;
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
  avatar_url?: string;
  bannerType: 'image';
  bannerFile?: File;
  banner?: {
    type?: 'image';
    imageUrl?: string;
    heading?: string;
    subheading?: string;
    textColor?: string;
  };
  category?: string;
  
  // Step 4 - Enhanced About & Media
  aboutTitle?: string;
  aboutDescription?: string;
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
  media?: {
    items: Array<{
      id: string;
      url: string;
      type: string;
      order: number;
    }>;
  };
  
  // Step 5 - Enhanced Social & Testimonials
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
  
  // Step 6 - Footer & Advanced Settings
  footerBusinessName?: string;
  footerAddress?: string;
  footerEmail?: string;
  footerPhone?: string;
  footerHours?: BusinessHours;
  footerNextAvailable?: string;
  footerCancellationPolicy?: string;
  footerPrivacyPolicy?: string;
  footerTermsOfService?: string;
  footerShowMaps?: boolean;
  footerShowAttribution?: boolean;
  
  // Profile ID for updates
  profileId?: string;
}

// Helper function to safely access nested properties
const safeGet = (obj: unknown, path: string[]): unknown => {
  if (!obj || typeof obj !== 'object') return undefined;
  let current: Record<string, unknown> = obj as Record<string, unknown>;
  for (const key of path) {
    if (current && typeof current === 'object' && key in current) {
      current = current[key] as Record<string, unknown>;
    } else {
      return undefined;
    }
  }
  return current;
};

export default function Onboarding() {
  const [searchParams] = useSearchParams();
  const [currentStep, setCurrentStep] = useState(1);
  const [onboardingData, setOnboardingData] = useState<OnboardingData>({
    handle: '',
    isBusiness: false,
    bookingUrl: '',
    bookingMode: 'embed',
    useWhatsApp: false,
    whatsappNumber: '',
    bannerType: 'image',
    socials: {},
    mediaFiles: [],
    socialLinks: [],
    testimonials: [],
  });
  // Prefill handle from URL if present (from hero)
  useEffect(() => {
    const h = searchParams.get('handle');
    if (h && !onboardingData.handle) {
      setOnboardingData(prev => ({ ...prev, handle: h.toLowerCase() }));
    }
  }, [searchParams, onboardingData.handle]);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isLivePreviewActive, setIsLivePreviewActive] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Helper function to clean testimonials data by removing _file property
  const cleanTestimonialsData = (testimonials: OnboardingData['testimonials']) => {
    return testimonials.map(testimonial => {
      const { _file, ...cleanTestimonial } = testimonial;
      return cleanTestimonial;
    });
  };

  // Manual refresh function for testimonials data
  const refreshTestimonialsData = async () => {
    if (!onboardingData.profileId) {
      console.error('❌ No profile ID found for refreshing testimonials');
      return;
    }

    try {
      console.log('🔄 Refreshing testimonials data...');
      
      const { data: profileData, error } = await supabase
        .from('profiles')
        .select('about, testimonials')
        .eq('id', onboardingData.profileId)
        .single();

      if (error) {
        console.error('❌ Error refreshing testimonials data:', error);
        return;
      }

      if (profileData) {
        console.log('🔄 Refreshed profile data:', profileData);
        
        // Load testimonials from both sources
        let testimonialsFromAbout: OnboardingData['testimonials'] = [];
        let testimonialsFromColumn: OnboardingData['testimonials'] = [];
        
        // Load from about section (backward compatibility)
        if (profileData.about && typeof profileData.about === 'object' && 'testimonials' in profileData.about) {
          testimonialsFromAbout = (profileData.about as Record<string, unknown>).testimonials as OnboardingData['testimonials'];
        }
        
        // Load from testimonials column (new approach)
        if (profileData.testimonials && Array.isArray(profileData.testimonials)) {
          testimonialsFromColumn = profileData.testimonials as unknown as OnboardingData['testimonials'];
        }
        
        // Merge testimonials, prioritizing the column data if available
        const finalTestimonials = testimonialsFromColumn.length > 0 ? testimonialsFromColumn : testimonialsFromAbout;
        
        // Clean testimonials data before updating state
        const cleanTestimonials = cleanTestimonialsData(finalTestimonials);
        
        // Update local state with refreshed data
        setOnboardingData(prev => ({
          ...prev,
          socialLinks: profileData.about && typeof profileData.about === 'object' && 'socialLinks' in profileData.about 
            ? (profileData.about as Record<string, unknown>).socialLinks as OnboardingData['socialLinks']
            : prev.socialLinks,
          testimonials: cleanTestimonials,
        }));

        console.log('✅ Testimonials data refreshed successfully');
        console.log('🔧 Testimonials from about section:', testimonialsFromAbout);
        console.log('🔧 Testimonials from column:', testimonialsFromColumn);
        console.log('🔧 Final merged testimonials:', finalTestimonials);
      }
    } catch (error) {
      console.error('❌ Error refreshing testimonials data:', error);
    }
  };

  const hasLoadedRef = useRef(false);

  const loadExistingProfile = useCallback(async () => {
    // start initial loader
    setIsInitialLoading(true);

    if (!user?.id) {
      console.log('No user ID found, skipping profile load');
      setIsInitialLoading(false);
      return;
    }

    try {
      console.log('🔧 Loading existing profile for user:', user.id);
      
      const { data: existingProfile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          console.log('No existing profile found, will create new one');
          return;
        }
        console.error('Error loading existing profile:', error);
        return;
      }

      if (existingProfile) {
        console.log('✅ Existing profile found:', existingProfile.id);
        console.log('🔧 Profile data:', existingProfile);
        
        // Set profile ID for future operations
        setOnboardingData(prev => ({
          ...prev,
          profileId: existingProfile.id,
          status: existingProfile.status
        }));
        
        setOnboardingData(prev => {
          // Load testimonials from both sources: about section and testimonials column
          let testimonialsFromAbout: OnboardingData['testimonials'] = [];
          let testimonialsFromColumn: OnboardingData['testimonials'] = [];
          
          // Load from about section (backward compatibility)
          if (existingProfile.about && typeof existingProfile.about === 'object' && 'testimonials' in existingProfile.about) {
            testimonialsFromAbout = (existingProfile.about as Record<string, unknown>).testimonials as OnboardingData['testimonials'];
          }
          
          // Load from testimonials column (new approach)
          if (existingProfile.testimonials && Array.isArray(existingProfile.testimonials)) {
            testimonialsFromColumn = existingProfile.testimonials as unknown as OnboardingData['testimonials'];
          }
          
          // Merge testimonials, prioritizing the column data if available
          const finalTestimonials = testimonialsFromColumn.length > 0 ? testimonialsFromColumn : testimonialsFromAbout;
          
          // Clean testimonials data by removing _file property
          const cleanTestimonials = cleanTestimonialsData(finalTestimonials);
          
          const newData = {
            ...prev,
            handle: existingProfile.handle || prev.handle,
            name: existingProfile.name || prev.name,
            businessName: existingProfile.name || prev.businessName, // Map name to businessName
            isBusiness: existingProfile.is_business || prev.isBusiness, // Load isBusiness flag
            slogan: existingProfile.slogan || prev.slogan,
            category: existingProfile.category || prev.category,
            avatar_url: existingProfile.avatar_url || prev.avatar_url,
            banner: existingProfile.banner as OnboardingData['banner'] || prev.banner,
            bookingUrl: existingProfile.booking_url || prev.bookingUrl,
            bookingMode: (existingProfile.booking_mode as 'embed' | 'new_tab') || prev.bookingMode,
            useWhatsApp: existingProfile.use_whatsapp || prev.useWhatsApp,
            whatsappNumber: existingProfile.whatsapp_number || prev.whatsappNumber,
            aboutTitle: existingProfile.about && typeof existingProfile.about === 'object' && 'title' in existingProfile.about ? (existingProfile.about as Record<string, unknown>).title as string : prev.aboutTitle,
            aboutDescription: existingProfile.about && typeof existingProfile.about === 'object' && 'description' in existingProfile.about ? (existingProfile.about as Record<string, unknown>).description as string : prev.aboutDescription,
            aboutAlignment: existingProfile.about && typeof existingProfile.about === 'object' && 'alignment' in existingProfile.about ? (existingProfile.about as Record<string, unknown>).alignment as 'center' | 'left' : prev.aboutAlignment,
            media: existingProfile.media as OnboardingData['media'] || prev.media,
            socials: existingProfile.socials as OnboardingData['socials'] || prev.socials,
            socialLinks: existingProfile.about && typeof existingProfile.about === 'object' && 'socialLinks' in existingProfile.about ? (existingProfile.about as Record<string, unknown>).socialLinks as OnboardingData['socialLinks'] : prev.socialLinks,
            testimonials: cleanTestimonials,
            // Prefill footer fields (columns preferred, then JSON fallbacks)
            footerBusinessName: ((existingProfile as Record<string, unknown>).footer_business_name as string) 
              ?? (safeGet(existingProfile.footer, ['businessName']) as string)
              ?? (safeGet(existingProfile.about, ['footer', 'businessName']) as string)
              ?? prev.footerBusinessName,
            footerAddress: ((existingProfile as Record<string, unknown>).footer_address as string) 
              ?? (safeGet(existingProfile.footer, ['address']) as string)
              ?? (safeGet(existingProfile.about, ['footer', 'address']) as string)
              ?? prev.footerAddress,
            footerEmail: ((existingProfile as Record<string, unknown>).footer_email as string) 
              ?? (safeGet(existingProfile.footer, ['email']) as string)
              ?? (safeGet(existingProfile.about, ['footer', 'email']) as string)
              ?? prev.footerEmail,
            footerPhone: ((existingProfile as Record<string, unknown>).footer_phone as string) 
              ?? (safeGet(existingProfile.footer, ['phone']) as string)
              ?? (safeGet(existingProfile.about, ['footer', 'phone']) as string)
              ?? prev.footerPhone,
            footerHours: ((existingProfile as Record<string, unknown>).footer_hours as OnboardingData['footerHours']) 
              ?? (safeGet(existingProfile.footer, ['hours']) as OnboardingData['footerHours'])
              ?? (safeGet(existingProfile.about, ['footer', 'hours']) as OnboardingData['footerHours'])
              ?? prev.footerHours,
            footerNextAvailable: ((existingProfile as Record<string, unknown>).footer_next_available as string) 
              ?? (safeGet(existingProfile.footer, ['nextAvailable']) as string)
              ?? (safeGet(existingProfile.about, ['footer', 'nextAvailable']) as string)
              ?? prev.footerNextAvailable,
            footerCancellationPolicy: ((existingProfile as Record<string, unknown>).footer_cancellation_policy as string) 
              ?? (safeGet(existingProfile.footer, ['cancellationPolicy']) as string)
              ?? (safeGet(existingProfile.about, ['footer', 'cancellationPolicy']) as string)
              ?? prev.footerCancellationPolicy,
            footerPrivacyPolicy: ((existingProfile as Record<string, unknown>).footer_privacy_policy as string) 
              ?? (safeGet(existingProfile.footer, ['privacyPolicy']) as string)
              ?? (safeGet(existingProfile.about, ['footer', 'privacyPolicy']) as string)
              ?? prev.footerPrivacyPolicy,
            footerTermsOfService: ((existingProfile as Record<string, unknown>).footer_terms_of_service as string) 
              ?? (safeGet(existingProfile.footer, ['termsOfService']) as string)
              ?? (safeGet(existingProfile.about, ['footer', 'termsOfService']) as string)
              ?? prev.footerTermsOfService,
            footerShowMaps: ((existingProfile as Record<string, unknown>).footer_show_maps as boolean) 
              ?? (safeGet(existingProfile.footer, ['showMaps']) as boolean)
              ?? (safeGet(existingProfile.about, ['footer', 'showMaps']) as boolean)
              ?? prev.footerShowMaps,
            footerShowAttribution: ((existingProfile as Record<string, unknown>).footer_show_attribution as boolean) 
              ?? (safeGet(existingProfile.footer, ['showAttribution']) as boolean)
              ?? (safeGet(existingProfile.about, ['footer', 'showAttribution']) as boolean)
              ?? prev.footerShowAttribution,
          };
          
          console.log('🔧 Updated onboarding data after refresh:', newData);
          console.log('🔧 Testimonials loaded:', newData.testimonials);
          console.log('🔧 About section from DB:', existingProfile.about);
          console.log('🔧 Testimonials from about section:', testimonialsFromAbout);
          console.log('🔧 Testimonials from column:', testimonialsFromColumn);
          console.log('🔧 Final merged testimonials:', finalTestimonials);
          
          // Additional logging for testimonials
          if (existingProfile.about && typeof existingProfile.about === 'object') {
            const aboutData = existingProfile.about as Record<string, unknown>;
            console.log('🔧 About section keys:', Object.keys(aboutData));
            console.log('🔧 About testimonials raw:', aboutData.testimonials);
            console.log('🔧 About socialLinks raw:', aboutData.socialLinks);
            
            if (aboutData.testimonials && Array.isArray(aboutData.testimonials)) {
              console.log('✅ Testimonials array found with length:', aboutData.testimonials.length);
              console.log('✅ First testimonial:', aboutData.testimonials[0]);
              
              // Validate testimonial structure
              aboutData.testimonials.forEach((testimonial, index) => {
                if (typeof testimonial === 'object' && testimonial !== null) {
                  const t = testimonial as Record<string, unknown>;
                  console.log(`🔧 Testimonial ${index} structure:`, {
                    customer_name: t.customer_name,
                    review_title: t.review_title,
                    review_text: t.review_text,
                    image_url: t.image_url,
                    has_file: '_file' in t
                  });
                  
                  // Ensure testimonials have required fields
                  if (!t.customer_name || !t.review_title || !t.review_text) {
                    console.warn(`⚠️ Testimonial ${index} missing required fields:`, {
                      has_customer_name: !!t.customer_name,
                      has_review_title: !!t.review_title,
                      has_review_text: !!t.review_text
                    });
                  }
                }
              });
            } else {
              console.log('❌ No testimonials array found in about section');
            }
          }
          
          return newData;
        });
      }
    } catch (error) {
      console.error('Error loading existing profile:', error);
    } finally {
      setIsInitialLoading(false);
      hasLoadedRef.current = true;
    }
  }, [user?.id]);
  
  // Load existing profile data when component mounts
  useEffect(() => {
    if (!hasLoadedRef.current) {
      loadExistingProfile();
    }
  }, [loadExistingProfile]);

  // Set current step from URL parameter
  useEffect(() => {
    const stepParam = searchParams.get('step');
    if (stepParam) {
      const step = parseInt(stepParam, 10);
      if (step >= 1 && step <= 8) {
        setCurrentStep(step);
        console.log('🔧 Setting current step from URL parameter:', step);
      }
    }
  }, [searchParams]);

  // Auto-start live preview when reaching step 8
  useEffect(() => {
    if (currentStep === 8 && user && onboardingData.profileId && !isLivePreviewActive) {
      console.log('🔧 Auto-starting live preview for step 7');
      startLivePreview().catch(error => {
        console.error('🔧 Auto-start live preview failed:', error);
        // Don't show error toast for auto-start, just log it
      });
    }
  }, [currentStep, user, onboardingData.profileId, isLivePreviewActive]);

  // Redirect if no user
  useEffect(() => {
    if (!user) {
      setIsInitialLoading(false);
      navigate('/login');
    }
  }, [user, navigate]);

  // Test storage connectivity
  useEffect(() => {
    const testStorageConnection = async () => {
      if (!user) return;
      
      console.log('Testing storage connection...');
      try {
        // Test if we can list buckets
        const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
        console.log('Storage buckets:', buckets);
        
        if (bucketsError) {
          console.error('Error listing buckets:', bucketsError);
        }
        
        // Test if we can access avatars bucket
        const { data: avatarsList, error: avatarsError } = await supabase.storage
          .from('avatars')
          .list('', { limit: 1 });
        
        console.log('Avatars bucket test:', { data: avatarsList, error: avatarsError });
        
        // Test if we can access media bucket
        const { data: mediaList, error: mediaError } = await supabase.storage
          .from('media')
          .list('', { limit: 1 });
        
        console.log('Media bucket test:', { data: mediaList, error: mediaError });
        
      } catch (error) {
        console.error('Storage connection test failed:', error);
      }
    };
    
    testStorageConnection();
  }, [user]);

  // Test database connection and policies
  useEffect(() => {
    const testDatabaseConnection = async () => {
      if (!user) return;
      
      console.log('Testing database connection...');
      try {
        // Test if we can read from profiles table
        const { data: readTest, error: readError } = await supabase
          .from('profiles')
          .select('id')
          .limit(1);
        
        console.log('Read test result:', { data: readTest, error: readError });
        
      } catch (error) {
        console.error('Database connection test failed:', error);
      }
    };
    
    testDatabaseConnection();
  }, [user]);

  const updateStep = async (step: number) => {
    setCurrentStep(step);
    
    // Update database with new step
    if (user && onboardingData.profileId) {
      try {
        await supabase
          .from('profiles')
          .update({
            onboarding_step: step,
            updated_at: new Date().toISOString()
          })
          .eq('id', onboardingData.profileId);
      } catch (error) {
        console.error('Error updating step:', error);
      }
    }
    
    // Refresh existing data when navigating to ensure placeholders are up-to-date
    if (user && (step === 3 || step === 4 || step === 5)) {
      refreshExistingData();
    }
  };

  // Function to refresh existing data from database
  const refreshExistingData = async () => {
    if (!user) return;
    
    try {
      const { data: existingProfile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();
      
      if (error && error.code !== 'PGRST116') {
        console.error('Error refreshing existing profile:', error);
        return;
      }
      
      if (existingProfile) {
        console.log('🔧 Refreshed existing profile data:', existingProfile);
        console.log('🔧 Avatar URL from database:', existingProfile.avatar_url);
        console.log('🔧 Media data from database:', existingProfile.media);
        
        setOnboardingData(prev => {
          const newData = {
            ...prev,
            avatar_url: existingProfile.avatar_url || prev.avatar_url,
            banner: existingProfile.banner as OnboardingData['banner'] || prev.banner,
            aboutTitle: existingProfile.about && typeof existingProfile.about === 'object' && 'title' in existingProfile.about ? (existingProfile.about as Record<string, unknown>).title as string : prev.aboutTitle,
            aboutDescription: existingProfile.about && typeof existingProfile.about === 'object' && 'description' in existingProfile.about ? (existingProfile.about as Record<string, unknown>).description as string : prev.aboutDescription,
            aboutAlignment: existingProfile.about && typeof existingProfile.about === 'object' && 'alignment' in existingProfile.about ? (existingProfile.about as Record<string, unknown>).alignment as 'center' | 'left' : prev.aboutAlignment,
            media: existingProfile.media as OnboardingData['media'] || prev.media,
            socials: existingProfile.socials as OnboardingData['socials'] || prev.socials,
            socialLinks: existingProfile.about && typeof existingProfile.about === 'object' && 'socialLinks' in existingProfile.about ? (existingProfile.about as Record<string, unknown>).socialLinks as OnboardingData['socialLinks'] : prev.socialLinks,
            testimonials: existingProfile.about && typeof existingProfile.about === 'object' && 'testimonials' in existingProfile.about ? (existingProfile.about as Record<string, unknown>).testimonials as OnboardingData['testimonials'] : prev.testimonials,
            // Prefill footer fields on refresh as well
            footerBusinessName: ((existingProfile as Record<string, unknown>).footer_business_name as string) 
              ?? (safeGet(existingProfile.footer, ['businessName']) as string)
              ?? (safeGet(existingProfile.about, ['footer', 'businessName']) as string)
              ?? prev.footerBusinessName,
            footerAddress: ((existingProfile as Record<string, unknown>).footer_address as string) 
              ?? (safeGet(existingProfile.footer, ['address']) as string)
              ?? (safeGet(existingProfile.about, ['footer', 'address']) as string)
              ?? prev.footerAddress,
            footerEmail: ((existingProfile as Record<string, unknown>).footer_email as string) 
              ?? (safeGet(existingProfile.footer, ['email']) as string)
              ?? (safeGet(existingProfile.about, ['footer', 'email']) as string)
              ?? prev.footerEmail,
            footerPhone: ((existingProfile as Record<string, unknown>).footer_phone as string) 
              ?? (safeGet(existingProfile.footer, ['phone']) as string)
              ?? (safeGet(existingProfile.about, ['footer', 'phone']) as string)
              ?? prev.footerPhone,
            footerHours: ((existingProfile as Record<string, unknown>).footer_hours as OnboardingData['footerHours']) 
              ?? (safeGet(existingProfile.footer, ['hours']) as OnboardingData['footerHours'])
              ?? (safeGet(existingProfile.about, ['footer', 'hours']) as OnboardingData['footerHours'])
              ?? prev.footerHours,
            footerNextAvailable: ((existingProfile as Record<string, unknown>).footer_next_available as string) 
              ?? (safeGet(existingProfile.footer, ['nextAvailable']) as string)
              ?? (safeGet(existingProfile.about, ['footer', 'nextAvailable']) as string)
              ?? prev.footerNextAvailable,
            footerCancellationPolicy: ((existingProfile as Record<string, unknown>).footer_cancellation_policy as string) 
              ?? (safeGet(existingProfile.footer, ['cancellationPolicy']) as string)
              ?? (safeGet(existingProfile.about, ['footer', 'cancellationPolicy']) as string)
              ?? prev.footerCancellationPolicy,
            footerPrivacyPolicy: ((existingProfile as Record<string, unknown>).footer_privacy_policy as string) 
              ?? (safeGet(existingProfile.footer, ['privacyPolicy']) as string)
              ?? (safeGet(existingProfile.about, ['footer', 'privacyPolicy']) as string)
              ?? prev.footerPrivacyPolicy,
            footerTermsOfService: ((existingProfile as Record<string, unknown>).footer_terms_of_service as string) 
              ?? (safeGet(existingProfile.footer, ['termsOfService']) as string)
              ?? (safeGet(existingProfile.about, ['footer', 'termsOfService']) as string)
              ?? prev.footerTermsOfService,
            footerShowMaps: ((existingProfile as Record<string, unknown>).footer_show_maps as boolean) 
              ?? (safeGet(existingProfile.footer, ['showMaps']) as boolean)
              ?? (safeGet(existingProfile.about, ['footer', 'showMaps']) as boolean)
              ?? prev.footerShowMaps,
            footerShowAttribution: ((existingProfile as Record<string, unknown>).footer_show_attribution as boolean) 
              ?? (safeGet(existingProfile.footer, ['showAttribution']) as boolean)
              ?? (safeGet(existingProfile.about, ['footer', 'showAttribution']) as boolean)
              ?? prev.footerShowAttribution,
          };
          
          console.log('🔧 Updated onboarding data after refresh:', newData);
          console.log('🔧 Testimonials loaded:', newData.testimonials);
          console.log('🔧 About section from DB:', existingProfile.about);
          
          // Additional logging for testimonials
          if (existingProfile.about && typeof existingProfile.about === 'object') {
            const aboutData = existingProfile.about as Record<string, unknown>;
            console.log('🔧 About section keys:', Object.keys(aboutData));
            console.log('🔧 About testimonials raw:', aboutData.testimonials);
            console.log('🔧 About socialLinks raw:', aboutData.socialLinks);
            
            if (aboutData.testimonials && Array.isArray(aboutData.testimonials)) {
              console.log('✅ Testimonials array found with length:', aboutData.testimonials.length);
              console.log('✅ First testimonial:', aboutData.testimonials[0]);
              
              // Validate testimonial structure
              aboutData.testimonials.forEach((testimonial, index) => {
                if (typeof testimonial === 'object' && testimonial !== null) {
                  const t = testimonial as Record<string, unknown>;
                  console.log(`🔧 Testimonial ${index} structure:`, {
                    customer_name: t.customer_name,
                    review_title: t.review_title,
                    review_text: t.review_text,
                    image_url: t.image_url,
                    has_file: '_file' in t
                  });
                }
              });
            } else {
              console.log('❌ No testimonials array found in about section');
            }
          }
          
          return newData;
        });
      }
    } catch (error) {
      console.error('Error refreshing existing profile:', error);
    }
  };

  const uploadFile = async (file: File, bucket: string): Promise<string | null> => {
    try {
      console.log(`Uploading file to bucket: ${bucket}`);
      
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `${user?.id}/${fileName}`; // Use user ID as folder

      console.log(`Uploading ${file.name} to ${bucket}/${filePath}`);

      const { data, error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error(`Upload error for ${bucket}:`, uploadError);
        
        // If RLS policy fails, try to upload to a different path
        if (uploadError.message.includes('row-level security policy')) {
          console.log('RLS policy failed, trying alternative upload method...');
          
          // Try uploading to root of bucket
          const alternativePath = fileName;
          const { data: altData, error: altError } = await supabase.storage
            .from(bucket)
            .upload(alternativePath, file, {
              cacheControl: '3600',
              upsert: false
            });
          
          if (altError) {
            console.error(`Alternative upload also failed:`, altError);
            throw altError;
          }
          
          console.log(`Alternative upload successful:`, altData);
          
          // Get public URL for alternative path
          const { data: urlData } = supabase.storage
            .from(bucket)
            .getPublicUrl(alternativePath);
          
          return urlData.publicUrl;
        }
        
        throw uploadError;
      }

      console.log(`File uploaded successfully to ${bucket}:`, data);

      // Get public URL
      const { data: urlData } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath);

      console.log(`Public URL generated:`, urlData.publicUrl);
      return urlData.publicUrl;
    } catch (error) {
      console.error(`Upload failed for ${bucket}:`, error);
      
      // Final fallback: return a placeholder URL and log the error
      console.error('Storage upload completely failed, using placeholder');
      return null;
    }
  };

  const saveProfileData = async (data: Partial<OnboardingData>, status: 'draft' | 'published' = 'draft') => {
    console.log('saveProfileData called with:', { data, status, user: user?.id });
    
    if (!user) {
      console.log('No user found, returning null');
      return null;
    }

    try {
      console.log('Starting file uploads...');
      // Upload files first
      let avatarUrl: string | undefined;
      let bannerUrl: string | undefined;
      let aboutPhotoUrl: string | undefined;
      const mediaUrls: string[] = [];

      if (data.avatarFile) {
        console.log('Uploading avatar file...');
        avatarUrl = await uploadFile(data.avatarFile, 'avatars') || undefined;
        console.log('Avatar upload result:', avatarUrl);
      } else if (data.avatar_url) {
        // Keep existing avatar URL if no new file uploaded
        avatarUrl = data.avatar_url;
        console.log('Keeping existing avatar URL:', avatarUrl);
      }

      if (data.bannerFile) {
        console.log('Uploading banner file...');
        bannerUrl = await uploadFile(data.bannerFile, 'media') || undefined;
        console.log('Banner upload result:', bannerUrl);
      } else if (data.banner?.imageUrl) {
        // Keep existing banner image URL if no new file uploaded
        bannerUrl = data.banner.imageUrl;
        console.log('Keeping existing banner image URL:', bannerUrl);
      }

      if (data.aboutPhotoFile) {
        console.log('Uploading about photo file...');
        aboutPhotoUrl = await uploadFile(data.aboutPhotoFile, 'media') || undefined;
        console.log('About photo upload result:', aboutPhotoUrl);
      }

      if (data.mediaFiles) {
        console.log('Uploading media files...');
        for (const file of data.mediaFiles) {
          const url = await uploadFile(file, 'media');
          if (url) mediaUrls.push(url);
        }
        console.log('Media files upload result:', mediaUrls);
      }

      // Determine the name field - prioritize business name for businesses
      let displayName: string | undefined;
      if (data.isBusiness && data.businessName) {
        displayName = data.businessName;
      } else if (data.name) {
        displayName = data.name;
      }

      // Prepare profile data matching Supabase schema
      const profileData = {
        user_id: user.id, // This links the profile to the logged-in user
        handle: data.handle?.toLowerCase() || '',
        name: displayName, // Use business name for businesses, personal name for individuals
        slogan: data.slogan,
        category: data.category,
        avatar_url: avatarUrl,
        booking_url: data.bookingUrl || '', // Explicitly set booking URL - will overwrite existing
        booking_mode: data.bookingMode || 'embed', // Explicitly set booking mode - will overwrite existing
        status,
        accent_color: '#6E56CF',
        theme_mode: 'light',
        banner: {
          type: 'image',
          imageUrl: data.bannerType === 'image' ? bannerUrl : undefined,
          heading: data.banner?.heading || data.name,
          subheading: data.banner?.subheading || data.slogan,
          textColor: data.banner?.textColor || '#ffffff',
        },
        about: {
          title: data.aboutTitle,
          description: data.aboutDescription,
          alignment: data.aboutAlignment || 'center',
          photoUrl: aboutPhotoUrl,
        },
        socials: data.socials || {},
        socialLinks: data.socialLinks || [],
        media: {
          items: mediaUrls.map(url => ({ url, kind: 'image' })),
        },
        testimonials: data.testimonials ? cleanTestimonialsData(data.testimonials) : [],
        footer: {
          businessName: data.footerBusinessName,
          address: data.footerAddress,
          email: data.footerEmail,
          phone: data.footerPhone,
          hours: data.footerHours,
          nextAvailable: data.footerNextAvailable,
          cancellationPolicy: data.footerCancellationPolicy,
          privacyPolicy: data.footerPrivacyPolicy,
          termsOfService: data.footerTermsOfService,
          showMaps: data.footerShowMaps,
          showAttribution: data.footerShowAttribution,
        },
        contact: {
          // Add contact information if available
          email: user.email,
          // Add other contact fields as needed
        },
      };

      console.log('Prepared profile data (will overwrite existing):', profileData);
      console.log('User linking info:', { userId: user.id, userEmail: user.email });

      if (data.profileId) {
        console.log('Updating existing profile with ID:', data.profileId);
        // Update existing profile using Supabase - this will overwrite all fields
        const { error } = await supabase
          .from('profiles')
          .update(profileData)
          .eq('id', data.profileId);

        if (error) {
          console.error('Update error:', error);
          throw error;
        }
        console.log('Profile updated successfully with overwritten data:', profileData);
        return data.profileId;
      } else {
        console.log('Creating new profile...');
        // Try to create new profile, but handle conflicts gracefully
        try {
          const { data: newProfile, error } = await supabase
            .from('profiles')
            .upsert(profileData, {
              onConflict: 'user_id'  // This tells it to update if user_id already exists
            })
            .select('id');

          if (error) {
            console.error('Upsert error:', error);
            
            // If upsert fails, try to find existing profile and update it
            if (error.code === '23505') { // Duplicate key error
              console.log('Profile already exists, trying to update...');
              const { data: existingProfile, error: findError } = await supabase
                .from('profiles')
                .select('id')
                .eq('user_id', user.id)
                .single();
              
              if (findError) {
                console.error('Error finding existing profile:', findError);
                throw findError;
              }
              
              if (existingProfile) {
                console.log('Found existing profile, updating...');
                const { error: updateError } = await supabase
                  .from('profiles')
                  .update(profileData)
                  .eq('id', existingProfile.id);
                
                if (updateError) {
                  console.error('Update error:', updateError);
                  throw updateError;
                }
                
                console.log('Profile updated successfully via fallback method');
                return existingProfile.id;
              }
            }
            
            throw error;
          }
          
          console.log('Profile created successfully:', newProfile);
          return newProfile[0].id;
        } catch (upsertError) {
          console.error('Upsert failed, trying direct update...', upsertError);
          
          // Final fallback: try to update any existing profile
          const { data: existingProfile, error: findError } = await supabase
            .from('profiles')
            .select('id')
            .eq('user_id', user.id)
            .single();
          
          if (findError) {
            console.error('Error finding existing profile:', findError);
            throw findError;
          }
          
          if (existingProfile) {
            console.log('Updating existing profile via fallback...');
            const { error: updateError } = await supabase
              .from('profiles')
              .update(profileData)
              .eq('id', existingProfile.id);
            
            if (updateError) {
              console.error('Final update error:', updateError);
              throw updateError;
            }
            
            console.log('Profile updated successfully via final fallback');
            return existingProfile.id;
          }
          
          throw upsertError;
        }
      }
    } catch (error) {
      console.error('Save error:', error);
      toast({
        title: "Save Error",
        description: error instanceof Error ? error.message : "Failed to save profile data",
        variant: "destructive",
      });
      return null;
    }
  };

  // Helper function to ensure we have the correct profile ID
  const ensureProfileId = async (userData: OnboardingData): Promise<string | null> => {
    if (userData.profileId) {
      return userData.profileId;
    }
    
    // Try to find existing profile for this user
    const { data: existingProfile, error } = await supabase
      .from('profiles')
      .select('id')
      .eq('user_id', user?.id)
      .single();
    
    if (error && error.code !== 'PGRST116') {
      console.error('Error finding existing profile:', error);
      return null;
    }
    
    if (existingProfile) {
      console.log('Found existing profile:', existingProfile.id);
      return existingProfile.id;
    }
    
    return null;
  };

  // Function to patch individual fields to database
  const patchFieldToDatabase = async (field: string, value: string | boolean | object | null) => {
    if (!onboardingData.profileId) {
      console.error('No profile ID found for patching field');
      return;
    }

    try {
      // Map frontend field names to database field names
      const dbFieldMap: Record<string, string> = {
        // Step 1
        'handle': 'handle',
        'businessName': 'name', // Map naar 'name' kolom
        'isBusiness': 'is_business',
        
        // Step 2
        'bookingUrl': 'booking_url',
        'bookingMode': 'booking_mode',
        'useWhatsApp': 'use_whatsapp',
        'whatsappNumber': 'whatsapp_number',
        
        // Step 3
        'name': 'name',
        'slogan': 'slogan',
        'avatarFile': 'avatar_url',
        'banner': 'banner',
        'category': 'category',
        
        // Step 4
        'about': 'about',
        'socials': 'socials',
        'media': 'media',
        
        // Step 5
        'testimonials': 'testimonials',
        
        // Step 6
        'footerBusinessName': 'footer_business_name',
        'footerAddress': 'footer_address',
        'footerEmail': 'footer_email',
        'footerPhone': 'footer_phone',
        'footerHours': 'footer_hours',
        'footerNextAvailable': 'footer_next_available',
        'footerCancellationPolicy': 'footer_cancellation_policy',
        'footerPrivacyPolicy': 'footer_privacy_policy',
        'footerTermsOfService': 'footer_terms_of_service',
        'footerShowMaps': 'footer_show_maps',
        'footerShowAttribution': 'footer_show_attribution',
      };

      const dbField = dbFieldMap[field] || field;
      console.log(`🔧 Patching field ${field} (${dbField}) to database:`, value);
      console.log(`🔧 Profile ID:`, onboardingData.profileId);
      console.log(`🔧 Current onboarding data:`, onboardingData);
      
      // Special handling for about field to ensure testimonials are included
      if (field === 'about' && typeof value === 'object' && value !== null) {
        const aboutValue = value as Record<string, unknown>;
        console.log(`🔧 About field contains:`, {
          title: aboutValue.title,
          description: aboutValue.description,
          alignment: aboutValue.alignment,
          socialLinks: aboutValue.socialLinks,
          testimonials: aboutValue.testimonials,
          testimonialsCount: Array.isArray(aboutValue.testimonials) ? aboutValue.testimonials.length : 'not array'
        });
        
        // Additional validation for testimonials
        if (aboutValue.testimonials && Array.isArray(aboutValue.testimonials)) {
          console.log('🔧 Testimonials validation:');
          aboutValue.testimonials.forEach((testimonial, index) => {
            if (typeof testimonial === 'object' && testimonial !== null) {
              const t = testimonial as Record<string, unknown>;
              console.log(`  Testimonial ${index}:`, {
                customer_name: t.customer_name,
                review_title: t.review_title,
                review_text: t.review_text,
                image_url: t.image_url,
                has_file: '_file' in t
              });
            }
          });
        }
        
        // Log the exact value being sent to database
        console.log('🔧 About value being sent to database:', value);
        console.log('🔧 About value JSON:', JSON.stringify(value, null, 2));
      }
      
      console.log(`🔧 About to update database with field ${dbField}:`, value);
      console.log(`🔧 Database update query:`, {
        table: 'profiles',
        field: dbField,
        value: value,
        profileId: onboardingData.profileId
      });
      
      const { error } = await supabase
        .from('profiles')
        .update({
          [dbField]: value,
          updated_at: new Date().toISOString()
        })
        .eq('id', onboardingData.profileId);

      if (error) {
        console.error(`❌ Error patching field ${field} (${dbField}):`, error);
        console.error(`❌ Error details:`, {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        toast({
          title: "Save Failed",
          description: `Failed to save ${field}. Please try again.`,
          variant: "destructive",
        });
      } else {
        console.log(`✅ Field ${field} (${dbField}) patched successfully`);
        console.log(`✅ Database update completed for profile ${onboardingData.profileId}`);
        
        // Verify the data was saved by reading it back
        if (field === 'about') {
          console.log('🔧 Verifying about field was saved...');
          const { data: verifyData, error: verifyError } = await supabase
            .from('profiles')
            .select('about')
            .eq('id', onboardingData.profileId)
            .single();
          
          if (verifyError) {
            console.error('❌ Error verifying saved data:', verifyError);
          } else {
            console.log('✅ Verified saved about data:', verifyData?.about);
            console.log('✅ Raw about data from verification:', verifyData?.about);
            
            if (verifyData?.about && typeof verifyData.about === 'object') {
              const savedAbout = verifyData.about as Record<string, unknown>;
              console.log('✅ Saved about data structure:', {
                keys: Object.keys(savedAbout),
                hasTestimonials: 'testimonials' in savedAbout,
                testimonialsType: typeof savedAbout.testimonials,
                testimonialsIsArray: Array.isArray(savedAbout.testimonials)
              });
            }
          }
        }
      }
    } catch (error) {
      console.error(`❌ Unexpected error patching field ${field}:`, error);
      toast({
        title: "Save Failed",
        description: `Unexpected error saving ${field}. Please try again.`,
        variant: "destructive",
      });
    }
  };

  // Step handlers
  const handleStep1 = async (data: { handle: string; businessName?: string; isBusiness: boolean }) => {
    console.log('🔧 Step 1 data received:', data);
    
    try {
      // Eerst profiel aanmaken als deze nog niet bestaat
      if (!onboardingData.profileId) {
        const { data: newProfile, error: createError } = await supabase
          .from('profiles')
          .insert({
            user_id: user?.id,
            handle: data.handle.toLowerCase(),
            name: data.businessName || null,
            is_business: data.isBusiness,
            status: 'draft',
            onboarding_step: 1,
            onboarding_completed: false,
          })
          .select('id')
          .single();

        if (createError) {
          console.error('Error creating profile:', createError);
          toast({
            title: "Profile Creation Failed",
            description: "Could not create profile. Please try again.",
            variant: "destructive",
          });
          return;
        }

        // Update onboarding data met nieuwe profileId
        const updatedData = { 
          ...onboardingData, 
          ...data, 
          profileId: newProfile.id 
        };
        setOnboardingData(updatedData);
        
        console.log('✅ Profile created with ID:', newProfile.id);
      } else {
        // Profiel bestaat al, update alleen de velden
        const updatedData = { ...onboardingData, ...data };
        setOnboardingData(updatedData);
        
        // Update bestaande profiel
        await patchFieldToDatabase('handle', data.handle);
        if (data.businessName !== undefined) {
          await patchFieldToDatabase('name', data.businessName);
        }
        await patchFieldToDatabase('is_business', data.isBusiness);
      }
      
      // Ga naar volgende stap
      updateStep(2);
      
    } catch (error) {
      console.error('Error in handleStep1:', error);
      toast({
        title: "Step 1 Failed",
        description: "Could not save your information. Please try again.",
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
    const updatedData = { ...onboardingData, ...data };
    setOnboardingData(updatedData);
    
    // Patch all fields to database immediately
    if (data.bookingUrl) {
      await patchFieldToDatabase('booking_url', data.bookingUrl);
    }
    if (data.bookingMode) {
      await patchFieldToDatabase('booking_mode', data.bookingMode);
    }
    if (data.useWhatsApp !== undefined) {
      await patchFieldToDatabase('use_whatsapp', data.useWhatsApp);
    }
    if (data.whatsappNumber) {
      await patchFieldToDatabase('whatsapp_number', data.whatsappNumber);
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
    console.log('🔧 Current onboarding data before update:', onboardingData);
    
    const updatedData = { ...onboardingData, ...data };
    setOnboardingData(updatedData);
    
    console.log('🔧 Updated data:', updatedData);
    
    // Always patch business name (even if empty) to ensure it gets saved
    console.log('🔧 Patching business name:', data.businessName || '');
    await patchFieldToDatabase('name', data.businessName || '');
    
    // Patch slogan if provided
    if (data.slogan !== undefined) {
      console.log('🔧 Patching slogan:', data.slogan);
      await patchFieldToDatabase('slogan', data.slogan);
    }
    
    // Patch category if provided
    if (data.category !== undefined) {
      console.log('🔧 Patching category:', data.category);
      await patchFieldToDatabase('category', data.category);
    }
    
    // Patch banner if provided
    if (data.banner) {
      console.log('🔧 Patching banner:', data.banner);
      await patchFieldToDatabase('banner', data.banner);
    }
    
    updateStep(4);
  };

  const handleStep4 = async (data: { 
    avatarFile?: File;
    aboutTitle?: string;
    aboutDescription?: string;
  }) => {
    console.log('🔧 Step 4 data received:', data);
    console.log('🔧 Current onboarding data before update:', onboardingData);
    
    const updatedData = { ...onboardingData, ...data };
    setOnboardingData(updatedData);
    
    // Handle avatar file upload
    if (data.avatarFile) {
      console.log('🔧 Uploading new avatar file to storage:', data.avatarFile.name);
      try {
        const avatarUrl = await uploadFile(data.avatarFile, 'avatars');
        if (avatarUrl) {
          console.log('🔧 Avatar uploaded successfully, URL:', avatarUrl);
          // Update local state with the new URL
          setOnboardingData(prev => ({
            ...prev,
            avatar_url: avatarUrl
          }));
          // Patch the new URL to database
          await patchFieldToDatabase('avatar_url', avatarUrl);
        } else {
          console.error('🔧 Failed to upload avatar file');
        }
      } catch (error) {
        console.error('🔧 Error uploading avatar:', error);
      }
    } else if (onboardingData.avatar_url) {
      // Keep existing avatar URL if no new file uploaded
      console.log('🔧 Keeping existing avatar URL:', onboardingData.avatar_url);
      // No need to patch since the URL is already in the database
    }
    
    // Patch about section if provided
    if (data.aboutTitle !== undefined || data.aboutDescription !== undefined) {
      const aboutData = {
        title: data.aboutTitle,
        description: data.aboutDescription,
        alignment: onboardingData.aboutAlignment || 'center'
      };
      console.log('🔧 Patching about section:', aboutData);
      await patchFieldToDatabase('about', aboutData);
    }
    
    updateStep(5);
  };

  const handleStep5 = async (data: {
    aboutAlignment?: 'center' | 'left';
    aboutPhotoFile?: File;
    socials: OnboardingData['socials'];
    mediaFiles: File[];
  }) => {
    console.log('🔧 Step 5 data received:', data);
    console.log('🔧 Media files to upload:', data.mediaFiles);
    
    // Ensure maximum 6 media files
    const maxMediaFiles = 6;
    if (data.mediaFiles.length > maxMediaFiles) {
      toast({
        title: "Te veel bestanden",
        description: `Je kunt maximaal ${maxMediaFiles} afbeeldingen uploaden. Alleen de eerste ${maxMediaFiles} bestanden worden verwerkt.`,
        variant: "destructive",
      });
      // Limit to first 6 files
      data.mediaFiles = data.mediaFiles.slice(0, maxMediaFiles);
    }
    
    const updatedData = { ...onboardingData, ...data };
    setOnboardingData(updatedData);
    
    try {
      // Upload media files first
      const mediaUrls: string[] = [];
      if (data.mediaFiles.length > 0) {
        console.log('🔧 Starting media files upload...');
        for (const file of data.mediaFiles) {
          console.log('🔧 Uploading media file:', file.name);
          const url = await uploadFile(file, 'media');
          if (url) {
            mediaUrls.push(url);
            console.log('🔧 Media file uploaded successfully:', url);
          } else {
            console.error('🔧 Failed to upload media file:', file.name);
          }
        }
      }
      
      // Get existing about data to merge with new data
      const existingAbout = onboardingData.aboutTitle || onboardingData.aboutDescription || onboardingData.aboutAlignment ? {
        title: onboardingData.aboutTitle,
        description: onboardingData.aboutDescription,
        alignment: data.aboutAlignment || onboardingData.aboutAlignment || 'center'
      } : {
        alignment: data.aboutAlignment || 'center'
      };
      
      // Merge with existing socialLinks and testimonials
      const aboutData = {
        ...existingAbout,
        socialLinks: onboardingData.socialLinks,
        testimonials: onboardingData.testimonials
      };
      
      // Patch about section to database immediately
      console.log('🔧 Patching about section to database:', aboutData);
      await patchFieldToDatabase('about', aboutData);
      
      // Patch socials to database immediately
      console.log('🔧 Patching socials to database:', data.socials);
      await patchFieldToDatabase('socials', data.socials);
      
      // Patch media metadata to database immediately
      if (mediaUrls.length > 0) {
        const mediaData = {
          items: mediaUrls.map((url, index) => ({
            id: `media-${Date.now()}-${index}`,
            url: url,
            type: 'image',
            order: index
          }))
        };
        console.log('🔧 Patching media data to database:', mediaData);
        await patchFieldToDatabase('media', mediaData);
        
        // Update local state with the uploaded URLs
        setOnboardingData(prev => ({
          ...prev,
          media: mediaData
        }));
      }
      
      console.log('🔧 Step 5 completed successfully');
      updateStep(6);
      
    } catch (error) {
      console.error('🔧 Error in handleStep5:', error);
      toast({
        title: "Save Error",
        description: "Failed to save media and social data. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Test function to manually save testimonials data
  const testSaveTestimonials = async () => {
    if (!onboardingData.profileId) {
      console.error('❌ No profile ID found for testing testimonials save');
      toast({
        title: "Test Error",
        description: "No profile ID found. Please complete the onboarding first.",
        variant: "destructive",
      });
      return;
    }

    try {
      console.log('🧪 Testing testimonials save...');
      
      // Create test testimonials data
      const testTestimonials = [
        {
          customer_name: 'Test Klant 1',
          review_title: 'Geweldige service!',
          review_text: 'Ze overtrof mijn verwachtingen volledig.',
          image_url: 'https://via.placeholder.com/300x400/6E56CF/FFFFFF?text=Test+Klant+1'
        },
        {
          customer_name: 'Test Klant 2',
          review_title: 'Fantastische ervaring',
          review_text: 'Zeer professioneel en betrouwbaar.',
          image_url: 'https://via.placeholder.com/300x400/6E56CF/FFFFFF?text=Test+Klant+2'
        }
      ];

      // Get existing about data
      const existingAbout = onboardingData.aboutTitle || onboardingData.aboutDescription || onboardingData.aboutAlignment ? {
        title: onboardingData.aboutTitle,
        description: onboardingData.aboutDescription,
        alignment: onboardingData.aboutAlignment || 'center'
      } : {
        alignment: 'center'
      };

      // Create about data with testimonials
      const aboutData = {
        ...existingAbout,
        socialLinks: onboardingData.socialLinks || [],
        testimonials: testTestimonials
      };

      console.log('🧪 Test about data:', aboutData);

      // Save to database
      await patchFieldToDatabase('about', aboutData);
      console.log('✅ Test testimonials saved successfully');

      // Verify the data was saved
      const { data: verifyData, error: verifyError } = await supabase
        .from('profiles')
        .select('about')
        .eq('id', onboardingData.profileId)
        .single();

      if (verifyError) {
        console.error('❌ Error verifying test testimonials:', verifyError);
      } else {
        console.log('✅ Verified test testimonials:', verifyData?.about);
        if (verifyData?.about && typeof verifyData.about === 'object') {
          const savedAbout = verifyData.about as Record<string, unknown>;
          console.log('✅ Test testimonials count:', Array.isArray(savedAbout.testimonials) ? savedAbout.testimonials.length : 'not array');
        }
      }

      toast({
        title: "Test Success",
        description: "Test testimonials saved successfully!",
      });

    } catch (error) {
      console.error('❌ Error testing testimonials save:', error);
      toast({
        title: "Test Error",
        description: "Failed to save test testimonials. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleStep6 = async (data: {
    socialLinks: OnboardingData['socialLinks'];
    testimonials: OnboardingData['testimonials'];
  }) => {
    console.log('🔧 handleStep6 called with data:', data);
    console.log('🔧 Data type:', typeof data);
    console.log('🔧 Data JSON:', JSON.stringify(data, null, 2));
    console.log('🔧 Current onboarding data:', onboardingData);
    
    const updatedData = { ...onboardingData, ...data };
    setOnboardingData(updatedData);
    
    // Get existing about data to merge with new data
    const existingAbout = onboardingData.aboutTitle || onboardingData.aboutDescription || onboardingData.aboutAlignment ? {
      title: onboardingData.aboutTitle,
      description: onboardingData.aboutDescription,
      alignment: onboardingData.aboutAlignment || 'center'
    } : {
      alignment: 'center'
    };
    
    console.log('🔧 Existing about data:', existingAbout);
    
    // Process testimonials: upload images and get URLs
    console.log('🔧 Processing testimonials...');
    const processedTestimonials = await Promise.all(
      data.testimonials.map(async (testimonial) => {
        console.log('🔧 Processing testimonial:', testimonial);
        if (testimonial._file) {
          try {
            // Upload testimonial image to existing media bucket
            const imageUrl = await uploadFile(testimonial._file, 'media');
            console.log('✅ Testimonial image uploaded to media bucket:', imageUrl);
            
            return {
              ...testimonial,
              image_url: imageUrl,
              _file: undefined // Remove file object
            };
          } catch (error) {
            console.error('❌ Error uploading testimonial image:', error);
            // Keep existing image_url if upload fails
            return {
              ...testimonial,
              _file: undefined
            };
          }
        }
        console.log('🔧 Testimonial processed (no file):', testimonial);
        return testimonial;
      })
    );
    
    console.log('🔧 Processed testimonials:', processedTestimonials);
    console.log('🔧 Processed testimonials count:', processedTestimonials.length);
    
    // Ensure we have a profile ID before saving
    let profileId = onboardingData.profileId;
    
    if (!profileId) {
      console.log('🔧 No profile ID found, attempting to create or find existing profile...');
      
      try {
        // First try to find an existing profile for this user
        const { data: existingProfile, error: findError } = await supabase
          .from('profiles')
          .select('id')
          .eq('user_id', user?.id)
          .single();
        
        if (findError && findError.code !== 'PGRST116') {
          console.error('❌ Error finding existing profile:', findError);
        } else if (existingProfile) {
          profileId = existingProfile.id;
          console.log('✅ Found existing profile with ID:', profileId);
          
          // Update local state with the found profile ID
          setOnboardingData(prev => ({
            ...prev,
            profileId: profileId
          }));
        }
        
        // If still no profile ID, create a new one
        if (!profileId) {
          console.log('🔧 Creating new profile for user...');
          const { data: newProfile, error: createError } = await supabase
            .from('profiles')
            .insert({
              user_id: user?.id,
              handle: onboardingData.handle || '',
              status: 'draft',
              onboarding_step: 6,
              onboarding_completed: false
            })
            .select('id')
            .single();
          
          if (createError) {
            console.error('❌ Error creating new profile:', createError);
            toast({
              title: "Profile Creation Error",
              description: "Failed to create profile. Please try again.",
              variant: "destructive",
            });
            return;
          }
          
          profileId = newProfile.id;
          console.log('✅ Created new profile with ID:', profileId);
          
          // Update local state with the new profile ID
          setOnboardingData(prev => ({
            ...prev,
            profileId: profileId
          }));
        }
      } catch (error) {
        console.error('❌ Error in profile ID fallback logic:', error);
        toast({
          title: "Profile Error",
          description: "Failed to create or find profile. Please try again.",
          variant: "destructive",
        });
        return;
      }
    }
    
    if (!profileId) {
      console.error('❌ Still no profile ID available, cannot save testimonials');
      toast({
        title: "Save Error",
        description: "No profile ID available. Please try again.",
        variant: "destructive",
      });
      return;
    }
    
          // Save testimonials data to database in multiple locations for better accessibility
      try {
        console.log('🔧 Saving testimonials data to database with profile ID:', profileId);
      
      // 1. Save testimonials directly to the testimonials column (NEW APPROACH)
      const testimonialsData = processedTestimonials.map(testimonial => ({
        id: `testimonial-${Date.now()}-${Math.random()}`,
        customer_name: testimonial.customer_name,
        review_title: testimonial.review_title,
        review_text: testimonial.review_text,
        image_url: testimonial.image_url
      }));
      
      console.log('🔧 Saving testimonials to testimonials column:', testimonialsData);
      
      // Save testimonials to the dedicated testimonials column
      const { error: testimonialsError } = await supabase
        .from('profiles')
        .update({
          testimonials: testimonialsData,
          updated_at: new Date().toISOString()
        })
        .eq('id', profileId);
      
      if (testimonialsError) {
        console.error('❌ Error saving testimonials to testimonials column:', testimonialsError);
        throw testimonialsError;
      } else {
        console.log('✅ Testimonials saved to testimonials column successfully');
      }
      
      // 2. Also save testimonials in the about section for backward compatibility
      const aboutData = {
        ...existingAbout,
        socialLinks: data.socialLinks,
        testimonials: cleanTestimonialsData(processedTestimonials)
      };
      
      console.log('🔧 Saving about data with testimonials (backward compatibility):', aboutData);
      await patchFieldToDatabase('about', aboutData);
      console.log('✅ About section saved successfully with testimonials');
      
      // 3. Update local state to ensure consistency
      setOnboardingData(prev => ({
        ...prev,
        socialLinks: data.socialLinks,
        testimonials: processedTestimonials
      }));
      
      // 4. Verify the data was saved by reading it back
      console.log('🔧 Verifying saved data...');
      const { data: verifyData, error: verifyError } = await supabase
        .from('profiles')
        .select('about, testimonials')
        .eq('id', profileId)
        .single();
      
      if (verifyError) {
        console.error('❌ Error verifying saved testimonials:', verifyError);
      } else {
        const verifiedData = verifyData as unknown as Record<string, unknown>;
        console.log('✅ Verified saved data:', verifiedData);
        console.log('✅ Raw about data from DB:', verifiedData?.about);
        console.log('✅ Raw testimonials data from DB:', verifiedData?.testimonials);
        
        // Check about section
        if (verifiedData?.about && typeof verifiedData.about === 'object') {
          const savedAbout = verifiedData.about as Record<string, unknown>;
          console.log('✅ About section contains:', {
            title: savedAbout.title,
            description: savedAbout.description,
            alignment: savedAbout.alignment,
            socialLinks: savedAbout.socialLinks,
            testimonials: savedAbout.testimonials
          });
          
          if (Array.isArray(savedAbout.testimonials)) {
            console.log('✅ About section testimonials count:', savedAbout.testimonials.length);
            savedAbout.testimonials.forEach((testimonial, index) => {
              if (typeof testimonial === 'object' && testimonial !== null) {
                const t = testimonial as Record<string, unknown>;
                console.log(`✅ About section testimonial ${index}:`, {
                  customer_name: t.customer_name,
                  review_title: t.review_title,
                  review_text: t.review_text,
                  image_url: t.image_url
                });
              }
            });
          } else {
            console.log('❌ Testimonials in about section is not an array:', typeof savedAbout.testimonials);
          }
        } else {
          console.log('❌ About section is not an object or is null:', verifiedData?.about);
        }
        
        // Check testimonials column
        const testimonialsColumn = verifiedData?.testimonials;
        if (testimonialsColumn && Array.isArray(testimonialsColumn)) {
          console.log('✅ Testimonials column count:', testimonialsColumn.length);
          testimonialsColumn.forEach((testimonial: Record<string, unknown>, index: number) => {
            if (typeof testimonial === 'object' && testimonial !== null) {
              console.log(`✅ Testimonials column testimonial ${index}:`, {
                customer_name: testimonial.customer_name,
                review_title: testimonial.review_title,
                review_text: testimonial.review_text,
                image_url: testimonial.image_url
              });
            }
          });
        } else {
          console.log('❌ Testimonials column is not an array or is null:', testimonialsColumn);
        }
        
        console.log('✅ Verification complete - testimonials are saved in both locations');
      }
      
      console.log('🎉 All testimonials data saved successfully!');
      toast({
        title: "Opgeslagen!",
        description: "Je klantenbeoordelingen en sociale media links zijn opgeslagen.",
      });
      
    } catch (error) {
      console.error('❌ Error saving testimonials data:', error);
      toast({
        title: "Save Error",
        description: "Failed to save testimonials and social data. Please try again.",
        variant: "destructive",
      });
      return;
    }
    
    updateStep(7);
  };

  const handleStep7 = async (data: {
    footerBusinessName?: string;
    footerAddress?: string;
    footerEmail?: string;
    footerPhone?: string;
    footerHours?: OnboardingData['footerHours'];
    footerNextAvailable?: string;
    footerCancellationPolicy?: string;
    footerPrivacyPolicy?: string;
    footerTermsOfService?: string;
    footerShowMaps?: boolean;
    footerShowAttribution?: boolean;
  }) => {
    const updatedData = { ...onboardingData, ...data };
    setOnboardingData(updatedData);
    
    // Patch all footer fields to database immediately
    if (data.footerBusinessName) {
      await patchFieldToDatabase('footerBusinessName', data.footerBusinessName);
    }
    if (data.footerAddress) {
      await patchFieldToDatabase('footerAddress', data.footerAddress);
    }
    if (data.footerEmail) {
      await patchFieldToDatabase('footerEmail', data.footerEmail);
    }
    if (data.footerPhone) {
      await patchFieldToDatabase('footerPhone', data.footerPhone);
    }
    if (data.footerHours) {
      await patchFieldToDatabase('footerHours', data.footerHours);
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
    
    // Also save footer data in about JSON field as fallback
    const existingAbout = onboardingData.aboutTitle || onboardingData.aboutDescription || onboardingData.aboutAlignment ? {
      title: onboardingData.aboutTitle,
      description: onboardingData.aboutDescription,
      alignment: onboardingData.aboutAlignment || 'center'
    } : {
      alignment: 'center'
    };
    
    const aboutData = {
      ...existingAbout,
      footer: {
        businessName: data.footerBusinessName,
        address: data.footerAddress,
        email: data.footerEmail,
        phone: data.footerPhone,
        hours: data.footerHours,
        nextAvailable: data.footerNextAvailable,
        cancellationPolicy: data.footerCancellationPolicy,
        privacyPolicy: data.footerPrivacyPolicy,
        termsOfService: data.footerTermsOfService,
        showMaps: data.footerShowMaps,
        showAttribution: data.footerShowAttribution
      }
    };
    
    // Patch about section with footer data
    await patchFieldToDatabase('about', aboutData);
    
    // Navigate to preview step
    updateStep(8);
  };

  const startLivePreview = async () => {
    try {
      console.log('🔧 Starting live preview for handle:', onboardingData.handle);
      
      // Validate required fields before proceeding
      if (!onboardingData.handle || onboardingData.handle.trim().length === 0) {
        throw new Error('Handle is verplicht om de preview te starten.');
      }
      
      if (!user?.id) {
        throw new Error('Je bent niet ingelogd. Log opnieuw in om de preview te starten.');
      }
      
      // If no profile exists yet, we need to create one first
      let profileId = onboardingData.profileId;
      
      if (!profileId) {
        console.log('🔧 No profile ID found, creating temporary profile for preview...');
        
        try {
          // Create a temporary profile with 'published' status for preview
          const tempProfileData = {
            user_id: user.id,
            handle: onboardingData.handle.trim().toLowerCase(),
            status: 'published', // Use 'published' status for preview
            name: onboardingData.businessName || onboardingData.name || 'Tijdelijke Preview',
            slogan: onboardingData.slogan || '',
            avatar_url: onboardingData.avatar_url || null,
            category: onboardingData.category || 'Other',
            accent_color: '#6E56CF',
            theme_mode: 'light',
            booking_url: onboardingData.bookingUrl || '',
            booking_mode: onboardingData.bookingMode || 'embed',
            socials: onboardingData.socials || {},
            about: {
              title: onboardingData.aboutTitle || '',
              description: onboardingData.aboutDescription || '',
              alignment: onboardingData.aboutAlignment || 'center',
              preview_info: {
                is_preview: true,
                expires_at: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
                started_at: new Date().toISOString()
              }
            },
            media: {
              items: []
            },
            contact: {},
            banner: onboardingData.banner || {},
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };
          
          console.log('🔧 Creating temporary profile with data:', tempProfileData);
          
          const { data: newProfile, error: createError } = await supabase
            .from('profiles')
            .insert(tempProfileData)
            .select('id')
            .single();
          
          if (createError) {
            console.error('🔧 Error creating temporary profile:', createError);
            throw createError;
          }
          
          profileId = newProfile.id;
          console.log('🔧 Temporary profile created with ID:', profileId);
          
          // Update local state with the new profile ID
          setOnboardingData(prev => ({
            ...prev,
            profileId: profileId
          }));
          
        } catch (createError: unknown) {
          console.error('🔧 Failed to create temporary profile:', createError);
          
          // Provide specific error messages based on the error type
          const errorMessage = createError instanceof Error ? createError.message : 'Onbekende fout';
          if (errorMessage.includes('duplicate key')) {
            throw new Error('Er bestaat al een profiel met deze handle. Probeer een andere handle te kiezen.');
          } else if (errorMessage.includes('row-level security')) {
            throw new Error('Geen toegang tot database. Probeer opnieuw in te loggen.');
          } else if (errorMessage.includes('null value')) {
            throw new Error('Vul eerst je handle en basis informatie in voordat je de preview start.');
          } else if (errorMessage.includes('Handle is immutable')) {
            throw new Error('Deze handle is al in gebruik. Kies een andere handle.');
          } else {
            throw new Error(`Kon geen profiel aanmaken voor preview: ${errorMessage}`);
          }
        }
      }
      
      // Update the profile status to 'published' in the database
      // Store preview info in about section
      const updateData: Record<string, string | Date | object> = {
        status: 'published', // Set to published for preview
        updated_at: new Date().toISOString()
      };
      
      // Get existing about data to merge with preview info
      const currentAbout = onboardingData.aboutTitle || onboardingData.aboutDescription || onboardingData.aboutAlignment ? {
        title: onboardingData.aboutTitle,
        description: onboardingData.aboutDescription,
        alignment: onboardingData.aboutAlignment || 'center'
      } : {};
      
      // Add preview info to about section
      const aboutData = {
        ...currentAbout,
        preview_info: {
          is_preview: true,
          expires_at: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
          started_at: new Date().toISOString()
        }
      };
      
      console.log('🔧 Updating profile status to published for preview');
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          ...updateData,
          about: aboutData
        })
        .eq('id', profileId);
      
      if (updateError) {
        console.error('🔧 Error updating profile status to published:', updateError);
        throw updateError;
      }
      
      console.log('🔧 Profile status updated to published for preview');
      
      // Update local state
      setIsLivePreviewActive(true);
      
      // Update onboarding data with new status
      setOnboardingData(prev => ({
        ...prev,
        status: 'published'
      }));
      
      toast({
        title: "Live Preview Gestart",
        description: "Je pagina is nu 15 minuten live zichtbaar voor bezoekers.",
      });

      // Auto-expire after 15 minutes
      setTimeout(async () => {
        try {
          // Update profile status back to 'draft' in database
          if (profileId) {
            const { error: expireError } = await supabase
              .from('profiles')
              .update({
                status: 'draft',
                updated_at: new Date().toISOString(),
                about: { // Clear preview_info from about section
                  ...(onboardingData.aboutTitle || onboardingData.aboutDescription || onboardingData.aboutAlignment ? {
                    title: onboardingData.aboutTitle,
                    description: onboardingData.aboutDescription,
                    alignment: onboardingData.aboutAlignment || 'center'
                  } : {}),
                  preview_info: null
                }
              })
              .eq('id', profileId);
            
            if (expireError) {
              console.error('🔧 Error expiring preview:', expireError);
            } else {
              console.log('🔧 Preview expired successfully');
            }
          }
          
          // Update local state
          setIsLivePreviewActive(false);
          setOnboardingData(prev => ({
            ...prev,
            status: 'draft'
          }));
          
          toast({
            title: "Live Preview Verlopen",
            description: "Je pagina is terug in conceptmodus.",
          });
          
        } catch (error) {
          console.error('🔧 Error during preview expiry:', error);
        }
      }, 15 * 60 * 1000);
      
    } catch (error: unknown) {
      console.error('🔧 Failed to start live preview:', error);
      const errorMessage = error instanceof Error ? error.message : "Er is een fout opgetreden bij het starten van de live preview.";
      toast({
        title: "Live Preview Mislukt",
        description: errorMessage,
        variant: "destructive",
      });
      throw error; // Re-throw so Step7Preview knows it failed
    }
  };

  const handleSubscribe = async () => {
    try {
      console.log('Starting subscription flow for handle:', onboardingData.handle);
      
      if (!onboardingData.handle) {
        toast({
          title: "Fout",
          description: "Geen handle gevonden. Publiceer eerst je profiel.",
          variant: "destructive",
        });
        return;
      }

      // Get profile ID from the database using the handle
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('id')
        .eq('handle', onboardingData.handle)
        .single();
      
      if (error || !profile?.id) {
        throw new Error('Profile niet gevonden');
      }

      // Redirect to Stripe checkout
      await StripeService.redirectToCheckout({
        profileId: profile.id,
        successUrl: `${window.location.origin}/dashboard?success=true&subscription=active`,
        cancelUrl: `${window.location.origin}/onboarding?step=7`,
      });
      
    } catch (error) {
      console.error('Failed to start subscription:', error);
      toast({
        title: "Abonnement Mislukt",
        description: "Er is een fout opgetreden bij het starten van het abonnement. Probeer het opnieuw.",
        variant: "destructive",
      });
    }
  };

  const handlePublish = async () => {
    setIsPublishing(true);
    console.log('Publishing profile with data:', onboardingData);
    
    try {
      const profileData = {
        ...onboardingData,
        subscriptionStatus: 'pending',
        subscriptionPlan: 'monthly'
      };
      
      const profileId = await saveProfileData(profileData, 'draft');
      if (profileId) {
        console.log('Profile saved successfully with ID:', profileId);
        
        // Update onboarding completion status
        try {
          await supabase
            .from('profiles')
            .update({
              onboarding_completed: true,
              onboarding_step: 8,
              updated_at: new Date().toISOString()
            })
            .eq('id', profileId);
        } catch (error) {
          console.error('Error updating onboarding completion status:', error);
        }
        
        toast({
          title: "Profiel Opgeslagen! 🎉",
          description: "Je profiel is opgeslagen. Start je abonnement om je pagina live te maken.",
        });
        
        // Start Stripe checkout immediately
        await handleSubscribe();
      } else {
        console.log('Profile saving failed');
        toast({
          title: "Opslaan Mislukt",
          description: "Je profiel kon niet worden opgeslagen. Probeer het opnieuw.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Publishing error:', error);
      toast({
        title: "Publishing Error",
        description: "An error occurred while publishing your profile.",
        variant: "destructive",
      });
    } finally {
      setIsPublishing(false);
    }
  };

  const handleSaveDraft = async () => {
    try {
      const profileId = await saveProfileData(onboardingData, 'draft');
      if (profileId) {
        // Update onboarding step but don't mark as completed
        try {
          await supabase
            .from('profiles')
            .update({
              onboarding_step: currentStep,
              updated_at: new Date().toISOString()
            })
            .eq('id', profileId);
        } catch (error) {
          console.error('Error updating onboarding step:', error);
        }
        
        toast({
          title: "Draft Saved",
          description: "Your progress has been saved. You can finish later.",
        });
        navigate(`/onboarding?step=${currentStep}`);
      } else {
        toast({
          title: "Save Failed",
          description: "Failed to save your draft. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Draft save error:', error);
      toast({
        title: "Save Error",
        description: "An error occurred while saving your draft.",
        variant: "destructive",
      });
    }
  };

  const handleEditPage = () => {
    navigate('/dashboard');
  };

  // Navigation handlers
  const goBack = () => {
    if (currentStep > 1) {
      updateStep(currentStep - 1);
    }
  };



  // Determine if profile can be published
  const canPublish = () => {
    const requiredFields = [
      onboardingData.handle,
      onboardingData.bookingUrl,
    ];
    
    // For businesses, require business name
    if (onboardingData.isBusiness) {
      requiredFields.push(onboardingData.businessName);
    }
    
    // For individuals, require personal name
    if (!onboardingData.isBusiness) {
      requiredFields.push(onboardingData.name);
    }
    
    // Check if all required fields are filled
    const hasAllRequired = requiredFields.every(field => field && field.trim().length > 0);
    
    console.log('Publish validation:', {
      requiredFields,
      hasAllRequired,
      isBusiness: onboardingData.isBusiness,
      businessName: onboardingData.businessName,
      personalName: onboardingData.name
    });
    
    return hasAllRequired;
  };

  // Determine if live preview can be started
  const canStartPreview = () => {
    // Basic requirements for preview
    const hasHandle = onboardingData.handle && onboardingData.handle.trim().length > 0;
    const hasBasicInfo = onboardingData.businessName || onboardingData.name;
    const hasUser = !!user?.id;
    
    // Check if we're not already in preview mode
    const notInPreview = onboardingData.status !== 'preview';
    
    const canStart = hasHandle && hasBasicInfo && hasUser && notInPreview;
    
    console.log('Preview validation:', {
      hasHandle,
      hasBasicInfo,
      hasUser,
      notInPreview,
      canStart,
      currentStatus: onboardingData.status,
      handle: onboardingData.handle,
      businessName: onboardingData.businessName,
      name: onboardingData.name
    });
    
    return canStart;
  };

  if (isInitialLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Gegevens laden...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect via useEffect
  }

  return (
    <div className="min-h-screen bg-background">
      {/* TapBookr Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            {/* TapBookr Branding */}
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900">TapBookr</h1>
            </div>
            
            {/* Progress Indicator */}
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-2 text-sm text-gray-600">
                <span>Step {currentStep}/8</span>
                <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary transition-all duration-300"
                    style={{ width: `${(currentStep / 8) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content with Header Spacing */}
      <div className="pt-20">
        {/* Render current step */}
        {(() => {
          switch (currentStep) {
            case 1:
              return (
                <Step1Handle 
                  onNext={handleStep1} 
                  onBack={() => navigate('/')}
                  existingData={{
                    handle: onboardingData.handle,
                    businessName: onboardingData.businessName,
                    isBusiness: onboardingData.isBusiness,
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
                  handle={onboardingData.handle}
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
                  requiresName={onboardingData.isBusiness || false}
                  handle={onboardingData.handle}
                  existingData={{
                    name: onboardingData.name || onboardingData.businessName,
                    slogan: onboardingData.slogan,
                    banner: onboardingData.banner,
                    category: onboardingData.category,
                  }}
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
                    avatar_url: onboardingData.avatar_url,
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
                    aboutAlignment: onboardingData.aboutAlignment,
                    aboutPhotoFile: onboardingData.aboutPhotoFile,
                    name: onboardingData.businessName || onboardingData.name,
                    socials: onboardingData.socials,
                    mediaFiles: onboardingData.mediaFiles,
                    whatsappNumber: onboardingData.whatsappNumber,
                    media: onboardingData.media,
                    // Pass about content from Step4PersonalImage
                    aboutTitle: onboardingData.aboutTitle,
                    aboutDescription: onboardingData.aboutDescription,
                    avatar_url: onboardingData.avatar_url,
                  }}
                />
              );
            
            case 6:
              return (
                <Step5SocialTestimonials 
                  onNext={handleStep6} 
                  onBack={goBack}
                  handle={onboardingData.handle}
                  existingData={{
                    socialLinks: onboardingData.socialLinks,
                    testimonials: onboardingData.testimonials,
                  }}
                />
              );

            case 7:
              return (
                <Step6Footer
                  onNext={handleStep7}
                  onBack={goBack}
                  handle={onboardingData.handle}
                  existingData={{
                    footerBusinessName: onboardingData.footerBusinessName,
                    footerAddress: onboardingData.footerAddress,
                    footerEmail: onboardingData.footerEmail,
                    footerPhone: onboardingData.footerPhone,
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
                  onPublish={handlePublish}
                  onSaveDraft={handleSaveDraft}
                  onBack={goBack}
                  onStartLivePreview={startLivePreview}
                  handle={onboardingData.handle}
                  canPublish={canPublish()}
                  isPublishing={isPublishing}
                  isPreviewActive={isLivePreviewActive}
                  profileData={{
                    handle: onboardingData.handle || '',
                    name: onboardingData.name || onboardingData.businessName,
                    slogan: onboardingData.slogan || '',
                    category: onboardingData.category || '',
                    avatar_url: onboardingData.avatar_url || '',
                    banner: onboardingData.banner || {},
                    aboutTitle: onboardingData.aboutTitle || '',
                    aboutDescription: onboardingData.aboutDescription || '',
                    aboutAlignment: onboardingData.aboutAlignment || 'center',
                    socials: onboardingData.socials || {},
                    socialLinks: onboardingData.socialLinks || [],
                    mediaFiles: onboardingData.mediaFiles || [],
                    testimonials: onboardingData.testimonials || [],
                    bookingUrl: onboardingData.bookingUrl || '',
                    bookingMode: onboardingData.bookingMode || 'embed',
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
                      showAttribution: onboardingData.footerShowAttribution
                    }
                  }}
                />
              );
            
            default:
              // Invalid step, redirect to step 1
              updateStep(1);
              return null;
          }
        })()}
      </div>
    </div>
  );
}