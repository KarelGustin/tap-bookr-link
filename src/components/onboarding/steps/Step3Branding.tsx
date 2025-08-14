import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { OnboardingLayout } from '../OnboardingLayout';
import { Upload } from 'lucide-react';

interface Step3BrandingProps {
  onNext: (data: { 
    businessName?: string; 
    slogan?: string; 
    category?: string;
    banner?: { 
      type: 'image'; 
      imageUrl?: string; 
      textColor?: string; 
    };
  }) => void;
  onBack: () => void;
  requiresName: boolean;
  handle?: string;
  existingData?: {
    name?: string;
    slogan?: string;
    banner?: {
      type?: 'image';
      imageUrl?: string;
      textColor?: string;
    };
    category?: string;
  };
}

const categories = [
  'Salon',
  'Dierenverzorging', 
  'Consultant/Coach',
  'Nagels',
  'Wenkbrauwen/Wimpers',
  'Fitness',
  'Anders'
];

export const Step3Branding = ({ onNext, onBack, requiresName, existingData, handle }: Step3BrandingProps) => {
  const [businessName, setBusinessName] = useState(existingData?.name || '');
  const [slogan, setSlogan] = useState(existingData?.slogan || '');
  const [category, setCategory] = useState(existingData?.category || '');
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [bannerTextColor, setBannerTextColor] = useState(existingData?.banner?.textColor || '#ffffff');
  const [bannerPreview, setBannerPreview] = useState<string | null>(existingData?.banner?.imageUrl || null);

  const bannerInputRef = useRef<HTMLInputElement>(null);

  // Update previews when existing data changes
  useEffect(() => {
    if (existingData?.banner?.imageUrl) {
      setBannerPreview(existingData.banner.imageUrl);
      console.log('Updated banner preview with existing data:', existingData.banner.imageUrl);
    }
    
    // Also update other fields when existing data changes
    if (existingData?.name) {
      setBusinessName(existingData.name);
    }
    if (existingData?.slogan) {
      setSlogan(existingData.slogan);
    }
    if (existingData?.category) {
      setCategory(existingData.category);
    }
    if (existingData?.banner?.textColor) {
      setBannerTextColor(existingData.banner.textColor);
    }
  }, [existingData]);

  const handleBannerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setBannerFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setBannerPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = () => {
    if (requiresName && !businessName.trim()) {
      return;
    }

    onNext({
      businessName: businessName.trim() || undefined,
      slogan: slogan.trim() || undefined,
      category: category || undefined,
      banner: {
        type: 'image',
        imageUrl: bannerPreview || undefined,
        textColor: bannerTextColor
      },
    });
  };

  const canContinue = !requiresName || businessName.trim().length >= 2;

  return (
    <OnboardingLayout
      currentStep={3}
      totalSteps={7}
      onNext={handleSubmit}
      canGoNext={canContinue}
      title="Banner & Branding"
      subtitle="Customize your banner and business identity."
      onBack={onBack}
      handle={handle}
    >
      <div className="space-y-6">
        {/* Business Name */}
        <div className="space-y-2">
          <Label htmlFor="businessName" className="text-base font-medium">
            Bedrijfsnaam *
          </Label>
          <Input
            id="businessName"
            placeholder="Glow Brow Studio"
            value={businessName}
            onChange={(e) => setBusinessName(e.target.value)}
            className="rounded-lg h-12"
            maxLength={60}
          />
          <p className="text-sm text-muted-foreground">
            Dit wordt prominent op je banner en doorheen je pagina getoond
          </p>
        </div>

        {/* Slogan */}
        <div className="space-y-2">
          <Label htmlFor="slogan" className="text-base font-medium">
            Bedrijfsslogan
          </Label>
          <Input
            id="slogan"
            placeholder="Brows, lashes & confidence."
            value={slogan}
            onChange={(e) => setSlogan(e.target.value)}
            className="rounded-lg h-12"
            maxLength={80}
          />
          <p className="text-sm text-muted-foreground">
            Een korte, herkenbare uitdrukking die je bedrijf beschrijft
          </p>
        </div>

        {/* Category */}
        <div className="space-y-2">
          <Label htmlFor="category" className="text-base font-medium">
            Bedrijfscategorie
          </Label>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="rounded-lg h-12">
              <SelectValue placeholder="Selecteer je bedrijfstype" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-sm text-muted-foreground">
            Helpt klanten je bedrijf te vinden en te begrijpen
          </p>
        </div>

        {/* Banner */}
        <div className="space-y-4">
          <Label className="text-base font-medium">Banner Achtergrond</Label>
          <p className="text-sm text-muted-foreground">
            Upload een afbeelding voor je bannerachtergrond. Dit is het eerste wat klanten zien.
          </p>
          
          {/* Banner image upload */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Banner afbeelding</Label>
            <div className="flex items-center gap-3">
              <Button type="button" variant="outline" onClick={() => bannerInputRef.current?.click()}>
                {bannerPreview ? 'Banner wijzigen' : 'Banner uploaden'}
              </Button>
              <input
                ref={bannerInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleBannerChange}
              />
            </div>
            {/* Current banner preview */}
            <div className="mt-2">
              <p className="text-xs text-muted-foreground mb-1">Huidige banner</p>
              <div className="w-full max-w-md aspect-[3/1] rounded-md overflow-hidden border bg-muted/30">
                {bannerPreview ? (
                  <img src={bannerPreview} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-muted/30 flex items-center justify-center">
                    <div className="text-center">
                      <Upload className="w-6 h-6 text-muted-foreground mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">Upload banner afbeelding</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Banner Text Color */}
        <div className="space-y-2">
          <Label htmlFor="bannerTextColor" className="text-base font-medium">
            Banner Tekst Kleur
          </Label>
          <div className="grid grid-cols-6 gap-2">
            {['#ffffff', '#000000', '#f3f4f6', '#1f2937', '#ef4444', '#10b981'].map((color) => (
              <button
                key={color}
                type="button"
                onClick={() => setBannerTextColor(color)}
                className={`w-10 h-10 rounded-lg border-2 ${
                  bannerTextColor === color ? 'border-foreground' : 'border-transparent'
                }`}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
          <p className="text-sm text-muted-foreground">
            Kies een kleur die ervoor zorgt dat je tekst leesbaar is op je bannerachtergrond
          </p>
        </div>

        {/* Continue button */}
        <Button 
          onClick={handleSubmit}
          disabled={!canContinue}
          className="w-full h-12 text-base rounded-lg"
          size="lg"
        >
          Volgende
        </Button>
      </div>
    </OnboardingLayout>
  );
};