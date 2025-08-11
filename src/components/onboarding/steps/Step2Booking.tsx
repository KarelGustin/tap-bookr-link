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
}

const bookingProviders = [
  { name: 'Calendly', icon: Calendar, placeholder: 'https://calendly.com/yourusername' },
  { name: 'Salonized', icon: Globe, placeholder: 'https://salonized.com/your-page' },
  { name: 'Treatwell', icon: Globe, placeholder: 'https://treatwell.com/your-business' },
  { name: 'Other', icon: ExternalLink, placeholder: 'https://your-booking-site.com' },
];

export const Step2Booking = ({ onNext, onBack }: Step2BookingProps) => {
  const [bookingUrl, setBookingUrl] = useState('');
  const [embedMode, setEmbedMode] = useState(true);
  const [selectedProvider, setSelectedProvider] = useState<number | null>(null);

  const isValidUrl = (url: string) => {
    try {
      const parsedUrl = new URL(url);
      return parsedUrl.protocol === 'https:';
    } catch {
      return false;
    }
  };

  const handleProviderSelect = (index: number) => {
    setSelectedProvider(index);
    setBookingUrl(bookingProviders[index].placeholder);
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
      title="Add your booking link"
      subtitle="Connect your existing booking system."
      onBack={onBack}
    >
      <div className="space-y-6">
        {/* Provider quick select */}
        <div className="grid grid-cols-2 gap-3">
          {bookingProviders.map((provider, index) => {
            const Icon = provider.icon;
            return (
              <Button
                key={provider.name}
                variant={selectedProvider === index ? "default" : "outline"}
                onClick={() => handleProviderSelect(index)}
                className="h-12 flex items-center gap-2"
              >
                <Icon className="w-4 h-4" />
                {provider.name}
              </Button>
            );
          })}
        </div>

        {/* URL input */}
        <div className="space-y-2">
          <Label htmlFor="bookingUrl" className="text-base font-medium">
            Booking URL
          </Label>
          <Input
            id="bookingUrl"
            type="url"
            placeholder="https://calendly.com/yourusername"
            value={bookingUrl}
            onChange={(e) => setBookingUrl(e.target.value)}
            className="rounded-lg h-12"
          />
          <p className="text-sm text-muted-foreground">
            Must be a secure HTTPS link
          </p>
        </div>

        {/* Embed mode toggle */}
        <div className="space-y-3 p-4 bg-muted/50 rounded-lg">
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
        </div>

        {/* Continue button */}
        <Button 
          onClick={handleSubmit}
          disabled={!canContinue}
          className="w-full h-12 text-base rounded-lg"
          size="lg"
        >
          Continue
        </Button>
        
        <p className="text-center text-sm text-muted-foreground">
          You can change this later in Edit Page.
        </p>
      </div>
    </OnboardingLayout>
  );
};