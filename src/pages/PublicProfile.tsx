import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';
import { Button } from '@/components/ui/button';
import NotFound from './NotFound';
import { useLanguage } from '@/contexts/LanguageContext';

type Profile = Database['public']['Tables']['profiles']['Row'] & {
  testimonials?: Testimonial[];
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
  hours?: {
    monday: { open: string; close: string; closed: boolean };
    tuesday: { open: string; close: string; closed: boolean };
    wednesday: { open: string; close: string; closed: boolean };
    thursday: { open: string; close: string; closed: boolean };
    friday: { open: string; close: string; closed: boolean };
    saturday: { open: string; close: string; closed: boolean };
    sunday: { open: string; close: string; closed: boolean };
  };
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
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('handle', handle)
        .eq('status', 'published')
        .maybeSingle();

      if (error) throw error;

      if (!data) {
        setNotFound(true);
        return;
      }

      console.log('Loaded profile data:', data);
      console.log('Media field:', data.media);
      console.log('Media type:', typeof data.media);
      console.log('Media is array:', Array.isArray(data.media));
      console.log('Footer field:', data.footer);
      console.log('Footer type:', typeof data.footer);
      console.log('Footer content:', data.footer);

      setProfile(data);
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
      }
      return undefined;
    })(),
    profile_image: profile.avatar_url || undefined,
    title: (() => {
      if (profile.banner && typeof profile.banner === 'object' && 'heading' in profile.banner && typeof profile.banner.heading === 'string') {
        return profile.banner.heading;
      }
      return profile.name || 'Your Business Name';
    })(),
    subtitle: (() => {
      if (profile.banner && typeof profile.banner === 'object' && 'subheading' in profile.banner && typeof profile.banner.subheading === 'string') {
        return profile.banner.subheading;
      }
      return profile.slogan || 'Your business description';
    })(),
    background_color: (() => {
      if (profile.banner && typeof profile.banner === 'object' && 'color' in profile.banner && typeof profile.banner.color === 'string') {
        return profile.banner.color;
      }
      return profile.accent_color || '#6E56CF';
    })(),
    text_color: (() => {
      if (profile.banner && typeof profile.banner === 'object' && 'textColor' in profile.banner && typeof profile.banner.textColor === 'string') {
        return profile.banner.textColor;
      }
      return 'white';
    })()
  };

  // Debug banner configuration
  console.log('Banner config:', bannerConfig);
  console.log('Banner background_image:', bannerConfig.background_image);
  console.log('Banner background_color:', bannerConfig.background_color);
  console.log('Raw footer data from profile:', profile.footer);
  console.log('Footer data type:', typeof profile.footer);
  console.log('Footer data stringified:', JSON.stringify(profile.footer, null, 2));
  
  // Check if footer data needs to be parsed
  let parsedFooter = profile.footer;
  if (typeof profile.footer === 'string') {
    try {
      parsedFooter = JSON.parse(profile.footer);
      console.log('Footer data was string, parsed to:', parsedFooter);
    } catch (error) {
      console.error('Failed to parse footer data:', error);
    }
  }

  // Strict helpers to normalize media from DB (supports { items: [...] } or array)
  type UnknownRecord = Record<string, unknown>;
  const rawMedia: unknown = profile.media as unknown;

  const extractMediaArray = (value: unknown): unknown[] => {
    if (Array.isArray(value)) return value;
    if (typeof value === 'object' && value !== null) {
      const maybeItems = (value as UnknownRecord).items;
      if (Array.isArray(maybeItems)) return maybeItems as unknown[];
      
      // Also check for other common field names
      const maybeMedia = (value as UnknownRecord).media;
      if (Array.isArray(maybeMedia)) return maybeMedia as unknown[];
      
      const maybeFiles = (value as UnknownRecord).files;
      if (Array.isArray(maybeFiles)) return maybeFiles as unknown[];
    }
    return [];
  };

  const getImageUrl = (item: unknown): string => {
    if (typeof item === 'string') return item;
    if (typeof item === 'object' && item !== null) {
      const rec = item as UnknownRecord;
      if (typeof rec.url === 'string') return rec.url;
      if (typeof rec.imageUrl === 'string') return rec.imageUrl;
      if (typeof rec.fileName === 'string') return rec.fileName;
      if (typeof rec.image_url === 'string') return rec.image_url;
      if (typeof rec.file_url === 'string') return rec.file_url;
    }
    return '';
  };

  const mediaList: unknown[] = extractMediaArray(rawMedia);

  
  // Debug logging
  console.log('Raw media data:', rawMedia);
  console.log('Raw media type:', typeof rawMedia);
  console.log('Raw media is object:', typeof rawMedia === 'object' && rawMedia !== null);
  console.log('Raw media keys:', typeof rawMedia === 'object' && rawMedia !== null ? Object.keys(rawMedia as object) : 'N/A');
  console.log('Extracted media list:', mediaList);
  console.log('Media list length:', mediaList.length);
  console.log('Banner data:', profile.banner);
  console.log('Banner type:', profile.banner && typeof profile.banner === 'object' ? (profile.banner as Record<string, unknown>).type : 'N/A');
  console.log('Banner imageUrl:', profile.banner && typeof profile.banner === 'object' ? (profile.banner as Record<string, unknown>).imageUrl : 'N/A');
  console.log('Footer data:', profile.footer);

  return (
    <div className="min-h-screen bg-white">
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
          {/* Debug info - remove in production */}
          {process.env.NODE_ENV === 'development' && (
            <div className="absolute top-4 left-4 bg-black/70 text-white text-xs p-2 rounded z-20">
              <div>Banner Image: {bannerConfig.background_image || 'None'}</div>
              <div>Banner Color: {bannerConfig.background_color}</div>
              <div>Raw Banner: {JSON.stringify(profile.banner)}</div>
            </div>
          )}
          
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
            {t('public.about', { name: (parsedFooter as FooterData)?.businessName || profile.name || 'jouw bedrijf' })}
          </h2>
                      {/* Mobile Layout - Stacked */}
          <div className="block md:hidden text-center">
            {/* Profile Avatar - Full width on mobile */}
            <div className="w-full mb-8">
              <div className="w-full h-[100%] overflow-hidden shadow-xl bg-white rounded-xl">
                {profile.avatar_url ? (
                  <img 
                    src={profile.avatar_url} 
                    alt={(parsedFooter as FooterData)?.businessName || profile.name || 'Profiel'}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                    <span className="text-6xl font-bold text-gray-400">
                      {(parsedFooter as FooterData)?.businessName?.charAt(0)?.toUpperCase() || profile.name?.charAt(0)?.toUpperCase() || '?'}
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
                    alt={(parsedFooter as FooterData)?.businessName || profile.name || 'Profile'}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                    <span className="text-6xl font-bold text-gray-400">
                      {(parsedFooter as FooterData)?.businessName?.charAt(0)?.toUpperCase() || profile.name?.charAt(0)?.toUpperCase() || '?'}
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
          
          {/* Debug info - remove in production */}
          {process.env.NODE_ENV === 'development' && (
            <div className="mb-4 p-4 bg-gray-100 rounded-lg text-xs">
              <div><strong>Media Debug Info:</strong></div>
              <div>Raw media: {JSON.stringify(profile.media)}</div>
              <div>Media type: {typeof profile.media}</div>
              <div>Extracted media list length: {mediaList.length}</div>
              <div>Media list: {JSON.stringify(mediaList)}</div>
            </div>
          )}
          
          {/* Horizontal Scrolling Container */}
          <div
            className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {mediaList.length > 0 ? (
              mediaList.map((mediaItem: unknown, index: number) => {
                const imageUrl = getImageUrl(mediaItem);
                console.log(`Media item ${index}:`, mediaItem, 'Image URL:', imageUrl);
                return (
                  <div key={index} className="flex-shrink-0">
                    <div className="w-80 aspect-[4/5] rounded-xl overflow-hidden shadow-lg">
                      {imageUrl ? (
                        <img
                          src={imageUrl}
                          alt={`Media ${index + 1}`}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            console.error(`Failed to load image ${index}:`, imageUrl);
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
                  className="w-full min-h-[1000px] border-0"
                  title="Afspraak Boeken"
                  allow="camera; microphone; geolocation"
                  sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox"
                />
              </div>
            )}
          </div>
        </section>

      {/* Reviews Section */}
      {(() => {
        // Check for testimonials in both profile.testimonials and profile.about.testimonials
        let testimonials: Testimonial[] = [];
        
        if (profile.testimonials && Array.isArray(profile.testimonials)) {
          testimonials = profile.testimonials;
        } else if (profile.about && typeof profile.about === 'object' && 'testimonials' in profile.about) {
          const aboutData = profile.about as AboutData & { testimonials?: Testimonial[] };
          if (aboutData.testimonials && Array.isArray(aboutData.testimonials)) {
            testimonials = aboutData.testimonials;
          }
        }
        
        // Only show section if there are testimonials
        if (testimonials.length === 0) return null;
        
        return (
          <section className="py-8 px-4">
            <div className="max-w-6xl mx-auto">
              <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
                {t('public.testimonials')}
              </h3>
              
              {/* Horizontal Scrolling Reviews Container */}
              <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                {testimonials.map((testimonial: Testimonial, index: number) => (
                  <div key={testimonial.id || index} className="flex-shrink-0">
                    <div className="w-80 aspect-[4/5] rounded-xl overflow-hidden shadow-lg">
                      {testimonial.image_url ? (
                        <div className="w-full h-full relative">
                          <img 
                            src={testimonial.image_url} 
                            alt={`${testimonial.customer_name} aanbeveling`}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-black/30" />
                          <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                            <div className="mb-4">
                              <h4 className="font-semibold text-lg mb-2">{testimonial.review_title}</h4>
                              <p className="text-sm opacity-90">{testimonial.customer_name}</p>
                            </div>
                            <p className="text-sm leading-relaxed opacity-90">
                              "{testimonial.review_text}"
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
                            <h4 className="font-semibold text-lg mb-2">{testimonial.review_title}</h4>
                            <p className="text-sm opacity-90">{testimonial.customer_name}</p>
                          </div>
                          <p className="text-sm leading-relaxed opacity-90">
                            "{testimonial.review_text}"
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
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
                 const footer = parsedFooter as FooterData;
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
                const footer = parsedFooter as FooterData;
                console.log('Footer data in business details:', footer);
                console.log('Footer data type:', typeof footer);
                console.log('Footer data keys:', footer && typeof footer === 'object' ? Object.keys(footer) : 'N/A');
                const businessName = footer?.businessName || profile.name;
                const address = footer?.address;
                const email = footer?.email;
                const phone = footer?.phone;
                const hours = footer?.hours;
                const nextAvailable = footer?.nextAvailable;
                
                console.log('Footer extracted values:', { businessName, address, email, phone, hours, nextAvailable });
                
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
              const footer = parsedFooter as FooterData;
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
                const footer = parsedFooter as FooterData;
                const cancellationPolicy = footer?.cancellationPolicy;
                const privacyPolicy = footer?.privacyPolicy;
                const termsOfService = footer?.termsOfService;
                
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
            const footer = parsedFooter as FooterData;
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
    </div>
  );
}