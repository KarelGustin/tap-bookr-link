import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Star, MapPin, Clock, Phone, Mail, Building2 } from 'lucide-react';

interface Step7PreviewProps {
  onPublish: () => void;
  onSaveDraft: () => void;
  onEditPage: () => void;
  onBack: () => void;
  profileData: {
    handle: string;
    name?: string;
    slogan?: string;
    category?: string;
    avatar_url?: string;
    banner: any;
    aboutTitle?: string;
    aboutDescription?: string;
    aboutAlignment?: 'center' | 'left';
    socials: any;
    socialLinks: Array<{
      id: string;
      title: string;
      platform?: string;
      url: string;
    }>;
    mediaFiles: File[];
    testimonials: Array<{
      customer_name: string;
      review_title: string;
      review_text: string;
      image_url?: string;
    }>;
    footer: {
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
    };
    bookingUrl: string;
    bookingMode: 'embed' | 'new_tab';
  };
  canPublish: boolean;
  isPublishing: boolean;
}

export const Step7Preview = ({ 
  onPublish, 
  onSaveDraft, 
  onEditPage, 
  onBack, 
  profileData, 
  canPublish, 
  isPublishing 
}: Step7PreviewProps) => {
  const [activeTab, setActiveTab] = useState<'preview' | 'summary'>('preview');

  const renderPreview = () => (
    <div className="space-y-6">
      {/* Banner Section */}
      <div 
        className="relative h-64 rounded-lg overflow-hidden"
        style={{
          backgroundColor: profileData.banner?.type === 'color' ? profileData.banner?.color : 'hsl(var(--accent))',
          backgroundImage: profileData.banner?.type === 'image' && profileData.banner?.imageUrl ? `url(${profileData.banner.imageUrl})` : 'none',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative z-10 h-full flex flex-col items-center justify-center text-center text-white p-6">
          <h1 className="text-3xl font-bold mb-2">
            {profileData.banner?.heading || profileData.name || 'Your Business Name'}
          </h1>
          <p className="text-xl opacity-90">
            {profileData.banner?.subheading || profileData.slogan || 'Your business tagline'}
          </p>
          {profileData.category && (
            <Badge variant="secondary" className="mt-3 bg-white/20 text-white border-white/30">
              {profileData.category}
            </Badge>
          )}
        </div>
      </div>

      {/* About Section */}
      {(profileData.aboutTitle || profileData.aboutDescription) && (
        <Card>
          <CardContent className="p-6">
            <div className={`text-center ${profileData.aboutAlignment === 'left' ? 'text-left' : ''}`}>
              {profileData.aboutTitle && (
                <h2 className="text-2xl font-bold text-gray-900 mb-4">{profileData.aboutTitle}</h2>
              )}
              {profileData.aboutDescription && (
                <p className="text-gray-600 leading-relaxed whitespace-pre-line">{profileData.aboutDescription}</p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Testimonials Section */}
      {profileData.testimonials && profileData.testimonials.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-center">What Our Customers Say</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              {profileData.testimonials.map((testimonial, index) => (
                <div key={index} className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex text-yellow-400">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-current" />
                      ))}
                    </div>
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-1">{testimonial.review_title}</h4>
                  <p className="text-gray-600 mb-2">{testimonial.review_text}</p>
                  <p className="text-sm text-gray-500">— {testimonial.customer_name}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Social Links */}
      {profileData.socialLinks && profileData.socialLinks.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-center">Connect With Us</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3 justify-center">
              {profileData.socialLinks.map((link) => (
                <Badge key={link.id} variant="outline" className="px-4 py-2">
                  {link.title}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Footer Section */}
      {(profileData.footer?.businessName || profileData.footer?.address || profileData.footer?.email || profileData.footer?.phone) && (
        <Card>
          <CardHeader>
            <CardTitle className="text-center">Contact Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 text-center">
              {profileData.footer?.businessName && (
                <div className="flex items-center justify-center gap-2">
                  <Building2 className="w-5 h-5 text-gray-500" />
                  <span className="font-medium">{profileData.footer.businessName}</span>
                </div>
              )}
              {profileData.footer?.address && (
                <div className="flex items-center justify-center gap-2">
                  <MapPin className="w-5 h-5 text-gray-500" />
                  <span>{profileData.footer.address}</span>
                </div>
              )}
              {profileData.footer?.email && (
                <div className="flex items-center justify-center gap-2">
                  <Mail className="w-5 h-5 text-gray-500" />
                  <span>{profileData.footer.email}</span>
                </div>
              )}
              {profileData.footer?.phone && (
                <div className="flex items-center justify-center gap-2">
                  <Phone className="w-5 h-5 text-gray-500" />
                  <span>{profileData.footer.phone}</span>
                </div>
              )}
              {profileData.footer?.hours && (
                <div className="flex items-center justify-center gap-2">
                  <Clock className="w-5 h-5 text-gray-500" />
                  <span>{profileData.footer.hours}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Booking Section */}
      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="p-6 text-center">
          <h3 className="text-xl font-bold text-gray-900 mb-2">Ready to Book?</h3>
          <p className="text-gray-600 mb-4">Click below to schedule your appointment</p>
          <Button className="bg-primary text-gray-900 hover:bg-primary/90">
            Book Now
          </Button>
        </CardContent>
      </Card>
    </div>
  );

  const renderSummary = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Page Summary</CardTitle>
          <CardDescription>Here's what your page will include:</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4">
            <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <div>
                <p className="font-medium text-green-900">Banner Section</p>
                <p className="text-sm text-green-700">
                  {profileData.banner?.type === 'image' ? 'Custom banner image' : 'Custom banner color'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <div>
                <p className="font-medium text-green-900">Business Information</p>
                <p className="text-sm text-green-700">
                  {profileData.name || profileData.banner?.heading || 'Business name'} • {profileData.category || 'Category'}
                </p>
              </div>
            </div>
            
            {profileData.aboutTitle || profileData.aboutDescription ? (
              <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <div>
                  <p className="font-medium text-green-900">About Section</p>
                  <p className="text-sm text-green-700">
                    {profileData.aboutTitle ? 'Custom title' : 'No title'} • {profileData.aboutDescription ? 'Custom description' : 'No description'}
                  </p>
                </div>
              </div>
            ) : null}
            
            {profileData.testimonials && profileData.testimonials.length > 0 ? (
              <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <div>
                  <p className="font-medium text-green-900">Testimonials</p>
                  <p className="text-sm text-green-700">
                    {profileData.testimonials.length} customer reviews
                  </p>
                </div>
              </div>
            ) : null}
            
            {profileData.socialLinks && profileData.socialLinks.length > 0 ? (
              <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <div>
                  <p className="font-medium text-green-900">Social Links</p>
                  <p className="text-sm text-green-700">
                    {profileData.socialLinks.length} social media platforms
                  </p>
                </div>
              </div>
            ) : null}
            
            {profileData.footer?.businessName || profileData.footer?.address ? (
              <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <div>
                  <p className="font-medium text-green-900">Footer Information</p>
                  <p className="text-sm text-green-700">
                    Business details, policies, and contact information
                  </p>
                </div>
              </div>
            ) : null}
            
            <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <div>
                <p className="font-medium text-green-900">Booking Integration</p>
                <p className="text-sm text-green-700">
                  {profileData.bookingMode === 'embed' ? 'Embedded booking form' : 'New tab booking'}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold text-gray-900">Preview Your Page</h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          This is how your customers will see your page. Review everything and make sure it looks perfect!
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="flex justify-center">
        <div className="flex border border-gray-200 rounded-lg p-1 bg-gray-50">
          <button
            onClick={() => setActiveTab('preview')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'preview'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Page Preview
          </button>
          <button
            onClick={() => setActiveTab('summary')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'summary'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Page Summary
          </button>
        </div>
      </div>

      {/* Content */}
      {activeTab === 'preview' ? renderPreview() : renderSummary()}

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Button variant="outline" onClick={onBack}>
          Back to Footer Settings
        </Button>
        <Button variant="outline" onClick={onEditPage}>
          Edit Page Later
        </Button>
        <Button 
          onClick={onPublish} 
          disabled={!canPublish || isPublishing}
          className="bg-primary text-gray-900 hover:bg-primary/90"
        >
          {isPublishing ? 'Publishing...' : 'Publish Page'}
        </Button>
      </div>

      {/* Save Draft Option */}
      <div className="text-center">
        <Button variant="ghost" onClick={onSaveDraft}>
          Save as Draft
        </Button>
        <p className="text-sm text-gray-500 mt-2">
          You can always come back and finish later
        </p>
      </div>
    </div>
  );
};
