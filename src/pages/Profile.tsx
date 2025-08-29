import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Database } from '@/integrations/supabase/types';
import { 
  ArrowLeft,
  CheckCircle,
  Clock,
  CreditCard,
  Calendar,
  Download,
  ExternalLink,
  AlertTriangle,
  Loader2,
  Settings
} from 'lucide-react';
import { InvoiceGenerator } from '@/components/InvoiceGenerator';

type Profile = Database['public']['Tables']['profiles']['Row'];

interface SubscriptionData {
  id: string;
  status: string;
  stripe_subscription_id: string;
  stripe_customer_id: string;
  current_period_start: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
}

export default function Profile() {
  const [searchParams] = useSearchParams();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [subscriptionLoading, setSubscriptionLoading] = useState(false);
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Handle success messages
  const success = searchParams.get('success');
  const subscriptionStatus = searchParams.get('subscription');
  const cancellation = searchParams.get('cancellation');
  const billing = searchParams.get('billing');

  useEffect(() => {
    if (success === 'true' && subscriptionStatus === 'active') {
      toast({
        title: "🎉 Betaling Succesvol!",
        description: "Je abonnement is actief voor €7 per maand!",
        variant: "default",
      });
      
      const url = new URL(window.location.href);
      url.searchParams.delete('success');
      url.searchParams.delete('subscription');
      window.history.replaceState({}, '', url.toString());
    }

    if (cancellation === 'initiated') {
      toast({
        title: "📝 Abonnement Opgezegd",
        description: "Je abonnement wordt opgezegd aan het einde van de huidige periode.",
        variant: "default",
      });
      
      const url = new URL(window.location.href);
      url.searchParams.delete('cancellation');
      window.history.replaceState({}, '', url.toString());
    }

    if (billing === 'viewed') {
      toast({
        title: "📊 Facturen Bekeken",
        description: "Je hebt je factuurgeschiedenis bekeken.",
        variant: "default",
      });
      
      const url = new URL(window.location.href);
      url.searchParams.delete('billing');
      window.history.replaceState({}, '', url.toString());
    }
  }, [success, subscriptionStatus, cancellation, billing, toast]);

  useEffect(() => {
    if (user) {
      loadProfile();
    } else if (user === null) {
      setProfileLoading(false);
    }
  }, [user]);

  const loadProfile = async () => {
    try {
      if (!user?.id) return;
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;

      if (!data) {
        navigate('/onboarding');
        return;
      }

      if (!data.onboarding_completed) {
        navigate('/onboarding');
        return;
      }

      setProfile(data);
      loadSubscriptionData(data);
    } catch (error) {
      console.error('Profile loading error:', error);
      toast({
        title: "Fout",
        description: "Kan profiel niet laden",
        variant: "destructive",
      });
      navigate('/onboarding');
    } finally {
      setProfileLoading(false);
    }
  };

  const loadSubscriptionData = async (profileData: Profile) => {
    if (!profileData?.id || !profileData?.subscription_id) {
      setSubscription(null);
      return;
    }
    
    setSubscriptionLoading(true);
    try {
      const { data: subscriptionData, error } = await supabase.functions.invoke('get-stripe-subscription', {
        body: { profileId: profileData.id }
      });

      if (error) {
        console.log('Error fetching Stripe subscription:', error);
        // Fallback to profile data
        const fallbackData = {
          id: profileData.id,
          status: profileData.subscription_status || 'inactive',
          stripe_subscription_id: profileData.subscription_id || '',
          stripe_customer_id: profileData.stripe_customer_id || '',
          current_period_start: profileData.subscription_started_at || profileData.created_at,
          current_period_end: profileData.trial_end_date || '',
          cancel_at_period_end: false,
        };
        setSubscription(fallbackData);
      } else if (subscriptionData) {
        setSubscription(subscriptionData);
      }
    } catch (error) {
      console.log('Error loading subscription data:', error);
    } finally {
      setSubscriptionLoading(false);
    }
  };

  const handleStartSubscription = async () => {
    if (!profile?.id) return;
    
    try {
      const { data, error } = await supabase.functions.invoke('stripe-create-checkout', {
        body: {
          profileId: profile.id,
          successUrl: `${window.location.origin}/profile?success=true&subscription=active`,
          cancelUrl: `${window.location.origin}/profile`
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
  };

  const handleManageSubscription = async () => {
    if (!profile?.id) return;
    
    try {
      const { data, error } = await supabase.functions.invoke('stripe-customer-portal', {
        body: {
          profileId: profile.id,
          returnUrl: `${window.location.origin}/profile?billing=viewed`
        }
      });

      if (error) throw error;

      if (data?.url) {
        window.open(data.url, '_blank');
      }
    } catch (error) {
      console.error('Error opening customer portal:', error);
      toast({
        title: "Fout",
        description: "Kan abonnementsbeheer niet openen",
        variant: "destructive",
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('nl-NL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getNextPaymentDate = (endDate: string) => {
    const end = new Date(endDate);
    return new Date(end.getFullYear(), end.getMonth() + 1, end.getDate());
  };

  if (authLoading || profileLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto" />
          <p className="text-muted-foreground">Profiel laden...</p>
        </div>
      </div>
    );
  }

  if (!user || !profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 flex items-center justify-center">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold">Toegang geweigerd</h2>
          <p className="text-muted-foreground">Log in om je profiel te bekijken.</p>
          <Button onClick={() => navigate('/login')}>
            Inloggen
          </Button>
        </div>
      </div>
    );
  }

  const isActive = subscription?.status === 'active';
  const startedDate = subscription?.current_period_start || profile.subscription_started_at || profile.created_at;
  const nextPaymentDate = subscription?.current_period_end ? getNextPaymentDate(subscription.current_period_end) : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/dashboard')}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Dashboard
            </Button>
            <h1 className="text-xl font-bold">Abonnement</h1>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(`/${profile.handle}`)}
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            Preview
          </Button>
        </div>
      </div>

      {/* Content */}  
      <div className="container mx-auto px-4 py-6 max-w-2xl">
        <div className="space-y-6">
          {/* Current Plan */}
          <Card className="border-0 shadow-lg bg-background/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center">
                  <CreditCard className="w-5 h-5 mr-2" />
                  Huidig Abonnement
                </span>
                {isActive ? (
                  <Badge variant="default" className="bg-green-500">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Actief
                  </Badge>
                ) : (
                  <Badge variant="secondary">
                    <Clock className="w-3 h-3 mr-1" />
                    Inactief
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                <div>
                  <h3 className="text-lg font-semibold">TapBookr Pro</h3>
                  <p className="text-2xl font-bold text-primary">€7 <span className="text-sm font-normal text-muted-foreground">per maand</span></p>
                </div>
                <div className="text-right text-sm text-muted-foreground">
                  {isActive ? (
                    <>
                      <p>Gestart op: {formatDate(startedDate)}</p>
                      {nextPaymentDate && (
                        <p>Volgende betaling: {formatDate(nextPaymentDate.toISOString())}</p>
                      )}
                    </>
                  ) : (
                    <p>Geen actief abonnement</p>
                  )}
                </div>
              </div>

              <div className="flex flex-col space-y-2">
                {isActive ? (
                  <>
                    <Button
                      onClick={handleManageSubscription}
                      variant="outline"
                      className="w-full"
                    >
                      <Settings className="w-4 h-4 mr-2" />
                      Abonnement Beheren
                    </Button>
                    {subscription && (
                      <InvoiceGenerator 
                        profile={profile}
                      />
                    )}
                  </>
                ) : (
                  <Button
                    onClick={handleStartSubscription}
                    className="w-full bg-primary hover:bg-primary/90"
                  >
                    <CreditCard className="w-4 h-4 mr-2" />
                    Start Abonnement - €7/maand
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Features */}
          <Card className="border-0 shadow-lg bg-background/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Wat krijg je?</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span>Gepersonaliseerde website op tapbookr.com</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span>Onbeperkte design aanpassingen</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span>Booking integratie</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span>Social media links</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span>Klantbeoordelingen</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span>24/7 support</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Info */}
          {isActive && (
            <Card className="border-0 shadow-lg bg-background/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="w-5 h-5 mr-2" />
                  Betaling Informatie
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p>• Automatische verlenging elke maand</p>
                  <p>• Opzeggen kan altijd via abonnementsbeheer</p>
                  <p>• Je website blijft actief tot het einde van de betaalde periode</p>
                  {subscription?.cancel_at_period_end && (
                    <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <div className="flex items-center text-yellow-800">
                        <AlertTriangle className="w-4 h-4 mr-2" />
                        <span className="text-sm font-medium">
                          Abonnement wordt opgezegd op {subscription.current_period_end ? formatDate(subscription.current_period_end) : 'onbekende datum'}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}