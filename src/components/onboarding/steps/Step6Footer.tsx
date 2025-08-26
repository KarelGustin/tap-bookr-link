import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Building2, MapPin, Clock, Shield, FileText, Search, Check } from 'lucide-react';
import { OnboardingLayout } from '../OnboardingLayout';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

interface BusinessHours {
  monday: { open: string; close: string; closed: boolean };
  tuesday: { open: string; close: string; closed: boolean };
  wednesday: { open: string; close: string; closed: boolean };
  thursday: { open: string; close: string; closed: boolean };
  friday: { open: string; close: string; closed: boolean };
  saturday: { open: string; close: string; closed: boolean };
  sunday: { open: string; close: string; closed: boolean };
}

interface AddressSuggestion {
  id: string;
  display_name: string;
  lat: number;
  lon: number;
  address: {
    house_number?: string;
    road?: string;
    city?: string;
    state?: string;
    postcode?: string;
    country?: string;
  };
}

interface Step6FooterProps {
  onNext: (data: {
    footerBusinessName?: string;
    footerAddress?: string;
    footerEmail?: string;
    footerPhone?: string;
    footerHours?: BusinessHours;
    footerNextAvailable?: string;
    footerCancellationPolicy?: string;
    footerPrivacyPolicy?: string;
    footerTermsOfService?: string;
    footerShowMaps?: boolean;
    footerShowAttribution?: boolean;
  }) => void;
  onBack: () => void;
  handle?: string;
  existingData: {
    footerBusinessName?: string;
    footerAddress?: string;
    footerEmail?: string;
    footerPhone?: string;
    footerHours?: BusinessHours;
    footerNextAvailable?: string;
    footerCancellationPolicy?: string;
    footerPrivacyPolicy?: string;
    footerTermsOfService?: string;
    footerShowMaps?: boolean;
    footerShowAttribution?: boolean;
  };
}

const defaultHours: BusinessHours = {
  monday: { open: '09:00', close: '17:00', closed: false },
  tuesday: { open: '09:00', close: '17:00', closed: false },
  wednesday: { open: '09:00', close: '17:00', closed: false },
  thursday: { open: '09:00', close: '17:00', closed: false },
  friday: { open: '09:00', close: '17:00', closed: false },
  saturday: { open: '10:00', close: '16:00', closed: false },
  sunday: { open: '10:00', close: '16:00', closed: true },
};

