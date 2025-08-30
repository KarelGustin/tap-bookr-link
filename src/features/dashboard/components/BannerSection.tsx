import { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SectionCard } from './SectionCard';
import { Upload, Image as ImageIcon } from 'lucide-react';
import { useImageUpload } from '@/hooks/use-image-upload';
import { useToast } from '@/hooks/use-toast';
import { sanitizeFilename } from '@/lib/utils';
interface BannerSectionProps {
  bannerUrl: string;
  bannerHeading: string;
  bannerSubheading: string;
  bannerTextColor: string;
  name: string;
  slogan: string;
  category: string;
  onUpdate: (updates: {
    bannerUrl?: string;
    bannerHeading?: string;
    bannerSubheading?: string;
    bannerTextColor?: string;
    name?: string;
    slogan?: string;
    category?: string;
  }) => void;
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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const {
    uploadImage,
    isUploading
  } = useImageUpload();
  const {
    toast
  } = useToast();
  const handleImageUpload = async (file: File) => {
    try {
      const sanitizedFilename = sanitizeFilename(file.name);
      const result = await uploadImage(file, 'media', `banner/${Date.now()}_${sanitizedFilename}`);
      if (result) {
        onUpdate({
          bannerUrl: result.url
        });
        toast({
          title: "Banner geüpload",
          description: "Je banner afbeelding is succesvol geüpload."
        });
      }
    } catch (error) {
      toast({
        title: "Upload mislukt",
        description: "Er is een fout opgetreden bij het uploaden.",
        variant: "destructive"
      });
    }
  };
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      handleImageUpload(files[0]);
    }
  };
  return <SectionCard title="Banner & Basis Informatie" cta={<Button type="button" variant="outline" size="sm" onClick={() => fileInputRef.current?.click()} disabled={isUploading} className="flex items-center gap-2">
          <Upload className="w-4 h-4" />
          {isUploading ? 'Uploaden...' : 'Banner Upload'}
        </Button>}>
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
              <Input id="name" placeholder="Je naam" value={name} onChange={e => onUpdate({
              name: e.target.value
            })} />
            </div>
            <div>
              <Label htmlFor="slogan">Slogan</Label>
              <Input id="slogan" placeholder="Je slogan of ondertitel" value={slogan} onChange={e => onUpdate({
              slogan: e.target.value
            })} />
            </div>
            <div>
              <Label htmlFor="category">Categorie</Label>
              <Input id="category" placeholder="Wat doe je?" value={category} onChange={e => onUpdate({
              category: e.target.value
            })} />
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
          <div 
            className="relative h-32 rounded-lg overflow-hidden border flex items-center justify-center cursor-pointer hover:bg-muted/70 transition-colors group"
            onClick={() => fileInputRef.current?.click()}
          >
            {bannerUrl ? (
              <>
                <img 
                  src={bannerUrl} 
                  alt="Banner preview" 
                  className="absolute inset-0 w-full h-full object-cover" 
                  onError={(e) => {
                    console.error('Banner image failed to load:', bannerUrl);
                    // Set a fallback background instead of hiding
                    const target = e.currentTarget;
                    target.style.display = 'none';
                    const parent = target.parentElement;
                    if (parent) {
                      parent.style.backgroundColor = 'hsl(var(--primary))';
                    }
                  }} 
                  onLoad={() => {
                    console.log('Banner image loaded successfully:', bannerUrl);
                  }} 
                />
                {/* Upload overlay for existing banner */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Button 
                    variant="secondary" 
                    size="sm" 
                    disabled={isUploading}
                    className="pointer-events-none"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    {isUploading ? 'Uploaden...' : 'Wijzig Banner'}
                  </Button>
                </div>
              </>
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-muted/50">
                <ImageIcon className="w-8 h-8 mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground mb-3">Geen banner geüpload</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  disabled={isUploading}
                  className="pointer-events-none"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  {isUploading ? 'Uploaden...' : 'Upload Banner'}
                </Button>
              </div>
            )}
          </div>

          {/* Banner Controls */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="bannerTextColor">Tekst Kleur</Label>
              <div className="flex gap-2 mt-1">
                <Input id="bannerTextColor" type="color" value={bannerTextColor} onChange={e => onUpdate({
                bannerTextColor: e.target.value
              })} className="w-12 h-10 p-1 rounded cursor-pointer" />
                <Input type="text" value={bannerTextColor} onChange={e => onUpdate({
                bannerTextColor: e.target.value
              })} placeholder="#FFFFFF" className="flex-1" />
              </div>
            </div>
          </div>

          {/* Text Content */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            
          </div>

          {/* Hidden File Input */}
          <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
        </div>
      </div>
    </SectionCard>;
}