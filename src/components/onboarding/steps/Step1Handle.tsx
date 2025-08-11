import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Check, X } from 'lucide-react';
import { OnboardingLayout } from '../OnboardingLayout';

interface Step1HandleProps {
  onNext: (data: { handle: string; businessName?: string; isBusiness: boolean }) => void;
}

export const Step1Handle = ({ onNext }: Step1HandleProps) => {
  const [handle, setHandle] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [isBusiness, setIsBusiness] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const [error, setError] = useState('');
  const { toast } = useToast();

  const isValidHandle = (value: string) => {
    const regex = /^[a-z0-9-]{3,24}$/;
    return regex.test(value);
  };

  const checkAvailability = async (value: string) => {
    if (!isValidHandle(value)) {
      setIsAvailable(null);
      return;
    }

    setIsChecking(true);
    setError('');

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('handle')
        .eq('handle', value.toLowerCase())
        .single();

      if (error && error.code === 'PGRST116') {
        // No rows returned, handle is available
        setIsAvailable(true);
      } else if (data) {
        // Handle exists
        setIsAvailable(false);
        setError('This handle is already taken. Try adding your city or business name.');
      }
    } catch (err) {
      setError('Unable to check availability. Please try again.');
      setIsAvailable(null);
    } finally {
      setIsChecking(false);
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (handle) {
        checkAvailability(handle);
      } else {
        setIsAvailable(null);
        setError('');
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [handle]);

  const handleSubmit = () => {
    if (!isValidHandle(handle)) {
      setError('Handle must be 3-24 characters, letters, numbers, and hyphens only.');
      return;
    }

    if (!isAvailable) {
      setError('Please choose an available handle.');
      return;
    }

    if (isBusiness && !businessName.trim()) {
      setError('Business name is required.');
      return;
    }

    onNext({ 
      handle: handle.toLowerCase(), 
      businessName: isBusiness ? businessName : undefined,
      isBusiness 
    });
  };

  const canContinue = isValidHandle(handle) && isAvailable && (!isBusiness || businessName.trim());

  return (
    <OnboardingLayout
      currentStep={1}
      totalSteps={5}
      title="Claim your Bookr handle"
      subtitle="Takes under 3 minutes."
    >
      <div className="space-y-6">
        {/* Handle input */}
        <div className="space-y-2">
          <Label htmlFor="handle" className="text-base font-medium">
            Your unique link
          </Label>
          <div className="relative">
            <div className="flex rounded-lg border border-input bg-background">
              <div className="flex items-center px-3 text-muted-foreground bg-muted/50 rounded-l-lg border-r">
                tapBookr.com/
              </div>
              <Input
                id="handle"
                placeholder="yourbusiness"
                value={handle}
                onChange={(e) => setHandle(e.target.value.toLowerCase())}
                className="border-0 rounded-l-none focus-visible:ring-0 pl-1"
              />
              {handle && (
                <div className="flex items-center px-3">
                  {isChecking ? (
                    <div className="w-4 h-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                  ) : isAvailable === true ? (
                    <Check className="w-4 h-4 text-green-600" />
                  ) : isAvailable === false ? (
                    <X className="w-4 h-4 text-red-600" />
                  ) : null}
                </div>
              )}
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            a–z, 0–9, hyphen, 3–24 characters
          </p>
          {error && (
            <p className="text-sm text-red-600">{error}</p>
          )}
        </div>

        {/* Business toggle */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Switch
              id="business"
              checked={isBusiness}
              onCheckedChange={setIsBusiness}
            />
            <Label htmlFor="business" className="text-base">
              I run a business
            </Label>
          </div>

          {isBusiness && (
            <div className="space-y-2">
              <Label htmlFor="businessName" className="text-base font-medium">
                Business name
              </Label>
              <Input
                id="businessName"
                placeholder="Glow Brow Studio"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                className="rounded-lg"
              />
            </div>
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
          Your handle is permanent and cannot be changed.
        </p>
      </div>
    </OnboardingLayout>
  );
};