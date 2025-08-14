import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Star, MapPin, Clock, Phone, Mail, Building2 } from 'lucide-react';
import { OnboardingLayout } from '../OnboardingLayout';

interface Step7PreviewProps {
  onPublish: () => void;
  onSaveDraft: () => void;
  onBack: () => void;
  handle?: string;
  profileData: {
    handle: string;
    name?: string;
    slogan?: string;
    category?: string;
    avatar_url?: string;
    banner: {
      type?: 'image';
      imageUrl?: string;
      heading?: string;
      subheading?: string;
      textColor?: string;
    } | undefined;
    aboutTitle?: string;
    aboutDescription?: string;
    aboutAlignment?: 'center' | 'left';
    socials: Record<string, string>;
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
    };
    bookingUrl: string;
    bookingMode: 'embed' | 'new_tab';
  };
  canPublish: boolean;
  isPublishing: boolean;
}

// Preview Countdown Component
const PreviewCountdown = () => {
  const [timeLeft, setTimeLeft] = useState(15 * 60); // 15 minutes in seconds

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  if (timeLeft === 0) {
    return <span className="text-red-600">Voorvertoning verlopen</span>;
  }

  return (
    <span>
      {minutes}:{seconds.toString().padStart(2, '0')} resterend
    </span>
  );
};

