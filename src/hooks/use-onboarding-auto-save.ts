import { useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Json } from '@/integrations/supabase/types';

interface AutoSaveOptions {
  enabled?: boolean;
  delay?: number;
}

export const useOnboardingAutoSave = (
  profileId: string | undefined,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onboardingData: any,
  options: AutoSaveOptions = {}
) => {
  const { enabled = true, delay = 2000 } = options;
  const { toast } = useToast();
  const timeoutRef = useRef<NodeJS.Timeout>();
  const previousDataRef = useRef<string>();

  const saveToDatabase = useCallback(async () => {
    if (!profileId || !enabled) return;

    try {
      console.log('🔧 Auto-saving onboarding data...', profileId);
      
      const { error } = await supabase
        .from('profiles')
        .update({
          name: onboardingData.businessName as string || onboardingData.name as string || null,
          is_business: onboardingData.isBusiness as boolean || false,
          slogan: onboardingData.slogan as string || null,
          category: onboardingData.category as string || null,
          avatar_url: onboardingData.avatar_url as string || null,
          banner: (onboardingData.banner as Json) || {},
          booking_url: onboardingData.bookingUrl as string || null,
          booking_mode: onboardingData.bookingMode as string || 'embed',
          use_whatsapp: onboardingData.useWhatsApp as boolean || false,
          whatsapp_number: onboardingData.whatsappNumber as string || null,
          about: {
            title: onboardingData.aboutTitle || '',
            description: onboardingData.aboutDescription || '',
            alignment: onboardingData.aboutAlignment || 'center',
            socialLinks: onboardingData.socialLinks || [],
          } as Json,
          socials: (onboardingData.socials as Json) || {},
          media: (onboardingData.media as Json) || { items: [] },
          testimonials: (onboardingData.testimonials as Json) || [],
          footer_business_name: onboardingData.footerBusinessName as string || null,
          footer_address: onboardingData.footerAddress as string || null,
          footer_email: onboardingData.footerEmail as string || null,
          footer_phone: onboardingData.footerPhone as string || null,
          footer_hours: (onboardingData.footerHours as Json) || null,
          footer_next_available: onboardingData.footerNextAvailable as string || null,
          footer_cancellation_policy: onboardingData.footerCancellationPolicy as string || null,
          footer_privacy_policy: onboardingData.footerPrivacyPolicy as string || null,
          footer_terms_of_service: onboardingData.footerTermsOfService as string || null,
          footer_show_maps: onboardingData.footerShowMaps as boolean ?? true,
          footer_show_attribution: onboardingData.footerShowAttribution as boolean ?? true,
          updated_at: new Date().toISOString(),
        })
        .eq('id', profileId);

      if (error) {
        console.error('Auto-save error:', error);
        toast({
          title: "Auto-save failed",
          description: "Your changes couldn't be saved automatically.",
          variant: "destructive",
        });
        return;
      }

      console.log('✅ Auto-save successful');
    } catch (error) {
      console.error('Auto-save exception:', error);
    }
  }, [profileId, onboardingData, enabled, toast]);

  const debouncedSave = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      saveToDatabase();
    }, delay);
  }, [saveToDatabase, delay]);

  useEffect(() => {
    const currentDataString = JSON.stringify(onboardingData);
    
    // Only trigger save if data has actually changed
    if (previousDataRef.current && previousDataRef.current !== currentDataString) {
      debouncedSave();
    }
    
    previousDataRef.current = currentDataString;
  }, [onboardingData, debouncedSave]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return { saveToDatabase };
};