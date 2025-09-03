import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function Confirm() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const handleVerification = async () => {
      try {
        const token_hash = searchParams.get('token_hash');
        const type = searchParams.get('type');
        const redirect_to = searchParams.get('redirect_to');

        console.log('🔧 Verification attempt:', { 
          hasTokenHash: !!token_hash,
          type,
          redirectTo: redirect_to 
        });

        if (!token_hash || !type) {
          throw new Error('Ongeldige verificatielink - ontbrekende parameters');
        }

        // Handle different types of verification
        let result;
        
        if (type === 'signup' || type === 'email_change') {
          // Email confirmation
          result = await supabase.auth.verifyOtp({
            token_hash,
            type: 'email'
          });
        } else if (type === 'recovery') {
          // Password recovery - redirect to reset password page
          const { data, error } = await supabase.auth.verifyOtp({
            token_hash,
            type: 'recovery'
          });
          
          if (error) throw error;
          
          // User is now authenticated, redirect to password reset
          navigate('/reset-password', { replace: true });
          return;
        } else if (type === 'magiclink') {
          // Magic link authentication
          result = await supabase.auth.verifyOtp({
            token_hash,
            type: 'magiclink'
          });
        } else {
          throw new Error(`Onbekend verificatietype: ${type}`);
        }

        if (result.error) {
          throw result.error;
        }

        console.log('✅ Verification successful:', result.data);
        
        setStatus('success');
        setMessage('Je account is succesvol geverifieerd!');
        
        toast({
          title: "Account geverifieerd",
          description: "Je account is succesvol geactiveerd. Je wordt nu doorgestuurd.",
        });

        // Wait a moment then redirect
        setTimeout(() => {
          if (redirect_to && redirect_to.startsWith('/')) {
            navigate(redirect_to, { replace: true });
          } else {
            // Check if user needs onboarding
            navigate('/onboarding', { replace: true });
          }
        }, 2000);

      } catch (error: any) {
        console.error('❌ Verification error:', error);
        setStatus('error');
        setMessage(error.message || 'Er is een fout opgetreden bij het verifiëren van je account');
        
        toast({
          variant: "destructive",
          title: "Verificatie mislukt",
          description: error.message || 'Er is een fout opgetreden bij het verifiëren van je account',
        });
      }
    };

    handleVerification();
  }, [searchParams, navigate, toast]);

  const handleRetry = () => {
    setStatus('loading');
    window.location.reload();
  };

  const handleGoHome = () => {
    navigate('/', { replace: true });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2">
            {status === 'loading' && <Loader2 className="h-5 w-5 animate-spin" />}
            {status === 'success' && <CheckCircle className="h-5 w-5 text-green-500" />}
            {status === 'error' && <XCircle className="h-5 w-5 text-red-500" />}
            
            {status === 'loading' && 'Account verifiëren...'}
            {status === 'success' && 'Verificatie succesvol!'}
            {status === 'error' && 'Verificatie mislukt'}
          </CardTitle>
          <CardDescription>
            {status === 'loading' && 'Even geduld, we verifiëren je account...'}
            {status === 'success' && 'Je account is geactiveerd en je wordt doorgestuurd.'}
            {status === 'error' && 'Er is iets misgegaan met de verificatie.'}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="text-center space-y-4">
          {status === 'loading' && (
            <div className="flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          )}
          
          {message && (
            <p className={`text-sm ${
              status === 'success' ? 'text-green-600' : 
              status === 'error' ? 'text-red-600' : 'text-muted-foreground'
            }`}>
              {message}
            </p>
          )}
          
          {status === 'error' && (
            <div className="space-y-2">
              <Button onClick={handleRetry} variant="outline" className="w-full">
                Opnieuw proberen
              </Button>
              <Button onClick={handleGoHome} variant="ghost" className="w-full">
                Terug naar hoofdpagina
              </Button>
            </div>
          )}
          
          {status === 'success' && (
            <div className="flex items-center justify-center">
              <div className="h-2 bg-muted rounded-full w-full">
                <div className="h-2 bg-primary rounded-full animate-pulse" style={{ width: '100%' }}></div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}