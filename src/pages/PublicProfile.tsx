import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';
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
    title: profile.name || 'Your Business Name',
    subtitle: profile.slogan || 'Your business description',
    background_color: profile.banner && typeof profile.banner === 'object' && 'color' in profile.banner && typeof profile.banner.color === 'string'
      ? profile.banner.color
      : (profile.accent_color || '#6E56CF'),
    text_color: 'white'
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
      <section className="relative w-full">
        {/* Background */}
        <div 
          className="relative w-full h-96"
          style={{
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
            {/* Profile Image */}
            {/* {bannerConfig.profile_image && (
              <div className="mb-6">
                <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-lg">
                  <img 
                    src={bannerConfig.profile_image} 
                    alt={bannerConfig.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            )} */}
            
            {/* Text Content */}
            <div className="space-y-2">
              <h1 
                className="text-4xl font-bold tracking-tight"
                style={{ color: bannerConfig.text_color }}
              >
                {bannerConfig.title}
              </h1>
              {bannerConfig.subtitle && (
                <p 
                  className="text-xl font-medium max-w-2xl mx-auto"
                  style={{ color: bannerConfig.text_color }}
                >
                  {bannerConfig.subtitle}
                </p>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Profile Section with Arced Background */}
      <section className="relative -mt-20 mb-8">
        {/* Arced Background */}
        <div className="relative w-full bg-white">
          {/* Arc shape that overlaps the banner */}
          <div className="absolute -top-20 left-0 right-0 h-40 bg-white rounded-t-[50%] transform -translate-y-1/2"></div>
          
          {/* Content Container with Profile Image and Text */}
          <div className="relative z-10 -pt-8 pb-4 px-4">
            <div className="max-w-2xl mx-auto text-center space-y-2">
              {/* Profile Image Circle */}
              <div className="flex justify-center mb-0">
                <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-xl bg-white -mt-48 ">
                  {profile.avatar_url ? (
                    <img 
                      src={profile.avatar_url} 
                      alt={profile.name || 'Profile'}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                      <span className="text-4xl font-bold text-gray-400">
                        {profile.name?.charAt(0)?.toUpperCase() || '?'}
                      </span>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Subheading: Name of user */}
              <p className="text-lg text-gray-600 font-medium">
                {profile.name || 'Your Name'}
              </p>
              
              {/* Heading: Business Name */}
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
                {profile.name || 'Your Business Name'}
              </h2>
              
              {/* Text: Description */}
              <p className="text-lg text-gray-600 leading-relaxed max-w-xl mx-auto">
                {profile.slogan || 'Your business description goes here. This is where you can tell visitors about what you do, your mission, or any other important information.'}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      {profile.about && typeof profile.about === 'object' && (
        <section className="py-8 px-4 bg-gray-50">
          <div className="max-w-4xl mx-auto text-center">
            {(profile.about as AboutData).title && (
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                {(profile.about as AboutData).title}
              </h3>
            )}
            {(profile.about as AboutData).description && (
              <p className="text-lg text-gray-600 leading-relaxed max-w-3xl mx-auto">
                {(profile.about as AboutData).description}
              </p>
            )}
          </div>
        </section>
      )}

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
                      className="inline-flex items-center px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
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
      {profile.testimonials && Array.isArray(profile.testimonials) && profile.testimonials.length > 0 && (
        <section className="py-8 px-4">
          <div className="max-w-6xl mx-auto">
            <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
              Customer Reviews
            </h3>
            
            {/* Horizontal Scrolling Reviews Container */}
            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
              {profile.testimonials.map((testimonial: Testimonial) => (
                <div key={testimonial.id} className="flex-shrink-0">
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
      )}

      {/* Additional sections will go here */}
      <div className="container mx-auto px-4 py-8">
        <p className="text-center text-gray-500">
          More customizable sections coming soon...
        </p>
      </div>
    </div>
  );
}