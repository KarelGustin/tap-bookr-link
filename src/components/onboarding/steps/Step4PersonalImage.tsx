import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { OnboardingLayout } from '../OnboardingLayout';
import { Upload, User, X } from 'lucide-react';

interface Step4PersonalImageProps {
  onNext: (data: { 
    avatarFile?: File;
  }) => void;
  onBack: () => void;
  existingData?: {
    avatar_url?: string;
  };
}

export const Step4PersonalImage = ({ onNext, onBack, existingData }: Step4PersonalImageProps) => {
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(existingData?.avatar_url || null);

  const avatarInputRef = useRef<HTMLInputElement>(null);

  // Update preview when existing data changes
  useEffect(() => {
    if (existingData?.avatar_url) {
      setAvatarPreview(existingData.avatar_url);
    }
  }, [existingData?.avatar_url]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setAvatarPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = () => {
    onNext({
      avatarFile: avatarFile || undefined
    });
  };

  const canContinue = true; // This step is optional

  return (
    <OnboardingLayout
      currentStep={4}
      totalSteps={7}
      title="Personal Image"
      subtitle="Add a photo to introduce yourself to your customers."
      onBack={onBack}
    >
      <div className="space-y-6">
        {/* Personal Image Upload */}
        <div className="space-y-4">
          <div className="text-center space-y-2">
            <Label className="text-base font-medium">Personal Introduction Photo</Label>
            <p className="text-sm text-muted-foreground">
              This image will be displayed prominently on your page to help customers connect with you personally
            </p>
          </div>
          
          <div className="flex flex-col items-center gap-6">
            {/* Image Preview */}
            <div className="w-32 h-32 rounded-xl bg-muted border-2 border-dashed border-border flex items-center justify-center overflow-hidden shadow-lg">
              {avatarPreview ? (
                <img src={avatarPreview} alt="Personal photo preview" className="w-full h-full object-cover" />
              ) : (
                <User className="w-12 h-12 text-muted-foreground" />
              )}
            </div>
            
            {/* Upload Controls */}
            <div className="flex flex-col gap-3 items-center">
              <Button
                type="button"
                variant="outline"
                onClick={() => avatarInputRef.current?.click()}
                className="h-11 px-6"
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
                  <X className="w-4 h-4 mr-2" />
                  Remove Photo
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

        {/* Help Text */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-2">
          <h4 className="font-medium text-blue-900">Why add a personal photo?</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Builds trust and personal connection with customers</li>
            <li>• Makes your business feel more approachable and human</li>
            <li>• Helps customers recognize you when they visit</li>
            <li>• Professional appearance that enhances your brand</li>
          </ul>
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
        
        <p className="text-center text-sm text-muted-foreground">
          You can skip this step and add a photo later
        </p>
      </div>
    </OnboardingLayout>
  );
};
