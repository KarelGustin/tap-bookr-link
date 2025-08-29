import { useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { SectionCard } from './SectionCard'
import { Upload, User } from 'lucide-react'
import { useImageUpload } from '@/hooks/use-image-upload'
import { useToast } from '@/hooks/use-toast'

interface AboutSectionProps {
  avatarUrl: string
  aboutTitle: string
  aboutDescription: string
  onUpdate: (data: {
    avatarUrl?: string
    aboutTitle?: string
    aboutDescription?: string
  }) => void
}

export function AboutSection({
  avatarUrl,
  aboutTitle,
  aboutDescription,
  onUpdate
}: AboutSectionProps) {
  const { uploadImage, isUploading } = useImageUpload()
  const { toast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleImageUpload = async (file: File) => {
    try {
      const result = await uploadImage(file, 'avatars', `avatar/${Date.now()}_${file.name}`)
      if (result) {
        onUpdate({ avatarUrl: result.url })
        toast({
          title: "Avatar geüpload",
          description: "Je profielfoto is succesvol geüpload.",
        })
      }
    } catch (error) {
      toast({
        title: "Upload mislukt",
        description: "Er is een fout opgetreden bij het uploaden van je avatar.",
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

  const removeAvatar = () => {
    onUpdate({ avatarUrl: '' })
  }

  return (
    <SectionCard title="Over Mij">
      <div className="space-y-6">
        {/* Avatar Upload */}
        <div className="space-y-4">
          <Label>Profielfoto</Label>
          <div className="flex items-center space-x-4">
            {avatarUrl ? (
              <div className="relative">
                <img
                  src={avatarUrl}
                  alt="Profielfoto"
                  className="w-20 h-20 object-cover rounded-full border-2 border-border"
                />
                <Button
                  size="sm"
                  variant="outline"
                  className="absolute -top-1 -right-1 rounded-full w-6 h-6 p-0"
                  onClick={removeAvatar}
                >
                  ×
                </Button>
              </div>
            ) : (
              <div className="w-20 h-20 rounded-full bg-muted border-2 border-dashed border-border flex items-center justify-center">
                <User className="w-8 h-8 text-muted-foreground" />
              </div>
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
                {isUploading ? 'Uploaden...' : avatarUrl ? 'Foto wijzigen' : 'Foto uploaden'}
              </Button>
              <p className="text-sm text-muted-foreground mt-1">
                Upload een professionele foto van jezelf
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

        {/* About Content */}
        <div className="space-y-4">
          <div>
            <Label htmlFor="aboutTitle">Over jou titel</Label>
            <Input
              id="aboutTitle"
              placeholder="Maak kennis met [jouw naam]"
              value={aboutTitle}
              onChange={(e) => onUpdate({ aboutTitle: e.target.value })}
              maxLength={60}
            />
          </div>
          <div>
            <Label htmlFor="aboutDescription">Over jou beschrijving</Label>
            <Textarea
              id="aboutDescription"
              placeholder="Vertel kort iets over jezelf, je passie en waarom je doet wat je doet..."
              value={aboutDescription}
              onChange={(e) => onUpdate({ aboutDescription: e.target.value })}
              className="min-h-[100px]"
              maxLength={200}
            />
            <p className="text-sm text-muted-foreground">
              {aboutDescription.length}/200 karakters
            </p>
          </div>
        </div>
      </div>
    </SectionCard>
  )
}