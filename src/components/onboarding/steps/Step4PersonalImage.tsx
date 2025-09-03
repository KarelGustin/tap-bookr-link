import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { OnboardingLayout } from '../OnboardingLayout';
import { Upload, User, Loader2 } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useImageUpload } from '@/hooks/use-image-upload';
import { useToast } from '@/hooks/use-toast';

interface Step4PersonalImageProps {
  onNext: (data: { 
    avatarUrl?: string;
    aboutTitle?: string;
    aboutDescription?: string;
  }) => void;
  onBack: () => void;
  handle?: string;
  existingData?: {
    avatarFile?: File;
    aboutTitle?: string;
    aboutDescription?: string;
    avatar_url?: string;
  };
}

export const Step4PersonalImage = ({ onNext, onBack, existingData, handle }: Step4PersonalImageProps) => {
  const { t } = useLanguage();
  const [avatarFile, setAvatarFile] = useState<File | null>(existingData?.avatarFile || null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [aboutTitle, setAboutTitle] = useState(existingData?.aboutTitle || '');
  const [aboutDescription, setAboutDescription] = useState(existingData?.aboutDescription || '');

  const avatarInputRef = useRef<HTMLInputElement>(null);
  const { uploadImage, isUploading } = useImageUpload();
  const { toast } = useToast();

  useEffect(() => {
    console.log('🔧 Step4PersonalImage - existingData:', existingData);
    
    if (existingData?.aboutTitle) {
      setAboutTitle(existingData.aboutTitle);
    }
    if (existingData?.aboutDescription) {
      setAboutDescription(existingData.aboutDescription);
    }
    
    // Load existing avatar from database if available
    if (existingData?.avatar_url) {
      console.log('🔧 Loading existing avatar from database:', existingData.avatar_url);
      setAvatarPreview(existingData.avatar_url);
      setAvatarUrl(existingData.avatar_url);
    } else if (existingData?.avatarFile) {
      console.log('🔧 Loading existing avatar file:', existingData.avatarFile);
      // If we have a file object, create a preview URL
      const reader = new FileReader();
      reader.onload = (e) => {
        setAvatarPreview(e.target?.result as string);
      };
      reader.readAsDataURL(existingData.avatarFile);
    }
  }, [existingData]);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      console.log('🔧 New avatar file selected:', file.name);
      setAvatarFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setAvatarPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);

      // Upload to Supabase
      try {
        const result = await uploadImage(file, 'avatars');
        if (result) {
          setAvatarUrl(result.url);
          toast({
            title: "Avatar geüpload",
            description: "Je profielfoto is succesvol geüpload.",
          });
        } else {
          throw new Error('Upload failed');
        }
      } catch (error) {
        console.error('Avatar upload error:', error);
        toast({
          title: "Upload fout",
          description: "Er is een fout opgetreden bij het uploaden van je profielfoto.",
          variant: "destructive",
        });
        // Keep the preview but clear the URL
        setAvatarUrl(null);
      }
    }
  };

  const handleSubmit = () => {
    onNext({
      avatarUrl: avatarUrl || undefined,
      aboutTitle: aboutTitle.trim() || undefined,
      aboutDescription: aboutDescription.trim() || undefined,
    });
  };

  // Check if required fields are filled
  const hasRequiredInfo = aboutTitle.trim().length > 0 && aboutDescription.trim().length > 0;
  const hasAvatar = !!(avatarFile || avatarPreview);
  
  // User can continue if they have required info (avatar is optional)
  const canGoNext = hasRequiredInfo;

  // Debug info
  console.log('🔧 Step4PersonalImage render state:', {
    avatarFile: avatarFile?.name,
    avatarPreview,
    existingData: existingData,
    canGoNext,
    hasRequiredInfo,
    hasAvatar,
    aboutTitle: aboutTitle.trim().length,
    aboutDescription: aboutDescription.trim().length,
    onNext: !!handleSubmit,
    onBack: !!onBack
  });

  return (
    <OnboardingLayout
      currentStep={4}
      totalSteps={7}
      title="Jouw Verhaal"
      subtitle="Vertel wie je bent en voeg een persoonlijke foto toe"
      onBack={onBack}
      onNext={handleSubmit}
      canGoNext={canGoNext}
      handle={handle}
    >
      <div className="space-y-6">
    
        {/* Persoonlijke afbeelding */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="avatar" className="text-base font-medium">
              Persoonlijke afbeelding
            </Label>
            <div className="flex items-center space-x-4">
              {avatarPreview ? (
                <div className="relative">
                  <img
                    src={avatarPreview}
                    alt="Avatar preview"
                    className="w-24 h-24 object-cover border-2 border-gray-200 rounded-lg"
                    onError={(e) => {
                      console.error('🔧 Error loading avatar image:', e);
                      setAvatarPreview(null);
                    }}
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    className="absolute -top-2 -right-2 rounded-lg w-8 h-8 p-0"
                    onClick={() => {
                      console.log('🔧 Removing avatar');
                      setAvatarFile(null);
                      setAvatarPreview(null);
                    }}
                  >
                    ×
                  </Button>
                </div>
              ) : (
                <div className="w-24 h-24 rounded-lg bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center">
                  <User className="w-8 h-8 text-gray-400" />
                </div>
              )}
              <div className="space-y-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => avatarInputRef.current?.click()}
                  className="rounded-lg"
                  disabled={isUploading}
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 mr-2" />
                      {avatarPreview ? 'Wijzig foto' : 'Foto kiezen'}
                    </>
                  )}
                </Button>
                <p className="text-sm text-muted-foreground">
                  {avatarPreview ? 'Klik om je foto te wijzigen' : 'Upload een professionele foto van jezelf (optioneel)'}
                </p>
                {avatarPreview && !avatarFile && existingData?.avatar_url && (
                  <p className="text-xs text-green-600">
                    ✓ Bestaande foto geladen uit database
                  </p>
                )}
                {avatarUrl && avatarFile && (
                  <p className="text-xs text-green-600">
                    ✓ Nieuwe foto geüpload
                  </p>
                )}
              </div>
            </div>
            <input
              ref={avatarInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>
        </div>

        {/* Over jou sectie */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="aboutTitle" className="text-base font-medium">
              Over jou titel
            </Label>
            <Input
              id="aboutTitle"
              placeholder="Maak kennis met [jouw naam]"
              value={aboutTitle}
              onChange={(e) => setAboutTitle(e.target.value)}
              className="rounded-lg h-12"
              maxLength={60}
            />
            <p className="text-sm text-muted-foreground">
              Een persoonlijke titel die klanten laat weten wie je bent
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="aboutDescription" className="text-base font-medium">
              Over jou beschrijving
            </Label>
            <Textarea
              id="aboutDescription"
              placeholder="Vertel kort iets over jezelf, je passie en waarom je doet wat je doet..."
              value={aboutDescription}
              onChange={(e) => setAboutDescription(e.target.value)}
              className="rounded-lg min-h-[100px]"
              maxLength={400}
            />
            <p className="text-sm text-muted-foreground">
              {aboutDescription.length}/400 karakters
            </p>
          </div>
        </div>


              </div>
        
      </OnboardingLayout>
    );
  };
