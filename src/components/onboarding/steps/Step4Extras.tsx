import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { OnboardingLayout } from '../OnboardingLayout';
import { Upload, User, Instagram, Facebook, Linkedin, Youtube, MessageCircle } from 'lucide-react';

interface Step4ExtrasProps {
  onNext: (data: {
    aboutTitle?: string;
    aboutDescription?: string;
    aboutPhotoFile?: File;
    socials: {
      instagram?: string;
      facebook?: string;
      linkedin?: string;
      youtube?: string;
      whatsapp?: string;
    };
    mediaFiles: File[];
  }) => void;
  onBack: () => void;
  onSkip: () => void;
}

export const Step4Extras = ({ onNext, onBack, onSkip }: Step4ExtrasProps) => {
  const [aboutTitle, setAboutTitle] = useState('');
  const [aboutDescription, setAboutDescription] = useState('');
  const [aboutPhotoFile, setAboutPhotoFile] = useState<File | null>(null);
  const [aboutPhotoPreview, setAboutPhotoPreview] = useState<string | null>(null);
  const [socials, setSocials] = useState({
    instagram: '',
    facebook: '',
    linkedin: '',
    youtube: '',
    whatsapp: '',
  });
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  const [mediaPreviews, setMediaPreviews] = useState<string[]>([]);

  const aboutPhotoInputRef = useRef<HTMLInputElement>(null);
  const mediaInputRef = useRef<HTMLInputElement>(null);

  const handleAboutPhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAboutPhotoFile(file);
      const reader = new FileReader();
      reader.onload = () => setAboutPhotoPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleMediaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const newFiles = files.slice(0, 6 - mediaFiles.length);
    
    if (newFiles.length > 0) {
      setMediaFiles(prev => [...prev, ...newFiles]);
      
      newFiles.forEach(file => {
        const reader = new FileReader();
        reader.onload = () => setMediaPreviews(prev => [...prev, reader.result as string]);
        reader.readAsDataURL(file);
      });
    }
  };

  const removeMedia = (index: number) => {
    setMediaFiles(prev => prev.filter((_, i) => i !== index));
    setMediaPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleSocialChange = (platform: keyof typeof socials, value: string) => {
    setSocials(prev => ({ ...prev, [platform]: value }));
  };

  const handleSubmit = () => {
    onNext({
      aboutTitle: aboutTitle.trim() || undefined,
      aboutDescription: aboutDescription.trim() || undefined,
      aboutPhotoFile: aboutPhotoFile || undefined,
      socials: Object.fromEntries(
        Object.entries(socials).filter(([_, value]) => value.trim())
      ),
      mediaFiles,
    });
  };

  const socialPlatforms = [
    { key: 'instagram' as const, icon: Instagram, label: 'Instagram', placeholder: '@yourusername' },
    { key: 'facebook' as const, icon: Facebook, label: 'Facebook', placeholder: 'facebook.com/yourpage' },
    { key: 'linkedin' as const, icon: Linkedin, label: 'LinkedIn', placeholder: 'linkedin.com/in/yourname' },
    { key: 'youtube' as const, icon: Youtube, label: 'YouTube', placeholder: 'youtube.com/yourchannel' },
    { key: 'whatsapp' as const, icon: MessageCircle, label: 'WhatsApp', placeholder: '+1234567890' },
  ];

  return (
    <OnboardingLayout
      currentStep={4}
      totalSteps={5}
      title="Optional extras"
      subtitle="Add more details to make your page stand out."
      onBack={onBack}
      onSkip={onSkip}
      canSkip={true}
    >
      <div className="space-y-8">
        {/* About section */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">About You</h3>
          
          <div className="space-y-2">
            <Label htmlFor="aboutTitle" className="text-base font-medium">
              Title
            </Label>
            <Input
              id="aboutTitle"
              placeholder="Meet Sarah"
              value={aboutTitle}
              onChange={(e) => setAboutTitle(e.target.value)}
              className="rounded-lg h-12"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="aboutDescription" className="text-base font-medium">
              Description
            </Label>
            <Textarea
              id="aboutDescription"
              placeholder="Hi! I'm Sara. I help clients feel their best with natural, long-lasting results."
              value={aboutDescription}
              onChange={(e) => setAboutDescription(e.target.value)}
              className="rounded-lg min-h-[100px]"
              maxLength={200}
            />
            <p className="text-sm text-muted-foreground">
              {aboutDescription.length}/200 characters
            </p>
          </div>

          <div className="space-y-2">
            <Label className="text-base font-medium">Portrait Photo</Label>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-lg bg-muted border-2 border-dashed border-border flex items-center justify-center overflow-hidden">
                {aboutPhotoPreview ? (
                  <img src={aboutPhotoPreview} alt="About photo preview" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-6 h-6 text-muted-foreground" />
                )}
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={() => aboutPhotoInputRef.current?.click()}
                className="h-10"
              >
                <Upload className="w-4 h-4 mr-2" />
                Upload Photo
              </Button>
              <input
                ref={aboutPhotoInputRef}
                type="file"
                accept="image/*"
                onChange={handleAboutPhotoChange}
                className="hidden"
              />
            </div>
          </div>
        </div>

        {/* Social links */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Social Links</h3>
          
          <div className="grid gap-4">
            {socialPlatforms.map(({ key, icon: Icon, label, placeholder }) => (
              <div key={key} className="space-y-2">
                <Label className="text-base font-medium flex items-center gap-2">
                  <Icon className="w-4 h-4" />
                  {label}
                </Label>
                <Input
                  placeholder={placeholder}
                  value={socials[key]}
                  onChange={(e) => handleSocialChange(key, e.target.value)}
                  className="rounded-lg h-12"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Media gallery */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Media Gallery</h3>
            <p className="text-sm text-muted-foreground">
              {mediaFiles.length}/6 images
            </p>
          </div>
          
          <p className="text-sm text-muted-foreground">
            Show your best work with up to 6 photos or videos.
          </p>

          {mediaPreviews.length > 0 && (
            <div className="grid grid-cols-3 gap-2">
              {mediaPreviews.map((preview, index) => (
                <div key={index} className="relative group">
                  <img 
                    src={preview} 
                    alt={`Media ${index + 1}`} 
                    className="w-full aspect-square object-cover rounded-lg"
                  />
                  <button
                    onClick={() => removeMedia(index)}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}

          {mediaFiles.length < 6 && (
            <Button
              type="button"
              variant="outline"
              onClick={() => mediaInputRef.current?.click()}
              className="w-full h-12 border-dashed"
            >
              <Upload className="w-4 h-4 mr-2" />
              Add Media ({6 - mediaFiles.length} remaining)
            </Button>
          )}
          
          <input
            ref={mediaInputRef}
            type="file"
            accept="image/*,video/*"
            multiple
            onChange={handleMediaChange}
            className="hidden"
          />
        </div>

        {/* Continue button */}
        <Button 
          onClick={handleSubmit}
          className="w-full h-12 text-base rounded-lg"
          size="lg"
        >
          Continue
        </Button>
        
        <p className="text-center text-sm text-muted-foreground">
          Everything auto-saves as you type.
        </p>
      </div>
    </OnboardingLayout>
  );
};