export const Step7Preview = ({ 
  onPublish, 
  onSaveDraft, 
  onBack, 
  profileData,
  canPublish,
  isPublishing,
  handle 
}: Step7PreviewProps) => {
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [activeTab, setActiveTab] = useState<'preview' | 'summary'>('preview');
  const [previewKey, setPreviewKey] = useState(0);

  // Set initial state based on existing data
  useEffect(() => {
    // Reset preview when profile data changes
    setPreviewKey(prev => prev + 1);
  }, [profileData]);

  const renderPreview = () => (
    <div className="space-y-6">
      {/* Live Iframe Preview */}
      <Card>
        <CardHeader>
          <CardTitle className="text-center">Live Voorvertoning van Je Pagina</CardTitle>
          <CardDescription className="text-center">
            Dit is precies hoe je klanten je pagina zullen zien op tapbookr.com/{profileData.handle}
          </CardDescription>
          {/* <p className="text-xs text-center text-green-600 mt-2">
            🟢 Live iframe - je pagina is tijdelijk gepubliceerd voor testen!
          </p> */}
          
          {/* Preview Mode Countdown */}
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-blue-900">Voorvertoningsmodus Actief</span>
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              </div>
              <p className="text-xs text-blue-700 mb-2">
                Je pagina is live voor testen! De iframe hieronder toont je echte, gepubliceerde pagina.
              </p>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 rounded-full">
                <Clock className="w-3 h-3 text-blue-600" />
                <span className="text-xs font-medium text-blue-800">
                  <PreviewCountdown />
                </span>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="relative w-full max-w-md mx-auto">
            {/* iPhone Mockup */}
            <div className="relative mx-auto w-[320px] h-[640px] bg-black rounded-[3rem] p-2 shadow-2xl">
              <div className="w-full h-full bg-white rounded-[2.5rem] overflow-hidden">
                {/* Status Bar */}
                <div className="h-6 bg-black rounded-t-[2.5rem] flex items-center justify-between px-6 text-white text-xs">
                  <span>9:41</span>
                  <div className="flex items-center gap-1">
                    <div className="w-1 h-3 bg-white rounded-full"></div>
                    <div className="w-1 h-3 bg-white rounded-full"></div>
                    <div className="w-1 h-3 bg-white rounded-full"></div>
                  </div>
                </div>
                
                {/* Iframe Content */}
                <div className="relative w-full h-[calc(100%-24px)]">
                  <iframe
                    src={`https://tapbookr.com/${profileData.handle}`}
                    className="w-full h-full border-0"
                    title="Pagina Voorvertoning"
                    sandbox="allow-scripts allow-same-origin allow-forms"
                    style={{
                      transform: "scale(1)",
                      transformOrigin: "top left",
                      width: "100%",
                      height: "100%"
                    }}
                  />
                  
                  {/* Overlay to prevent clicks but allow scrolling */}
                  <div 
                    className="absolute inset-0 pointer-events-none z-10"
                    style={{ pointerEvents: "none" }}
                  ></div>
                </div>
              </div>
            </div>
            
            {/* Preview Label */}
            {/* <div className="text-center mt-4 space-y-2">
              <p className="text-sm text-gray-600">
                Voorvertoning: {profileData.handle}
              </p>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-100 rounded-full">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-xs text-green-700 font-medium">Live Pagina</span>
              </div>
              <p className="text-xs text-green-600">
                Deze iframe toont je echte, gepubliceerde pagina die klanten kunnen bezoeken
              </p>
            </div> */}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderSummary = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Pagina Samenvatting</CardTitle>
          <CardDescription>Dit is wat je pagina zal bevatten:</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4">
            <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <div>
                <p className="font-medium text-green-900">Banner Sectie</p>
                <p className="text-sm text-green-700">
                  Aangepaste banner afbeelding
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <div>
                <p className="font-medium text-green-900">Bedrijfsinformatie</p>
                <p className="text-sm text-green-700">
                  {profileData.name || profileData.banner?.heading || 'Bedrijfsnaam'} • {profileData.category || 'Categorie'}
                </p>
              </div>
            </div>
            
            {profileData.aboutTitle || profileData.aboutDescription ? (
              <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <div>
                  <p className="font-medium text-green-900">Over Sectie</p>
                  <p className="text-sm text-green-700">
                    {profileData.aboutTitle ? 'Aangepaste titel' : 'Geen titel'} • {profileData.aboutDescription ? 'Aangepaste beschrijving' : 'Geen beschrijving'}
                  </p>
                </div>
              </div>
            ) : null}
            
            {profileData.testimonials && profileData.testimonials.length > 0 ? (
              <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <div>
                  <p className="font-medium text-green-900">Aanbevelingen</p>
                  <p className="text-sm text-green-700">
                    {profileData.testimonials.length} klantbeoordelingen
                  </p>
                </div>
              </div>
            ) : null}
            
            {profileData.socialLinks && profileData.socialLinks.length > 0 ? (
              <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <div>
                  <p className="font-medium text-green-900">Sociale Links</p>
                  <p className="text-sm text-green-700">
                    {profileData.socialLinks.length} sociale media platforms
                  </p>
                </div>
              </div>
            ) : null}
            
            {profileData.footer?.businessName || profileData.footer?.address ? (
              <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <div>
                  <p className="font-medium text-green-900">Footer Informatie</p>
                  <p className="text-sm text-green-700">
                    Bedrijfsdetails, beleid en contactinformatie
                  </p>
                </div>
              </div>
            ) : null}
            
            <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <div>
                <p className="font-medium text-green-900">Boekingsintegratie</p>
                <p className="text-sm text-green-700">
                  {profileData.bookingMode === 'embed' ? 'Ingebed boekingsformulier' : 'Nieuwe tab boeking'}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <OnboardingLayout
      currentStep={7}
      totalSteps={7}
      onNext={onPublish}
      onBack={onBack}
      canGoNext={canPublish}
      isLastStep={true}
      handle={profileData.handle}
    >
      <div className="max-w-6xl mx-auto p-6 space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold text-gray-900">Voorvertoning van Je Pagina</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Dit is hoe je klanten je pagina zullen zien. Bekijk alles en zorg ervoor dat het er perfect uitziet!
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
              Pagina Voorvertoning
            </button>
            <button
              onClick={() => setActiveTab('summary')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'summary'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Pagina Samenvatting
            </button>
          </div>
        </div>

        {/* Content */}
        {activeTab === 'preview' ? renderPreview() : renderSummary()}
        
        {/* Edit Info */}
        <div className="text-center">
          <p className="text-sm text-gray-500">
            Je kunt de pagina op elk moment bewerken
          </p>
        </div>

        {/* Save Draft Option */}
        <div className="text-center">
          <Button variant="ghost" onClick={onSaveDraft}>
            Opslaan als Concept
          </Button>
          {/* <p className="text-sm text-gray-500 mt-2">
            Je kunt altijd terugkomen en later afmaken
          </p> */}
        </div>
      </div>
    </OnboardingLayout>
  );
};
