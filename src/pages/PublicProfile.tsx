import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';
import { Button } from '@/components/ui/button';
import NotFound from './NotFound';
import { useLanguage } from '@/contexts/LanguageContext';

type Profile = Database['public']['Tables']['profiles']['Row'] & {
  testimonials?: Testimonial[];
  // Footer database columns
  footer_business_name?: string;
  footer_address?: string;
  footer_email?: string;
  footer_phone?: string;
  footer_hours?: Record<string, { open: string; close: string; closed: boolean }>;
  footer_next_available?: string;
  footer_cancellation_policy?: string;
  footer_privacy_policy?: string;
  footer_terms_of_service?: string;
  footer_show_maps?: boolean;
  footer_show_attribution?: boolean;
};

interface BannerSection {
  background_image?: string;
  profile_image?: string;
  title?: string;
  subtitle?: string;
  background_color?: string;
  text_color?: string;
}

interface BannerData {
  url?: string;
  imageUrl?: string;
  color?: string;
  type?: 'color' | 'image';
}

interface AboutData {
  title?: string;
  description?: string;
  alignment?: 'center' | 'left';
  testimonials?: Testimonial[];
}

interface FooterData {
  businessName?: string;
  address?: string;
  email?: string;
  phone?: string;
  hours?: Record<string, { open: string; close: string; closed: boolean }>;
  nextAvailable?: string;
  cancellationPolicy?: string;
  privacyPolicy?: string;
  termsOfService?: string;
  showMaps?: boolean;
  showAttribution?: boolean;
}

interface MediaItem {
  url?: string;
  fileName?: string;
}

interface SocialLink {
  title?: string;
  url?: string;
  platform?: string;
}

interface Testimonial {
  id: string;
  customer_name: string;
  review_title: string;
  review_text: string;
  image_url?: string;
  background_color?: string;
  text_color?: string;
}

