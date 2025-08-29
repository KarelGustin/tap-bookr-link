import { useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { SectionCard } from './SectionCard'
import { Upload, Image as ImageIcon } from 'lucide-react'
import { useImageUpload } from '@/hooks/use-image-upload'
import { useToast } from '@/hooks/use-toast'

interface BannerSectionProps {
  bannerUrl: string
  bannerHeading: string
  bannerSubheading: string
  bannerTextColor: string
  name: string
  slogan: string
  category: string
  onUpdate: (updates: {
    bannerUrl?: string
    bannerHeading?: string
    bannerSubheading?: string
    bannerTextColor?: string
    name?: string
    slogan?: string
    category?: string
  }) => void
}

export function BannerSection({ 
  bannerUrl, 
  bannerHeading, 
  bannerSubheading, 
  bannerTextColor,
  name,
  slogan, 
  category,
  onUpdate 
}: BannerSectionProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { uploadImage, isUploading } = useImageUpload()
  const { toast } = useToast()

  const handleImageUpload = async (file: File) => {
    try {
      const result = await uploadImage(file, 'media', `banner/${Date.now()}_${file.name}`)
      if (result) {
        onUpdate({ bannerUrl: result.url })
        toast({
          title: "Banner geüpload",
          description: "Je banner afbeelding is succesvol geüpload.",
        })
      }
    } catch (error) {
      toast({
        title: "Upload mislukt",
        description: "Er is een fout opgetreden bij het uploaden.",
        variant: "destructive",
      })
    }
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (files && files.length > 0) {
      handleImageUpload(files[0])
    }
  }

  return (
    <SectionCard 
      title="Banner & Basis Informatie"
      cta={
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="flex items-center gap-2"
        >
          <Upload className="w-4 h-4" />
          {isUploading ? 'Uploaden...' : 'Banner Upload'}
        </Button>
      }
    >
      <div className="space-y-6">
        {/* Basis Informatie */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-muted-foreground">
            <ImageIcon className="w-4 h-4" />
            <p className="text-sm">Basis informatie voor je profiel</p>
          </div>
          
          <div className="grid grid-cols-1 gap-4">
            <div>
              <Label htmlFor="name">Naam</Label>
              <Input
                id="name"
                placeholder="Je naam"
                value={name}
                onChange={(e) => onUpdate({ name: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="slogan">Slogan</Label>
              <Input
                id="slogan"
                placeholder="Je slogan of ondertitel"
                value={slogan}
                onChange={(e) => onUpdate({ slogan: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="category">Categorie</Label>
              <Input
                id="category"
                placeholder="Wat doe je?"
                value={category}
                onChange={(e) => onUpdate({ category: e.target.value })}
              />
            </div>
          </div>
        </div>

        {/* Banner Image Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-muted-foreground">
            <ImageIcon className="w-4 h-4" />
            <p className="text-sm">Upload een banner afbeelding voor je profiel</p>
          </div>

          {/* Banner Preview */}
          <div className="relative h-32 rounded-lg overflow-hidden border flex items-center justify-center">
            {bannerUrl && (
              <img 
                src={bannerUrl} 
                alt="Banner preview" 
                className="absolute inset-0 w-full h-full object-cover"
                onError={(e) => {
                  console.error('Banner image failed to load:', bannerUrl);
                  e.currentTarget.style.display = 'none';
                }}
              />
            )}
            <div className="text-center px-4">
              <h3 
                className="font-bold text-lg mb-1"
                style={{ color: bannerTextColor }}
              >
                {bannerHeading || name || 'Jouw Banner Titel'}
              </h3>
              <p 
                className="text-sm opacity-90"
                style={{ color: bannerTextColor }}
              >
                {bannerSubheading || slogan || 'Jouw banner ondertitel'}
              </p>
            </div>
            
            {!bannerUrl && (
              <div className="absolute inset-0 flex items-center justify-center bg-muted/50">
                <div className="text-center">
                  <ImageIcon className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">Geen banner geüpload</p>
                </div>
              </div>
            )}
          </div>

          {/* Banner Controls */}
          <div className="space-y-4">
            {bannerUrl && (
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-2">Huidige banner:</p>
                <img 
                  src={bannerUrl} 
                  alt="Banner preview" 
                  className="w-full h-24 object-cover rounded border"
                />
              </div>
            )}
            
            <div>
              <Label htmlFor="bannerTextColor">Tekst Kleur</Label>
              <div className="flex gap-2 mt-1">
                <Input
                  id="bannerTextColor"
                  type="color"
                  value={bannerTextColor}
                  onChange={(e) => onUpdate({ bannerTextColor: e.target.value })}
                  className="w-12 h-10 p-1 rounded cursor-pointer"
                />
                <Input
                  type="text"
                  value={bannerTextColor}
                  onChange={(e) => onUpdate({ bannerTextColor: e.target.value })}
                  placeholder="#FFFFFF"
                  className="flex-1"
                />
              </div>
            </div>
          </div>

          {/* Text Content */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="bannerHeading">Banner Titel</Label>
              <Input
                id="bannerHeading"
                value={bannerHeading}
                onChange={(e) => onUpdate({ bannerHeading: e.target.value })}
                placeholder={name || "Jouw banner titel"}
              />
            </div>
            <div>
              <Label htmlFor="bannerSubheading">Banner Ondertitel</Label>
              <Input
                id="bannerSubheading"
                value={bannerSubheading}
                onChange={(e) => onUpdate({ bannerSubheading: e.target.value })}
                placeholder={slogan || "Jouw banner ondertitel"}
              />
            </div>
          </div>

          {/* Hidden File Input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>
      </div>
    </SectionCard>
  )
}