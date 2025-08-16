import { useState, useCallback, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

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

export interface OnboardingData {
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
  
  // Preview fields
  preview_expires_at?: string;
  preview_started_at?: string;
}

const initialData: OnboardingData = {
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
};

// Optimized cache key for localStorage
const CACHE_KEY = 'onboarding_profile_cache_v2';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

interface CachedData {
  data: OnboardingData;
  timestamp: number;
  userId: string;
}

export const useOnboardingData = () => {
  const [data, setData] = useState<OnboardingData>(initialData);
  const [isLoading, setIsLoading] = useState(true);
  const [profileId, setProfileId] = useState<string | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  // Get cached data
  const getCachedData = useCallback((): OnboardingData | null => {
    if (!user?.id) return null;
    
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (!cached) return null;
      
      const parsedCache: CachedData = JSON.parse(cached);
      const isExpired = Date.now() - parsedCache.timestamp > CACHE_DURATION;
      const isWrongUser = parsedCache.userId !== user.id;
      
      if (isExpired || isWrongUser) {
        localStorage.removeItem(CACHE_KEY);
        return null;
      }
      
      return parsedCache.data;
    } catch {
      localStorage.removeItem(CACHE_KEY);
      return null;
    }
  }, [user?.id]);

  // Set cached data
  const setCachedData = useCallback((data: OnboardingData) => {
    if (!user?.id) return;
    
    try {
      const cacheData: CachedData = {
        data,
        timestamp: Date.now(),
        userId: user.id,
      };
      localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
    } catch (error) {
      console.error('Failed to cache profile data:', error);
    }
  }, [user?.id]);

  // Clean testimonials data
  const cleanTestimonials = useCallback((testimonials: OnboardingData['testimonials']) => {
    return testimonials.map(({ _file, ...testimonial }) => testimonial);
  }, []);

  // Process profile data efficiently
  const processProfileData = useCallback((profile: any): OnboardingData => {
    // Handle testimonials from both sources
    let testimonials: OnboardingData['testimonials'] = [];
    
    if (profile.testimonials && Array.isArray(profile.testimonials)) {
      testimonials = profile.testimonials;
    } else if (profile.about?.testimonials && Array.isArray(profile.about.testimonials)) {
      testimonials = profile.about.testimonials;
    }

    return {
      ...initialData,
      profileId: profile.id,
      status: profile.status,
      handle: profile.handle || '',
      name: profile.name || '',
      slogan: profile.slogan || '',
      category: profile.category || '',
      avatar_url: profile.avatar_url || '',
      banner: profile.banner || undefined,
      bookingUrl: profile.booking_url || '',
      bookingMode: profile.booking_mode || 'embed',
      useWhatsApp: profile.use_whatsapp || false,
      whatsappNumber: profile.whatsapp_number || '',
      aboutTitle: profile.about?.title || '',
      aboutDescription: profile.about?.description || '',
      aboutAlignment: profile.about?.alignment || 'center',
      media: profile.media || { items: [] },
      socials: profile.socials || {},
      socialLinks: profile.about?.socialLinks || [],
      testimonials: cleanTestimonials(testimonials),
      // Footer data - prioritize columns over JSON
      footerBusinessName: profile.footer_business_name || profile.footer?.businessName || '',
      footerAddress: profile.footer_address || profile.footer?.address || '',
      footerEmail: profile.footer_email || profile.footer?.email || '',
      footerPhone: profile.footer_phone || profile.footer?.phone || '',
      footerHours: profile.footer_hours || profile.footer?.hours || undefined,
      footerNextAvailable: profile.footer_next_available || profile.footer?.nextAvailable || '',
      footerCancellationPolicy: profile.footer_cancellation_policy || profile.footer?.cancellationPolicy || '',
      footerPrivacyPolicy: profile.footer_privacy_policy || profile.footer?.privacyPolicy || '',
      footerTermsOfService: profile.footer_terms_of_service || profile.footer?.termsOfService || '',
      footerShowMaps: profile.footer_show_maps ?? profile.footer?.showMaps ?? true,
      footerShowAttribution: profile.footer_show_attribution ?? profile.footer?.showAttribution ?? true,
    };
  }, [cleanTestimonials]);

  // Load profile data optimized
  const loadProfile = useCallback(async () => {
    if (!user?.id) {
      setIsLoading(false);
      return;
    }

    // Try cache first
    const cachedData = getCachedData();
    if (cachedData) {
      setData(cachedData);
      setProfileId(cachedData.profileId || null);
      setIsLoading(false);
      return;
    }

    try {
      // Single optimized query
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('id, user_id, handle, name, slogan, category, avatar_url, banner, booking_url, booking_mode, use_whatsapp, whatsapp_number, about, media, socials, testimonials, footer_business_name, footer_address, footer_email, footer_phone, footer_hours, footer_next_available, footer_cancellation_policy, footer_privacy_policy, footer_terms_of_service, footer_show_maps, footer_show_attribution, footer, status')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading profile:', error);
        toast({
          title: "Error",
          description: "Failed to load profile data",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      if (profile) {
        const processedData = processProfileData(profile);
        setData(processedData);
        setProfileId(profile.id);
        setCachedData(processedData);
      }
    } catch (error) {
      console.error('Unexpected error loading profile:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, getCachedData, setCachedData, processProfileData, toast]);

  // Refresh data and clear cache
  const refreshData = useCallback(async () => {
    localStorage.removeItem(CACHE_KEY);
    setIsLoading(true);
    await loadProfile();
  }, [loadProfile]);

  // Update data locally and in cache
  const updateData = useCallback((updates: Partial<OnboardingData>) => {
    const newData = { ...data, ...updates };
    setData(newData);
    setCachedData(newData);
  }, [data, setCachedData]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  return {
    data,
    setData: updateData,
    isLoading,
    profileId,
    refreshData,
    cleanTestimonials,
  };
};