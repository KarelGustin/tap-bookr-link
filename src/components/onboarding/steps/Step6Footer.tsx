import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Building2, MapPin, Clock, Shield, FileText } from 'lucide-react';

interface BusinessHours {
  monday: { open: string; close: string; closed: boolean };
  tuesday: { open: string; close: string; closed: boolean };
  wednesday: { open: string; close: string; closed: boolean };
  thursday: { open: string; close: string; closed: boolean };
  friday: { open: string; close: string; closed: boolean };
  saturday: { open: string; close: string; closed: boolean };
  sunday: { open: string; close: string; closed: boolean };
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

export const Step6Footer = ({ onNext, onBack, existingData }: Step6FooterProps) => {
  const [footerData, setFooterData] = useState({
    footerBusinessName: existingData.footerBusinessName || '',
    footerAddress: existingData.footerAddress || '',
    footerEmail: existingData.footerEmail || '',
    footerPhone: existingData.footerPhone || '',
    footerHours: existingData.footerHours || defaultHours,
    footerNextAvailable: existingData.footerNextAvailable || '',
    footerCancellationPolicy: existingData.footerCancellationPolicy || 'Plans changed? Reschedule or cancel 24h in advance to avoid a fee.',
    footerPrivacyPolicy: existingData.footerPrivacyPolicy || 'We only use your details to manage your appointment. No spam.',
    footerTermsOfService: existingData.footerTermsOfService || 'Secure booking handled by top booking platforms.',
    footerShowMaps: existingData.footerShowMaps ?? true,
    footerShowAttribution: existingData.footerShowAttribution ?? true,
  });

  const updateField = (field: keyof typeof footerData, value: string | boolean | BusinessHours) => {
    setFooterData(prev => ({ ...prev, [field]: value }));
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
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const getDayLabel = (day: string) => {
    return day.charAt(0).toUpperCase() + day.slice(1);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold text-gray-900">Complete Your Business Profile</h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Add your business information and policies to build trust and provide customers with everything they need to know.
        </p>
      </div>

      {/* Business Information */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <Building2 className="w-6 h-6 text-primary" />
            <div>
              <CardTitle>Business Information</CardTitle>
              <CardDescription>
                Help customers contact you and understand your business better.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="businessName">Business Name</Label>
              <Input
                id="businessName"
                placeholder="Your business name"
                value={footerData.footerBusinessName}
                onChange={(e) => updateField('footerBusinessName', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={footerData.footerEmail}
                onChange={(e) => updateField('footerEmail', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+1 (555) 123-4567"
                value={footerData.footerPhone}
                onChange={(e) => updateField('footerPhone', e.target.value)}
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="address">Business Address</Label>
            <Input
              id="address"
              placeholder="123 Main St, City, State 12345"
              value={footerData.footerAddress}
              onChange={(e) => updateField('footerAddress', e.target.value)}
            />
          </div>
          
          {/* Business Hours with Tabs */}
          <div className="space-y-3">
            <Label>Business Hours</Label>
            <p className="text-sm text-muted-foreground">
              Set your weekly schedule so customers know when you're available
            </p>
            
            <Tabs defaultValue="monday" className="w-full">
              <TabsList className="grid w-full grid-cols-7">
                <TabsTrigger value="monday">Mon</TabsTrigger>
                <TabsTrigger value="tuesday">Tue</TabsTrigger>
                <TabsTrigger value="wednesday">Wed</TabsTrigger>
                <TabsTrigger value="thursday">Thu</TabsTrigger>
                <TabsTrigger value="friday">Fri</TabsTrigger>
                <TabsTrigger value="saturday">Sat</TabsTrigger>
                <TabsTrigger value="sunday">Sun</TabsTrigger>
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
                      <Label htmlFor={`${day}-closed`}>Closed</Label>
                    </div>
                  </div>
                  
                  {!hours.closed && (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor={`${day}-open`}>Opening Time</Label>
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
                        <Label htmlFor={`${day}-close`}>Closing Time</Label>
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
                      <p>Closed on {getDayLabel(day)}</p>
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
              <CardTitle>Business Policies</CardTitle>
              <CardDescription>
                Set clear expectations for your customers. These policies help build trust and prevent misunderstandings.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="cancellationPolicy">Cancellation Policy</Label>
            <Textarea
              id="cancellationPolicy"
              placeholder="Plans changed? Reschedule or cancel 24h in advance to avoid a fee."
              value={footerData.footerCancellationPolicy}
              onChange={(e) => updateField('footerCancellationPolicy', e.target.value)}
              rows={2}
            />
            <p className="text-sm text-gray-500 mt-1">
              Explain your cancellation and rescheduling policy clearly.
            </p>
          </div>
          
          <div>
            <Label htmlFor="privacyPolicy">Privacy Policy</Label>
            <Textarea
              id="privacyPolicy"
              placeholder="We only use your details to manage your appointment. No spam."
              value={footerData.footerPrivacyPolicy}
              onChange={(e) => updateField('footerPrivacyPolicy', e.target.value)}
              rows={2}
            />
            <p className="text-sm text-gray-500 mt-1">
              Explain how you handle customer information and data.
            </p>
          </div>
          
          <div>
            <Label htmlFor="termsOfService">Terms of Service</Label>
            <Textarea
              id="termsOfService"
              placeholder="Secure booking handled by top booking platforms."
              value={footerData.footerTermsOfService}
              onChange={(e) => updateField('footerTermsOfService', e.target.value)}
              rows={2}
            />
            <p className="text-sm text-gray-500 mt-1">
              Explain your terms and conditions for using your services.
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
            <h4 className="font-medium text-blue-900">Why this matters</h4>
            <p className="text-sm text-blue-800">
              Complete business information builds trust and helps customers make informed decisions. 
              Clear policies prevent misunderstandings and show professionalism.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Preview Mode Info */}
      <Card className="bg-green-50 border-green-200">
        <CardContent className="pt-6">
          <div className="text-center space-y-2">
            <h4 className="font-medium text-green-900">Live Preview Mode</h4>
            <p className="text-sm text-green-800">
              Clicking "Enable Live Preview" will temporarily publish your page for 15 minutes, 
              allowing you to test the real iframe and see exactly how customers will experience your page.
            </p>
            <p className="text-xs text-green-700 mt-2">
              ⚡ Your page will automatically return to draft mode after 15 minutes
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button onClick={handleSubmit}>
          Enable Live Preview (15 min)
        </Button>
      </div>
    </div>
  );
};
