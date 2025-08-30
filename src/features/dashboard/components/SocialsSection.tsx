import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { SectionCard } from './SectionCard'
import { Plus, X, Share2 } from 'lucide-react'

interface Social {
  id: string
  title: string
  platform?: string
  url: string
}

interface SocialsSectionProps {
  socials: Social[]
  onUpdate: (socials: Social[]) => void
}

export function SocialsSection({ socials, onUpdate }: SocialsSectionProps) {
  const [localSocials, setLocalSocials] = useState<Social[]>(() => {
    if (socials.length > 0) {
      return socials
    }
    // Default socials with placeholders - URLs will be filled from DB data
    return [
      { id: '1', title: 'Instagram', platform: 'instagram', url: '' },
      { id: '2', title: 'Facebook', platform: 'facebook', url: '' },
      { id: '3', title: 'LinkedIn', platform: 'linkedin', url: '' },
      { id: '4', title: 'YouTube', platform: 'youtube', url: '' },
    ]
  })

  // Update local state when socials prop changes (from DB)
  useEffect(() => {
    if (socials.length > 0) {
      setLocalSocials(socials)
    } else {
      // Reset to default empty state
      setLocalSocials([])
    }
  }, [socials])

  const updateSocial = (id: string, field: 'title' | 'url', value: string) => {
    const updated = localSocials.map(social =>
      social.id === id ? { ...social, [field]: value } : social
    )
    setLocalSocials(updated)
    
    // Only filter out completely empty socials (both title and URL empty)
    const validSocials = updated.filter(social => 
      social.title.trim() || social.url.trim()
    )
    onUpdate(validSocials)
  }

  const addSocial = () => {
    const newId = (localSocials.length + 1).toString()
    const newSocial = { id: newId, title: '', platform: '', url: '' }
    const updated = [...localSocials, newSocial]
    setLocalSocials(updated)
  }

  const removeSocial = (id: string) => {
    const updated = localSocials.filter(social => social.id !== id)
    setLocalSocials(updated)
    
    // Filter out empty socials before updating parent
    const validSocials = updated.filter(social => social.title.trim() && social.url.trim())
    onUpdate(validSocials)
  }

  return (
    <SectionCard 
      title="Sociale Media"
      cta={
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addSocial}
          className="flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Toevoegen
        </Button>
      }
    >
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Share2 className="w-4 h-4" />
          <p className="text-sm">
            Help klanten je te vinden op sociale media platforms
          </p>
        </div>
        
        {localSocials.map((social) => (
          <div key={social.id} className="space-y-3 p-4 border rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <Label htmlFor={`social-title-${social.id}`}>Platform naam</Label>
                <Input
                  id={`social-title-${social.id}`}
                  placeholder="Instagram"
                  value={social.title}
                  onChange={(e) => updateSocial(social.id, 'title', e.target.value)}
                  className="mt-1"
                />
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => removeSocial(social.id)}
                className="ml-3 shrink-0"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            <div>
              <Label htmlFor={`social-url-${social.id}`}>URL</Label>
              <Input
                id={`social-url-${social.id}`}
                placeholder={social.url || `https://${social.platform || 'example'}.com/jouwpagina`}
                value={social.url}
                onChange={(e) => updateSocial(social.id, 'url', e.target.value)}
                className="mt-1"
              />
            </div>
          </div>
        ))}
        
        {localSocials.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <Share2 className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>Nog geen sociale media links toegevoegd</p>
            <p className="text-sm">Klik op "Toevoegen" om je eerste link toe te voegen</p>
          </div>
        )}
      </div>
    </SectionCard>
  )
}