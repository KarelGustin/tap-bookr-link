import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';
import { Button } from '@/components/ui/button';
import NotFound from './NotFound';

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
  // Footer data
  businessName?: string;
  address?: string;
  email?: string;
  phone?: string;
  hours?: string;
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
    background_image: profile.banner && typeof profile.banner === 'object' && 'imageUrl' in profile.banner && typeof profile.banner.imageUrl === 'string'
      ? profile.banner.imageUrl 
      : undefined,
    profile_image: profile.avatar_url || undefined,
    title: profile.banner && typeof profile.banner === 'object' && 'heading' in profile.banner && typeof profile.banner.heading === 'string'
      ? profile.banner.heading
      : (profile.name || 'Your Business Name'),
    subtitle: profile.banner && typeof profile.banner === 'object' && 'subheading' in profile.banner && typeof profile.banner.subheading === 'string'
      ? profile.banner.subheading
      : (profile.slogan || 'Your business description'),
    background_color: profile.banner && typeof profile.banner === 'object' && 'color' in profile.banner && typeof profile.banner.color === 'string'
      ? profile.banner.color
      : (profile.accent_color || '#6E56CF'),
    text_color: profile.banner && typeof profile.banner === 'object' && 'textColor' in profile.banner && typeof profile.banner.textColor === 'string'
      ? profile.banner.textColor
      : 'white'
  };

  // Strict helpers to normalize media from DB (supports { items: [...] } or array)
  type UnknownRecord = Record<string, unknown>;
  const rawMedia: unknown = profile.media as unknown;

  const extractMediaArray = (value: unknown): unknown[] => {
    if (Array.isArray(value)) return value;
    if (typeof value === 'object' && value !== null) {
      const maybeItems = (value as UnknownRecord).items;
      if (Array.isArray(maybeItems)) return maybeItems as unknown[];
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
    }
    return '';
  };

  const mediaList: unknown[] = extractMediaArray(rawMedia);

  return (
    <div className="min-h-screen bg-white">
      {/* Banner Section */}
      <section className="relative w-full" style={{ zIndex: 1 }}>
        {/* Background */}
        <div 
          className="relative w-full"
          style={{
            height: '70vh',
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



      {/* Arc Transition Section */}
      <section className="relative -mt-16" style={{ zIndex: 2 }}>
        {/* Arc shape that overlaps the banner */}
        <div className="relative w-full bg-white">
          <div className="absolute -top-16 left-0 right-0 h-32 bg-white rounded-t-[50%] transform -translate-y-1/2"></div>
        </div>
      </section>

      {/* About Section with Profile Avatar */}
      <section className="py-16 px-4 bg-white relative" style={{ zIndex: 3, marginTop: '-1px' }}>
        <div className="max-w-4xl mx-auto text-center">
          {/* Profile Avatar */}
          <div className="flex justify-center mb-8">
            <div className="w-48 h-48 rounded-full overflow-hidden border-4 border-white shadow-xl bg-white -mt-24">
              {profile.avatar_url ? (
                <img 
                  src={profile.avatar_url} 
                  alt={profile.name || 'Profile'}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                  <span className="text-6xl font-bold text-gray-400">
                    {profile.name?.charAt(0)?.toUpperCase() || '?'}
                  </span>
                </div>
              )}
            </div>
          </div>
          
          {/* About Content */}
          {profile.about && typeof profile.about === 'object' && (
            <>
              {(profile.about as AboutData).title && (
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  {(profile.about as AboutData).title}
                </h3>
              )}
              {(profile.about as AboutData).description && (
                <div 
                  className={`text-lg text-gray-600 leading-relaxed max-w-3xl mx-auto ${
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
      </section>

      {/* Social Links Section */}
      {profile.socials && Array.isArray(profile.socials) && profile.socials.length > 0 && (
        <section className="py-8 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Connect With Us</h3>
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
            {(() => {
              if (profile.about && typeof profile.about === 'object' && 'title' in profile.about) {
                const aboutData = profile.about as AboutData;
                return aboutData.title || 'Our Work(Space)';
              }
              return 'Our Work(Space)';
            })()}
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
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-gray-400 to-gray-500 flex items-center justify-center">
                          <span className="text-white text-lg font-medium">Image {index + 1}</span>
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
                    <span className="text-gray-500 text-lg font-medium">No images uploaded yet</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Booking Section */}
      {profile.booking_url && (
        <section className="w-full">
          <div className="w-full">
            <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center px-4">
              Book Your Appointment
            </h3>
            
            {/* Booking iframe - 100% width */}
            <div className="w-full">
              <iframe
                src={profile.booking_url}
                className="w-full min-h-[1000px] border-0"
                title="Book Appointment"
                allow="camera; microphone; geolocation"
                sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox"
              />
            </div>
          </div>
        </section>
      )}

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
                Customer Reviews
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
                            alt={`${testimonial.customer_name} testimonial`}
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
              {profile.booking_url && (
                <Button 
                  size="lg"
                  className="bg-primary hover:bg-primary/90 text-white px-8 py-3 text-lg"
                  onClick={() => {
                    if (profile.booking_url) {
                      window.open(profile.booking_url, '_blank');
                    }
                  }}
                >
                  Book Now
                </Button>
              )}
                             {(() => {
                 const about = profile.about as AboutData;
                 const phone = about?.phone;
                 if (phone) {
                  return (
                    <Button 
                      size="lg"
                      variant="outline"
                      className="border-white text-white hover:bg-white hover:text-gray-900 px-8 py-3 text-lg"
                      onClick={() => window.open(`tel:${phone}`, '_self')}
                    >
                      Call Now
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
                const about = profile.about as AboutData;
                const businessName = about?.businessName || profile.name;
                const address = about?.address;
                const email = about?.email;
                const phone = about?.phone;
                const hours = about?.hours;
                const nextAvailable = about?.nextAvailable;
                
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
                        <p className="text-gray-300">{hours}</p>
                      </div>
                    )}
                    
                    {nextAvailable && (
                      <div className="flex items-center space-x-3">
                        <div className="w-5 h-5 text-gray-400">
                          🎯
                        </div>
                        <p className="text-gray-300">
                          Next available: <span className="font-medium">{nextAvailable}</span>
                        </p>
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>

            {/* Google Maps */}
            {(() => {
              const about = profile.about as AboutData;
              const address = about?.address;
              const showMaps = about?.showMaps !== false;
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
                      title="Business Location"
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
                const about = profile.about as AboutData;
                const cancellationPolicy = about?.cancellationPolicy;
                const privacyPolicy = about?.privacyPolicy;
                const termsOfService = about?.termsOfService;
                
                return (
                  <>
                    {cancellationPolicy && (
                      <div>
                        <h4 className="font-medium mb-2">Cancellation Policy</h4>
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
                        <h4 className="font-medium mb-2">Terms</h4>
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
            const about = profile.about as AboutData;
            const showAttribution = about?.showAttribution !== false;
            
            if (showAttribution) {
              return (
                <div className="border-t border-gray-700 pt-6 text-center">
                  <div className="flex flex-col sm:flex-row items-center justify-center space-y-2 sm:space-y-0 sm:space-x-4 text-sm text-gray-400">
                    <span>Powered by Bookr</span>
                    <span>•</span>
                    <a 
                      href="/onboarding" 
                      className="text-gray-300 hover:text-white transition-colors"
                    >
                      Create your page
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