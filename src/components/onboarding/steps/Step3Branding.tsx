import { useState, useRef, useEffect } from 'react';
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
  existingData?: {
    name?: string;
    slogan?: string;
    avatar_url?: string;
    banner?: {
      type?: 'color' | 'image';
      color?: string;
      imageUrl?: string;
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
  const [name, setName] = useState(existingData?.name || '');
  const [slogan, setSlogan] = useState(existingData?.slogan || '');
  const [category, setCategory] = useState(existingData?.category || '');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [bannerType, setBannerType] = useState<'color' | 'image'>(existingData?.banner?.type || 'color');
  const [bannerColor, setBannerColor] = useState(existingData?.banner?.color || brandColors[0]);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(existingData?.avatar_url || null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(existingData?.banner?.imageUrl || null);

  const avatarInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  // Update previews when existing data changes
  useEffect(() => {
    if (existingData?.avatar_url) {
      setAvatarPreview(existingData.avatar_url);
      console.log('Updated avatar preview with existing data:', existingData.avatar_url);
    }
    if (existingData?.banner?.imageUrl) {
      setBannerPreview(existingData.banner.imageUrl);
      console.log('Updated banner preview with existing data:', existingData.banner.imageUrl);
    }
    
    // Also update other fields when existing data changes
    if (existingData?.name) {
      setName(existingData.name);
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
  }, [existingData]);

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
            <div className="flex flex-col gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => avatarInputRef.current?.click()}
                className="h-10"
              >
                <Upload className="w-4 h-4 mr-2" />
                {avatarPreview ? 'Change Photo' : 'Upload Photo'}
              </Button>
              {avatarPreview && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setAvatarPreview(null);
                    setAvatarFile(null);
                  }}
                  className="h-8 text-sm text-muted-foreground hover:text-destructive"
                >
                  Remove
                </Button>
              )}
            </div>
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
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => bannerInputRef.current?.click()}
                  className="flex-1"
                >
                  {bannerPreview ? 'Change Image' : 'Choose Image'}
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
                    className="text-muted-foreground hover:text-destructive"
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

        {/* Mobile Preview */}
        {(avatarPreview || bannerPreview || bannerColor || name || slogan) && (
          <div className="space-y-3">
            <Label className="text-base font-medium">
              Preview of your public page
            </Label>
            <div className="border rounded-lg overflow-hidden bg-white">
              <div className="bg-gray-100 p-3 border-b">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  </div>
                  <div className="text-xs text-gray-600">tapBookr.com/yourhandle</div>
                </div>
              </div>
              
              {/* Banner */}
              <div className="relative">
                <div 
                  className="h-20 w-full"
                  style={{ 
                    backgroundColor: bannerType === 'color' ? bannerColor : 'transparent',
                    backgroundImage: bannerType === 'image' && bannerPreview ? `url(${bannerPreview})` : 'none',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
                  }}
                />
                {/* Curved bottom edge */}
                <div className="absolute bottom-0 left-0 right-0 h-6 bg-white" style={{
                  clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%)',
                  borderRadius: '50% 50% 0 0 / 100% 100% 0 0'
                }}></div>
              </div>
              
              {/* Content */}
              <div className="p-4 space-y-4">
                <div className="text-center space-y-2 -mt-12">
                  <div className="w-16 h-16 rounded-full mx-auto border-4 border-white overflow-hidden relative z-10">
                    {avatarPreview ? (
                      <img src={avatarPreview} alt="Avatar preview" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                        <User className="w-8 h-8 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <h1 className="text-lg font-semibold">{name || 'Your Business Name'}</h1>
                  <p className="text-sm text-gray-600">{slogan || 'Your business slogan'}</p>
                  {category && (
                    <span className="inline-block px-2 py-1 bg-gray-100 text-xs text-gray-600 rounded">
                      {category}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              This is how your public page will look to visitors
            </p>
          </div>
        )}

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