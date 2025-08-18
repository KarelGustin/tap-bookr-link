import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { OnboardingLayout } from '../OnboardingLayout';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { Check, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface Step1HandleProps {
  onNext: (data: { 
    handle: string; 
  }) => void;
  onBack: () => void;
  handle?: string;
  existingData?: {
    handle?: string;
    status?: string;
    profileId?: string;
  };
}

interface HandleStatus {
  available: boolean;
  checking: boolean;
  suggestions: string[];
}

export const Step1Handle = ({ onNext, onBack, existingData, handle: propHandle }: Step1HandleProps) => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [userHandle, setUserHandle] = useState<string>('');
  const [handle, setHandle] = useState(existingData?.handle || '');
  const [useExistingHandle, setUseExistingHandle] = useState(false);
  const [isHandleLocked, setIsHandleLocked] = useState(false);
  const [handleStatus, setHandleStatus] = useState<HandleStatus>({
    available: false,
    checking: false,
    suggestions: [],
  });

  const handleInputRef = useRef<HTMLInputElement>(null);

  // Check handle availability with debouncing
  useEffect(() => {
    if (!handle || handle.length < 3) {
      setHandleStatus(prev => ({ ...prev, available: false, checking: false }));
      return;
    }

    const timeoutId = setTimeout(async () => {
      await checkHandleAvailability(handle);
    }, 600);

    return () => clearTimeout(timeoutId);
  }, [handle]);

  // Load existing user handle from database
  useEffect(() => {
    const fetchUserHandle = async () => {
      if (!existingData?.profileId) return;

      try {
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('handle, status')
          .eq('id', existingData.profileId)
          .single();

        if (error) throw error;

        if (profile?.handle) {
          setUserHandle(profile.handle);
          if (profile.status === 'published') {
            setIsHandleLocked(true);
          }
        }
      } catch (error) {
        console.error('Error fetching user handle:', error);
      }
    };

    fetchUserHandle();
  }, [existingData?.profileId]);

  const checkHandleAvailability = async (handleToCheck: string) => {
    if (handleToCheck === userHandle) {
      setHandleStatus({
        available: true,
        checking: false,
        suggestions: [],
      });
      return;
    }

    setHandleStatus(prev => ({ ...prev, checking: true }));

    try {
      // Use the database function for consistent handle checking
      const { data: isAvailable, error } = await supabase
        .rpc('is_handle_available', { in_handle: handleToCheck.toLowerCase() });

      if (error) {
        console.error('Error checking handle availability:', error);
        setHandleStatus(prev => ({ ...prev, checking: false }));
        return;
      }

      if (isAvailable) {
        setHandleStatus({
          available: true,
          checking: false,
          suggestions: [],
        });
      } else {
        // Check if it's the user's own handle
        const { data: existingProfile, error: profileError } = await supabase
          .from('profiles')
          .select('id, handle, user_id')
          .eq('handle', handleToCheck.toLowerCase())
          .maybeSingle();

        if (!profileError && existingProfile && existingProfile.user_id === user?.id) {
          // Dit is de eigen handle van de gebruiker
          setHandleStatus({
            available: true,
            checking: false,
            suggestions: [],
          });
        } else {
          // Handle is door iemand anders in gebruik, genereer suggesties
          const suggestions = [
            `${handleToCheck}-nl`,
            `${handleToCheck}-amsterdam`,
            `${handleToCheck}-${Math.floor(Math.random() * 999) + 1}`,
          ];

          setHandleStatus({
            available: false,
            checking: false,
            suggestions,
          });
        }
      }
    } catch (error) {
      console.error('Error checking handle availability:', error);
      setHandleStatus(prev => ({ ...prev, checking: false }));
    }
  };

  const handleInputChange = (value: string) => {
    const cleanValue = value.toLowerCase().replace(/[^a-z0-9-]/g, '');
    setHandle(cleanValue);
  };

  const handleChooseExistingHandle = () => {
    setUseExistingHandle(true);
    setHandle(userHandle);
    setIsHandleLocked(true);
  };

  const handleChooseNewHandle = () => {
    setUseExistingHandle(false);
    setIsHandleLocked(false);
    setHandle('');
    setHandleStatus({
      available: false,
      checking: false,
      suggestions: [],
    });
  };

  const canGoNext = () => {
    if (useExistingHandle && userHandle) return true;
    return handle.length >= 3 && handleStatus.available;
  };

  const handleNext = () => {
    if (!canGoNext()) return;

    onNext({
      handle: handle.toLowerCase(),
    });
  };

  return (
    <OnboardingLayout
      currentStep={1}
      totalSteps={8}
      title="Kies je handle"
      subtitle="Kies een unieke naam voor je TapBookr pagina"
      onBack={onBack}
      handle={handle || userHandle}
    >
      <div className="max-w-2xl mx-auto space-y-8 relative">
        {/* Existing handle section */}
        {userHandle && !useExistingHandle && (
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                <Check className="w-5 h-5 text-blue-600 mt-0.5" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-blue-900 mb-2">
                  Je hebt al een handle: @{userHandle}
                </h3>
                <p className="text-sm text-blue-700 mb-3">
                  Wil je verder gaan met deze handle of een nieuwe kiezen?
                </p>
                <div className="flex gap-3">
                  <Button
                    onClick={handleChooseExistingHandle}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Ja, gebruik mijn bestaande handle
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleChooseNewHandle}
                  >
                    Nee, ik wil een nieuwe
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Handle input section */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="handle" className="text-base font-medium">
              Je handle
            </Label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-500 sm:text-sm">tapbookr.com/</span>
              </div>
              <Input
                ref={handleInputRef}
                id="handle"
                type="text"
                value={handle}
                onChange={(e) => handleInputChange(e.target.value)}
                placeholder="jouw-naam"
                className={`pl-36 font-mono ${isHandleLocked ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                disabled={isHandleLocked}
                maxLength={30}
              />
            </div>
            
            {/* Handle status and suggestions */}
            {handle.length >= 3 && (
              <div className="flex items-center gap-2 text-sm">
                {handleStatus.checking ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                    <span className="text-blue-600">Controleren...</span>
                  </>
                ) : handleStatus.available ? (
                  <>
                    <Check className="w-4 h-4 text-green-600" />
                    <span className="text-green-600">Beschikbaar</span>
                  </>
                ) : handleStatus.suggestions.length > 0 ? (
                  <>
                    <AlertCircle className="w-4 h-4 text-red-600" />
                    <span className="text-red-600">Al bezet</span>
                  </>
                ) : null}
              </div>
            )}

            {/* Suggestions */}
            {handleStatus.suggestions.length > 0 && (
              <div className="mt-2">
                <p className="text-sm text-gray-600 mb-2">Suggesties:</p>
                <div className="flex flex-wrap gap-2">
                  {handleStatus.suggestions.map((suggestion) => (
                    <Button
                      key={suggestion}
                      variant="outline"
                      size="sm"
                      onClick={() => setHandle(suggestion)}
                      className="text-xs"
                    >
                      {suggestion}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            <p className="text-sm text-muted-foreground">
              Alleen kleine letters, cijfers en streepjes. Minimaal 3 karakters.
            </p>
          </div>

          {/* Important note */}
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="text-sm text-amber-800">
              <strong>Belangrijk:</strong> Je kunt je handle wijzigen totdat je pagina wordt gepubliceerd. 
              Na publicatie is de handle definitief.
            </p>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-between pt-6">
          <Button variant="outline" onClick={onBack} className="rounded-lg">
            Terug
          </Button>
          <Button 
            onClick={handleNext} 
            disabled={!canGoNext()}
            className="rounded-lg"
          >
            {useExistingHandle && userHandle ? 'Verder gaan met je handle' : 'Claim deze handle'}
          </Button>
        </div>
      </div>
    </OnboardingLayout>
  );
};
