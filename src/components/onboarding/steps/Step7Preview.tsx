import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { OnboardingLayout } from '../OnboardingLayout';
import { useLanguage } from '@/contexts/LanguageContext';
import { ExternalLink, CheckCircle, CreditCard, Clock } from 'lucide-react';
import StripeService from '@/services/stripeService';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface Step7PreviewProps {
  onPublish: () => Promise<void>;
  onSaveDraft: () => Promise<void>;
  onBack: () => void;
  onStartLivePreview: () => Promise<void>;
  handle: string;
  canPublish: boolean;
  isPublishing: boolean;
  isPreviewActive?: boolean; // Add this prop
  profileData: {
    handle: string;
    email?: string;
    name?: string;
    slogan?: string;
    category?: string;
    avatar_url?: string;
    banner?: {
      type?: string;
      imageUrl?: string;
      heading?: string;
      subheading?: string;
      textColor?: string;
    };
    aboutTitle?: string;
    aboutDescription?: string;
    aboutAlignment?: 'center' | 'left';
    socials?: Record<string, string>;
    socialLinks?: Array<{
      id: string;
      title: string;
      platform?: string;
      url: string;
    }>;
    mediaFiles?: File[];
    testimonials?: Array<{
      customer_name: string;
      review_title: string;
      review_text: string;
      image_url?: string;
    }>;
    bookingUrl?: string;
    bookingMode?: string;
    footer?: {
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
    };
  };
}

