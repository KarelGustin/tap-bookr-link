import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

export default function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();

  // Auto-switch to signup mode if coming from hero "Claim Nu" button
  useEffect(() => {
    if (searchParams.get('signup') === 'true') {
      setIsLogin(false);
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Password confirmation validation for signup
    if (!isLogin && password !== confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match",
        variant: "destructive",
      });
      return;
    }
    
    setLoading(true);

    try {
      const emailSan = email.trim().toLowerCase();
      const { error } = isLogin 
        ? await signIn(emailSan, password)
        : await signUp(emailSan, password);

      if (error) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      } else {
        if (isLogin) {
          // For login, let ProtectedRoute handle the redirection
          toast({
            title: "Ingelogd!",
            description: "Je wordt doorverwezen...",
          });
          navigate('/', { replace: true });
        } else {
          // For signup, redirect to onboarding
          toast({
            title: "Account created!",
            description: "Please check your email to verify your account.",
          });
          // After signup, redirect to onboarding step 1
          const prefillHandle = searchParams.get('handle');
          const target = prefillHandle ? `/onboarding?step=1&handle=${encodeURIComponent(prefillHandle)}` : '/onboarding?step=1';
          navigate(target);
        }
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-accent/10 px-4">
      <div className="w-full max-w-md space-y-8">
        {/* Brand Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">TapBookr</h1>
              <p className="text-sm text-gray-600">Jouw booking link, maar dan mooier</p>
            </div>
          </div>
          
          <Link to="/" className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 transition-colors">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Terug naar home
          </Link>
        </div>
        
        {/* Login/Signup Card */}
        <Card className="border border-gray-200 bg-white rounded-2xl shadow-sm">
          <CardHeader className="space-y-3 pb-6">
            <CardTitle className="text-2xl font-bold text-center text-gray-900">
              {isLogin ? 'Welkom terug' : 'Maak een account'}
            </CardTitle>
            <CardDescription className="text-center text-gray-600">
              {isLogin 
                ? 'Log in om verder te gaan' 
                : 'Vul je gegevens in om een account te maken'
              }
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-700 font-medium">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Vul je email in"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="border-gray-200 focus:border-primary focus:ring-primary/20"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-gray-700 font-medium">Wachtwoord</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Vul je wachtwoord in"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="border-gray-200 focus:border-primary focus:ring-primary/20"
                  required
                />
              </div>
              {!isLogin && (
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-gray-700 font-medium">Bevestig wachtwoord</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Bevestig je wachtwoord"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="border-gray-200 focus:border-primary focus:ring-primary/20"
                    required
                  />
                </div>
              )}
              <Button 
                type="submit" 
                className="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-3 rounded-xl transition-colors"
                disabled={loading}
              >
                {loading ? 'Even geduld...' : (isLogin ? 'Inloggen' : 'Account aanmaken')}
              </Button>
            </form>
            
            <div className="text-center">
              <button
                type="button"
                onClick={() => {
                  setIsLogin(!isLogin);
                  // Clear confirm password when switching modes
                  if (isLogin) {
                    setConfirmPassword('');
                  }
                }}
                className="text-sm text-gray-600 hover:text-primary transition-colors font-medium"
              >
                {isLogin 
                  ? "Heb je nog geen account? Registreer je hier" 
                  : "Heb je al een account? Log in hier"
                }
              </button>
            </div>
          </CardContent>
        </Card>
        
        {/* Trust Indicators */}
        <div className="text-center space-y-3">
          <div className="flex items-center justify-center space-x-6 text-xs text-gray-500">
            <span className="flex items-center">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
              Beveiligd & versleuteld
            </span>
            <span className="flex items-center">
              <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
              De oplossing voor je onderneming
            </span>
          </div>
          <p className="text-xs text-gray-400">
            Door verder te gaan, ga je akkoord met onze Algemene Voorwaarden en Privacybeleid
          </p>
        </div>
      </div>
    </div>
  );
}