import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { SectionCard } from './SectionCard'
import { Upload, Image, Palette } from 'lucide-react'
import { useImageUpload } from '@/hooks/use-image-upload'
import { useToast } from '@/hooks/use-toast'

interface BannerSectionProps {
  bannerUrl: string
  bannerColor: string
  bannerHeading: string
  bannerSubheading: string
  bannerTextColor: string
  onUpdate: (data: {
    bannerUrl?: string
    bannerColor?: string
    bannerHeading?: string
    bannerSubheading?: string
    bannerTextColor?: string
  }) => void
}

export function BannerSection({
  bannerUrl,
  bannerColor,
  bannerHeading,
  bannerSubheading,
  bannerTextColor,
  onUpdate
}: BannerSectionProps) {
  const { uploadImage, isUploading } = useImageUpload()
  const { toast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [bannerType, setBannerType] = useState<'color' | 'image'>(bannerUrl ? 'image' : 'color')

  const handleImageUpload = async (file: File) => {
    try {
      const result = await uploadImage(file, 'media', `banner/${Date.now()}_${file.name}`)
      if (result) {
        onUpdate({ bannerUrl: result.url })
        setBannerType('image')
        toast({
          title: "Banner geüpload",
          description: "Je banner afbeelding is succesvol geüpload.",
        })
      }
    } catch (error) {
      toast({
        title: "Upload mislukt",
        description: "Er is een fout opgetreden bij het uploaden van de banner.",
        variant: "destructive",
      })
    }
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      handleImageUpload(file)
    }
  }

  return (
    <SectionCard title="Banner">
      <div className="space-y-6">
        {/* Banner Type Toggle */}
        <div className="flex gap-2">
          <Button
            type="button"
            variant={bannerType === 'color' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setBannerType('color')}
            className="flex items-center gap-2"
          >
            <Palette className="w-4 h-4" />
            Kleur
          </Button>
          <Button
            type="button"
            variant={bannerType === 'image' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setBannerType('image')}
            className="flex items-center gap-2"
          >
            <Image className="w-4 h-4" />
            Afbeelding
          </Button>
        </div>

        {/* Banner Preview */}
        <div className="relative h-32 rounded-lg overflow-hidden border border-border">
          {bannerType === 'image' && bannerUrl ? (
            <img 
              src={bannerUrl} 
              alt="Banner preview" 
              className="w-full h-full object-cover"
            />
          ) : (
            <div 
              className="w-full h-full"
              style={{ backgroundColor: bannerColor }}
            />
          )}
          
          {/* Banner Text Overlay */}
          <div className="absolute inset-0 flex flex-col justify-center items-center text-center p-4">
            {bannerHeading && (
              <h2 
                className="text-lg font-bold mb-1"
                style={{ color: bannerTextColor }}
              >
                {bannerHeading}
              </h2>
            )}
            {bannerSubheading && (
              <p 
                className="text-sm"
                style={{ color: bannerTextColor }}
              >
                {bannerSubheading}
              </p>
            )}
          </div>
        </div>

        {/* Banner Configuration */}
        {bannerType === 'color' ? (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="bannerColor">Banner kleur</Label>
              <div className="flex gap-2 items-center">
                <input
                  id="bannerColor"
                  type="color"
                  value={bannerColor}
                  onChange={(e) => onUpdate({ bannerColor: e.target.value })}
                  className="w-12 h-12 rounded-lg border border-border cursor-pointer"
                />
                <Input
                  value={bannerColor}
                  onChange={(e) => onUpdate({ bannerColor: e.target.value })}
                  placeholder="#6E56CF"
                  className="flex-1"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="bannerTextColor">Tekst kleur</Label>
              <div className="flex gap-2 items-center">
                <input
                  id="bannerTextColor"
                  type="color"
                  value={bannerTextColor}
                  onChange={(e) => onUpdate({ bannerTextColor: e.target.value })}
                  className="w-12 h-12 rounded-lg border border-border cursor-pointer"
                />
                <Input
                  value={bannerTextColor}
                  onChange={(e) => onUpdate({ bannerTextColor: e.target.value })}
                  placeholder="#FFFFFF"
                  className="flex-1"
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              {bannerUrl && (
                <img 
                  src={bannerUrl} 
                  alt="Huidige banner" 
                  className="w-16 h-16 object-cover rounded-lg border border-border"
                />
              )}
              <div className="flex-1">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="w-full"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  {isUploading ? 'Uploaden...' : bannerUrl ? 'Banner wijzigen' : 'Banner uploaden'}
                </Button>
                <p className="text-sm text-muted-foreground mt-1">
                  Upload een banner afbeelding voor je profiel
                </p>
              </div>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>
        )}

        {/* Banner Text */}
        <div className="grid grid-cols-1 gap-4">
          <div>
            <Label htmlFor="bannerHeading">Banner titel</Label>
            <Input
              id="bannerHeading"
              placeholder="Je hoofdtitel"
              value={bannerHeading}
              onChange={(e) => onUpdate({ bannerHeading: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="bannerSubheading">Banner ondertitel</Label>
            <Input
              id="bannerSubheading"
              placeholder="Je ondertitel"
              value={bannerSubheading}
              onChange={(e) => onUpdate({ bannerSubheading: e.target.value })}
            />
          </div>
        </div>
      </div>
    </SectionCard>
  )
}