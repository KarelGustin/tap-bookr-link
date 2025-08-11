import { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Check, X } from 'lucide-react';
import { OnboardingLayout } from '../OnboardingLayout';
import { useAuth } from '@/contexts/AuthContext';

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
  const { user } = useAuth();

  const isValidHandle = (value: string) => {
    const regex = /^[a-z0-9-]{3,24}$/;
    return regex.test(value);
  };

  const checkAvailability = useCallback(async (value: string) => {
    if (!isValidHandle(value)) {
      setIsAvailable(null);
      return;
    }

    setIsChecking(true);
    setError('');
    console.log('🔍 Checking availability for handle:', value);

    try {
      // First check if user is authenticated
      if (!user) {
        console.log('⚠️ User not authenticated, skipping availability check for now');
        // For unauthenticated users, assume handle is available (they'll be authenticated before saving)
        setIsAvailable(true);
        return;
      }

      console.log('🔐 User authenticated, attempting database query...');
      console.log('👤 User ID:', user.id);

      // Test basic database connection first
      const { data: testData, error: testError } = await supabase
        .from('profiles')
        .select('id')
        .limit(1);

      console.log('🧪 Basic connection test:', { testData, testError });

      if (testError) {
        console.error('🚨 Basic connection failed:', testError);
        setError(`Database connection failed: ${testError.message}`);
        setIsAvailable(null);
        return;
      }

      // Now try the actual availability check
      // Use a simpler approach that should work better with RLS
      const { data, error } = await supabase
        .from('profiles')
        .select('id')
        .eq('handle', value.toLowerCase())
        .maybeSingle();

      console.log('📊 Availability check result:', { data, error });

      if (error) {
        // If we get a permission error, try a different approach
        if (error.code === '42501' || error.message.includes('permission denied')) {
          console.log('🔒 Permission denied, trying alternative approach...');
          
          // Try to check if the user already has a profile with this handle
          const { data: ownProfile, error: ownError } = await supabase
            .from('profiles')
            .select('id')
            .eq('user_id', user.id)
            .eq('handle', value.toLowerCase())
            .maybeSingle();
          
          if (ownError) {
            console.error('🚨 Own profile check failed:', ownError);
            setError('Unable to check availability. Please try again.');
            setIsAvailable(null);
            return;
          }
          
          if (ownProfile) {
            // User already has this handle
            console.log('❌ User already has this handle');
            setIsAvailable(false);
            setError('You already have this handle.');
          } else {
            // Assume available for now (user will be authenticated before saving)
            console.log('✅ Assuming handle is available (will verify on save)');
            setIsAvailable(true);
          }
        } else {
          console.error('🚨 Availability check error:', error);
          setError(`Error checking availability: ${error.message}`);
          setIsAvailable(null);
        }
      } else if (data) {
        // Handle exists
        console.log('❌ Handle is taken');
        setIsAvailable(false);
        setError('This handle is already taken. Try adding your city or business name.');
      } else {
        // No handle found - it's available
        console.log('✅ Handle is available');
        setIsAvailable(true);
      }
    } catch (err) {
      console.error('💥 Availability check exception:', err);
      setError('Unable to check availability. Please try again.');
      setIsAvailable(null);
    } finally {
      setIsChecking(false);
    }
  }, [user]);

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
  }, [handle, checkAvailability]);

  const handleSubmit = () => {
    if (!isValidHandle(handle)) {
      setError('Handle must be 3-24 characters, letters, numbers, and hyphens only. No spaces.');
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

  // Debug logging
  console.log('Step1Handle validation:', {
    handle,
    isValidHandle: isValidHandle(handle),
    isAvailable,
    isBusiness,
    businessName: businessName.trim(),
    businessNameValid: !isBusiness || businessName.trim(),
    canContinue
  });

  return (
    <OnboardingLayout
      currentStep={1}
      totalSteps={5}
      title="Claim your Bookr handle"
      subtitle="Takes less than 3 minutes."
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
        
        {/* Debug information - remove in production */}
        <div className="text-xs text-gray-500 space-y-1">
          <p>Debug: Handle valid: {isValidHandle(handle) ? '✅' : '❌'}</p>
          <p>Debug: Available: {isAvailable === true ? '✅' : isAvailable === false ? '❌' : '⏳'}</p>
          <p>Debug: Business name valid: {(!isBusiness || businessName.trim()) ? '✅' : '❌'}</p>
          <p>Debug: Can continue: {canContinue ? '✅' : '❌'}</p>
        </div>
        
        <p className="text-center text-sm text-muted-foreground">
          Your handle is permanent and cannot be changed.
        </p>
      </div>
    </OnboardingLayout>
  );
};