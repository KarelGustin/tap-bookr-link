import { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { OnboardingLayout } from '../OnboardingLayout';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { Check, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

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
  const { toast } = useToast();
  const [userHandle, setUserHandle] = useState<string>('');
  const [handle, setHandle] = useState(existingData?.handle || '');
  const [useExistingHandle, setUseExistingHandle] = useState(false);
  const [isHandleLocked, setIsHandleLocked] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [handleStatus, setHandleStatus] = useState<HandleStatus>({
    available: false,
    checking: false,
    suggestions: [],
  });

  const handleInputRef = useRef<HTMLInputElement>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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

  // Check for handle from URL parameters (from Hero claim flow)
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const handleFromUrl = urlParams.get('handle');
    if (handleFromUrl) {
      setHandle(handleFromUrl);
      setUseExistingHandle(false); // Force new handle mode when coming from Hero
      console.log('🔧 Handle prefilled from URL:', handleFromUrl);
    }
  }, []);

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
        .rpc('is_handle_available', { 
          handle_to_check: handleToCheck.toLowerCase(),
          user_id_to_exclude: user?.id || null
        });

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

  // Real-time save to database with debouncing
  const saveHandleToDatabase = useCallback(async (handleToSave: string) => {
    if (!user || !existingData?.profileId || handleToSave.length < 3) return;
    
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ handle: handleToSave.toLowerCase() })
        .eq('id', existingData.profileId);
      
      if (error) {
        console.error('❌ Failed to save handle:', error);
        toast({
          title: "Opslaan mislukt",
          description: "Handle kon niet worden opgeslagen. Probeer het opnieuw.",
          variant: "destructive",
        });
      } else {
        console.log('✅ Handle saved to database:', handleToSave);
      }
    } catch (error) {
      console.error('❌ Error saving handle:', error);
    } finally {
      setIsSaving(false);
    }
  }, [user, existingData?.profileId, toast]);

  const handleInputChange = (value: string) => {
    const cleanValue = value.toLowerCase().replace(/[^a-z0-9-]/g, '');
    setHandle(cleanValue);
    
    // Debounced save to database
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    
    if (cleanValue.length >= 3 && !isHandleLocked) {
      saveTimeoutRef.current = setTimeout(() => {
        saveHandleToDatabase(cleanValue);
      }, 1500); // Save after 1.5 seconds of no typing
    }
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

  const handleNext = async () => {
    if (!canGoNext()) return;

    // Cancel any pending auto-save
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    
    // Immediately save handle to database before proceeding
    if (handle.length >= 3 && !isHandleLocked && existingData?.profileId) {
      await saveHandleToDatabase(handle);
      
      // Also update the onboarding step to 2
      try {
        const { error } = await supabase
          .from('profiles')
          .update({ onboarding_step: 2 })
          .eq('id', existingData.profileId);
        
        if (error) {
          console.error('Failed to update onboarding step:', error);
        } else {
          console.log('✅ Updated onboarding step to 2');
        }
      } catch (error) {
        console.error('Error updating onboarding step:', error);
      }
    }

    onNext({
      handle: handle.toLowerCase(),
    });
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  return (
    <OnboardingLayout
      currentStep={1}
      totalSteps={7}
      title="Kies je handle"
      subtitle="Kies een unieke naam voor je TapBookr pagina"
      onBack={onBack}
      onNext={handleNext}
      canGoNext={canGoNext()}
      handle={handle || userHandle}
    >
      <div className="space-y-6">
        {/* Existing handle section */}
        {userHandle && !useExistingHandle && (
          <Card>
            <CardContent className="p-6">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0">
                  <Check className="w-5 h-5 text-green-600 mt-0.5" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-foreground mb-2">
                    Je hebt al een handle: @{userHandle}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Wil je verder gaan met deze handle of een nieuwe kiezen?
                  </p>
                  <div className="flex gap-3">
                    <Button
                      onClick={handleChooseExistingHandle}
                      className="h-12"
                      size="default"
                    >
                      Ja, gebruik mijn bestaande handle
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleChooseNewHandle}
                      className="h-12"
                      size="default"
                    >
                      Nee, ik wil een nieuwe
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Handle input section */}
        <Card>
          <CardContent className="p-6 space-y-6">
            <div className="space-y-2">
              <Label htmlFor="handle" className="text-base font-medium">
                Je handle
              </Label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-muted-foreground text-sm">tapbookr.com/</span>
                </div>
                <Input
                  ref={handleInputRef}
                  id="handle"
                  type="text"
                  value={handle}
                  onChange={(e) => handleInputChange(e.target.value)}
                  placeholder="jouw-naam"
                  className={`pl-36 font-mono h-12 ${isHandleLocked ? 'bg-muted cursor-not-allowed' : ''}`}
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
                    {isSaving && (
                      <>
                        <Loader2 className="w-3 h-3 animate-spin text-gray-400 ml-2" />
                        <span className="text-gray-500 text-xs">Opslaan...</span>
                      </>
                    )}
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
                <div className="mt-4">
                  <p className="text-sm text-muted-foreground mb-2">Suggesties:</p>
                  <div className="flex flex-wrap gap-2">
                    {handleStatus.suggestions.map((suggestion) => (
                      <Button
                        key={suggestion}
                        variant="outline"
                        size="sm"
                        onClick={() => setHandle(suggestion)}
                        className="h-8"
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
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-sm text-amber-700">
                <strong>Belangrijk:</strong> Je kunt je handle wijzigen totdat je pagina wordt gepubliceerd. 
                Na publicatie is de handle definitief.
              </p>
            </div>
          </CardContent>
        </Card>

      </div>
    </OnboardingLayout>
  );
};
