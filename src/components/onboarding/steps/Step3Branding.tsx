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
    bannerType: 'color' | 'image';
    bannerColor?: string;
    bannerFile?: File;
    bannerTextColor?: string;
  }) => void;
  onBack: () => void;
  requiresName: boolean;
  existingData?: {
    name?: string;
    slogan?: string;
    banner?: {
      type?: 'color' | 'image';
      color?: string;
      imageUrl?: string;
      textColor?: string;
    };
    category?: string;
  };
}

const categories = [
  'Salon',
  'Pet Groomer', 
  'Consultant/Coach',
  'Nails',
  'Brows/Lashes',
  'Fitness',
  'Other'
];

const brandColors = [
  '#FFBE0B', // Primary yellow
  '#FB5607', // Accent orange
  '#3A86FF', // Secondary blue
  '#8338EC', // Purple
  '#FF006E', // Pink
  '#06FFA5'  // Green
];

export const Step3Branding = ({ onNext, onBack, requiresName, existingData }: Step3BrandingProps) => {
  const [businessName, setBusinessName] = useState(existingData?.name || '');
  const [slogan, setSlogan] = useState(existingData?.slogan || '');
  const [category, setCategory] = useState(existingData?.category || '');
  const [bannerType, setBannerType] = useState<'color' | 'image'>(existingData?.banner?.type || 'color');
  const [bannerColor, setBannerColor] = useState(existingData?.banner?.color || brandColors[0]);
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
    if (existingData?.banner?.type) {
      setBannerType(existingData.banner.type);
    }
    if (existingData?.banner?.color) {
      setBannerColor(existingData.banner.color);
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
      bannerType,
      bannerColor: bannerType === 'color' ? bannerColor : undefined,
      bannerFile: bannerType === 'image' ? bannerFile || undefined : undefined,
      bannerTextColor
    });
  };

  const canContinue = !requiresName || businessName.trim().length >= 2;

  return (
    <OnboardingLayout
      currentStep={3}
      totalSteps={7}
      title="Banner & Branding"
      subtitle="Customize your banner and business identity."
      onBack={onBack}
    >
      <div className="space-y-6">
        {/* Business Name */}
        <div className="space-y-2">
          <Label htmlFor="businessName" className="text-base font-medium">
            Business Name *
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
            This will be displayed prominently on your banner and throughout your page
          </p>
        </div>

        {/* Slogan */}
        <div className="space-y-2">
          <Label htmlFor="slogan" className="text-base font-medium">
            Business Slogan
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
            A short, memorable phrase that describes your business
          </p>
        </div>

        {/* Category */}
        <div className="space-y-2">
          <Label htmlFor="category" className="text-base font-medium">
            Business Category
          </Label>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="rounded-lg h-12">
              <SelectValue placeholder="Select your business type" />
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
            Helps customers find and understand your business
          </p>
        </div>

        {/* Banner */}
        <div className="space-y-4">
          <Label className="text-base font-medium">Banner Background</Label>
          <p className="text-sm text-muted-foreground">
            Choose between a solid color or upload an image for your banner background
          </p>
          
          {/* Banner type selection */}
          <div className="flex gap-2">
            <Button
              type="button"
              variant={bannerType === 'color' ? 'default' : 'outline'}
              onClick={() => setBannerType('color')}
              className="flex-1"
            >
              Solid Color
            </Button>
            <Button
              type="button"
              variant={bannerType === 'image' ? 'default' : 'outline'}
              onClick={() => setBannerType('image')}
              className="flex-1"
            >
              Background Image
            </Button>
          </div>

          {bannerType === 'color' ? (
            <div className="space-y-3">
              <Label className="text-sm font-medium">Choose a color:</Label>
              <div className="grid grid-cols-6 gap-2">
                {brandColors.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setBannerColor(color)}
                    className={`w-10 h-10 rounded-lg border-2 ${
                      bannerColor === color ? 'border-foreground' : 'border-transparent'
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="h-24 rounded-lg bg-muted border-2 border-dashed border-border flex items-center justify-center overflow-hidden">
                {bannerPreview ? (
                  <img src={bannerPreview} alt="Banner preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="text-center">
                    <Upload className="w-6 h-6 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">Upload banner image</p>
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => bannerInputRef.current?.click()}
                  className="flex-1"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  {bannerPreview ? 'Change Image' : 'Upload Image'}
                </Button>
                {bannerPreview && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setBannerPreview(null);
                      setBannerFile(null);
                    }}
                    className="h-8 text-sm text-muted-foreground hover:text-destructive"
                  >
                    Remove
                  </Button>
                )}
              </div>
              <input
                ref={bannerInputRef}
                type="file"
                accept="image/*"
                onChange={handleBannerChange}
                className="hidden"
              />
            </div>
          )}
        </div>

        {/* Banner Text Color */}
        <div className="space-y-2">
          <Label htmlFor="bannerTextColor" className="text-base font-medium">
            Banner Text Color
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
            Choose a color that ensures your text is readable on your banner background
          </p>
        </div>

        {/* Continue button */}
        <Button 
          onClick={handleSubmit}
          disabled={!canContinue}
          className="w-full h-12 text-base rounded-lg"
          size="lg"
        >
          Continue
        </Button>
      </div>
    </OnboardingLayout>
  );
};