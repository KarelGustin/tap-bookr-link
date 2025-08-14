import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { OnboardingLayout } from '../OnboardingLayout';
import { Calendar, Globe, ExternalLink } from 'lucide-react';

interface Step2BookingProps {
  onNext: (data: { 
    bookingUrl?: string; 
    bookingMode?: 'embed' | 'new_tab';
    useWhatsApp?: boolean;
    whatsappNumber?: string;
  }) => void;
  onBack: () => void;
  handle?: string;
  existingData?: {
    bookingUrl?: string;
    bookingMode?: 'embed' | 'new_tab';
    useWhatsApp?: boolean;
    whatsappNumber?: string;
  };
}


export const Step2Booking = ({ onNext, onBack, existingData, handle }: Step2BookingProps) => {
  const [bookingUrl, setBookingUrl] = useState(existingData?.bookingUrl || '');
  const [embedMode, setEmbedMode] = useState(existingData?.bookingMode === 'new_tab' ? false : true);
  const [useWhatsApp, setUseWhatsApp] = useState(existingData?.useWhatsApp || false);
  const [whatsappNumber, setWhatsappNumber] = useState(existingData?.whatsappNumber || '');

  // Set initial state based on existing data
  useEffect(() => {
    if (existingData?.useWhatsApp) {
      setUseWhatsApp(true);
    } else if (existingData?.bookingUrl) {
      setUseWhatsApp(false);
      setBookingUrl(existingData.bookingUrl);
      setEmbedMode(existingData.bookingMode === 'embed');
    }
  }, [existingData]);

  const isValidUrl = (url: string) => {
    try {
      const parsedUrl = new URL(url);
      return parsedUrl.protocol === 'https:';
    } catch {
      return false;
    }
  };


  const handleSubmit = () => {
    if (useWhatsApp) {
      if (!whatsappNumber.trim()) {
        return;
      }
      onNext({ 
        useWhatsApp: true,
        whatsappNumber: whatsappNumber.trim()
      });
    } else {
      if (!isValidUrl(bookingUrl)) {
        return;
      }
      onNext({ 
        bookingUrl, 
        bookingMode: embedMode ? 'embed' : 'new_tab',
        useWhatsApp: false
      });
    }
  };

  const canContinue = useWhatsApp ? whatsappNumber.trim().length > 0 : isValidUrl(bookingUrl);

  return (
    <OnboardingLayout
      currentStep={2}
      totalSteps={5}
      title={existingData?.bookingUrl ? "Je boekingslink" : "Voeg je boekingslink toe"}
      subtitle={existingData?.bookingUrl ? "Je boekingslink is al verbonden." : "Verbind je bestaande boekingssysteem."}
      onBack={onBack}
      handle={handle}
    >
      <div className="space-y-6">

        {/* Booking Method Selection */}
        <div className="space-y-4">
          <Label className="text-base font-medium">Hoe wil je dat klanten boeken?</Label>
          
          <div className="grid gap-3">
            <button
              type="button"
              onClick={() => setUseWhatsApp(false)}
              className={`p-4 border-2 rounded-lg text-left transition-all ${
                !useWhatsApp 
                  ? 'border-primary bg-primary/5' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-5 h-5 rounded-full border-2 ${
                  !useWhatsApp ? 'border-primary bg-primary' : 'border-gray-300'
                }`}>
                  {!useWhatsApp && <div className="w-2 h-2 bg-white rounded-full m-auto" />}
                </div>
                <div>
                  <div className="font-medium">Gebruik een boekingssysteem</div>
                  <div className="text-sm text-muted-foreground">
                    Verbind Salonized, Calendly, Acuity of andere boekingsplatforms
                  </div>
                </div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setUseWhatsApp(true)}
              className={`p-4 border-2 rounded-lg text-left transition-all ${
                useWhatsApp 
                  ? 'border-primary bg-primary/5' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-5 h-5 rounded-full border-2 ${
                  useWhatsApp ? 'border-primary bg-primary' : 'border-gray-300'
                }`}>
                  {useWhatsApp && <div className="w-2 h-2 bg-white rounded-full m-auto" />}
                </div>
                <div>
                  <div className="font-medium">Gebruik WhatsApp</div>
                  <div className="text-sm text-muted-foreground">
                    Klanten nemen rechtstreeks contact op via WhatsApp
                  </div>
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* URL input - only show if not using WhatsApp */}
        {!useWhatsApp && (
          <div className="space-y-2">
            <Label htmlFor="bookingUrl" className="text-base font-medium">
              Boekings-URL
              {existingData?.bookingUrl && (
                <span className="ml-2 text-sm text-muted-foreground">
                  (Al opgeslagen)
                </span>
              )}
            </Label>
            <Input
              id="bookingUrl"
              type="url"
              placeholder="https://calendly.com/jegebruikersnaam"
              value={bookingUrl}
              onChange={(e) => setBookingUrl(e.target.value)}
              className="rounded-lg h-12"
            />
            {existingData?.bookingUrl ? (
              <p className="text-sm text-green-600">
                ✅ Je boekings-URL is opgeslagen. Je kunt deze bijwerken indien nodig.
              </p>
            ) : (
              <p className="text-sm text-muted-foreground">
                Moet een beveiligde HTTPS-link zijn
              </p>
            )}
          </div>
        )}

        {/* WhatsApp input - only show if using WhatsApp */}
        {useWhatsApp && (
          <div className="space-y-2">
            <Label htmlFor="whatsappNumber" className="text-base font-medium">
              WhatsApp Nummer
            </Label>
            <Input
              id="whatsappNumber"
              type="tel"
              placeholder="+31 (0) 6 12345678"
              value={whatsappNumber}
              onChange={(e) => setWhatsappNumber(e.target.value)}
              className="rounded-lg h-12"
            />
            <p className="text-sm text-muted-foreground">
              Klanten kunnen rechtstreeks contact met je opnemen via WhatsApp
            </p>
          </div>
        )}

        {/* Embed mode toggle */}
        {/* <div className="space-y-3 p-4 bg-muted/50 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="embedMode" className="text-base font-medium">
                Embed inside my Bookr page
              </Label>
              <p className="text-sm text-muted-foreground">
                Visitors book without leaving your page
              </p>
            </div>
            <Switch
              id="embedMode"
              checked={embedMode}
              onCheckedChange={setEmbedMode}
            />
          </div>
          
          {!embedMode && (
            <p className="text-sm text-muted-foreground">
              Will open booking link in a new tab
            </p>
          )}
        </div> */}

        {/* Iframe Preview - only show if not using WhatsApp */}
        {!useWhatsApp && bookingUrl && isValidUrl(bookingUrl) && (
          <div className="space-y-3">
            <Label className="text-base font-medium">
              Voorvertoning van je boekingspagina
            </Label>
            <p className="text-sm text-muted-foreground">
              Zie hoe je boekingssoftware eruit zal zien op je publieke pagina
            </p>
            <div className="border rounded-lg overflow-hidden bg-white">
              {embedMode ? (
                <div className="relative">
                  <iframe
                    src={bookingUrl}
                    className="w-full h-96 border-0"
                    title="Boekingsvoorvertoning"
                    sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
                  />
                  <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                    Ingebedde Modus
                  </div>
                </div>
              ) : (
                <div className="h-96 bg-muted/50 flex items-center justify-center">
                  <div className="text-center space-y-2">
                    <ExternalLink className="w-12 h-12 text-muted-foreground mx-auto" />
                    <p className="text-muted-foreground">
                      Opent in nieuwe tab: {bookingUrl}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Nieuwe Tab Modus
                    </p>
                  </div>
                </div>
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              {embedMode 
                ? "Dit is hoe je boekingsformulier eruit zal zien op je publieke pagina."
                : "Bezoekers worden doorgestuurd naar je boekingspagina in een nieuwe tab."
              }
            </p>
            {embedMode && (
              <p className="text-xs text-muted-foreground bg-blue-50 p-2 rounded">
                💡 Tip: Als de iframe niet goed laadt, kan dit komen door de beveiligingsinstellingen van het boekingsplatform. 
                Het formulier zal nog steeds correct werken op je live pagina.
              </p>
            )}
          </div>
        )}

        {/* Continue button */}
        <Button 
          onClick={handleSubmit}
          disabled={!canContinue}
          className="w-full h-12 text-base rounded-lg"
          size="lg"
        >
          {existingData?.bookingUrl ? 'Doorgaan met opgeslagen boekingslink' : 'Doorgaan'}
        </Button>
        
        <p className="text-center text-sm text-muted-foreground">
          Je kunt dit later wijzigen in Pagina Bewerken.
        </p>
      </div>
    </OnboardingLayout>
  );
};