export const Step6Footer = ({ onNext, onBack, existingData, handle }: Step6FooterProps) => {
  const [footerData, setFooterData] = useState({
    footerBusinessName: existingData.footerBusinessName || '',
    footerAddress: existingData.footerAddress || '',
    footerEmail: existingData.footerEmail || '',
    footerPhone: existingData.footerPhone || '',
    footerHours: existingData.footerHours || defaultHours,
    footerNextAvailable: existingData.footerNextAvailable || '',
    footerCancellationPolicy: existingData.footerCancellationPolicy || 'Plannen gewijzigd? Herplan of annuleer 24 uur van tevoren om een vergoeding te voorkomen.',
    footerPrivacyPolicy: existingData.footerPrivacyPolicy || 'We gebruiken je gegevens alleen om je afspraak te beheren. Geen spam.',
    footerTermsOfService: existingData.footerTermsOfService || 'Veilige boeking afgehandeld door toonaangevende boekingsplatforms.',
    footerShowMaps: existingData.footerShowMaps ?? true,
    footerShowAttribution: existingData.footerShowAttribution ?? true,
  });

  // Set initial state based on existing data
  useEffect(() => {
    if (existingData.footerBusinessName) {
      setFooterData(prev => ({ ...prev, footerBusinessName: existingData.footerBusinessName }));
    }
    if (existingData.footerAddress) {
      setFooterData(prev => ({ ...prev, footerAddress: existingData.footerAddress }));
    }
    if (existingData.footerEmail) {
      setFooterData(prev => ({ ...prev, footerEmail: existingData.footerEmail }));
    }
    if (existingData.footerPhone) {
      setFooterData(prev => ({ ...prev, footerPhone: existingData.footerPhone }));
    }
    if (existingData.footerHours) {
      setFooterData(prev => ({ ...prev, footerHours: existingData.footerHours }));
    }
    if (existingData.footerNextAvailable) {
      setFooterData(prev => ({ ...prev, footerNextAvailable: existingData.footerNextAvailable }));
    }
    if (existingData.footerCancellationPolicy) {
      setFooterData(prev => ({ ...prev, footerCancellationPolicy: existingData.footerCancellationPolicy }));
    }
    if (existingData.footerPrivacyPolicy) {
      setFooterData(prev => ({ ...prev, footerPrivacyPolicy: existingData.footerPrivacyPolicy }));
    }
    if (existingData.footerTermsOfService) {
      setFooterData(prev => ({ ...prev, footerTermsOfService: existingData.footerTermsOfService }));
    }
  }, [existingData]);

  // Address validation state
  const [addressSuggestions, setAddressSuggestions] = useState<AddressSuggestion[]>([]);
  const [isAddressSearching, setIsAddressSearching] = useState(false);
  const [isAddressPopoverOpen, setIsAddressPopoverOpen] = useState(false);
  const [addressSearchQuery, setAddressSearchQuery] = useState('');
  const addressSearchTimeoutRef = useRef<NodeJS.Timeout>();

  // Address validation function using OpenStreetMap Nominatim API
  const searchAddress = async (query: string) => {
    if (query.length < 3) {
      setAddressSuggestions([]);
      return;
    }

    try {
      setIsAddressSearching(true);
      
      // Keep existing suggestions visible while searching
      // Only clear if this is a completely new search
      if (query !== addressSearchQuery) {
        setAddressSuggestions([]);
      }
      
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&countrycodes=nl&limit=5&addressdetails=1`
      );
      
      if (response.ok) {
        const data = await response.json();
        setAddressSuggestions(data);
      }
    } catch (error) {
      console.error('Error searching address:', error);
      // Keep existing suggestions on error
    } finally {
      setIsAddressSearching(false);
    }
  };

  // Debounced address search
  useEffect(() => {
    if (addressSearchTimeoutRef.current) {
      clearTimeout(addressSearchTimeoutRef.current);
    }

    if (addressSearchQuery.trim() && addressSearchQuery.length >= 3) {
      addressSearchTimeoutRef.current = setTimeout(() => {
        searchAddress(addressSearchQuery);
      }, 600); // Increased delay for better UX
    } else if (addressSearchQuery.trim().length < 3) {
      // Clear suggestions if query is too short
      setAddressSuggestions([]);
    }

    return () => {
      if (addressSearchTimeoutRef.current) {
        clearTimeout(addressSearchTimeoutRef.current);
      }
    };
  }, [addressSearchQuery]);

  // Keep suggestions visible while typing
  useEffect(() => {
    if (addressSearchQuery.length >= 3 && !isAddressSearching) {
      // Keep existing suggestions visible while user types
      // Only clear if query becomes too short
    }
  }, [addressSearchQuery, isAddressSearching]);

  // Initialize address search query with existing data
  useEffect(() => {
    if (existingData.footerAddress) {
      setAddressSearchQuery(existingData.footerAddress);
    }
  }, [existingData.footerAddress]);

  // Select address suggestion
  const selectAddress = (suggestion: AddressSuggestion) => {
    const address = suggestion.address;
    const formattedAddress = [
      address.house_number && address.road ? `${address.road} ${address.house_number}` : address.road,
      address.postcode && address.city ? `${address.postcode} ${address.city}` : address.city,
      address.state,
      address.country
    ].filter(Boolean).join(', ');
    
    setFooterData(prev => ({ ...prev, footerAddress: formattedAddress }));
    setAddressSearchQuery(formattedAddress);
    setIsAddressPopoverOpen(false);
  };

  // Format address for display
  const formatAddressForDisplay = (suggestion: AddressSuggestion) => {
    const address = suggestion.address;
    return [
      address.house_number && address.road ? `${address.road} ${address.house_number}` : address.road,
      address.postcode && address.city ? `${address.postcode} ${address.city}` : address.city,
      address.state
    ].filter(Boolean).join(', ');
  };

  const updateField = (field: keyof typeof footerData, value: string | boolean | BusinessHours) => {
    setFooterData(prev => ({ ...prev, [field]: value }));
    
    // Synchronize address search query when address field is updated
    if (field === 'footerAddress') {
      // Only update search query if it's different to prevent conflicts
      if (value !== addressSearchQuery) {
        setAddressSearchQuery(value as string);
      }
    }
  };

  const updateHours = (day: keyof BusinessHours, field: 'open' | 'close' | 'closed', value: string | boolean) => {
    setFooterData(prev => ({
      ...prev,
      footerHours: {
        ...prev.footerHours!,
        [day]: {
          ...prev.footerHours![day],
          [field]: value
        }
      }
    }));
  };

  const handleSubmit = () => {
    onNext(footerData);
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    return `${hours}:${minutes}`;
  };

  const getDayLabel = (day: string) => {
    const dayLabels: Record<string, string> = {
      monday: 'Maandag',
      tuesday: 'Dinsdag',
      wednesday: 'Woensdag',
      thursday: 'Donderdag',
      friday: 'Vrijdag',
      saturday: 'Zaterdag',
      sunday: 'Zondag'
    };
    return dayLabels[day] || day.charAt(0).toUpperCase() + day.slice(1);
  };

  const canGoNext = () => {
    // Check if at least one contact method is provided
    const hasContactMethod = footerData.footerEmail || footerData.footerPhone;
    
    // Check if business name is provided
    const hasBusinessName = footerData.footerBusinessName && footerData.footerBusinessName.trim().length > 0;
    
    // Check if address is provided
    const hasAddress = footerData.footerAddress && footerData.footerAddress.trim().length > 0;
    
    // Check if at least one policy is provided
    const hasPolicy = footerData.footerCancellationPolicy || footerData.footerPrivacyPolicy || footerData.footerTermsOfService;
    
    // Check if opening hours are consistent (if not closed, open < close)
    const hasConsistentHours = Object.values(footerData.footerHours || {}).every(day => {
      if (day.closed) return true;
      return day.open && day.close && day.open < day.close;
    });
    
    return hasContactMethod && hasBusinessName && hasAddress && hasPolicy && hasConsistentHours;
  };

  return (
    <OnboardingLayout
      onNext={handleSubmit}
      onBack={onBack}
      currentStep={6}
      totalSteps={7}
      title="Vul Je Bedrijfsprofiel Aan"
      subtitle="Voeg je bedrijfsinformatie en beleid toe om vertrouwen op te bouwen en klanten te voorzien van alles wat ze moeten weten."
      handle={handle}
      canGoNext={canGoNext()}
      canGoBack={true}
    >
      {/* Business Information */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <Building2 className="w-6 h-6 text-primary" />
            <div>
              <CardTitle>Bedrijfsinformatie</CardTitle>
              <CardDescription>
                Help klanten contact met je op te nemen en je bedrijf beter te begrijpen.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="businessName">Bedrijfsnaam</Label>
              <Input
                id="businessName"
                placeholder="Je bedrijfsnaam"
                value={footerData.footerBusinessName}
                onChange={(e) => updateField('footerBusinessName', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="email">E-mailadres</Label>
              <Input
                id="email"
                type="email"
                placeholder="jouw@email.com"
                value={footerData.footerEmail}
                onChange={(e) => updateField('footerEmail', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="phone">Telefoonnummer</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+31 (0) 6 12345678"
                value={footerData.footerPhone}
                onChange={(e) => updateField('footerPhone', e.target.value)}
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="address">Bedrijfsadres</Label>
            <Popover open={isAddressPopoverOpen} onOpenChange={setIsAddressPopoverOpen}>
              <PopoverTrigger asChild>
                <div className="relative">
                  <Input
                    id="address"
                    placeholder="Hoofdstraat 123, Stad, Provincie 1234 AB"
                    value={addressSearchQuery || footerData.footerAddress}
                    onChange={(e) => {
                      const value = e.target.value;
                      setAddressSearchQuery(value);
                      // Don't update footerData immediately to prevent conflicts
                      // Only update the search query for now
                    }}
                    onFocus={() => {
                      // Ensure popover opens and stays open
                      setIsAddressPopoverOpen(true);
                      // Set search query to current address if empty
                      if (!addressSearchQuery && footerData.footerAddress) {
                        setAddressSearchQuery(footerData.footerAddress);
                      }
                    }}
                    onBlur={(e) => {
                      // Small delay to allow clicking on suggestions
                      setTimeout(() => {
                        // Only close if no suggestion was clicked
                        if (!e.relatedTarget || !e.relatedTarget.closest('[data-radix-popper-content-wrapper]')) {
                          setIsAddressPopoverOpen(false);
                        }
                      }, 150);
                    }}
                    className="pr-10"
                  />
                  <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                </div>
              </PopoverTrigger>
              <PopoverContent className="w-[400px] p-0" align="start" onOpenAutoFocus={(e) => e.preventDefault()}>
                <Command>
                  <CommandInput 
                    placeholder="Zoek naar een adres..." 
                    value={addressSearchQuery}
                    onValueChange={(value) => {
                      setAddressSearchQuery(value);
                      // Start search after user stops typing
                      if (value.length >= 3) {
                        searchAddress(value);
                      }
                    }}
                    onFocus={(e) => e.preventDefault()}
                  />
                  <CommandList>
                    {isAddressSearching && (
                      <div className="p-4 text-center text-sm text-muted-foreground">
                        Zoeken naar adressen...
                      </div>
                    )}
                    {!isAddressSearching && addressSuggestions.length === 0 && addressSearchQuery.length >= 3 && (
                      <CommandEmpty>Geen adressen gevonden.</CommandEmpty>
                    )}
                    {!isAddressSearching && addressSuggestions.length === 0 && addressSearchQuery.length < 3 && (
                      <CommandEmpty>Type minimaal 3 karakters om te zoeken.</CommandEmpty>
                    )}
                    <CommandGroup>
                      {addressSuggestions.map((suggestion) => (
                        <CommandItem
                          key={suggestion.id}
                          onSelect={() => selectAddress(suggestion)}
                          className="cursor-pointer"
                        >
                          <div className="flex items-center gap-2 w-full">
                            <MapPin className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <div className="font-medium truncate">
                                {formatAddressForDisplay(suggestion)}
                              </div>
                              {suggestion.address.country && (
                                <div className="text-sm text-muted-foreground truncate">
                                  {suggestion.address.country}
                                </div>
                              )}
                            </div>
                            <Check className="w-4 h-4 text-primary flex-shrink-0" />
                          </div>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
            <p className="text-sm text-muted-foreground mt-1">
              Begin met typen om adressuggesties te zien
            </p>
          </div>
          
          {/* Business Hours with Tabs */}
          <div className="space-y-3">
            <Label>Openingstijden</Label>
            <p className="text-sm text-muted-foreground">
              Stel je wekelijkse schema in zodat klanten weten wanneer je beschikbaar bent
            </p>
            
            <Tabs defaultValue="monday" className="w-full">
              <TabsList className="grid w-full grid-cols-7">
                <TabsTrigger value="monday">Ma</TabsTrigger>
                <TabsTrigger value="tuesday">Di</TabsTrigger>
                <TabsTrigger value="wednesday">Wo</TabsTrigger>
                <TabsTrigger value="thursday">Do</TabsTrigger>
                <TabsTrigger value="friday">Vr</TabsTrigger>
                <TabsTrigger value="saturday">Za</TabsTrigger>
                <TabsTrigger value="sunday">Zo</TabsTrigger>
              </TabsList>
              
              {Object.entries(footerData.footerHours!).map(([day, hours]) => (
                <TabsContent key={day} value={day} className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium">{getDayLabel(day)}</h3>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id={`${day}-closed`}
                        checked={hours.closed}
                        onCheckedChange={(checked) => 
                          updateHours(day as keyof BusinessHours, 'closed', checked as boolean)
                        }
                      />
                      <Label htmlFor={`${day}-closed`}>Gesloten</Label>
                    </div>
                  </div>
                  
                  {!hours.closed && (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor={`${day}-open`}>Openingstijd</Label>
                        <Input
                          id={`${day}-open`}
                          type="time"
                          value={hours.open}
                          onChange={(e) => updateHours(day as keyof BusinessHours, 'open', e.target.value)}
                        />
                        <p className="text-sm text-muted-foreground mt-1">
                          {formatTime(hours.open)}
                        </p>
                      </div>
                      <div>
                        <Label htmlFor={`${day}-close`}>Sluitingstijd</Label>
                        <Input
                          id={`${day}-close`}
                          type="time"
                          value={hours.close}
                          onChange={(e) => updateHours(day as keyof BusinessHours, 'close', e.target.value)}
                        />
                        <p className="text-sm text-muted-foreground mt-1">
                          {formatTime(hours.close)}
                        </p>
                      </div>
                    </div>
                  )}
                  
                  {hours.closed && (
                    <div className="text-center py-8 text-muted-foreground">
                      <Clock className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p>Gesloten op {getDayLabel(day)}</p>
                    </div>
                  )}
                </TabsContent>
              ))}
            </Tabs>
          </div>
        </CardContent>
      </Card>

      {/* Policies */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <Shield className="w-6 h-6 text-primary" />
            <div>
              <CardTitle>Bedrijfsbeleid</CardTitle>
              <CardDescription>
                Stel duidelijke verwachtingen voor je klanten. Dit beleid helpt bij het opbouwen van vertrouwen en voorkomt misverstanden.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="cancellationPolicy">Annuleringsbeleid</Label>
            <Textarea
              id="cancellationPolicy"
              placeholder="Plannen gewijzigd? Herplan of annuleer 24 uur van tevoren om een vergoeding te voorkomen."
              value={footerData.footerCancellationPolicy}
              onChange={(e) => updateField('footerCancellationPolicy', e.target.value)}
              rows={2}
            />
            <p className="text-sm text-gray-500 mt-1">
              Leg je annulerings- en herplanbeleid duidelijk uit.
            </p>
          </div>
          
          <div>
            <Label htmlFor="privacyPolicy">Privacybeleid</Label>
            <Textarea
              id="privacyPolicy"
              placeholder="We gebruiken je gegevens alleen om je afspraak te beheren. Geen spam."
              value={footerData.footerPrivacyPolicy}
              onChange={(e) => updateField('footerPrivacyPolicy', e.target.value)}
              rows={2}
            />
            <p className="text-sm text-gray-500 mt-1">
              Leg uit hoe je klantinformatie en gegevens verwerkt.
            </p>
          </div>
          
          <div>
            <Label htmlFor="termsOfService">Algemene Voorwaarden</Label>
            <Textarea
              id="termsOfService"
              placeholder="Veilige boeking afgehandeld door toonaangevende boekingsplatforms."
              value={footerData.footerTermsOfService}
              onChange={(e) => updateField('footerTermsOfService', e.target.value)}
              rows={2}
            />
            <p className="text-sm text-gray-500 mt-1">
              Leg je algemene voorwaarden voor het gebruik van je diensten uit.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Display Options
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <FileText className="w-6 h-6 text-primary" />
            <div>
              <CardTitle>Display Options</CardTitle>
              <CardDescription>
                Choose what additional information to show on your public page.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="showMaps"
              checked={footerData.footerShowMaps}
              onCheckedChange={(checked) => updateField('footerShowMaps', checked as boolean)}
            />
            <Label htmlFor="showMaps">Show Google Maps with your business location</Label>
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox
              id="showAttribution"
              checked={footerData.footerShowAttribution}
              onCheckedChange={(checked) => updateField('footerShowAttribution', checked as boolean)}
            />
            <Label htmlFor="showAttribution">Show "Powered by TapBookr" attribution</Label>
          </div>
        </CardContent>
      </Card> */}

      {/* Help Text */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="text-center space-y-2">
            <h4 className="font-medium text-blue-900">Waarom dit belangrijk is</h4>
            <p className="text-sm text-blue-800">
              Complete bedrijfsinformatie bouwt vertrouwen op en helpt klanten weloverwogen beslissingen te nemen. 
              Duidelijk beleid voorkomt misverstanden en toont professionaliteit.
            </p>
          </div>
        </CardContent>
      </Card>

    </OnboardingLayout>
  );
};
