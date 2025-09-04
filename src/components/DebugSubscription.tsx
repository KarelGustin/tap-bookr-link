import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { ChevronDown, Bug, Loader2 } from 'lucide-react'
import { supabase } from '@/integrations/supabase/client'
import { useToast } from '@/hooks/use-toast'

interface DebugSubscriptionProps {
  profile: any
}

export const DebugSubscription = ({ profile }: DebugSubscriptionProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const [debugInfo, setDebugInfo] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const runDebug = async () => {
    setIsLoading(true)
    try {
      const { data, error } = await supabase.functions.invoke('debug-subscription')
      
      if (error) {
        toast({
          title: "Debug Fout",
          description: "Kon debug informatie niet ophalen.",
          variant: "destructive",
        })
        console.error('Debug error:', error)
      } else {
        setDebugInfo(data)
        console.log('Debug info:', data)
      }
    } catch (error) {
      console.error('Debug error:', error)
      toast({
        title: "Debug Fout",
        description: "Er is een fout opgetreden.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-muted/50">
            <CardTitle className="flex items-center justify-between text-lg">
              <div className="flex items-center gap-2">
                <Bug className="w-5 h-5" />
                Debug Abonnement Status
              </div>
              <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </CardTitle>
          </CardHeader>
        </CollapsibleTrigger>
        
        <CollapsibleContent>
          <CardContent className="pt-0">
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Heb je problemen met je abonnement? Gebruik deze tool om de status te controleren.
              </p>
              
              <Button
                onClick={runDebug}
                disabled={isLoading}
                size="sm"
                variant="outline"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Analyseren...
                  </>
                ) : (
                  <>
                    <Bug className="w-4 h-4 mr-2" />
                    Analyseer Status
                  </>
                )}
              </Button>

              {debugInfo && (
                <div className="space-y-4 mt-4">
                  <div className="p-3 bg-muted rounded-lg">
                    <h4 className="font-medium mb-2">Analyse Resultaat:</h4>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">Stripe Klant:</span>
                        <Badge variant={debugInfo.analysis.has_stripe_customer ? 'default' : 'destructive'}>
                          {debugInfo.analysis.has_stripe_customer ? 'Ja' : 'Nee'}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">Abonnement Record:</span>
                        <Badge variant={debugInfo.analysis.has_subscription_record ? 'default' : 'destructive'}>
                          {debugInfo.analysis.has_subscription_record ? 'Ja' : 'Nee'}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">Profiel Status:</span>
                        <Badge variant={debugInfo.analysis.profile_published ? 'default' : 'secondary'}>
                          {debugInfo.analysis.profile_published ? 'Gepubliceerd' : 'Concept'}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">Abonnement Actief:</span>
                        <Badge variant={debugInfo.analysis.subscription_active ? 'default' : 'destructive'}>
                          {debugInfo.analysis.subscription_active ? 'Ja' : 'Nee'}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {debugInfo.analysis.issues.length > 0 && (
                    <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                      <h4 className="font-medium text-destructive mb-2">Gevonden Problemen:</h4>
                      <ul className="space-y-1">
                        {debugInfo.analysis.issues.map((issue: string, index: number) => (
                          <li key={index} className="text-sm text-destructive flex items-start gap-2">
                            <span className="text-destructive">•</span>
                            <span>{issue}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {debugInfo.subscription && (
                    <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                      <h4 className="font-medium text-green-900 mb-2">Abonnement Details:</h4>
                      <div className="text-sm text-green-800 space-y-1">
                        <p><span className="font-medium">ID:</span> {debugInfo.subscription.stripe_subscription_id}</p>
                        <p><span className="font-medium">Status:</span> {debugInfo.subscription.status}</p>
                        <p><span className="font-medium">Eindigt:</span> {new Date(debugInfo.subscription.current_period_end).toLocaleDateString('nl-NL')}</p>
                      </div>
                    </div>
                  )}

                  <div className="text-xs text-muted-foreground p-2 bg-muted rounded">
                    <p className="font-medium mb-1">Technische Details:</p>
                    <p>Profiel ID: {debugInfo.profile.id}</p>
                    <p>Stripe Klant ID: {debugInfo.profile.stripe_customer_id || 'Geen'}</p>
                    <p>Laatste Update: {new Date(debugInfo.profile.updated_at).toLocaleString('nl-NL')}</p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  )
}