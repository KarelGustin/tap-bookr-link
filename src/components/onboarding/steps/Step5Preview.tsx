import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { OnboardingLayout } from '../OnboardingLayout';
import { Check, Copy, ExternalLink, Edit, Sparkles, User, Instagram, Facebook, Linkedin, Youtube, MessageCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Step5PreviewProps {
  onPublish: () => void;
  onSaveDraft: () => void;
  onEditPage: () => void;
  onBack: () => void;
  handle?: string;
  profileData: {
    handle: string;
    name?: string;
    slogan?: string;
    category?: string;
    avatar_url?: string;
    banner?: {
      type?: 'color' | 'image';
      color?: string;
      imageUrl?: string;
    };
    aboutTitle?: string;
    aboutDescription?: string;
    socials?: {
      instagram?: string;
      facebook?: string;
      linkedin?: string;
      youtube?: string;
      whatsapp?: string;
    };
    mediaFiles?: File[];
    bookingUrl: string;
    bookingMode?: 'embed' | 'new_tab';
  };
  canPublish: boolean;
  isPublishing: boolean;
}

export const Step5Preview = ({ 
  onPublish, 
  onSaveDraft, 
  onEditPage, 
  onBack, 
  profileData,
  canPublish,
  isPublishing,
  handle 
}: Step5PreviewProps) => {
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const { toast } = useToast();

  const handlePublish = async () => {
    if (!agreedToTerms) {
      toast({
        title: "Voorwaarden Vereist",
        description: "Ga akkoord met de Algemene Voorwaarden & Privacy om je pagina te publiceren.",
        variant: "destructive",
      });
      return;
    }

    await onPublish();
    setShowSuccess(true);
  };

  const copyLink = () => {
    navigator.clipboard.writeText(`https://TapBookr.com/${profileData.handle}`);
    toast({
      title: "Link gekopieerd!",
      description: "Je Bookr link is naar het klembord gekopieerd.",
    });
  };

  const shareLink = `https://TapBookr.com/${profileData.handle}`;

  if (showSuccess) {
    return (
      <OnboardingLayout
        currentStep={5}
        totalSteps={5}
        title="Je Bookr is live! 🎉"
        subtitle="Gefeliciteerd! Je professionele boekingspagina is klaar."
        handle={handle}
      >
        <div className="space-y-6 text-center">
          {/* Confetti effect placeholder */}
          <div className="mx-auto w-24 h-24 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center">
            <Sparkles className="w-12 h-12 text-background" />
          </div>

          {/* Trial Information */}
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <div className="text-green-600 text-lg">🎉</div>
              <h3 className="text-lg font-semibold text-green-800">Je Bookr is Live!</h3>
            </div>
            <p className="text-green-700 mb-3">Je professionele boekingspagina is nu klaar voor bezoekers.</p>
            <div className="bg-white p-3 rounded border">
              <p className="text-sm font-medium text-gray-800 mb-1">7-Dagen Gratis Proefperiode Actief</p>
              <p className="text-xs text-gray-600">Na je proefperiode, ga door voor slechts €5/maand</p>
            </div>
          </div>

          {/* Share section */}
          <div className="space-y-4">
            <div className="p-4 bg-muted/50 rounded-lg">
              <p className="text-sm text-muted-foreground mb-2">Je Bookr pagina:</p>
              <div className="flex items-center gap-2">
                <code className="flex-1 text-left bg-background p-2 rounded border text-sm">
                  {shareLink}
                </code>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={copyLink}
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Button 
                variant="outline"
                className="h-12"
                onClick={() => window.open(shareLink, '_blank')}
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Bekijk Pagina
              </Button>
              <Button 
                className="h-12"
                onClick={onEditPage}
              >
                <Edit className="w-4 h-4 mr-2" />
                Bewerk Pagina
              </Button>
            </div>
          </div>

          <p className="text-muted-foreground">
            Deel je link en begin met het ontvangen van boekingen!
          </p>
        </div>
      </OnboardingLayout>
    );
  }

  return (
    <OnboardingLayout
      currentStep={5}
      totalSteps={5}
      title="Voorvertoning & Publiceren"
      subtitle="Bekijk je pagina en ga live wanneer je klaar bent."
      onBack={onBack}
    >
      <div className="space-y-8">
        {/* Mobile preview */}
        <Card>
          <CardContent className="p-6">
            <div className="mx-auto max-w-sm">
              <div className="bg-background border-2 border-border rounded-[2rem] p-1">
                <div className="bg-muted/30 rounded-[1.5rem] p-6 min-h-[400px]">
                  {/* Mock preview content */}
                  <div className="space-y-4">
                    <div className="h-20 bg-gradient-to-r from-primary to-accent rounded-lg"></div>
                    
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-muted rounded-full"></div>
                      <div>
                        <div className="font-semibold">{profileData.name || 'Je Naam'}</div>
                         <div className="text-sm text-muted-foreground">
                           TapBookr.com/{profileData.handle}
                         </div>
                      </div>
                    </div>

                    <div className="h-10 bg-primary rounded-lg flex items-center justify-center text-primary-foreground font-medium">
                      Boek Nu
                    </div>

                    <div className="space-y-2">
                      <div className="h-4 bg-muted rounded w-3/4"></div>
                      <div className="h-4 bg-muted rounded w-1/2"></div>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <div className="aspect-square bg-muted rounded-lg"></div>
                      <div className="aspect-square bg-muted rounded-lg"></div>
                      <div className="aspect-square bg-muted rounded-lg"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Checklist */}
        <Card>
          <CardContent className="p-6 space-y-6">
            <h3 className="font-semibold text-lg">Klaar om te lanceren</h3>
            
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
                <Check className="w-5 h-5 text-green-600" />
                <div>
                  <div className="font-medium">Handle vergrendeld</div>
                  <div className="text-sm text-muted-foreground">
                    TapBookr.com/{profileData.handle}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
                <Check className="w-5 h-5 text-green-600" />
                <div>
                  <div className="font-medium">Boekingslink ingesteld</div>
                  <div className="text-sm text-muted-foreground truncate">
                    {new URL(profileData.bookingUrl).hostname}
                  </div>
                </div>
              </div>

              {profileData.name ? (
                <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <Check className="w-5 h-5 text-green-600" />
                  <div>
                    <div className="font-medium">Naam ingesteld</div>
                    <div className="text-sm text-muted-foreground">
                      {profileData.name}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3 p-4 bg-orange-50 border border-orange-200 rounded-lg">
                  <div className="w-5 h-5 rounded-full border-2 border-orange-500"></div>
                  <div>
                    <div className="font-medium text-orange-700">Naam ontbreekt</div>
                    <div className="text-sm text-orange-600">
                      Aanbevolen voor professionele uitstraling
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Mobile Preview */}
        <Card>
          <CardContent className="p-6 space-y-4">
            <div>
              <Label className="text-base font-medium">
                Eindvoorvertoning van je publieke pagina
              </Label>
              <p className="text-sm text-muted-foreground mt-1">
                Deze voorvertoning toont hoe je complete Bookr pagina eruit zal zien voor bezoekers. Alle secties zijn inbegrepen: banner, profiel, over, sociale links, werkgalerij en boeken.
              </p>
            </div>
          <div className="border rounded-lg overflow-hidden bg-white">
            <div className="bg-gray-100 p-3 border-b">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                </div>
                <div className="text-xs text-gray-600">tapBookr.com/{profileData.handle}</div>
              </div>
            </div>
            
            {/* Full Page Content */}
            <div className="space-y-0">
              {/* Banner Section */}
              <div 
                className="h-20 w-full relative"
                style={{ 
                  backgroundColor: profileData.banner?.type === 'color' ? profileData.banner.color : 'transparent',
                  backgroundImage: profileData.banner?.type === 'image' && profileData.banner.imageUrl ? `url(${profileData.banner.imageUrl})` : 'none',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center'
                }}
              >
                {/* Curved bottom edge */}
                <div className="absolute bottom-0 left-0 right-0 h-6 bg-white" style={{
                  clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%)',
                  borderRadius: '50% 50% 0 0 / 100% 100% 0 0'
                }}></div>
              </div>
              
              {/* Profile Section */}
              <div className="text-center space-y-2 -mt-12 pb-4">
                <div className="w-16 h-16 rounded-full mx-auto border-4 border-white overflow-hidden relative z-10">
                  {profileData.avatar_url ? (
                    <img src={profileData.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                      <User className="w-8 h-8 text-gray-400" />
                    </div>
                  )}
                </div>
                <h1 className="text-lg font-semibold">{profileData.name || 'Je Bedrijfsnaam'}</h1>
                {profileData.slogan && (
                  <p className="text-sm text-gray-600">{profileData.slogan}</p>
                )}
                {profileData.category && (
                  <span className="inline-block px-2 py-1 bg-gray-100 text-xs text-gray-600 rounded">
                    {profileData.category}
                  </span>
                )}
              </div>
              
              {/* About Section */}
              {(profileData.aboutTitle || profileData.aboutDescription) && (
                <div className="p-4 bg-gray-50 border-b">
                  {profileData.aboutTitle && (
                    <h2 className="text-lg font-semibold text-center mb-2">{profileData.aboutTitle}</h2>
                  )}
                  {profileData.aboutDescription && (
                    <p className="text-sm text-gray-600 text-center leading-relaxed">{profileData.aboutDescription}</p>
                  )}
                </div>
              )}
              
              {/* Social Links */}
              {profileData.socials && Object.values(profileData.socials).some(s => s) && (
                <div className="p-4 border-b">
                  <h3 className="text-sm font-medium text-gray-700 mb-3 text-center">Verbind met mij</h3>
                  <div className="flex flex-wrap justify-center gap-3">
                    {profileData.socials.instagram && (
                      <div className="flex items-center space-x-2 px-3 py-2 bg-gray-100 rounded-full text-xs">
                        <Instagram className="w-4 h-4" />
                        <span className="text-gray-700">Instagram</span>
                      </div>
                    )}
                    {profileData.socials.facebook && (
                      <div className="flex items-center space-x-2 px-3 py-2 bg-gray-100 rounded-full text-xs">
                        <Facebook className="w-4 h-4" />
                        <span className="text-gray-700">Facebook</span>
                      </div>
                    )}
                    {profileData.socials.linkedin && (
                      <div className="flex items-center space-x-2 px-3 py-2 bg-gray-100 rounded-full text-xs">
                        <Linkedin className="w-4 h-4" />
                        <span className="text-gray-700">LinkedIn</span>
                      </div>
                    )}
                    {profileData.socials.youtube && (
                      <div className="flex items-center space-x-2 px-3 py-2 bg-gray-100 rounded-full text-xs">
                        <Youtube className="w-4 h-4" />
                        <span className="text-gray-700">YouTube</span>
                      </div>
                    )}
                    {profileData.socials.whatsapp && (
                      <div className="flex items-center space-x-2 px-3 py-2 bg-gray-100 rounded-full text-xs">
                        <MessageCircle className="w-4 h-4" />
                        <span className="text-gray-700">WhatsApp</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              {/* Media Gallery */}
              {profileData.mediaFiles && profileData.mediaFiles.length > 0 && (
                <div className="p-4 border-b">
                  <h3 className="text-sm font-medium text-gray-700 mb-3 text-center">Mijn Werk</h3>
                  <div className="flex space-x-4 overflow-x-auto pb-2" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                    {profileData.mediaFiles.map((file, index) => (
                      <div key={index} className="flex-shrink-0 w-64 h-80 rounded-lg overflow-hidden border shadow-sm relative">
                        <img 
                          src={URL.createObjectURL(file)} 
                          alt={`Werk ${index + 1}`} 
                          className="w-full h-full object-cover" 
                        />
                        <div className="absolute top-2 left-2 bg-black/70 text-white text-sm px-2 py-1 rounded">
                          {index + 1}
                        </div>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 text-center mt-2">
                    Veeg om meer te zien • {profileData.mediaFiles.length} afbeelding{profileData.mediaFiles.length !== 1 ? 'en' : ''}
                  </p>
                </div>
              )}
              
              {/* Booking Section */}
              <div className="p-4">
                <div className="space-y-3">
                  {profileData.bookingUrl && (
                    profileData.bookingMode === 'embed' ? (
                      <div className="border rounded-lg overflow-hidden">
                        <iframe
                          src={profileData.bookingUrl}
                          className="w-full h-[800px] border-0"
                          title="Boekingsformulier"
                          sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
                        />
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div className="h-12 bg-blue-500 text-white rounded-lg flex items-center justify-center font-medium">
                          📅 Boek Nu
                        </div>
                        <p className="text-xs text-gray-500 text-center">
                          Opent in nieuwe tab
                        </p>
                      </div>
                    )
                  )}
                </div>
              </div>
              
              {/* Reviews Section */}
              <div className="p-4 border-b">
                <h3 className="text-lg font-semibold text-center mb-4">Klantbeoordelingen</h3>
                <div className="flex space-x-4 overflow-x-auto pb-2" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                  {/* Review Card 1 */}
                  <div className="flex-shrink-0 w-64 h-80 rounded-lg overflow-hidden border shadow-sm relative bg-white">
                    <div className="h-48 bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                      <div className="text-white text-center">
                        <div className="text-2xl mb-2">👩‍💼</div>
                        <div className="text-xs">Sarah M.</div>
                      </div>
                    </div>
                    <div className="p-4">
                      <h4 className="font-medium text-sm mb-2">Sarah M.</h4>
                      <p className="text-xs text-gray-600 leading-relaxed">
                        "Geweldige service! Ze gingen echt boven en buiten mijn verwachtingen. Zeer aanbevolen!"
                      </p>
                    </div>
                  </div>
                  
                  {/* Review Card 2 */}
                  <div className="flex-shrink-0 w-64 h-80 rounded-lg overflow-hidden border shadow-sm relative bg-white">
                    <div className="h-48 bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center">
                      <div className="text-white text-center">
                        <div className="text-2xl mb-2">👨‍💼</div>
                        <div className="text-xs">Michael R.</div>
                      </div>
                    </div>
                    <div className="p-4">
                      <h4 className="font-medium text-sm mb-2">Michael R.</h4>
                      <p className="text-xs text-gray-600 leading-relaxed">
                        "Professioneel, betrouwbaar en uitstekende kwaliteit. Zal zeker hun diensten opnieuw gebruiken."
                      </p>
                    </div>
                  </div>
                  
                  {/* Review Card 3 */}
                  <div className="flex-shrink-0 w-64 h-80 rounded-lg overflow-hidden border shadow-sm relative bg-white">
                    <div className="h-48 bg-gradient-to-br from-pink-400 to-red-500 flex items-center justify-center">
                      <div className="text-white text-center">
                        <div className="text-2xl mb-2">👩‍💻</div>
                        <div className="text-xs">Emma L.</div>
                      </div>
                    </div>
                    <div className="p-4">
                      <h4 className="font-medium text-sm mb-2">Emma L.</h4>
                      <p className="text-xs text-gray-600 leading-relaxed">
                        "Uitstekend werk! Ze leverden precies wat ik zocht en meer."
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="text-center mt-4">
                  <p className="text-xs text-gray-500">
                    Beoordelingen verschijnen hier zodra je ze hebt verzameld en toegevoegd. Gecureerd door jezelf.
                  </p>
                </div>
              </div>
              
              <div className="text-center text-xs text-gray-500 p-4 bg-gray-50">
                Dit is precies hoe bezoekers je pagina zullen zien
              </div>
            </div>
          </div>
          </CardContent>
        </Card>

        {/* Terms agreement */}
        <div className="space-y-3">
          <div className="flex items-start space-x-2">
            <Checkbox 
              id="terms" 
              checked={agreedToTerms}
              onCheckedChange={(checked) => setAgreedToTerms(!!checked)}
              className="mt-1"
            />
            <Label htmlFor="terms" className="text-sm text-muted-foreground leading-relaxed">
              Ik ga akkoord met de{' '}
              <a href="/terms" className="text-primary hover:underline">
                Algemene Voorwaarden
              </a>{' '}
              en{' '}
              <a href="/privacy" className="text-primary hover:underline">
                Privacybeleid
              </a>
            </Label>
          </div>
          
          {/* <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <div className="flex items-start space-x-2">
              <div className="text-amber-600 text-sm">⚠️</div>
              <div className="text-sm text-amber-800">
                <p className="font-medium mb-1">Trial Terms</p>
                <p>By publishing, you agree to start a 7-day free trial. After the trial, your subscription will automatically continue at €5/month unless cancelled.</p>
              </div>
            </div>
          </div> */}
        </div>

        {/* Action buttons */}
        <div className="space-y-3">
          <Button 
            onClick={handlePublish}
            disabled={!canPublish || !agreedToTerms || isPublishing}
            className="w-full h-12 text-base rounded-lg"
            size="lg"
          >
            {isPublishing ? 'Publiceren...' : 'Publiceer Mijn Bookr (7-Dagen Gratis Proefperiode)'}
          </Button>
          
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start space-x-2">
              <div className="text-blue-600 text-sm">ℹ️</div>
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">Gratis Proefperiode Inbegrepen</p>
                <p>Je Bookr pagina zal 7 dagen volledig gratis live zijn. Na de proefperiode, ga door voor slechts €5/maand.</p>
              </div>
            </div>
          </div>
{/* 
          <div className="grid grid-cols-2 gap-3">
            <Button 
              variant="outline"
              onClick={onSaveDraft}
              className="h-10"
            >
              Save as Draft
            </Button>
            <Button 
              variant="outline"
              onClick={onEditPage}
              className="h-10"
            >
              Go to Edit Page
            </Button>
          </div> */}
        </div>

        {!canPublish && (
          <p className="text-center text-sm text-orange-600">
            Vul verplichte velden in om te publiceren
          </p>
        )}
      </div>
    </OnboardingLayout>
  );
};