export const Step7Preview = ({ 
  onPublish, 
  onSaveDraft, 
  onBack, 
  onStartLivePreview, 
  handle, 
  canPublish, 
  isPublishing,
  isPreviewActive, // Destructure the new prop
  profileData 
}: Step7PreviewProps) => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [isLivePreviewActive, setIsLivePreviewActive] = useState(false);
  const [livePreviewTimeLeft, setLivePreviewTimeLeft] = useState(15 * 60); // 15 minutes in seconds
  const [previewKey, setPreviewKey] = useState(0);
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [planType, setPlanType] = useState<'monthly' | 'yearly'>('yearly');

  // Initialize local state based on the prop
  useEffect(() => {
    if (isPreviewActive !== undefined) {
      setIsLivePreviewActive(isPreviewActive);
      // If preview is active, reset time left to 15 minutes
      if (isPreviewActive) {
        setLivePreviewTimeLeft(15 * 60);
      }
    }
  }, [isPreviewActive]);

  // Check if profile is already in preview mode
  useEffect(() => {
    // This would typically come from the database status
    // For now, we'll check if the profile has a recent preview timestamp
    const checkPreviewStatus = async () => {
      try {
        // You could make an API call here to check the current preview status
        // For now, we'll just use the local state
        console.log('🔧 Checking preview status...');
      } catch (error) {
        console.error('🔧 Error checking preview status:', error);
      }
    };
    
    checkPreviewStatus();
  }, []);

  // Start live preview countdown
  useEffect(() => {
    if (isLivePreviewActive && livePreviewTimeLeft > 0) {
      const timer = setInterval(() => {
        setLivePreviewTimeLeft(prev => {
          if (prev <= 1) {
            setIsLivePreviewActive(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [isLivePreviewActive, livePreviewTimeLeft]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const startLivePreview = async () => {
    try {
      console.log('🔧 Starting live preview from Step7Preview...');
      
      // Call the parent component's startLivePreview function
      await onStartLivePreview();
      
      // If successful, update local state
      setIsLivePreviewActive(true);
      
      // Refresh the preview iframe
      setPreviewKey(prev => prev + 1);
      
      console.log('🔧 Live preview started successfully');
      
    } catch (error) {
      console.error('🔧 Failed to start live preview:', error);
      // Don't update local state if the API call failed
    }
  };

  const handleSubscribe = async () => {
    if (!profileData.handle) {
      toast({
        title: "Fout",
        description: "Geen handle gevonden. Publiceer eerst je profiel.",
        variant: "destructive",
      });
      return;
    }

    setIsSubscribing(true);
    try {
      // Get profile ID from the database using the handle
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('id, booking_url, whatsapp_number')
        .eq('handle', profileData.handle)
        .single();
      
      if (error || !profile?.id) {
        throw new Error('Profile niet gevonden');
      }

      if (!profile.booking_url && !profile.whatsapp_number) {
        throw new Error('Om live te gaan moet je een whatsapp nummer invoeren of je boekings-URL toevoegen');
      }

      // Prefer Stripe Payment Links when configured; fallback to Edge Function checkout
      const monthlyLink = import.meta.env.VITE_STRIPE_LINK_MONTHLY as string | undefined;
      const yearlyLink = import.meta.env.VITE_STRIPE_LINK_YEARLY as string | undefined;
      const baseLink = planType === 'yearly' ? yearlyLink : monthlyLink;

      if (baseLink) {
        // Prefill email and pass client_reference_id for webhook linkage
        const { data: auth } = await supabase.auth.getUser();
        const email = auth?.user?.email;
        const params = new URLSearchParams();
        params.set('client_reference_id', profile.id);
        if (email) params.set('prefilled_email', email);
        const url = `${baseLink}${baseLink.includes('?') ? '&' : '?'}${params.toString()}`;
        window.location.href = url;
        return;
      }

      // Fallback: use Edge Function (applies coupon automatically)
      await StripeService.redirectToCheckout({
        profileId: profile.id,
        successUrl: `${window.location.origin}/dashboard?success=true&subscription=active`,
        cancelUrl: `${window.location.origin}/onboarding?step=7`,
      });
    } catch (error) {
      console.error('Error starting subscription:', error);
      toast({
        title: "Fout",
        description: "Er is een fout opgetreden bij het starten van je abonnement. Probeer het opnieuw.",
        variant: "destructive",
      });
    } finally {
      setIsSubscribing(false);
    }
  };

  return (
    <OnboardingLayout
      currentStep={8}
      totalSteps={8}
      title="Voorvertoning & Publicatie"
      subtitle="Bekijk je pagina en kies hoe je verder wilt gaan"
      onBack={onBack}
      handle={handle}
    >
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Live Preview Status */}
        {isLivePreviewActive && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <div className="flex-1">
                <h3 className="font-medium text-green-900">
                  Live Preview Actief - {formatTime(livePreviewTimeLeft)} resterend
                </h3>
                <p className="text-sm text-green-700">
                  Je pagina is nu live en zichtbaar voor bezoekers
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Live Preview Expired */}
        {!isLivePreviewActive && livePreviewTimeLeft === 0 && (
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-amber-600" />
              <div>
                <h3 className="font-medium text-amber-900">
                  Live preview is verlopen
                </h3>
                <p className="text-sm text-amber-700">
                  Je pagina is terug in conceptmodus. Start een nieuwe preview of publiceer permanent.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Preview Tabs */}
        <div className="space-y-8">
          {/* Page Preview */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Pagina Voorvertoning</h3>
            <div className="border rounded-lg overflow-hidden">
              {isLivePreviewActive ? (
                <iframe
                  key={previewKey}
                  src={`${window.location.origin}/${handle}`}
                  className="w-full h-96 border-0"
                  title="Live Page Preview"
                />
              ) : (
                <div className="w-full h-96 bg-gray-100 flex items-center justify-center">
                  <div className="text-center">
                    <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-600 mb-2">
                      Start Live Preview
                    </h3>
                    <p className="text-sm text-gray-500">
                      Klik op "Start 15 min. Live Preview" om je pagina live te zetten
                    </p>
                  </div>
                </div>
              )}
            </div>
            <div className="flex flex-col gap-3">
              <Button
                onClick={startLivePreview}
                disabled={isLivePreviewActive}
                className="flex-1"
              >
                <Clock className="w-4 h-4 mr-2" />
                Start 15 min. Live Preview
              </Button>
              <Button
                variant="outline"
                onClick={() => window.open(`https://tapbookr.com/${handle}`, '_blank')}
                disabled={!isLivePreviewActive}
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Open in nieuw tabblad
              </Button>
            </div>
          </div>



          {/* Page Summary */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Pagina Samenvatting</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium mb-3">Basis Informatie</h4>
                <div className="space-y-2 text-sm text-gray-600">
                  <p><span className="font-medium">Handle:</span> <span className="break-all">@{handle}</span></p>
                  <p><span className="font-medium">Naam:</span> <span className="break-words">{profileData.name || 'Niet ingevuld'}</span></p>
                  <p><span className="font-medium">Slogan:</span> <span className="break-words">{profileData.slogan || 'Niet ingevuld'}</span></p>
                  <p><span className="font-medium">Categorie:</span> <span className="break-words">{profileData.category || 'Niet ingevuld'}</span></p>
                </div>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium mb-3">Boeking</h4>
                <div className="space-y-2 text-sm text-gray-600">
                  <p>
                    <span className="font-medium">Status:</span> {profileData.bookingUrl ? 'Gekoppeld aan boekingssysteem' : 'Geen boeking ingesteld'}
                  </p>
                  {profileData.bookingUrl && (
                    <p>
                      <span className="font-medium">URL:</span>
                      <span 
                        className="ml-1 text-blue-600 hover:text-blue-800 cursor-pointer break-all"
                        title={profileData.bookingUrl}
                        onClick={() => window.open(profileData.bookingUrl, '_blank')}
                      >
                        {profileData.bookingUrl.length > 50 
                          ? `${profileData.bookingUrl.substring(0, 50)}...` 
                          : profileData.bookingUrl
                        }
                      </span>
                    </p>
                  )}
                </div>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium mb-3">Content</h4>
                <div className="space-y-2 text-sm text-gray-600">
                  <p>
                    <span className="font-medium">Over jou:</span> {profileData.aboutTitle ? 'Ingevuld' : 'Niet ingevuld'}
                  </p>
                  <p><span className="font-medium">Media items:</span> {profileData.mediaFiles?.length || 0}</p>
                  <p><span className="font-medium">Testimonials:</span> {profileData.testimonials?.length || 0}</p>
                  {profileData.socialLinks && profileData.socialLinks.length > 0 && (
                    <p><span className="font-medium">Sociale links:</span> {profileData.socialLinks.length}</p>
                  )}
                </div>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium mb-3">Footer</h4>
                <div className="space-y-2 text-sm text-gray-600">
                  <p>
                    <span className="font-medium">Bedrijfsinfo:</span> {profileData.footer?.businessName ? 'Ingevuld' : 'Niet ingevuld'}
                  </p>
                  {profileData.footer?.email && (
                    <p><span className="font-medium">Email:</span> <span className="break-all">{profileData.footer.email}</span></p>
                  )}
                  {profileData.footer?.phone && (
                    <p><span className="font-medium">Telefoon:</span> <span className="break-words">{profileData.footer.phone}</span></p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Plan Toggle + Action Buttons */}
        <div className="flex flex-col gap-3 pt-6">
          <div className="grid grid-cols-2 rounded-lg border overflow-hidden">
            <button
              type="button"
              onClick={() => setPlanType('monthly')}
              className={`py-2 text-sm font-medium ${planType === 'monthly' ? 'bg-gray-900 text-white' : 'bg-white text-gray-700'}`}
            >
              Maandelijks
            </button>
            <button
              type="button"
              onClick={() => setPlanType('yearly')}
              className={`py-2 text-sm font-medium ${planType === 'yearly' ? 'bg-gray-900 text-white' : 'bg-white text-gray-700'}`}
            >
              Jaarlijks
            </button>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <Button
              onClick={handleSubscribe}
              disabled={isSubscribing}
              className="flex-1"
            >
              <CreditCard className="w-4 h-4 mr-2" />
              {isSubscribing
                ? 'Bezig...'
                : planType === 'yearly'
                  ? 'Een jaar lang live voor €89'
                  : 'Ga live voor €1'}
            </Button>
          </div>
        </div>

        {/* Subscription Info */}
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-blue-900 mb-2">
                Eerste maand €1, daarna €7 per maand!
              </h4>
              <p className="text-sm text-blue-700 mb-3">
                Je pagina blijft live en je kunt alle functies gebruiken. Annuleer op elk moment.
              </p>
              <div className="flex flex-wrap gap-2 text-xs text-blue-600">
                <span>✓ Creditcard</span>
                <span>✓ iDEAL</span>
                <span>✓ Automatische verlenging</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </OnboardingLayout>
  );
};
