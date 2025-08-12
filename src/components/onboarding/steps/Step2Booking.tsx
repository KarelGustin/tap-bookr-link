import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { OnboardingLayout } from '../OnboardingLayout';
import { Calendar, Globe, ExternalLink } from 'lucide-react';

interface Step2BookingProps {
  onNext: (data: { bookingUrl: string; bookingMode: 'embed' | 'new_tab' }) => void;
  onBack: () => void;
  existingData?: {
    bookingUrl?: string;
    bookingMode?: 'embed' | 'new_tab';
  };
}


export const Step2Booking = ({ onNext, onBack, existingData }: Step2BookingProps) => {
  const [bookingUrl, setBookingUrl] = useState(existingData?.bookingUrl || '');
  const [embedMode, setEmbedMode] = useState(existingData?.bookingMode === 'new_tab' ? false : true);
  const [selectedProvider, setSelectedProvider] = useState<number | null>(null);

  const isValidUrl = (url: string) => {
    try {
      const parsedUrl = new URL(url);
      return parsedUrl.protocol === 'https:';
    } catch {
      return false;
    }
  };


  const handleSubmit = () => {
    if (!isValidUrl(bookingUrl)) {
      return;
    }

    onNext({ 
      bookingUrl, 
      bookingMode: embedMode ? 'embed' : 'new_tab' 
    });
  };

  const canContinue = isValidUrl(bookingUrl);

  return (
    <OnboardingLayout
      currentStep={2}
      totalSteps={5}
      title={existingData?.bookingUrl ? "Your booking link" : "Add your booking link"}
      subtitle={existingData?.bookingUrl ? "Your booking link is already connected." : "Connect your existing booking system."}
      onBack={onBack}
    >
      <div className="space-y-6">

        {/* URL input */}
        <div className="space-y-2">
          <Label htmlFor="bookingUrl" className="text-base font-medium">
            Booking URL
            {existingData?.bookingUrl && (
              <span className="ml-2 text-sm text-muted-foreground">
                (Already saved)
              </span>
            )}
          </Label>
          <Input
            id="bookingUrl"
            type="url"
            placeholder="https://calendly.com/yourusername"
            value={bookingUrl}
            onChange={(e) => setBookingUrl(e.target.value)}
            className="rounded-lg h-12"
          />
          {existingData?.bookingUrl ? (
            <p className="text-sm text-green-600">
              ✅ Your booking URL is saved. You can update it if needed.
            </p>
          ) : (
            <p className="text-sm text-muted-foreground">
              Must be a secure HTTPS link
            </p>
          )}
        </div>

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

        {/* Iframe Preview */}
        {bookingUrl && isValidUrl(bookingUrl) && (
          <div className="space-y-3">
            <Label className="text-base font-medium">
              Preview of your booking page
            </Label>
            <p className="text-sm text-muted-foreground">
              See how your booking software will appear on your public page
            </p>
            <div className="border rounded-lg overflow-hidden bg-white">
              {embedMode ? (
                <div className="relative">
                  <iframe
                    src={bookingUrl}
                    className="w-full h-96 border-0"
                    title="Booking preview"
                    sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
                  />
                  <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                    Embedded Mode
                  </div>
                </div>
              ) : (
                <div className="h-96 bg-muted/50 flex items-center justify-center">
                  <div className="text-center space-y-2">
                    <ExternalLink className="w-12 h-12 text-muted-foreground mx-auto" />
                    <p className="text-muted-foreground">
                      Will open in new tab: {bookingUrl}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      New Tab Mode
                    </p>
                  </div>
                </div>
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              {embedMode 
                ? "This is how your booking form will appear on your public page."
                : "Visitors will be redirected to your booking page in a new tab."
              }
            </p>
            {embedMode && (
              <p className="text-xs text-muted-foreground bg-blue-50 p-2 rounded">
                💡 Tip: If the iframe doesn't load properly, it may be due to the booking platform's security settings. 
                The form will still work correctly on your live page.
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
          {existingData?.bookingUrl ? 'Continue with saved booking link' : 'Continue'}
        </Button>
        
        <p className="text-center text-sm text-muted-foreground">
          You can change this later in Edit Page.
        </p>
      </div>
    </OnboardingLayout>
  );
};