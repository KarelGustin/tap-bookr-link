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
    background_image: profile.banner ? (profile.banner as BannerData)?.url : undefined,
    profile_image: profile.avatar_url || undefined,
    title: profile.name || 'Your Business Name',
    subtitle: profile.slogan || 'Your business description',
    background_color: profile.accent_color || 'hsl(var(--primary))',
    text_color: 'white'
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Banner Section */}
      <section className="relative w-full">
        {/* Background */}
        <div 
          className="relative w-full h-96 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500"
          style={{
            backgroundImage: bannerConfig.background_image 
              ? `url(${bannerConfig.background_image})` 
              : undefined,
            backgroundColor: bannerConfig.background_image ? 'transparent' : bannerConfig.background_color
          }}
        >
          {bannerConfig.background_image && (
            <div className="absolute inset-0 bg-black/20" />
          )}
          
          {/* Content Container */}
          <div className="relative z-10 flex flex-col items-center justify-center h-full px-4 text-center">
            {/* Profile Image */}
            {bannerConfig.profile_image && (
              <div className="mb-6">
                <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-lg">
                  <img 
                    src={bannerConfig.profile_image} 
                    alt={bannerConfig.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            )}
            
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

      {/* Horizontal Scrolling Cards Section */}
      <section className="py-8 px-4">
        <div className="max-w-6xl mx-auto">
          <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Our Work(Space)
          </h3>
          
          {/* Horizontal Scrolling Container */}
          <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            {/* Card 1 */}
            <div className="flex-shrink-0">
              <div className="w-80 aspect-[4/5] rounded-xl overflow-hidden shadow-lg">
                <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                  <span className="text-white text-lg font-medium">Image 1</span>
                </div>
              </div>
            </div>
            
            {/* Card 2 */}
            <div className="flex-shrink-0">
              <div className="w-80 aspect-[4/5] rounded-xl overflow-hidden shadow-lg">
                <div className="w-full h-full bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center">
                  <span className="text-white text-lg font-medium">Image 2</span>
                </div>
              </div>
            </div>
            
            {/* Card 3 */}
            <div className="flex-shrink-0">
              <div className="w-80 aspect-[4/5] rounded-xl overflow-hidden shadow-lg">
                <div className="w-full h-full bg-gradient-to-br from-pink-400 to-red-500 flex items-center justify-center">
                  <span className="text-white text-lg font-medium">Image 3</span>
                </div>
              </div>
            </div>
            
            {/* Card 4 */}
            <div className="flex-shrink-0">
              <div className="w-80 aspect-[4/5] rounded-xl overflow-hidden shadow-lg">
                <div className="w-full h-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center">
                  <span className="text-white text-lg font-medium">Image 4</span>
                </div>
              </div>
            </div>
            
            {/* Card 5 */}
            <div className="flex-shrink-0">
              <div className="w-80 aspect-[4/5] rounded-xl overflow-hidden shadow-lg">
                <div className="w-full h-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center">
                  <span className="text-white text-lg font-medium">Image 5</span>
                </div>
              </div>
            </div>
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

      {/* Placeholder Testimonials Section */}
      <section className="py-8 px-4">
        <div className="max-w-6xl mx-auto">
          <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Customer Reviews
          </h3>
          
          {/* Horizontal Scrolling Reviews Container */}
          <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            {/* Placeholder Review Card 1 */}
            <div className="flex-shrink-0">
              <div className="w-80 aspect-[4/5] rounded-xl overflow-hidden shadow-lg">
                <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-500 flex flex-col justify-end p-6 text-white">
                  <div className="mb-4">
                    <h4 className="font-semibold text-lg mb-2">Amazing Service</h4>
                    <p className="text-sm opacity-90">John Doe</p>
                  </div>
                  <p className="text-sm leading-relaxed opacity-90">
                    "Absolutely fantastic experience! The quality of work exceeded my expectations and the team was incredibly professional."
                  </p>
                </div>
              </div>
            </div>
            
            {/* Placeholder Review Card 2 */}
            <div className="flex-shrink-0">
              <div className="w-80 aspect-[4/5] rounded-xl overflow-hidden shadow-lg">
                <div className="w-full h-full bg-gradient-to-br from-green-400 to-blue-500 flex flex-col justify-end p-6 text-white">
                  <div className="mb-4">
                    <h4 className="font-semibold text-lg mb-2">Highly Recommended</h4>
                    <p className="text-sm opacity-90">Sarah Johnson</p>
                  </div>
                  <p className="text-sm leading-relaxed opacity-90">
                    "I've been a customer for years and they never disappoint. The attention to detail is outstanding."
                  </p>
                </div>
              </div>
            </div>
            
            {/* Placeholder Review Card 3 */}
            <div className="flex-shrink-0">
              <div className="w-80 aspect-[4/5] rounded-xl overflow-hidden shadow-lg">
                <div className="w-full h-full bg-gradient-to-br from-pink-400 to-red-500 flex flex-col justify-end p-6 text-white">
                  <div className="mb-4">
                    <h4 className="font-semibold text-lg mb-2">Outstanding Quality</h4>
                    <p className="text-sm opacity-90">Mike Brown</p>
                  </div>
                  <p className="text-sm leading-relaxed opacity-90">
                    "The best service I've ever received. Professional, punctual, and the results speak for themselves."
                  </p>
                </div>
              </div>
            </div>
            
            {/* Placeholder Review Card 4 */}
            <div className="flex-shrink-0">
              <div className="w-80 aspect-[4/5] rounded-xl overflow-hidden shadow-lg">
                <div className="w-full h-full bg-gradient-to-br from-yellow-400 to-orange-500 flex flex-col justify-end p-6 text-white">
                  <div className="mb-4">
                    <h4 className="font-semibold text-lg mb-2">Exceptional Experience</h4>
                    <p className="text-sm opacity-90">Lisa Wilson</p>
                  </div>
                  <p className="text-sm leading-relaxed opacity-90">
                    "From start to finish, everything was perfect. I couldn't be happier with the results!"
                  </p>
                </div>
              </div>
            </div>
            
            {/* Placeholder Review Card 5 */}
            <div className="flex-shrink-0">
              <div className="w-80 aspect-[4/5] rounded-xl overflow-hidden shadow-lg">
                <div className="w-full h-full bg-gradient-to-br from-indigo-400 to-purple-500 flex flex-col justify-end p-6 text-white">
                  <div className="mb-4">
                    <h4 className="font-semibold text-lg mb-2">Professional & Reliable</h4>
                    <p className="text-sm opacity-90">Robert Davis</p>
                  </div>
                  <p className="text-sm leading-relaxed opacity-90">
                    "They delivered exactly what they promised, on time and within budget. Highly professional team."
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Additional sections will go here */}
      <div className="container mx-auto px-4 py-8">
        <p className="text-center text-gray-500">
          More customizable sections coming soon...
        </p>
      </div>
    </div>
  );
}