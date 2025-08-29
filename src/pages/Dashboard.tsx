import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { Database, Json } from '@/integrations/supabase/types';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import StripeService from '@/services/stripeService';
import { 
  ChevronDown,
  Settings,
  Palette,
  BarChart3,
  Plus,
  Edit3,
  Save,
  Link as LinkIcon,
  Star,
  Share2,
  Menu,
  Lock,
  ExternalLink,
  LogOut,
  CheckCircle,
  Calendar,
  CreditCard,
  Download,
  X,
  ArrowLeft,
  User,
  Globe,
  Image as ImageIcon,
  Upload,
  Clock
} from 'lucide-react';
import { LanguageSelector } from '@/components/ui/language-selector';
import { useLanguage } from '@/contexts/LanguageContext';
import { useDashboardProfile } from '@/features/dashboard/hooks/useDashboardProfile';
import { useDesignState } from '@/features/dashboard/hooks/useDesignState';

// Types
export type SocialItem = { title?: string; platform?: string; url?: string };
export type TestimonialItem = { customer_name: string; review_title: string; review_text: string; image_url?: string };
export type Banner = { 
  type: 'color' | 'image'; 
  color?: string; 
  imageUrl?: string;
  heading?: string;
  subheading?: string;
  textColor?: string;
};

type Profile = Database['public']['Tables']['profiles']['Row'];