export default function PublicProfile() {
  const { handle } = useParams();
  const { t } = useLanguage();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (handle) {
      loadProfile();
    }
  }, [handle]);

  const loadProfile = async () => {
    try {
      console.log('🔍 Loading profile for handle:', handle);
      
      if (!handle) {
        console.error('❌ No handle provided');
        setNotFound(true);
        return;
      }
      
      // Fetch profile data
      const { data: profileData, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('handle', handle)
        .maybeSingle();

      if (error) {
        console.error('❌ Database error:', error);
        setNotFound(true);
        return;
      }

      if (!profileData) {
        console.log('❌ No profile found for handle:', handle);
        setNotFound(true);
        return;
      }

      console.log('✅ Found profile:', profileData.id);

      // Check subscription status FIRST - this is the priority
      const hasActiveSubscription = profileData.subscription_status === 'active';
      const isPublished = profileData.status === 'published';

      console.log('🔍 Profile access check:', {
        handle: profileData.handle,
        status: profileData.status,
        subscription_status: profileData.subscription_status,
        isPublished,
        hasActiveSubscription
      });

      // PRIORITY 1: If user has active subscription, ALWAYS allow access
      if (hasActiveSubscription) {
        console.log('✅ User has active subscription - page always accessible regardless of preview status');
        setProfile(profileData);
        setNotFound(false);
        return;
      }

      // PRIORITY 2: If profile is published, allow access
      if (isPublished) {
        console.log('✅ Profile is published - page accessible');
        setProfile(profileData);
        setNotFound(false);
        return;
      }

      // PRIORITY 3: For non-subscription users, check preview expiry
      const about = (profileData.about ?? {}) as { [key: string]: unknown };
      const previewInfo = about.preview_info;

      if (previewInfo && typeof previewInfo === 'object' && 'started_at' in previewInfo) {
        const startedAt = new Date(previewInfo.started_at as string);
        const now = new Date();
        const diffInMinutes = (now.getTime() - startedAt.getTime()) / (1000 * 60);
        
        if (diffInMinutes > 15) {
          console.log('❌ Preview has expired for non-subscription user');
          setNotFound(true);
          return;
        }
        
        console.log('✅ Preview is still active');
        setProfile(profileData);
        setNotFound(false);
        return;
      }

      // If we get here, profile is not accessible
      console.log('❌ Profile is not accessible - no subscription, not published, and no valid preview');
      setNotFound(true);

    } catch (error) {
      console.error('❌ Error loading profile:', error);
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (notFound || !profile) {
    return <NotFound />;
  }

  // Default banner configuration
  const bannerConfig: BannerSection = {
    background_image: (() => {
      if (profile.banner && typeof profile.banner === 'object') {
        if ('imageUrl' in profile.banner && typeof profile.banner.imageUrl === 'string') {
          return profile.banner.imageUrl;
        }
        if ('image_url' in profile.banner && typeof profile.banner.image_url === 'string') {
          return profile.banner.image_url;
        }
        if ('url' in profile.banner && typeof profile.banner.url === 'string') {
          return profile.banner.url;
        }
      }
      return undefined;
    })(),
    profile_image: profile.avatar_url || undefined,
    title: (() => {
      if (profile.banner && typeof profile.banner === 'object') {
        if ('heading' in profile.banner && typeof profile.banner.heading === 'string') {
          return profile.banner.heading;
        }
        if ('title' in profile.banner && typeof profile.banner.title === 'string') {
          return profile.banner.title;
        }
      }
      return profile.name || 'Welkom';
    })(),
    subtitle: (() => {
      if (profile.banner && typeof profile.banner === 'object') {
        if ('subheading' in profile.banner && typeof profile.banner.subheading === 'string') {
          return profile.banner.subheading;
        }
        if ('subtitle' in profile.banner && typeof profile.banner.subtitle === 'string') {
          return profile.banner.subtitle;
        }
      }
      return profile.slogan || 'Maak kennis met ons';
    })(),
    background_color: (() => {
      if (profile.banner && typeof profile.banner === 'object') {
        if ('color' in profile.banner && typeof profile.banner.color === 'string') {
          return profile.banner.color;
        }
        if ('backgroundColor' in profile.banner && typeof profile.banner.backgroundColor === 'string') {
          return profile.banner.backgroundColor;
        }
      }
      return '#6E56CF';
    })(),
    text_color: (() => {
      if (profile.banner && typeof profile.banner === 'object') {
        if ('textColor' in profile.banner && typeof profile.banner.textColor === 'string') {
          return profile.banner.textColor;
        }
        if ('color' in profile.banner && typeof profile.banner.color === 'string') {
          return profile.banner.color;
        }
      }
      return '#FFFFFF';
    })()
  };

  // Extract footer data from database columns
  const footerData: FooterData = {
    businessName: profile.footer_business_name || profile.name,
    address: profile.footer_address,
    email: profile.footer_email,
    phone: profile.footer_phone,
    hours: profile.footer_hours,
    nextAvailable: profile.footer_next_available,
    cancellationPolicy: profile.footer_cancellation_policy,
    privacyPolicy: profile.footer_privacy_policy,
    termsOfService: profile.footer_terms_of_service,
    showMaps: profile.footer_show_maps !== false,
    showAttribution: profile.footer_show_attribution !== false
  };

  // Fallback: Also check for footer data in about JSON field
  if (profile.about && typeof profile.about === 'object' && profile.about !== null) {
    const aboutData = profile.about as Record<string, unknown>;
    
    // Check for footer data in about section
    if (aboutData.footer && typeof aboutData.footer === 'object' && aboutData.footer !== null) {
      const aboutFooter = aboutData.footer as Record<string, unknown>;
      
      // Use about footer data as fallback if database columns are empty
      if (!footerData.businessName && aboutFooter.businessName) {
        footerData.businessName = aboutFooter.businessName as string;
      }
      if (!footerData.address && aboutFooter.address) {
        footerData.address = aboutFooter.address as string;
      }
      if (!footerData.email && aboutFooter.email) {
        footerData.email = aboutFooter.email as string;
      }
      if (!footerData.phone && aboutFooter.phone) {
        footerData.phone = aboutFooter.phone as string;
      }
      if (!footerData.hours && aboutFooter.hours) {
        footerData.hours = aboutFooter.hours as Record<string, { open: string; close: string; closed: boolean }>;
      }
      if (!footerData.nextAvailable && aboutFooter.nextAvailable) {
        footerData.nextAvailable = aboutFooter.nextAvailable as string;
      }
      if (!footerData.cancellationPolicy && aboutFooter.cancellationPolicy) {
        footerData.cancellationPolicy = aboutFooter.cancellationPolicy as string;
      }
      if (!footerData.privacyPolicy && aboutFooter.privacyPolicy) {
        footerData.privacyPolicy = aboutFooter.privacyPolicy as string;
      }
      if (!footerData.termsOfService && aboutFooter.termsOfService) {
        footerData.termsOfService = aboutFooter.termsOfService as string;
      }
      if (footerData.showMaps === undefined && aboutFooter.showMaps !== undefined) {
        footerData.showMaps = aboutFooter.showMaps as boolean;
      }
      if (footerData.showAttribution === undefined && aboutFooter.showAttribution !== undefined) {
        footerData.showAttribution = aboutFooter.showAttribution as boolean;
      }
    }
  }

  // Extract media array from various possible structures
  const rawMedia: unknown = profile.media;
  const extractMediaArray = (rawMedia: unknown): unknown[] => {
    if (!rawMedia) return [];
    
    // If it's already an array, return it
    if (Array.isArray(rawMedia)) return rawMedia;
    
    // If it's an object, look for common media properties
    if (typeof rawMedia === 'object' && rawMedia !== null) {
      const mediaObj = rawMedia as Record<string, unknown>;
      
      // Check for items array
      if (mediaObj.items && Array.isArray(mediaObj.items)) {
        return mediaObj.items;
      }
      
      // Check for media array
      if (mediaObj.media && Array.isArray(mediaObj.media)) {
        return mediaObj.media;
      }
      
      // Check for files array
      if (mediaObj.files && Array.isArray(mediaObj.files)) {
        return mediaObj.files;
      }
      
      // If no array found, return the object itself as a single item
      return [mediaObj];
    }
    
    return [];
  };

  // Get media list and limit to maximum 6 items
  const mediaList: unknown[] = extractMediaArray(rawMedia).slice(0, 6);

  // Get image URL from various possible media item structures
  const getImageUrl = (mediaItem: unknown): string | null => {
    if (!mediaItem) return null;
    
    if (typeof mediaItem === 'string') {
      return mediaItem;
    }
    
    if (typeof mediaItem === 'object' && mediaItem !== null) {
      const item = mediaItem as Record<string, unknown>;
      
      // Check for common URL properties
      if (item.url && typeof item.url === 'string') return item.url;
      if (item.imageUrl && typeof item.imageUrl === 'string') return item.imageUrl;
      if (item.image_url && typeof item.image_url === 'string') return item.image_url;
      if (item.file_url && typeof item.file_url === 'string') return item.file_url;
      
      // Check for file object
      if (item.file && typeof item.file === 'object' && item.file !== null) {
        const file = item.file as Record<string, unknown>;
        if (file.url && typeof file.url === 'string') return file.url;
      }
    }
    
    return null;
  };

  
  return (
    <div className="min-h-screen bg-background">
      {/* Preview Banner - Show when profile is in preview mode AND no active subscription */}
      {profile?.about && 
        typeof profile.about === 'object' && 
        'preview_info' in profile.about && 
        profile.about.preview_info && 
        profile.subscription_status !== 'active' && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-amber-500 text-white px-4 py-2 text-center">
          <div className="flex items-center justify-center gap-2">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
            <span className="font-medium">LIVE PREVIEW MODE</span>
            <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
          </div>
          <p className="text-xs opacity-90 mt-1">
            Deze pagina is 15 minuten live voor preview. Na 15 minuten wordt de pagina automatisch teruggezet naar conceptmodus.
          </p>
        </div>
      )}

      {/* Main Content */}
      <div className={profile?.about && 
        typeof profile.about === 'object' && 
        'preview_info' in profile.about && 
        profile.about.preview_info && 
        profile.subscription_status !== 'active' ? 'pt-20' : ''}>
        {loading ? (
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
              <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
              <p className="mt-4 text-lg text-muted-foreground">Pagina laden...</p>
            </div>
          </div>
        ) : notFound ? (
          <NotFound />
        ) : profile ? (
          <>
            {/* Banner Section */}
            <section className="relative w-full" style={{ zIndex: 1 }}>
              {/* Background */}
              <div 
                className="relative w-full"
                style={{
                  height: '80vh',
                  backgroundImage: bannerConfig.background_image 
                    ? `url(${bannerConfig.background_image})` 
                    : undefined,
                  backgroundColor: bannerConfig.background_image ? 'transparent' : bannerConfig.background_color,
                  backgroundSize: bannerConfig.background_image ? 'cover' : undefined,
                  backgroundPosition: bannerConfig.background_image ? 'center' : undefined,
                }}
              >
                
                {bannerConfig.background_image && (
                  <div className="absolute inset-0 bg-black/20" />
                )}
                
                {/* Content Container */}
                <div className="relative z-10 flex flex-col items-center justify-center h-full px-4 text-center">
                  {/* Text Content */}
                  <div className="space-y-4 text-center">
                    {/* Category */}
                    {profile.category && (
                      <p 
                        className="text-lg font-medium uppercase tracking-wider"
                        style={{ color: bannerConfig.text_color }}
                      >
                        {profile.category}
                      </p>
                    )}
                    
                    {/* Main Heading */}
                    <h1 
                      className="text-5xl md:text-6xl font-bold tracking-tight"
                      style={{ color: bannerConfig.text_color }}
                    >
                      {bannerConfig.title}
                    </h1>
                    
                    {/* Subheading */}
                    {bannerConfig.subtitle && (
                      <p 
                        className="text-xl md:text-2xl font-medium max-w-3xl mx-auto leading-relaxed"
                        style={{ color: bannerConfig.text_color }}
                      >
                        {bannerConfig.subtitle}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </section>





            {/* About Section with Profile Avatar */}
            <section className="py-16 px-4 bg-white relative" style={{ zIndex: 3 }}>
              <div className="max-w-6xl mx-auto">
                <h2 className="text-3xl font-bold text-center mb-12">
                  {t('public.about', { name: footerData.businessName || profile.name || 'jouw bedrijf' })}
                </h2>
                {/* Mobile Layout - Stacked */}
                <div className="block md:hidden text-center">
                  {/* Profile Avatar - Full width on mobile */}
                  <div className="w-full mb-8">
                    <div className="w-full h-[100%] overflow-hidden shadow-xl bg-white rounded-xl">
                      {profile.avatar_url ? (
                        <img 
                          src={profile.avatar_url} 
                          alt={footerData.businessName || profile.name || 'Profiel'}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            // Hide image if it fails to load
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                          <span className="text-6xl font-bold text-gray-400">
                            {footerData.businessName?.charAt(0)?.toUpperCase() || profile.name?.charAt(0)?.toUpperCase() || '?'}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* About Content - Centered on mobile */}
                  {profile.about && typeof profile.about === 'object' && (
                    <>
                      {(profile.about as AboutData).title && (
                        <h3 className="text-2xl font-bold text-gray-900 mb-4">
                          {(profile.about as AboutData).title}
                        </h3>
                      )}
                      {(profile.about as AboutData).description && (
                        <div 
                          className={`text-lg text-gray-600 leading-relaxed ${
                            (profile.about as AboutData).alignment === 'left' ? 'text-left' : 'text-center'
                          }`}
                          style={{ whiteSpace: 'pre-line' }}
                        >
                          {(profile.about as AboutData).description}
                        </div>
                      )}
                    </>
                  )}
                </div>

                {/* Desktop Layout - Side by side */}
                <div className="hidden md:flex items-start gap-8">
                  {/* Profile Avatar - Left side on desktop */}
                  <div className="w-1/2">
                    <div className="w-full h-[100%] overflow-hidden shadow-xl bg-white rounded-xl" >
                      {profile.avatar_url ? (
                        <img 
                          src={profile.avatar_url} 
                          alt={footerData.businessName || profile.name || 'Profile'}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            // Hide image if it fails to load
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                          <span className="text-6xl font-bold text-gray-400">
                            {footerData.businessName?.charAt(0)?.toUpperCase() || profile.name?.charAt(0)?.toUpperCase() || '?'}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* About Content - Right side on desktop */}
                  <div className="w-1/2 pt-8">
                    {profile.about && typeof profile.about === 'object' && (
                      <>
                        {(profile.about as AboutData).title && (
                          <h3 className={`text-2xl font-bold text-gray-900 mb-4 ${
                            (profile.about as AboutData).alignment === 'left' ? 'text-left' : 'text-center'
                          }`}>
                            {(profile.about as AboutData).title}
                          </h3>
                        )}
                        {(profile.about as AboutData).description && (
                          <div 
                            className={`text-lg text-gray-600 leading-relaxed ${
                              (profile.about as AboutData).alignment === 'left' ? 'text-left' : 'text-center'
                            }`}
                            style={{ whiteSpace: 'pre-line' }}
                          >
                            {(profile.about as AboutData).description}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            </section>

            {/* Social Links Section */}
            {profile.socials && Array.isArray(profile.socials) && profile.socials.length > 0 && (
              <section className="py-8 px-4">
                <div className="max-w-4xl mx-auto text-center">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">Social Media</h3>
                  <div className="flex flex-wrap justify-center gap-4">
                    {(profile.socials as SocialLink[]).map((social: SocialLink, index: number) => {
                      // Defensive: allow for string or object, but only render if object with url
                      if (typeof social === 'object' && social !== null && 'url' in social && social.url) {
                        return (
                          <a
                            key={index}
                            href={social.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center px-6 py-3 bg-primary text-black rounded-lg hover:bg-primary/90 transition-colors"
                          >
                            <span className="font-medium">{social.title || social.platform || 'Social'}</span>
                          </a>
                        );
                      }
                      return null;
                    })}
                  </div>
                </div>
              </section>
            )}

            {/* Horizontal Scrolling Cards Section */}
            <section className="py-8 px-4">
              <div className="max-w-6xl mx-auto">
                <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
                  {t('public.workResults')}
                </h3>
                
                
                
                {/* Horizontal Scrolling Container */}
                <div
                  className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide"
                  style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                  {mediaList.length > 0 ? (
                    mediaList.map((mediaItem: unknown, index: number) => {
                      const imageUrl = getImageUrl(mediaItem);
                      return (
                        <div key={index} className="flex-shrink-0">
                          <div className="w-80 aspect-[4/5] rounded-xl overflow-hidden shadow-lg">
                            {imageUrl ? (
                              <img
                                src={imageUrl}
                                alt={`Media ${index + 1}`}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  // Hide image if it fails to load
                                  e.currentTarget.style.display = 'none';
                                }}
                              />
                            ) : (
                              <div className="w-full h-full bg-gradient-to-br from-gray-400 to-gray-500 flex items-center justify-center">
                                <span className="text-white text-lg font-medium">Afbeelding {index + 1}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    // Fallback when no media is available
                    <div className="flex-shrink-0">
                      <div className="w-80 aspect-[4/5] rounded-xl overflow-hidden shadow-lg">
                        <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                          <span className="text-gray-500 text-lg font-medium">Nog geen afbeeldingen geüpload</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </section>

            {/* Booking Section */}
            <section className="w-full" id="booking-section">
                <div className="w-full">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center px-4">
                    {profile.booking_url && !profile.use_whatsapp ? t('public.booking') : t('public.contact')}
                  </h3>
                  
                  {/* WhatsApp CTA - Show when using WhatsApp OR when no booking URL */}
                  {(profile.use_whatsapp || !profile.booking_url) && profile.whatsapp_number && (
                    <div className="text-center px-4 py-8">
                      <div className="max-w-md mx-auto space-y-4">
                        <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto">
                          <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                          </svg>
                        </div>
                        <h4 className="text-xl font-semibold text-gray-900">
                          Neem contact op via WhatsApp
                        </h4>
                        <p className="text-gray-600">
                          Neem direct contact op voor afspraken, vragen of informatie
                        </p>
                        <Button 
                          onClick={() => {
                            const phoneNumber = profile.whatsapp_number?.replace(/\D/g, '');
                            if (phoneNumber) {
                              window.open(`https://wa.me/${phoneNumber}`, '_blank');
                            }
                          }}
                          className="bg-green-500 hover:bg-green-600 text-white px-8 py-3 text-lg font-medium"
                        >
                          Chat via WhatsApp
                        </Button>
                      </div>
                    </div>
                  )}
                  
                  {/* Booking iframe - only show if not using WhatsApp */}
                  {!profile.use_whatsapp && profile.booking_url && (
                    <div className="w-full">
                      <iframe
                        src={profile.booking_url}
                        className="w-full min-h-[800px] border-0"
                        title="Afspraak Boeken"
                        allow="camera; microphone; geolocation"
                        sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox"
                      />
                    </div>
                  )}
                </div>
              </section>

            

            {/* Debug Section - Temporary for development */}
           

            {/* Reviews Section */}
            {(() => {
              console.log('🔍 Starting testimonials section rendering...');
              console.log('🔍 Profile data:', {
                about: profile.about,
                aboutType: typeof profile.about,
                aboutKeys: profile.about && typeof profile.about === 'object' ? Object.keys(profile.about as Record<string, unknown>) : null
              });
              
              // Debug button - temporary
              if (process.env.NODE_ENV === 'development') {
                console.log('🧪 Development mode - showing debug info');
                console.log('🧪 Full profile object:', profile);
                console.log('🧪 Profile ID:', profile.id);
                console.log('🧪 Profile status:', profile.status);
                console.log('🧪 Profile about section:', profile.about);
              }
              
              // Check for testimonials in multiple locations with better fallback logic
              let testimonials: Testimonial[] = [];
              
              // First priority: testimonials from dedicated testimonials column (NEW APPROACH)
              if (profile.testimonials && Array.isArray(profile.testimonials)) {
                testimonials = profile.testimonials;
                console.log('✅ Found testimonials in profile.testimonials column:', testimonials);
                console.log('✅ Testimonials array length:', testimonials.length);
                console.log('✅ First testimonial structure:', testimonials[0]);
              } else {
                console.log('❌ No testimonials found in testimonials column');
              }
              
              // Second priority: testimonials in about section (backward compatibility)
              if (testimonials.length === 0 && profile.about && typeof profile.about === 'object' && 'testimonials' in profile.about) {
                const aboutData = profile.about as Record<string, unknown>;
                if (aboutData.testimonials && Array.isArray(aboutData.testimonials)) {
                  testimonials = aboutData.testimonials;
                  console.log('✅ Found testimonials in profile.about.testimonials (fallback):', testimonials);
                  console.log('✅ Testimonials array length:', testimonials.length);
                  console.log('✅ First testimonial structure:', testimonials[0]);
                } else {
                  console.log('❌ Testimonials in about section is not an array:', aboutData.testimonials);
                  console.log('❌ Testimonials type:', typeof aboutData.testimonials);
                }
              } else {
                console.log('❌ No testimonials key found in about section');
              }
              
              // Third priority: check if testimonials exist in socialLinks structure (onboarding data structure)
              if (testimonials.length === 0 && profile.about && typeof profile.about === 'object' && 'socialLinks' in profile.about) {
                const aboutData = profile.about as Record<string, unknown>;
                if (aboutData.testimonials && Array.isArray(aboutData.testimonials)) {
                  testimonials = aboutData.testimonials as Testimonial[];
                  console.log('✅ Found testimonials in profile.about (socialLinks structure):', testimonials);
                } else {
                  console.log('❌ No testimonials found in socialLinks structure');
                }
              }
              
              // Fourth priority: check for testimonials in any about section structure
              if (testimonials.length === 0 && profile.about && typeof profile.about === 'object') {
                const aboutData = profile.about as Record<string, unknown>;
                console.log('🔍 Checking about section for testimonials:', aboutData);
                console.log('🔍 About section keys:', Object.keys(aboutData));
                
                // Look for testimonials in any property of about
                for (const [key, value] of Object.entries(aboutData)) {
                  console.log(`🔍 Checking key "${key}":`, value);
                  if (key === 'testimonials' && Array.isArray(value)) {
                    testimonials = value as Testimonial[];
                    console.log('✅ Found testimonials in about section:', testimonials);
                    break;
                  }
                }
              }
              
              // Fifth priority: check for testimonials in the about JSON structure (most common case)
              if (testimonials.length === 0 && profile.about && typeof profile.about === 'object') {
                const aboutData = profile.about as Record<string, unknown>;
            
                
                // Check if testimonials exists as a direct property
                if ('testimonials' in aboutData) {
                  const testimonialsData = aboutData.testimonials;
                  console.log('🔍 Found testimonials property:', testimonialsData);
                  console.log('🔍 Testimonials type:', typeof testimonialsData);
                  
                  if (Array.isArray(testimonialsData)) {
                    testimonials = testimonialsData as Testimonial[];
                    console.log('✅ Found testimonials array in about JSON:', testimonials);
                    console.log('✅ Testimonials count:', testimonials.length);
                  } else {
                    console.log('❌ Testimonials property is not an array:', testimonialsData);
                  }
                } else {
                  console.log('❌ No testimonials property found in about JSON');
                }
              }
              
              console.log('🔍 Final testimonials array:', testimonials);
              console.log('🔍 Testimonials length:', testimonials.length);
              
              // Filter out testimonials without required content
              const validTestimonials = testimonials.filter(testimonial => {
                console.log('🔍 Checking testimonial for validity:', testimonial);
                
                const hasCustomerName = testimonial.customer_name && testimonial.customer_name.trim();
                const hasReviewTitle = testimonial.review_title && testimonial.review_title.trim();
                const hasReviewText = testimonial.review_text && testimonial.review_text.trim();
                
                const isValid = hasCustomerName && hasReviewTitle && hasReviewText;
                
                console.log('🔍 Testimonial validation:', {
                  customer_name: testimonial.customer_name,
                  review_title: testimonial.review_title,
                  review_text: testimonial.review_text,
                  hasCustomerName,
                  hasReviewTitle,
                  hasReviewText,
                  isValid
                });
                
                if (!isValid) {
                  console.log('❌ Invalid testimonial filtered out:', testimonial);
                }
                
                return isValid;
              });
              
              console.log('🔍 Valid testimonials after filtering:', validTestimonials);
              console.log('🔍 Valid testimonials count:', validTestimonials.length);
              
              // Only show section if there are valid testimonials
              if (validTestimonials.length === 0) {
                console.log('❌ No valid testimonials found, hiding section');
                console.log('❌ Raw testimonials data:', testimonials);
                console.log('❌ About section content:', profile.about);
                return null;
              }
              
              console.log('✅ Displaying testimonials section with', validTestimonials.length, 'valid testimonials');
              
              return (
                <section className="py-8 px-4">
                  <div className="max-w-6xl mx-auto">
                    <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
                      Klantbeoordelingen
                    </h3>
                    
                    {/* Horizontal Scrolling Reviews Container */}
                    <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                      {validTestimonials.map((testimonial: Testimonial, index: number) => {
                        console.log(`🎯 Rendering testimonial ${index}:`, testimonial);
                        
                        // Ensure all required fields are present with fallbacks
                        const customerName = testimonial.customer_name?.trim() || 'Anonieme klant';
                        const reviewTitle = testimonial.review_title?.trim() || 'Geweldige ervaring';
                        const reviewText = testimonial.review_text?.trim() || 'Zeer tevreden met de service.';
                        const imageUrl = testimonial.image_url;
                        
                        console.log(`🎯 Testimonial ${index} processed:`, {
                          customerName,
                          reviewTitle,
                          reviewText,
                          imageUrl
                        });
                        
                        return (
                          <div key={testimonial.id || index} className="flex-shrink-0">
                            <div className="w-80 aspect-[4/5] rounded-xl overflow-hidden shadow-lg">
                              {imageUrl ? (
                                <div className="w-full h-full relative">
                                  <img 
                                    src={imageUrl} 
                                    alt={`${customerName} aanbeveling`}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                      console.log(`❌ Image failed to load for testimonial ${index}:`, imageUrl);
                                      // Hide image if it fails to load and show text-only version
                                      e.currentTarget.style.display = 'none';
                                      const fallback = e.currentTarget.parentElement?.nextElementSibling;
                                      if (fallback) {
                                        fallback.classList.remove('hidden');
                                      }
                                    }}
                                    onLoad={() => {
                                      console.log(`✅ Image loaded successfully for testimonial ${index}:`, imageUrl);
                                    }}
                                  />
                                  <div className="absolute inset-0 bg-black/30" />
                                  <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                                    <div className="mb-4">
                                      <h4 className="font-semibold text-lg mb-2">{reviewTitle}</h4>
                                      <p className="text-sm opacity-90">{customerName}</p>
                                    </div>
                                    <p className="text-sm leading-relaxed opacity-90 line-clamp-3">
                                      "{reviewText}"
                                    </p>
                                  </div>
                                </div>
                              ) : (
                                <div 
                                  className="w-full h-full flex flex-col justify-end p-6 text-white"
                                  style={{ 
                                    backgroundColor: testimonial.background_color || 'hsl(var(--primary))',
                                    color: testimonial.text_color || 'white'
                                  }}
                                >
                                  <div className="mb-4">
                                    <h4 className="font-semibold text-lg mb-2">{reviewTitle}</h4>
                                    <p className="text-sm opacity-90">{customerName}</p>
                                  </div>
                                  <p className="text-sm leading-relaxed opacity-90 line-clamp-3">
                                    "{reviewText}"
                                  </p>
                                </div>
                              )}
                              
                              {/* Fallback text-only version (hidden by default) */}
                              <div className="hidden w-full h-full flex flex-col justify-end p-6 text-white bg-gray-800">
                                <div className="mb-4">
                                  <h4 className="font-semibold text-lg mb-2">{reviewTitle}</h4>
                                  <p className="text-sm opacity-90">{customerName}</p>
                                </div>
                                <p className="text-sm leading-relaxed opacity-90 line-clamp-3">
                                  "{reviewText}"
                                </p>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </section>
              );
            })()}

            {/* Footer Section */}
            <footer className="bg-gray-900 text-white mt-16">
              <div className="max-w-6xl mx-auto px-4 py-12">
                
                {/* Primary Actions */}
                <div className="text-center mb-8">
                  <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
                    {profile.booking_url && !profile.use_whatsapp ? (
                      <Button 
                        size="lg"
                        className="bg-primary hover:bg-primary/90 text-black px-8 py-3 text-lg"
                        onClick={() => {
                          document.getElementById('booking-section')?.scrollIntoView({ 
                            behavior: 'smooth' 
                          });
                        }}
                      >
                        {t('public.booking')}
                      </Button>
                    ) : profile.whatsapp_number && (
                      <Button 
                        size="lg"
                        className="bg-green-500 hover:bg-green-600 text-white px-8 py-3 text-lg"
                        onClick={() => {
                          document.getElementById('booking-section')?.scrollIntoView({ 
                            behavior: 'smooth' 
                          });
                        }}
                      >
                        Neem contact op via WhatsApp
                      </Button>
                    )}
                    {(() => {
                       const footer = footerData;
                       const phone = footer?.phone;
                       if (phone) {
                        return (
                          <Button 
                            size="lg"
                            variant="outline"
                            className="border-white text-black hover:bg-white hover:text-gray-900 px-8 py-3 text-lg"
                            onClick={() => {
                              const whatsappUrl = `https://wa.me/${phone.replace(/\D/g, '')}`;
                              window.open(whatsappUrl, '_blank');
                            }}
                          >
                            Vragen? WhatsApp!
                          </Button>
                        );
                      }
                      return null;
                    })()}
                  </div>
                </div>

                {/* Business Information & Map */}
                <div className="grid md:grid-cols-2 gap-8 mb-8">
                  {/* Business Details */}
                  <div className="space-y-4">
                    {(() => {
                      const footer = footerData;
                      const businessName = footer?.businessName || profile.name;
                      const address = footer?.address;
                      const email = footer?.email;
                      const phone = footer?.phone;
                      const hours = footer?.hours;
                      const nextAvailable = footer?.nextAvailable;
                      
                      return (
                        <div className="space-y-4">
                          {businessName && (
                            <h3 className="text-xl font-semibold">{businessName}</h3>
                          )}
                          
                          {address && (
                            <div className="flex items-start space-x-3">
                              <div className="w-5 h-5 text-gray-400 mt-0.5">
                                📍
                              </div>
                              <p className="text-gray-300">{address}</p>
                            </div>
                          )}
                          
                          {phone && (
                            <div className="flex items-center space-x-3">
                              <div className="w-5 h-5 text-gray-400">
                                📞
                              </div>
                              <a 
                                href={`tel:${phone}`}
                                className="text-gray-300 hover:text-white transition-colors"
                              >
                                {phone}
                              </a>
                            </div>
                          )}
                          
                          {email && (
                            <div className="flex items-center space-x-3">
                              <div className="w-5 h-5 text-gray-400">
                                ✉️
                              </div>
                              <a 
                                href={`mailto:${email}`}
                                className="text-gray-300 hover:text-white transition-colors"
                              >
                                {email}
                              </a>
                            </div>
                          )}
                          
                          {hours && (
                            <div className="flex items-start space-x-3">
                              <div className="w-5 h-5 text-gray-400 mt-0.5">
                                🕒
                              </div>
                              <p className="text-gray-300">
                                {Object.entries(hours)
                                  .filter(([_, day]) => !day.closed)
                                  .map(([day, time]) => `${day.charAt(0).toUpperCase() + day.slice(1)} ${time.open}-${time.close}`)
                                  .join(', ')}
                              </p>
                            </div>
                          )}
                          
                          {nextAvailable && (
                            <div className="flex items-center space-x-3">
                              <div className="w-5 h-5 text-gray-400">
                                🎯
                              </div>
                              <p className="text-gray-300">
                                Volgende beschikbaar: <span className="font-medium">{nextAvailable}</span>
                              </p>
                            </div>
                          )}
                        </div>
                      );
                    })()}
                  </div>

                  {/* Google Maps */}
                  {(() => {
                    const footer = footerData;
                    const address = footer?.address;
                    const showMaps = footer?.showMaps !== false;
                    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
                    
                    if (showMaps && address && apiKey) {
                      const encodedAddress = encodeURIComponent(address);
                      const mapUrl = `https://www.google.com/maps/embed/v1/place?key=${apiKey}&q=${encodedAddress}`;
                      
                      return (
                        <div className="h-64 rounded-lg overflow-hidden">
                          <iframe
                            src={mapUrl}
                            width="100%"
                            height="100%"
                            style={{ border: 0 }}
                            allowFullScreen
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                            title="Bedrijfslocatie"
                          />
                        </div>
                      );
                    }
                    return null;
                  })()}
                </div>

                {/* Policies & Trust */}
                <div className="border-t border-gray-700 pt-8 mb-8">
                  <div className="grid md:grid-cols-3 gap-6">
                    {(() => {
                      const footer = footerData;
                      const cancellationPolicy = footer?.cancellationPolicy;
                      const privacyPolicy = footer?.privacyPolicy;
                      const termsOfService = footer?.termsOfService;
                      
                      // Only show section if at least one policy exists
                      if (!cancellationPolicy && !privacyPolicy && !termsOfService) {
                        return null;
                      }
                      
                      return (
                        <>
                          {cancellationPolicy && (
                            <div>
                              <h4 className="font-medium mb-2">Annuleringsbeleid</h4>
                              <p className="text-sm text-gray-300">{cancellationPolicy}</p>
                            </div>
                          )}
                          
                          {privacyPolicy && (
                            <div>
                              <h4 className="font-medium mb-2">Privacy</h4>
                              <p className="text-sm text-gray-300">{privacyPolicy}</p>
                            </div>
                          )}
                          
                          {termsOfService && (
                            <div>
                              <h4 className="font-medium mb-2">Voorwaarden</h4>
                              <p className="text-sm text-gray-300">{termsOfService}</p>
                            </div>
                          )}
                        </>
                      );
                    })()}
                  </div>
                </div>

                {/* Attribution */}
                {(() => {
                  const footer = footerData;
                  const showAttribution = footer?.showAttribution !== false;
                  
                  if (showAttribution) {
                    return (
                      <div className="border-t border-gray-700 pt-6 text-center">
                        <div className="flex flex-col sm:flex-row items-center justify-center space-y-2 sm:space-y-0 sm:space-x-4 text-sm text-gray-400">
                          <span>Aangedreven door Bookr</span>
                          <span>•</span>
                          <a 
                            href="/onboarding" 
                            className="text-gray-300 hover:text-white transition-colors"
                          >
                            Maak je pagina aan
                          </a>
                        </div>
                      </div>
                    );
                  }
                  return null;
                })()}
              </div>
            </footer>
          </>
        ) : null}
      </div>
    </div>
  );
}