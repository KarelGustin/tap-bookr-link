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
  existingData?: {
    handle?: string;
    businessName?: string;
    isBusiness?: boolean;
  };
}

export const Step1Handle = ({ onNext, existingData }: Step1HandleProps) => {
  const [handle, setHandle] = useState(existingData?.handle || '');
  const [businessName, setBusinessName] = useState(existingData?.businessName || '');
  const [isBusiness, setIsBusiness] = useState(existingData?.isBusiness || false);
  const [isChecking, setIsChecking] = useState(false);
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const [error, setError] = useState('');
  const [isHandleLocked, setIsHandleLocked] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  // If user already has a handle, mark it as locked and available
  useEffect(() => {
    console.log('useEffect triggered with existingData:', existingData);
    if (existingData?.handle && existingData.handle.trim()) {
      setIsHandleLocked(true);
      setIsAvailable(true);
      setHandle(existingData.handle); // Ensure handle is set
      console.log('✅ Handle is locked:', existingData.handle);
    } else {
      console.log('❌ No existing handle found in existingData');
    }
  }, [existingData?.handle]);

  const isValidHandle = (value: string) => {
    const regex = /^[a-z0-9-]{3,24}$/;
    return regex.test(value);
  };

  const checkAvailability = useCallback(async (value: string) => {
    // If handle is already locked, don't check availability
    if (isHandleLocked) {
      console.log('🔒 Handle is locked, skipping availability check');
      return;
    }

    if (!isValidHandle(value)) {
      setIsAvailable(null);
      return;
    }

    // If user already owns this handle, mark it as available
    if (existingData?.handle === value.toLowerCase()) {
      console.log('✅ User already owns this handle - marking as available');
      setIsAvailable(true);
      setError('');
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
        console.error('Error details:', {
          code: testError.code,
          message: testError.message,
          details: testError.details,
          hint: testError.hint
        });
        setError(`Database connection failed: ${testError.message}`);
        setIsAvailable(null);
        return;
      }

      // Now try the actual availability check
      // Use a simpler approach that should work better with RLS
      const { data, error } = await supabase
        .from('profiles')
        .select('id, user_id')
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
            // User already has this handle - this is allowed!
            console.log('✅ User already owns this handle - allowing use');
            setIsAvailable(true);
            setError('');
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
        // Handle exists - check if it's owned by the current user
        if (data.user_id === user.id) {
          // User already owns this handle - this is allowed!
          console.log('✅ User already owns this handle - allowing use');
          setIsAvailable(true);
          setError('');
        } else {
          // Handle is taken by someone else
          console.log('❌ Handle is taken by another user');
          setIsAvailable(false);
          setError('This handle is already taken. Try adding your city or business name.');
        }
      } else {
        // Handle is available
        console.log('✅ Handle is available');
        setIsAvailable(true);
        setError('');
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
      // Don't check availability if handle is locked
      if (isHandleLocked) {
        console.log('🔒 Handle is locked, skipping availability check in useEffect');
        return;
      }
      
      if (handle) {
        checkAvailability(handle);
      } else {
        setIsAvailable(null);
        setError('');
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [handle, checkAvailability, isHandleLocked]);

  const handleSubmit = () => {
    if (!isValidHandle(handle)) {
      setError('Please enter a valid handle.');
      return;
    }

    if (isAvailable === false) {
      setError('This handle is already taken. Please choose another one.');
      return;
    }

    // If user already owns this handle, proceed directly without confirmation
    if (existingData?.handle === handle.toLowerCase()) {
      onNext({ 
        handle: handle.toLowerCase(), 
        businessName: undefined,
        isBusiness: false
      });
      return;
    }

    // Show confirmation step for new handles
    if (!isHandleLocked) {
      setShowConfirmation(true);
      return;
    }

    // If handle is already locked/confirmed, proceed directly
    onNext({ 
      handle: handle.toLowerCase(), 
      businessName: undefined,
      isBusiness: false
    });
  };

  const confirmHandle = () => {
    // Lock the handle and proceed
    setIsHandleLocked(true);
    setShowConfirmation(false);
    onNext({ 
      handle: handle.toLowerCase(), 
      businessName: undefined,
      isBusiness: false
    });
  };

  const cancelConfirmation = () => {
    setShowConfirmation(false);
  };

  const canContinue = isValidHandle(handle) && 
    (isAvailable === true || (isAvailable === null && !isChecking)) && 
    !isHandleLocked;

  // Allow continue if handle is valid and we're not actively checking
  // The availability will be verified again when saving the profile
  const canContinueWithFallback = isValidHandle(handle) && 
    !isChecking && 
    (isHandleLocked || isAvailable === true || isAvailable === null);

  // Debug logging
  useEffect(() => {
    console.log('Button state debug:', {
      showConfirmation,
      canContinueWithFallback,
      buttonDisabled: !canContinueWithFallback,
      isHandleLocked,
      isAvailable,
      isChecking,
      handle,
      existingData
    });
  }, [showConfirmation, canContinueWithFallback, isHandleLocked, isAvailable, isChecking, handle, existingData]);

  return (
    <OnboardingLayout
      currentStep={1}
      totalSteps={5}
      title={isHandleLocked ? "Your Bookr handle" : "Claim your Bookr handle"}
      subtitle={isHandleLocked ? "Your handle is already claimed and locked." : "Takes less than 3 minutes."}
    >
      <div className="space-y-6">
        {/* Handle input */}
        <div className="space-y-2">
          <Label htmlFor="handle" className="text-base font-medium">
            Your unique Business Website link (This will be your link in bio, the website your customers will visit.)
            {isHandleLocked && (
              <span className="ml-2 text-sm text-muted-foreground">
                (Already claimed)
              </span>
            )}
          </Label>
          <div className="relative">
            <div className={`flex rounded-lg border ${isHandleLocked ? 'border-green-200 bg-green-50' : 'border-input bg-background'}`}>
              <div className="flex items-center px-3 text-muted-foreground bg-muted/50 rounded-l-lg border-r">
                tapBookr.com/
              </div>
              <Input
                id="handle"
                placeholder={isHandleLocked ? handle : "yourbusiness"}
                value={handle}
                onChange={(e) => !isHandleLocked && setHandle(e.target.value.toLowerCase())}
                className={`border-0 rounded-l-none focus-visible:ring-0 pl-1 ${isHandleLocked ? 'bg-transparent cursor-not-allowed' : ''}`}
                readOnly={isHandleLocked}
                disabled={isHandleLocked}
              />
              {handle && (
                <div className="flex items-center px-3">
                  {isHandleLocked ? (
                    <Check className="w-4 h-4 text-green-600" />
                  ) : isChecking ? (
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
          {isHandleLocked ? (
            <p className="text-sm text-green-600">
              ✅ Your handle "{handle}" is locked and cannot be changed
            </p>
          ) : (
            <p className="text-sm text-muted-foreground">
              a–z, 0–9, hyphen, 3–24 characters
            </p>
          )}
          {error && (
            <p className="text-sm text-red-600">{error}</p>
          )}
        </div>

        {/* Mobile Preview */}
        {handle && isValidHandle(handle) && (
          <div className="space-y-3">
            <Label className="text-base font-medium">
              Preview of your public page
            </Label>
            <div className="border rounded-lg overflow-hidden bg-white">
              <div className="bg-gray-100 p-3 border-b">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  </div>
                  <div className="text-xs text-gray-600">tapBookr.com/{handle}</div>
                </div>
              </div>
              <div className="p-4 space-y-4">
                <div className="text-center space-y-2">
                  <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto"></div>
                  <h1 className="text-lg font-semibold">Your Business Name</h1>
                  <p className="text-sm text-gray-600">Your business slogan or description</p>
                </div>
                <div className="space-y-2">
                  <div className="h-10 bg-gray-200 rounded"></div>
                  <div className="h-10 bg-gray-200 rounded"></div>
                </div>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              This is how your public page will look to visitors
            </p>
          </div>
        )}

        {/* Handle confirmation */}
        {showConfirmation && (
          <div className="p-4 border border-yellow-200 bg-yellow-50 rounded-lg">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <div className="w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center">
                  <span className="text-yellow-800 text-sm font-bold">!</span>
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-medium text-yellow-800">
                  Confirm your handle
                </h3>
                <p className="mt-1 text-sm text-yellow-700">
                  You're about to claim <strong>tapBookr.com/{handle}</strong>. 
                  This handle will be permanent and cannot be changed later.
                </p>
                <div className="mt-3 flex space-x-3">
                  <Button
                    onClick={confirmHandle}
                    className="bg-yellow-600 hover:bg-yellow-700 text-white"
                    size="sm"
                  >
                    Yes, claim this handle
                  </Button>
                  <Button
                    onClick={cancelConfirmation}
                    variant="outline"
                    size="sm"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Continue button */}
        {!showConfirmation && (
          <Button 
            onClick={handleSubmit}
            disabled={!canContinueWithFallback}
            className="w-full h-12 text-base rounded-lg"
            size="lg"
          >
            {isHandleLocked ? 'Continue with existing handle' : 'Continue'}
          </Button>
        )}
        

        
        <p className="text-center text-sm text-muted-foreground">
          {isHandleLocked 
            ? "Your handle is locked and cannot be changed." 
            : "Your handle will be permanent and cannot be changed once claimed."
          }
        </p>
      </div>
    </OnboardingLayout>
  );
};