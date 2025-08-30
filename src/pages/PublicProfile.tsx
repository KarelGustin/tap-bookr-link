import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';
import { Button } from '@/components/ui/button';
import NotFound from './NotFound';
import { useLanguage } from '@/contexts/LanguageContext';


type Profile = Database['public']['Tables']['profiles']['Row'] & {
  testimonials?: Testimonial[];
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
  imageUrl?: string;
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
      if (!handle) {
        setNotFound(true);
        return;
      }
      
      const { data: profileData, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('handle', handle)
        .maybeSingle();

      if (error || !profileData) {
        setNotFound(true);
        return;
      }

      // Check subscription status and access permissions
      const hasActiveSubscription = profileData.subscription_status === 'active';
      const isPublished = profileData.status === 'published';

      if (hasActiveSubscription || isPublished) {
        setProfile(profileData as Profile);
        setNotFound(false);
        return;
      }

      // Check preview expiry for non-subscription users
      const about = (profileData.about ?? {}) as { [key: string]: unknown };
      const previewInfo = about.preview_info;

      if (previewInfo && typeof previewInfo === 'object' && 'started_at' in previewInfo) {
        const startedAt = new Date(previewInfo.started_at as string);
        const now = new Date();
        const diffInMinutes = (now.getTime() - startedAt.getTime()) / (1000 * 60);
        
        if (diffInMinutes <= 15) {
          setProfile(profileData as Profile);
          setNotFound(false);
          return;
        }
      }

      setNotFound(true);
    } catch (error) {
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

  // Extract banner configuration - simplified with beauty industry colors
  const bannerConfig: BannerSection = {
    background_image: (() => {
      // First check banner_url column, then banner object
      if (profile.banner_url) {
        return profile.banner_url;
      }
      if (profile.banner && typeof profile.banner === 'object') {
        const banner = profile.banner as Record<string, unknown>;
        return (banner.imageUrl || banner.image_url || banner.url) as string;
      }
      return undefined;
    })(),
    profile_image: profile.avatar_url,
    title: profile.name || 'Welkom',
    subtitle: profile.slogan || 'Maak kennis met ons',
    background_color: '#EC4899', // Warm pink for beauty industry
    text_color: '#FFFFFF'        // White text for contrast
  };

  // Extract footer data
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

  // Fallback to about JSON footer data
  if (profile.about && typeof profile.about === 'object' && profile.about !== null) {
    const aboutData = profile.about as Record<string, unknown>;
    if (aboutData.footer && typeof aboutData.footer === 'object' && aboutData.footer !== null) {
      const aboutFooter = aboutData.footer as Record<string, unknown>;
      
      Object.entries(aboutFooter).forEach(([key, value]) => {
        if (value && !footerData[key as keyof FooterData]) {
          (footerData as Record<string, unknown>)[key] = value;
        }
      });
    }
  }

  // Extract media items with proper type handling
  const extractMediaItems = (rawMedia: unknown): MediaItem[] => {
    if (!rawMedia) return [];
    
    if (Array.isArray(rawMedia)) {
      return rawMedia.map(item => {
        if (typeof item === 'string') {
          return { url: item, imageUrl: item };
        }
        if (typeof item === 'object' && item !== null) {
          const mediaObj = item as Record<string, unknown>;
          return {
            url: mediaObj.url as string,
            fileName: mediaObj.fileName as string,
            imageUrl: mediaObj.imageUrl as string || mediaObj.url as string
          };
        }
        return {};
      }).filter(item => item.imageUrl || item.url);
    }
    
    if (typeof rawMedia === 'object' && rawMedia !== null) {
      const mediaObj = rawMedia as Record<string, unknown>;
      
      if (mediaObj.items && Array.isArray(mediaObj.items)) {
        return extractMediaItems(mediaObj.items);
      }
      if (mediaObj.media && Array.isArray(mediaObj.media)) {
        return extractMediaItems(mediaObj.media);
      }
      if (mediaObj.files && Array.isArray(mediaObj.files)) {
        return extractMediaItems(mediaObj.files);
      }
    }
    
    return [];
  };

  const mediaItems = extractMediaItems(profile.media).slice(0, 6);

  // Extract testimonials
  const extractTestimonials = (): Testimonial[] => {
    let testimonials: Testimonial[] = [];
    
    // Check dedicated testimonials column first
    if (profile.testimonials && Array.isArray(profile.testimonials)) {
      testimonials = profile.testimonials;
    }
    
    // Fallback to about section
    if (testimonials.length === 0 && profile.about && typeof profile.about === 'object') {
      const aboutData = profile.about as Record<string, unknown>;
      if (aboutData.testimonials && Array.isArray(aboutData.testimonials)) {
        testimonials = aboutData.testimonials;
      }
    }
    
    return testimonials.filter(testimonial => 
      testimonial.customer_name?.trim() && 
      testimonial.review_title?.trim() && 
      testimonial.review_text?.trim()
    );
  };

  const validTestimonials = extractTestimonials();
  const showPreviewBanner = profile?.about && 
    typeof profile.about === 'object' && 
    'preview_info' in profile.about && 
    profile.about.preview_info && 
    profile.subscription_status !== 'active';

  return (
    <div className="min-h-screen bg-background">
      {/* Preview Banner */}
      {showPreviewBanner && (
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
      <div className={showPreviewBanner ? 'pt-20' : ''}>
        {/* Banner Section */}
        <section className="relative w-full" style={{ zIndex: 1 }}>
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
            
            <div className="relative z-10 flex flex-col items-center justify-center h-full px-4 text-center">
              <div className="space-y-4 text-center">
                {profile.category && (
                  <p 
                    className="text-lg font-medium uppercase tracking-wider"
                    style={{ color: bannerConfig.text_color }}
                  >
                    {profile.category}
                  </p>
                )}
                
                <h1 
                  className="text-5xl md:text-6xl font-bold tracking-tight"
                  style={{ color: bannerConfig.text_color }}
                >
                  {bannerConfig.title}
                </h1>
                
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

        {/* About Section */}
        <section className="py-16 px-4 relative" style={{ zIndex: 3, backgroundColor: '#FFFFFF' }}>
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12" style={{ color: '#1F2937' }}>
              {t('public.about', { name: footerData.businessName || profile.name || 'jouw bedrijf' })}
            </h2>
            
            {/* Mobile Layout */}
            <div className="block md:hidden text-center">
              <div className="w-full mb-8">
                <div className="w-full h-[100%] overflow-hidden shadow-xl bg-white rounded-xl">
                  {profile.avatar_url ? (
                    <img 
                      src={profile.avatar_url} 
                      alt={footerData.businessName || profile.name || 'Profiel'}
                      className="w-full h-full object-cover"
                      onError={(e) => {
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

            {/* Desktop Layout */}
            <div className="hidden md:flex items-start gap-8">
              <div className="w-1/2">
                <div className="w-full h-[100%] overflow-hidden shadow-xl bg-white rounded-xl">
                  {profile.avatar_url ? (
                    <img 
                      src={profile.avatar_url} 
                      alt={footerData.businessName || profile.name || 'Profile'}
                      className="w-full h-full object-cover"
                      onError={(e) => {
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

        {/* Social Links Section - Temporarily disabled */}

        {/* Media Gallery Section */}
        <section className="py-8 px-4" style={{ backgroundColor: '#fafafa' }}>
          <div className="max-w-6xl mx-auto">
            <h3 className="text-2xl font-bold text-center mb-6" style={{ color: '#1F2937' }}>
              {t('public.workResults')}
            </h3>
            
            <div
              className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {mediaItems.length > 0 ? (
                mediaItems.map((mediaItem, index) => {
                  const imageUrl = mediaItem.imageUrl || mediaItem.url;
                  return (
                    <div key={index} className="flex-shrink-0">
                      <div className="w-80 aspect-[4/5] rounded-xl overflow-hidden shadow-lg">
                        {imageUrl ? (
                          <img
                            src={imageUrl}
                            alt={`Media ${index + 1}`}
                            className="w-full h-full object-cover"
                            onError={(e) => {
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
              {profile.booking_url && !profile.use_whatsapp ? t('') : t('Neem contact op')}
            </h3>
            
            {/* WhatsApp CTA */}
            {(profile.use_whatsapp || !profile.booking_url) && profile.whatsapp_number && (
              <div className="text-center px-4 py-8">
                <div className="max-w-md mx-auto space-y-4">
                  <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto">
                    <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
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
            
            {/* Booking iframe */}
            {!profile.use_whatsapp && profile.booking_url && (
              <div className="w-full">
                <iframe
                  src={profile.booking_url}
                  className="w-full min-h-[800px] border-0"
                  title="Afspraak Boeken"
                  sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox"
                />
              </div>
            )}
          </div>
        </section>

        {/* Testimonials Section */}
        {validTestimonials.length > 0 && (
          <section className="py-8 px-4">
            <div className="max-w-6xl mx-auto">
              <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
                Klantbeoordelingen
              </h3>
              
              <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                {validTestimonials.map((testimonial, index) => {
                  const customerName = testimonial.customer_name?.trim() || 'Anonieme klant';
                  const reviewTitle = testimonial.review_title?.trim() || 'Geweldige ervaring';
                  const reviewText = testimonial.review_text?.trim() || 'Zeer tevreden met de service.';
                  const imageUrl = testimonial.image_url;
                  
                  return (
                    <div key={testimonial.id || index} className="flex-shrink-0">
                      <div className="w-80 aspect-[4/5] rounded-xl overflow-hidden">
                        {imageUrl ? (
                          <div className="w-full h-full relative">
                            <img 
                              src={imageUrl} 
                              alt={`${customerName} aanbeveling`}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                                const fallback = e.currentTarget.parentElement?.nextElementSibling;
                                if (fallback) {
                                  fallback.classList.remove('hidden');
                                }
                              }}
                            />
                            {/* Overlay for dimming image */}
                            <div className="absolute inset-0 bg-black/20" />
                            {/* Review text area: white background, black text */}
                            <div className="absolute bottom-0 left-0 right-0 p-6 bg-white bg-opacity-95 text-black rounded-b-xl">
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
                            className="w-full h-full flex flex-col justify-end p-6 bg-white text-black rounded-xl "
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
                        {/* Fallback text-only version */}
                        <div className="hidden w-full h-full flex flex-col justify-end p-6 bg-white text-black rounded-xl">
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
        )}

        {/* Footer Section */}
        <footer className="text-white mt-16" style={{ backgroundColor: '#111827' }}>
          <div className="max-w-6xl mx-auto px-4 py-12">
            
            {/* Primary Actions */}
            <div className="text-center mb-8">
              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
                {profile.booking_url && !profile.use_whatsapp ? (
                  <Button 
                    size="lg"
                    className="px-8 py-3 text-lg"
                    style={{
                      backgroundColor: 'hsl(var(--accent))',
                      color: '#000000'
                    }}
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
                    className="px-8 py-3 text-lg"
                    style={{
                      backgroundColor: '#10B981', // Keep WhatsApp green
                      color: 'white'
                    }}
                    onClick={() => {
                      document.getElementById('booking-section')?.scrollIntoView({ 
                        behavior: 'smooth' 
                      });
                    }}
                  >
                    Neem contact op via WhatsApp
                  </Button>
                )}
                {footerData.phone && (
                  <Button 
                    size="lg"
                    variant="outline"
                    className="border-white text-black hover:bg-white hover:text-gray-900 px-8 py-3 text-lg"
                    onClick={() => {
                      const whatsappUrl = `https://wa.me/${footerData.phone!.replace(/\D/g, '')}`;
                      window.open(whatsappUrl, '_blank');
                    }}
                  >
                    Vragen? WhatsApp!
                  </Button>
                )}
              </div>
            </div>

            {/* Business Information & Map */}
            <div className="grid md:grid-cols-2 gap-8 mb-8">
              {/* Business Details */}
              <div className="space-y-4">
                                 {footerData.businessName && (
                   <h3 className="text-xl font-semibold" style={{ color: '#FFFFFF' }}>{footerData.businessName}</h3>
                 )}
                 
                 {footerData.address && (
                   <div className="flex items-start space-x-3">
                     <div className="w-5 h-5 mt-0.5" style={{ color: '#FFFFFF' }}>📍</div>
                     <p style={{ color: '#FFFFFF' }}>{footerData.address}</p>
                   </div>
                 )}
                 
                 {footerData.phone && (
                   <div className="flex items-center space-x-3">
                     <div className="w-5 h-5" style={{ color: '#FFFFFF' }}>📞</div>
                     <a 
                       href={`tel:${footerData.phone}`}
                       className="transition-colors"
                       style={{ color: '#FFFFFF' }}
                     >
                       {footerData.phone}
                     </a>
                   </div>
                 )}
                 
                 {footerData.email && (
                   <div className="flex items-center space-x-3">
                     <div className="w-5 h-5" style={{ color: '#FFFFFF' }}>✉️</div>
                     <a 
                       href={`mailto:${footerData.email}`}
                       className="transition-colors"
                       style={{ color: '#FFFFFF' }}
                     >
                       {footerData.email}
                     </a>
                   </div>
                 )}
                 
                 {footerData.hours && (
                   <div className="flex items-start space-x-3">
                     <div className="w-5 h-5 mt-0.5" style={{ color: '#FFFFFF' }}>🕒</div>
                     <p style={{ color: '#FFFFFF' }}>
                       {Object.entries(footerData.hours)
                         .filter(([_, day]) => !day.closed)
                         .map(([day, time]) => `${day.charAt(0).toUpperCase() + day.slice(1)} ${time.open}-${time.close}`)
                         .join(', ')}
                     </p>
                   </div>
                 )}
                 
                 {footerData.nextAvailable && (
                   <div className="flex items-center space-x-3">
                     <div className="w-5 h-5" style={{ color: '#FFFFFF' }}>🎯</div>
                     <p style={{ color: '#FFFFFF' }}>
                       Volgende beschikbaar: <span className="font-medium">{footerData.nextAvailable}</span>
                     </p>
                   </div>
                 )}
              </div>

              {/* Google Maps */}
              {footerData.showMaps && footerData.address && import.meta.env.VITE_GOOGLE_MAPS_API_KEY && (
                <div className="h-64 rounded-lg overflow-hidden">
                  <iframe
                    src={`https://www.google.com/maps/embed/v1/place?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}&q=${encodeURIComponent(footerData.address)}`}
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="Bedrijfslocatie"
                  />
                </div>
              )}
            </div>

            {/* Policies & Trust */}
            {(footerData.cancellationPolicy || footerData.privacyPolicy || footerData.termsOfService) && (
              <div className="border-t border-gray-700 pt-8 mb-8">
                <div className="grid md:grid-cols-3 gap-6">
                  {footerData.cancellationPolicy && (
                    <div>
                      <h4 className="font-medium mb-2">Annuleringsbeleid</h4>
                      <p className="text-sm text-gray-300">{footerData.cancellationPolicy}</p>
                    </div>
                  )}
                  
                  {footerData.privacyPolicy && (
                    <div>
                      <h4 className="font-medium mb-2">Privacy</h4>
                      <p className="text-sm text-gray-300">{footerData.privacyPolicy}</p>
                    </div>
                  )}
                  
                  {footerData.termsOfService && (
                    <div>
                      <h4 className="font-medium mb-2">Voorwaarden</h4>
                      <p className="text-sm text-gray-300">{footerData.termsOfService}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Attribution */}
            {footerData.showAttribution && (
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
            )}
          </div>
        </footer>
      </div>
    </div>
  );
}