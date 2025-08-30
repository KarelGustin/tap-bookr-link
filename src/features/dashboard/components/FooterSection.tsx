import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { SectionCard } from './SectionCard'
import { Building2, Clock, MapPin } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface BusinessHours {
  [day: string]: { open: string; close: string; closed: boolean }
}

interface FooterSectionProps {
  footerBusinessName: string
  footerAddress: string
  footerEmail: string
  footerPhone: string
  footerHours: BusinessHours
  footerNextAvailable: string
  footerCancellationPolicy: string
  footerPrivacyPolicy: string
  footerTermsOfService: string
  footerShowMaps: boolean
  onUpdate: (data: Partial<FooterSectionProps>) => void
}

export function FooterSection({
  footerBusinessName,
  footerAddress,
  footerEmail,
  footerPhone,
  footerHours,
  footerNextAvailable,
  footerCancellationPolicy,
  footerPrivacyPolicy,
  footerTermsOfService,
  footerShowMaps,
  onUpdate
}: FooterSectionProps) {
  const defaultHours: BusinessHours = {
    monday: { open: '09:00', close: '17:00', closed: false },
    tuesday: { open: '09:00', close: '17:00', closed: false },
    wednesday: { open: '09:00', close: '17:00', closed: false },
    thursday: { open: '09:00', close: '17:00', closed: false },
    friday: { open: '09:00', close: '17:00', closed: false },
    saturday: { open: '10:00', close: '16:00', closed: false },
    sunday: { open: '10:00', close: '16:00', closed: true },
  }

  const [hours, setHours] = useState<BusinessHours>(() => {
    // Check if footerHours has actual day data, not just empty object
    if (footerHours && Object.keys(footerHours).length > 0 && footerHours.monday) {
      return footerHours;
    }
    return defaultHours;
  })

  const updateHours = (day: string, field: 'open' | 'close' | 'closed', value: string | boolean) => {
    const newHours = {
      ...hours,
      [day]: {
        ...hours[day],
        [field]: value
      }
    }
    setHours(newHours)
    onUpdate({ footerHours: newHours })
  }

  const getDayLabel = (day: string) => {
    const dayLabels: Record<string, string> = {
      monday: 'Maandag',
      tuesday: 'Dinsdag',
      wednesday: 'Woensdag',
      thursday: 'Donderdag',
      friday: 'Vrijdag',
      saturday: 'Zaterdag',
      sunday: 'Zondag'
    }
    return dayLabels[day] || day
  }

  return (
    <SectionCard title="Footer Informatie">
      <div className="space-y-6">
        <Tabs defaultValue="business" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="business">Bedrijf</TabsTrigger>
            <TabsTrigger value="hours">Openingstijden</TabsTrigger>
            <TabsTrigger value="policies">Beleid</TabsTrigger>
          </TabsList>

          <TabsContent value="business" className="space-y-4 mt-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-4">
              <Building2 className="w-4 h-4" />
              <p className="text-sm">Bedrijfsinformatie die klanten zien</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="footerBusinessName">Bedrijfsnaam</Label>
                <Input
                  id="footerBusinessName"
                  placeholder="Je bedrijfsnaam"
                  value={footerBusinessName}
                  onChange={(e) => onUpdate({ footerBusinessName: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="footerEmail">E-mailadres</Label>
                <Input
                  id="footerEmail"
                  type="email"
                  placeholder="jouw@email.com"
                  value={footerEmail}
                  onChange={(e) => onUpdate({ footerEmail: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="footerPhone">Telefoonnummer</Label>
                <Input
                  id="footerPhone"
                  type="tel"
                  placeholder="+31 (0) 6 12345678"
                  value={footerPhone}
                  onChange={(e) => onUpdate({ footerPhone: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="footerNextAvailable">Eerst beschikbaar</Label>
                <Input
                  id="footerNextAvailable"
                  placeholder="Vandaag om 14:00"
                  value={footerNextAvailable}
                  onChange={(e) => onUpdate({ footerNextAvailable: e.target.value })}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="footerAddress">Bedrijfsadres</Label>
              <Input
                id="footerAddress"
                placeholder="Hoofdstraat 123, 1234 AB Stad"
                value={footerAddress}
                onChange={(e) => onUpdate({ footerAddress: e.target.value })}
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="footerShowMaps"
                  checked={footerShowMaps}
                  onCheckedChange={(checked) => onUpdate({ footerShowMaps: !!checked })}
                />
                <Label htmlFor="footerShowMaps">Toon kaart in footer</Label>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="hours" className="space-y-4 mt-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-4">
              <Clock className="w-4 h-4" />
              <p className="text-sm">Stel je openingstijden in</p>
            </div>

            <div className="space-y-3">
              {Object.entries(hours).map(([day, dayHours]) => (
                <div key={day} className="flex items-center gap-4 p-3 border border-border rounded-lg">
                  <div className="w-20 font-medium">
                    {getDayLabel(day)}
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id={`closed-${day}`}
                      checked={dayHours.closed}
                      onCheckedChange={(checked) => updateHours(day, 'closed', !!checked)}
                    />
                    <Label htmlFor={`closed-${day}`} className="text-sm">
                      Gesloten
                    </Label>
                  </div>
                  {!dayHours.closed && (
                    <>
                      <Input
                        type="time"
                        value={dayHours.open}
                        onChange={(e) => updateHours(day, 'open', e.target.value)}
                        className="w-32"
                      />
                      <span>tot</span>
                      <Input
                        type="time"
                        value={dayHours.close}
                        onChange={(e) => updateHours(day, 'close', e.target.value)}
                        className="w-32"
                      />
                    </>
                  )}
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="policies" className="space-y-4 mt-4">
            <div className="space-y-4">
              <div>
                <Label htmlFor="footerCancellationPolicy">Annuleringsbeleid</Label>
                <Textarea
                  id="footerCancellationPolicy"
                  placeholder="Plannen gewijzigd? Herplan of annuleer 24 uur van tevoren om een vergoeding te voorkomen."
                  value={footerCancellationPolicy}
                  onChange={(e) => onUpdate({ footerCancellationPolicy: e.target.value })}
                  className="min-h-[80px]"
                />
              </div>
              <div>
                <Label htmlFor="footerPrivacyPolicy">Privacybeleid</Label>
                <Textarea
                  id="footerPrivacyPolicy"
                  placeholder="We gebruiken je gegevens alleen om je afspraak te beheren. Geen spam."
                  value={footerPrivacyPolicy}
                  onChange={(e) => onUpdate({ footerPrivacyPolicy: e.target.value })}
                  className="min-h-[80px]"
                />
              </div>
              <div>
                <Label htmlFor="footerTermsOfService">Algemene voorwaarden</Label>
                <Textarea
                  id="footerTermsOfService"
                  placeholder="Veilige boeking afgehandeld door toonaangevende boekingsplatforms."
                  value={footerTermsOfService}
                  onChange={(e) => onUpdate({ footerTermsOfService: e.target.value })}
                  className="min-h-[80px]"
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </SectionCard>
  )
}