export default function Dashboard() {
  const [searchParams] = useSearchParams();
  const [activeSection, setActiveSection] = useState<'design' | 'subscription'>('design');
  const [isSaving, setIsSaving] = useState(false);
  const { user, signOut, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { profile, loading: profileLoading, reload: reloadProfile } = useDashboardProfile();
  const { design, setDesign } = useDesignState();

  // Success message handling
  const success = searchParams.get('success');
  const subscriptionStatus = searchParams.get('subscription');

  // Show success message when coming from successful subscription
  useEffect(() => {
    if (success === 'true' && subscriptionStatus === 'active') {
      const handleSubscriptionSuccess = async () => {
        if (!profile?.id) return;
        
        try {
          const { data, error } = await supabase.functions.invoke('handle-subscription-success', {
            body: { profileId: profile.id }
          });
          
          if (error) {
            console.error('Error handling subscription success:', error);
          }
        } catch (error) {
          console.error('Error calling subscription success handler:', error);
        }
      };
      
      handleSubscriptionSuccess();
      
      toast({
        title: "🎉 Betaling Succesvol!",
        description: "Je abonnement is actief en je website is nu live op tapbookr.com!",
        variant: "default",
      });
      
      const url = new URL(window.location.href);
      url.searchParams.delete('success');
      url.searchParams.delete('subscription');
      window.history.replaceState({}, '', url.toString());
      
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    }
  }, [success, subscriptionStatus, toast, profile?.id]);

  // Check onboarding completion
  useEffect(() => {
    if (profile && !profile.onboarding_completed) {
      navigate('/onboarding');
    }
  }, [profile, navigate]);

  // Load design data from profile
  useEffect(() => {
    if (!profile) return;
    
    const bannerData = (profile.banner as any) || {};
    const aboutData = (profile.about as any) || {};
    const footerData = (profile.footer as any) || {};
    const socialsData = (profile.socials as any) || {};
    const mediaData = (profile.media as any) || { items: [] };
    const testimonialsData = (profile.testimonials as any) || [];

    setDesign({
      bannerType: bannerData.type || 'color',
      bannerColor: bannerData.color || '#6E56CF',
      bannerHeading: bannerData.heading || '',
      bannerSubheading: bannerData.subheading || '',
      bannerTextColor: bannerData.textColor || '#FFFFFF',
      name: profile.name || '',
      slogan: profile.slogan || '',
      category: profile.category || '',
      aboutTitle: aboutData.title || '',
      aboutDescription: aboutData.description || '',
      footerBusinessName: profile.footer_business_name || '',
      footerAddress: profile.footer_address || '',
      footerEmail: profile.footer_email || '',
      footerPhone: profile.footer_phone || '',
      footerHours: (profile.footer_hours as Record<string, any>) || {},
      footerNextAvailable: profile.footer_next_available || '',
      footerCancellationPolicy: profile.footer_cancellation_policy || '',
      footerPrivacyPolicy: profile.footer_privacy_policy || '',
      footerTermsOfService: profile.footer_terms_of_service || '',
      footerShowMaps: profile.footer_show_maps ?? true,
      footerShowAttribution: profile.footer_show_attribution ?? true,
      mediaFiles: [],
      mediaOrder: mediaData.items?.map((item: any) => item.url) || [],
      socials: Object.entries(socialsData).map(([platform, data]: [string, any]) => ({
        title: data?.title || platform,
        platform,
        url: data?.url || ''
      })),
      bookingUrl: profile.booking_url || '',
      bookingMode: (profile.booking_mode as 'embed' | 'new_tab') || 'embed',
      testimonials: testimonialsData.map((t: any) => ({
        customer_name: t.customer_name || '',
        review_title: t.review_title || '',
        review_text: t.review_text || '',
        image_url: t.image_url
      }))
    });
  }, [profile, setDesign]);

  const handleSave = async () => {
    if (!profile) return;
    
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          name: design.name,
          slogan: design.slogan,
          category: design.category,
          banner: {
            type: design.bannerType,
            color: design.bannerColor,
            heading: design.bannerHeading,
            subheading: design.bannerSubheading,
            textColor: design.bannerTextColor,
            imageUrl: profile.banner_url
          },
          about: {
            title: design.aboutTitle,
            description: design.aboutDescription
          },
          footer_business_name: design.footerBusinessName,
          footer_address: design.footerAddress,
          footer_email: design.footerEmail,
          footer_phone: design.footerPhone,
          footer_hours: design.footerHours,
          footer_next_available: design.footerNextAvailable,
          footer_cancellation_policy: design.footerCancellationPolicy,
          footer_privacy_policy: design.footerPrivacyPolicy,
          footer_terms_of_service: design.footerTermsOfService,
          footer_show_maps: design.footerShowMaps,
          footer_show_attribution: design.footerShowAttribution,
          socials: design.socials.reduce((acc, social) => {
            if (social.platform) {
              acc[social.platform] = {
                title: social.title,
                url: social.url
              };
            }
            return acc;
          }, {} as any),
          booking_url: design.bookingUrl,
          booking_mode: design.bookingMode,
          testimonials: design.testimonials,
          updated_at: new Date().toISOString()
        })
        .eq('id', profile.id);

      if (error) throw error;

      toast({
        title: "✅ Opgeslagen!",
        description: "Je wijzigingen zijn succesvol opgeslagen.",
      });
      
      reloadProfile();
    } catch (error) {
      toast({
        title: "❌ Fout",
        description: "Er is een fout opgetreden bij het opslaan.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (authLoading || profileLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Dashboard laden...</p>
        </div>
      </div>
    );
  }

  if (!user || !profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 flex items-center justify-center">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold">Toegang geweigerd</h2>
          <p className="text-muted-foreground">Log in om je dashboard te bekijken.</p>
          <Button onClick={() => navigate('/login')}>
            Inloggen
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5">
      {/* Mobile-First Header */}
      <div className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
              <span className="text-primary-foreground text-sm font-semibold">
                {profile.name?.charAt(0)?.toUpperCase() || 'U'}
              </span>
            </div>
            <h1 className="text-xl font-bold">Dashboard</h1>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(`/${profile.handle}`)}
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Preview
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={signOut}
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Content Container */}
      <div className="container mx-auto px-4 py-6 max-w-2xl">
        {/* Navigation Tabs */}
        <div className="mb-6">
          <div className="flex space-x-1 p-1 bg-muted rounded-lg">
            <button
              onClick={() => setActiveSection('design')}
              className={`flex-1 flex items-center justify-center px-4 py-2 rounded-md text-sm font-medium transition-all ${
                activeSection === 'design'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Palette className="w-4 h-4 mr-2" />
              Design
            </button>
            <button
              onClick={() => setActiveSection('subscription')}
              className={`flex-1 flex items-center justify-center px-4 py-2 rounded-md text-sm font-medium transition-all ${
                activeSection === 'subscription'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <CreditCard className="w-4 h-4 mr-2" />
              Abonnement
            </button>
          </div>
        </div>

        {/* Section Content */}
        {activeSection === 'design' ? (
          <div className="space-y-6">
            {/* Basic Info Section */}
            <Card className="border-0 shadow-lg bg-background/50 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center">
                  <User className="w-5 h-5 mr-2" />
                  Basis Informatie
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="name">Naam</Label>
                  <Input
                    id="name"
                    value={design.name}
                    onChange={(e) => setDesign(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Je naam of bedrijfsnaam"
                  />
                </div>
                <div>
                  <Label htmlFor="slogan">Slogan</Label>
                  <Input
                    id="slogan"
                    value={design.slogan}
                    onChange={(e) => setDesign(prev => ({ ...prev, slogan: e.target.value }))}
                    placeholder="Een korte beschrijving"
                  />
                </div>
                <div>
                  <Label htmlFor="category">Categorie</Label>
                  <Input
                    id="category"
                    value={design.category}
                    onChange={(e) => setDesign(prev => ({ ...prev, category: e.target.value }))}
                    placeholder="Bijv. Restaurant, Kapper, Coach"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Banner Section */}
            <Card className="border-0 shadow-lg bg-background/50 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center">
                  <ImageIcon className="w-5 h-5 mr-2" />
                  Banner
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="banner-heading">Hoofdtekst</Label>
                  <Input
                    id="banner-heading"
                    value={design.bannerHeading}
                    onChange={(e) => setDesign(prev => ({ ...prev, bannerHeading: e.target.value }))}
                    placeholder="Welkom bij..."
                  />
                </div>
                <div>
                  <Label htmlFor="banner-subheading">Ondertekst</Label>
                  <Input
                    id="banner-subheading"
                    value={design.bannerSubheading}
                    onChange={(e) => setDesign(prev => ({ ...prev, bannerSubheading: e.target.value }))}
                    placeholder="Meer informatie..."
                  />
                </div>
                <div>
                  <Label htmlFor="banner-color">Banner Kleur</Label>
                  <Input
                    id="banner-color"
                    type="color"
                    value={design.bannerColor}
                    onChange={(e) => setDesign(prev => ({ ...prev, bannerColor: e.target.value }))}
                  />
                </div>
              </CardContent>
            </Card>

            {/* About Section */}
            <Card className="border-0 shadow-lg bg-background/50 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center">
                  <Globe className="w-5 h-5 mr-2" />
                  Over Mij
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="about-title">Titel</Label>
                  <Input
                    id="about-title"
                    value={design.aboutTitle}
                    onChange={(e) => setDesign(prev => ({ ...prev, aboutTitle: e.target.value }))}
                    placeholder="Over mij"
                  />
                </div>
                <div>
                  <Label htmlFor="about-description">Beschrijving</Label>
                  <Textarea
                    id="about-description"
                    value={design.aboutDescription}
                    onChange={(e) => setDesign(prev => ({ ...prev, aboutDescription: e.target.value }))}
                    placeholder="Vertel iets over jezelf..."
                    rows={4}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Booking Section */}
            <Card className="border-0 shadow-lg bg-background/50 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center">
                  <Calendar className="w-5 h-5 mr-2" />
                  Boekingen
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="booking-url">Booking URL</Label>
                  <Input
                    id="booking-url"
                    value={design.bookingUrl}
                    onChange={(e) => setDesign(prev => ({ ...prev, bookingUrl: e.target.value }))}
                    placeholder="https://calendly.com/jouwlink"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Save Button */}
            <div className="sticky bottom-4">
              <Button
                onClick={handleSave}
                disabled={isSaving}
                className="w-full py-3 text-lg font-semibold"
                size="lg"
              >
                {isSaving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2" />
                    Opslaan...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Wijzigingen Opslaan
                  </>
                )}
              </Button>
            </div>
          </div>
        ) : (
          // Subscription Section
          <div className="space-y-6">
            {/* Subscription Status */}
            <Card className="border-0 shadow-lg bg-background/50 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center">
                    <CreditCard className="w-5 h-5 mr-2" />
                    Abonnement Status
                  </span>
                  {profile.subscription_status === 'active' ? (
                    <div className="flex items-center text-green-600 bg-green-50 px-3 py-1 rounded-full text-sm font-medium">
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Actief
                    </div>
                  ) : (
                    <div className="flex items-center text-orange-600 bg-orange-50 px-3 py-1 rounded-full text-sm font-medium">
                      <Clock className="w-4 h-4 mr-1" />
                      Inactief
                    </div>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-muted/30 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-semibold">TapBookr Pro</h3>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-primary">€7</p>
                      <p className="text-sm text-muted-foreground">per maand</p>
                    </div>
                  </div>
                  
                  {profile.subscription_status === 'active' ? (
                    <div className="space-y-2 text-sm">
                      <p><strong>Gestart op:</strong> {profile.subscription_started_at ? new Date(profile.subscription_started_at).toLocaleDateString('nl-NL') : 'Onbekend'}</p>
                      {profile.trial_end_date && (
                        <p><strong>Volgende betaling:</strong> {new Date(profile.trial_end_date).toLocaleDateString('nl-NL')}</p>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">Geen actief abonnement</p>
                  )}
                </div>

                <div className="flex flex-col space-y-3">
                  {profile.subscription_status === 'active' ? (
                    <>
                      <Button
                        onClick={() => navigate('/profile')}
                        variant="outline"
                        className="w-full"
                      >
                        <Settings className="w-4 h-4 mr-2" />
                        Abonnement Beheren
                      </Button>
                      <Button
                        onClick={() => navigate('/profile')}
                        variant="outline"
                        className="w-full"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Factuur Printen
                      </Button>
                    </>
                  ) : (
                    <Button
                      onClick={async () => {
                        if (!profile?.id) return;
                        
                        try {
                          const { data, error } = await supabase.functions.invoke('stripe-create-checkout', {
                            body: {
                              profileId: profile.id,
                              successUrl: `${window.location.origin}/dashboard?success=true&subscription=active`,
                              cancelUrl: `${window.location.origin}/dashboard`
                            }
                          });

                          if (error) throw error;

                          if (data?.url) {
                            window.location.href = data.url;
                          }
                        } catch (error) {
                          console.error('Error starting subscription:', error);
                          toast({
                            title: "Fout",
                            description: "Kan abonnement niet starten",
                            variant: "destructive",
                          });
                        }
                      }}
                      className="w-full bg-primary hover:bg-primary/90"
                    >
                      <CreditCard className="w-4 h-4 mr-2" />
                      Start Abonnement - €7/maand
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Subscription Features */}
            <Card className="border-0 shadow-lg bg-background/50 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <CardTitle>Wat krijg je?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span>Gepersonaliseerde website op tapbookr.com</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span>Onbeperkte design aanpassingen</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span>Booking integratie</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span>Social media links</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span>Klantbeoordelingen</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span>24/7 support</span>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="border-0 shadow-lg bg-background/50 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <CardTitle>Snelle Acties</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  onClick={() => navigate(`/${profile.handle}`)}
                  variant="outline"
                  className="w-full justify-start"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Website Bekijken
                </Button>
                <Button
                  onClick={() => navigate('/profile')}
                  variant="outline"
                  className="w-full justify-start"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Geavanceerde Instellingen
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}