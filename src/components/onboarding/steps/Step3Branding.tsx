import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { OnboardingLayout } from '../OnboardingLayout';
import { Upload, User } from 'lucide-react';

interface Step3BrandingProps {
  onNext: (data: { 
    name?: string; 
    slogan?: string; 
    avatarFile?: File; 
    bannerType: 'color' | 'image';
    bannerColor?: string;
    bannerFile?: File;
    category?: string;
  }) => void;
  onBack: () => void;
  requiresName: boolean;
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

export const Step3Branding = ({ onNext, onBack, requiresName }: Step3BrandingProps) => {
  const [name, setName] = useState('');
  const [slogan, setSlogan] = useState('');
  const [category, setCategory] = useState('');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [bannerType, setBannerType] = useState<'color' | 'image'>('color');
  const [bannerColor, setBannerColor] = useState(brandColors[0]);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);

  const avatarInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onload = () => setAvatarPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleBannerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setBannerFile(file);
      const reader = new FileReader();
      reader.onload = () => setBannerPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = () => {
    if (requiresName && !name.trim()) {
      return;
    }

    onNext({
      name: name.trim() || undefined,
      slogan: slogan.trim() || undefined,
      avatarFile: avatarFile || undefined,
      bannerType,
      bannerColor: bannerType === 'color' ? bannerColor : undefined,
      bannerFile: bannerType === 'image' ? bannerFile || undefined : undefined,
      category: category || undefined,
    });
  };

  const canContinue = !requiresName || name.trim().length >= 2;

  return (
    <OnboardingLayout
      currentStep={3}
      totalSteps={5}
      title="Make it yours"
      subtitle="Add your personal touch with just a few details."
      onBack={onBack}
    >
      <div className="space-y-6">
        {/* Name */}
        <div className="space-y-2">
          <Label htmlFor="name" className="text-base font-medium">
            {requiresName ? 'Business Name *' : 'Name'}
          </Label>
          <Input
            id="name"
            placeholder="Glow Brow Studio"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="rounded-lg h-12"
            maxLength={60}
          />
          {requiresName && (
            <p className="text-sm text-muted-foreground">
              Required for business profiles
            </p>
          )}
        </div>

        {/* Slogan */}
        <div className="space-y-2">
          <Label htmlFor="slogan" className="text-base font-medium">
            Professional Slogan
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
            {slogan.length}/80 characters
          </p>
        </div>

        {/* Avatar upload */}
        <div className="space-y-2">
          <Label className="text-base font-medium">Avatar/Logo</Label>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-muted border-2 border-dashed border-border flex items-center justify-center overflow-hidden">
              {avatarPreview ? (
                <img src={avatarPreview} alt="Avatar preview" className="w-full h-full object-cover" />
              ) : (
                <User className="w-6 h-6 text-muted-foreground" />
              )}
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={() => avatarInputRef.current?.click()}
              className="h-10"
            >
              <Upload className="w-4 h-4 mr-2" />
              Upload Photo
            </Button>
            <input
              ref={avatarInputRef}
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              className="hidden"
            />
          </div>
        </div>

        {/* Banner */}
        <div className="space-y-4">
          <Label className="text-base font-medium">Banner</Label>
          
          {/* Banner type selection */}
          <div className="flex gap-2">
            <Button
              type="button"
              variant={bannerType === 'color' ? 'default' : 'outline'}
              onClick={() => setBannerType('color')}
              className="flex-1"
            >
              Color
            </Button>
            <Button
              type="button"
              variant={bannerType === 'image' ? 'default' : 'outline'}
              onClick={() => setBannerType('image')}
              className="flex-1"
            >
              Image
            </Button>
          </div>

          {bannerType === 'color' ? (
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
              <Button
                type="button"
                variant="outline"
                onClick={() => bannerInputRef.current?.click()}
                className="w-full"
              >
                Choose Image
              </Button>
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

        {/* Category */}
        <div className="space-y-2">
          <Label className="text-base font-medium">Category</Label>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="h-12 rounded-lg">
              <SelectValue placeholder="Select your profession" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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
        
        {requiresName && !name.trim() && (
          <p className="text-center text-sm text-orange-600">
            Business name is required to continue
          </p>
        )}
        
        <p className="text-center text-sm text-muted-foreground">
          You can change this later in Edit Page.
        </p>
      </div>
    </OnboardingLayout>
  );
};