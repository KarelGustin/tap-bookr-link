import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { OnboardingLayout } from '../OnboardingLayout';
import { Upload, User, Instagram, Facebook, Linkedin, Youtube, MessageCircle, GripVertical } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface Step4ExtrasProps {
  onNext: (data: {
    aboutTitle?: string;
    aboutDescription?: string;
    aboutAlignment?: 'center' | 'left';
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
  handle?: string;
  existingData?: {
    aboutTitle?: string;
    aboutDescription?: string;
    aboutAlignment?: 'center' | 'left';
    aboutPhotoFile?: File;
    name?: string;
    socials?: {
      instagram?: string;
      facebook?: string;
      linkedin?: string;
      youtube?: string;
      whatsapp?: string;
    };
    mediaFiles?: File[];
    whatsappNumber?: string;
    media?: {
      items: Array<{
        id: string;
        url: string;
        type: string;
        order: number;
      }>;
    };
  };
}

export const Step4Extras = ({ onNext, onBack, existingData, handle }: Step4ExtrasProps) => {
  const { t } = useLanguage();
  const [aboutTitle, setAboutTitle] = useState(existingData?.aboutTitle || '');
  const [aboutDescription, setAboutDescription] = useState(existingData?.aboutDescription || '');
  const [aboutAlignment, setAboutAlignment] = useState<'center' | 'left'>(existingData?.aboutAlignment || 'center');
  const [aboutPhotoFile, setAboutPhotoFile] = useState<File | null>(existingData?.aboutPhotoFile || null);
  const [aboutPhotoPreview, setAboutPhotoPreview] = useState<string | null>(null);
  const [socials, setSocials] = useState({
    instagram: existingData?.socials?.instagram || '',
    facebook: existingData?.socials?.facebook || '',
    linkedin: existingData?.socials?.linkedin || '',
    youtube: existingData?.socials?.youtube || '',
    whatsapp: existingData?.socials?.whatsapp || existingData?.whatsappNumber || '',
  });
  const [mediaFiles, setMediaFiles] = useState<File[]>(existingData?.mediaFiles || []);
  const [mediaPreviews, setMediaPreviews] = useState<string[]>([]);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const aboutPhotoInputRef = useRef<HTMLInputElement>(null);
  const mediaInputRef = useRef<HTMLInputElement>(null);

  // Initialize media previews from existing data
  useEffect(() => {
    if (existingData?.mediaFiles && existingData.mediaFiles.length > 0) {
      const previews = existingData.mediaFiles.map(file => URL.createObjectURL(file));
      setMediaPreviews(previews);
    } else if (existingData?.media?.items && existingData.media.items.length > 0) {
      // Use existing media from database
      const previews = existingData.media.items
        .sort((a, b) => a.order - b.order)
        .map(item => item.url);
      setMediaPreviews(previews);
    }
    
    // Initialize about photo preview from existing data
    if (existingData?.aboutPhotoFile) {
      setAboutPhotoFile(existingData.aboutPhotoFile);
    }
    
    // Cleanup function to revoke object URLs
    return () => {
      mediaPreviews.forEach(url => {
        // Only revoke URLs that were created with createObjectURL (local files)
        if (url.startsWith('blob:')) {
          URL.revokeObjectURL(url);
        }
      });
    };
  }, [existingData?.mediaFiles, existingData?.media, existingData?.aboutPhotoFile]);

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
    const newFiles = files.slice(0, 6 - mediaPreviews.length);
    
    if (newFiles.length > 0) {
      const updatedMediaFiles = [...mediaFiles, ...newFiles];
      setMediaFiles(updatedMediaFiles);
      
      // Create previews for new files
      newFiles.forEach(file => {
        const reader = new FileReader();
        reader.onload = () => setMediaPreviews(prev => [...prev, reader.result as string]);
        reader.readAsDataURL(file);
      });
    }
  };

  const removeMedia = (index: number) => {
    // Revoke the URL for the removed preview if it's a local file
    const removedPreview = mediaPreviews[index];
    if (removedPreview && removedPreview.startsWith('blob:')) {
      URL.revokeObjectURL(removedPreview);
    }
    
    // Remove from both arrays
    setMediaFiles(prev => prev.filter((_, i) => i !== index));
    setMediaPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (draggedIndex === null) return;

    const newMediaFiles = [...mediaFiles];
    const newMediaPreviews = [...mediaPreviews];
    
    const [draggedFile] = newMediaFiles.splice(draggedIndex, 1);
    const [draggedPreview] = newMediaPreviews.splice(draggedIndex, 1);
    
    newMediaFiles.splice(dropIndex, 0, draggedFile);
    newMediaPreviews.splice(dropIndex, 0, draggedPreview);
    
    setMediaFiles(newMediaFiles);
    setMediaPreviews(newMediaPreviews);
    setDraggedIndex(null);
  };

  const handleSocialChange = (platform: keyof typeof socials, value: string) => {
    setSocials(prev => ({ ...prev, [platform]: value }));
  };

  const handleSubmit = () => {
    onNext({
      aboutTitle: aboutTitle.trim() || undefined,
      aboutDescription: aboutDescription.trim() || undefined,
      aboutAlignment,
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
    { key: 'whatsapp' as const, icon: MessageCircle, label: 'WhatsApp', placeholder: existingData?.whatsappNumber || '+1234567890' },
  ];

  return (
    <OnboardingLayout
      currentStep={4}
      totalSteps={7}
      title={existingData?.aboutTitle || existingData?.socials ? t('onboarding.step4.extras.title') : t('onboarding.step4.extras.optionalTitle')}
      subtitle={existingData?.aboutTitle || existingData?.socials ? t('onboarding.step4.extras.subtitle') : t('onboarding.step4.extras.optionalSubtitle')}
      onBack={onBack}
      handle={handle}
    >
      <div className="space-y-8">
        {/* About section */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">
            {t('onboarding.step4.aboutYou.title')}
            {existingData?.aboutTitle && (
              <span className="ml-2 text-sm text-muted-foreground">
                {t('onboarding.step4.aboutYou.alreadySaved')}
              </span>
            )}
          </h3>
          
          <div className="space-y-2">
            <Label htmlFor="aboutTitle" className="text-base font-medium">
              {t('onboarding.step4.aboutYou.titleLabel')}
            </Label>
            <Input
              id="aboutTitle"
              placeholder={t('onboarding.step4.aboutTitle.placeholder', { name: existingData?.name || 'jouw bedrijf' })}
              value={aboutTitle}
              onChange={(e) => setAboutTitle(e.target.value)}
              className="rounded-lg h-12"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="aboutDescription" className="text-base font-medium">
              {t('onboarding.step4.aboutYou.descriptionLabel')}
            </Label>
            <Textarea
              id="aboutDescription"
              placeholder={t('onboarding.step4.aboutYou.descriptionPlaceholder', { name: existingData?.name || 'jouw bedrijf' })}
              value={aboutDescription}
              onChange={(e) => setAboutDescription(e.target.value)}
              className="rounded-lg min-h-[100px]"
              maxLength={200}
            />
            <p className="text-sm text-muted-foreground">
              {aboutDescription.length}/200 {t('onboarding.step4.aboutYou.characters')}
            </p>
          </div>

          {/* About Photo */}
          <div className="space-y-2">
            <Label className="text-base font-medium">
              {t('onboarding.step4.aboutPhoto.title')}
            </Label>
            <p className="text-sm text-muted-foreground">
              {t('onboarding.step4.aboutPhoto.description')}
            </p>
            
            {aboutPhotoPreview || existingData?.aboutPhotoFile ? (
              <div className="space-y-2">
                <div className="w-32 h-32 rounded-lg overflow-hidden border">
                  <img 
                    src={aboutPhotoPreview || (existingData?.aboutPhotoFile ? URL.createObjectURL(existingData.aboutPhotoFile) : '')} 
                    alt="About photo preview" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => aboutPhotoInputRef.current?.click()}
                  >
                    {t('onboarding.step4.aboutPhoto.changePhoto')}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setAboutPhotoFile(null);
                      setAboutPhotoPreview(null);
                    }}
                  >
                    {t('onboarding.step4.aboutPhoto.removePhoto')}
                  </Button>
                </div>
              </div>
            ) : (
              <Button
                type="button"
                variant="outline"
                onClick={() => aboutPhotoInputRef.current?.click()}
                className="w-full h-12 border-dashed"
              >
                <Upload className="w-4 h-4 mr-2" />
                {t('onboarding.step4.aboutPhoto.uploadPhoto')}
              </Button>
            )}
            
            <input
              ref={aboutPhotoInputRef}
              type="file"
              accept="image/*"
              onChange={handleAboutPhotoChange}
              className="hidden"
            />
          </div>
        </div>

        {/* Social links */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">
            {t('onboarding.step4.socialLinks.title')}
            {existingData?.socials && Object.values(existingData.socials).some(s => s) && (
              <span className="ml-2 text-sm text-muted-foreground">
                {t('onboarding.step4.aboutYou.alreadySaved')}
              </span>
            )}
          </h3>
          
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
            <h3 className="text-lg font-semibold">{t('onboarding.step4.mediaGallery.title')}</h3>
            <p className="text-sm text-muted-foreground">
              {mediaPreviews.length}/6 {t('onboarding.step4.mediaGallery.images')}
            </p>
          </div>
          
          <p className="text-sm text-muted-foreground">
            {existingData?.media?.items && existingData.media.items.length > 0 
              ? t('onboarding.step4.mediaGallery.existingDescription')
              : t('onboarding.step4.mediaGallery.uploadDescription')
            }
          </p>

          {mediaPreviews.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                {t('onboarding.step4.mediaGallery.dragDropDescription')}
              </p>
              <div className="grid grid-cols-3 gap-2">
                {mediaPreviews.map((preview, index) => (
                  <div
                    key={index}
                    className={`relative group cursor-move ${
                      draggedIndex === index ? 'opacity-50 scale-95' : ''
                    }`}
                    draggable
                    onDragStart={(e) => handleDragStart(e, index)}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, index)}
                    onDragEnd={() => setDraggedIndex(null)}
                  >
                    <img 
                      src={preview} 
                      alt={`${t('onboarding.step4.mediaGallery.mediaAlt')} ${index + 1}`} 
                      className="w-full aspect-square object-cover rounded-lg"
                    />
                    <div className="absolute top-1 left-1 bg-black/70 text-white text-xs px-1 py-0.5 rounded">
                      {index + 1}
                    </div>
                    <div className="absolute top-1 right-1 bg-black/70 text-white p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                      <GripVertical className="w-3 h-3" />
                    </div>
                    <button
                      onClick={() => removeMedia(index)}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {mediaPreviews.length < 6 && (
            <Button
              type="button"
              variant="outline"
              onClick={() => mediaInputRef.current?.click()}
              className="w-full h-12 border-dashed"
            >
              <Upload className="w-4 h-4 mr-2" />
              {t('onboarding.step4.mediaGallery.addMedia')} ({6 - mediaPreviews.length} {t('onboarding.step4.mediaGallery.remaining')})
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

        {/* Mobile Preview */}
        {(aboutTitle || aboutDescription || aboutPhotoPreview || Object.values(socials).some(s => s) || mediaPreviews.length > 0) && (
          <div className="space-y-3">
            <Label className="text-base font-medium">
              {t('onboarding.step4.preview.title')}
            </Label>
            <div className="border rounded-lg overflow-hidden bg-white">
              <div className="bg-gray-100 p-3 border-b">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  </div>
                  <div className="text-xs text-gray-600">{t('common.urlPrefix')}yourhandle</div>
                </div>
              </div>
              
              <div className="space-y-0">
                {/* About Section */}
                {(aboutTitle || aboutDescription || aboutPhotoPreview) && (
                  <div className="p-4 bg-gray-50">
                    {aboutPhotoPreview && (
                      <div className="flex justify-center mb-3">
                        <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-white shadow-md">
                          <img 
                            src={aboutPhotoPreview} 
                            alt="About photo" 
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </div>
                    )}
                    {aboutTitle && (
                      <h2 className="text-lg font-semibold text-center mb-2">{aboutTitle}</h2>
                    )}
                    {aboutDescription && (
                      <p className="text-sm text-gray-600 text-center leading-relaxed">{aboutDescription}</p>
                    )}
                  </div>
                )}
                
                {/* Social Links */}
                {Object.values(socials).some(s => s) && (
                  <div className="p-4 border-b">
                    <h3 className="text-sm font-medium text-gray-700 mb-3 text-center">{t('onboarding.step4.preview.socialTitle')}</h3>
                    <div className="flex flex-wrap justify-center gap-3">
                      {socialPlatforms.map(({ key, icon: Icon, label }) => {
                        if (socials[key]) {
                          return (
                            <div key={key} className="flex items-center space-x-2 px-3 py-2 bg-gray-100 rounded-full text-xs">
                              <Icon className="w-4 h-4" />
                              <span className="text-gray-700">{label}</span>
                            </div>
                          );
                        }
                        return null;
                      })}
                    </div>
                  </div>
                )}
                
                {/* Media Gallery - Horizontal Slider */}
                {mediaPreviews.length > 0 && (
                  <div className="p-4">
                    <h3 className="text-sm font-medium text-gray-700 mb-3 text-center">{t('onboarding.step4.preview.mediaTitle')}</h3>
                    <div className="flex space-x-4 overflow-x-auto pb-2" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                      {mediaPreviews.map((preview, index) => (
                        <div key={index} className="flex-shrink-0 w-64 h-80 rounded-lg overflow-hidden border shadow-sm relative">
                          <img src={preview} alt={`Work ${index + 1}`} className="w-full h-full object-cover" />
                          <div className="absolute top-2 left-2 bg-black/70 text-white text-sm px-2 py-1 rounded">
                            {index + 1}
                          </div>
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-gray-500 text-center mt-2">
                      {t('onboarding.step4.preview.swipeText', { count: mediaPreviews.length.toString() })}
                    </p>
                  </div>
                )}
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              {t('onboarding.step4.preview.description')}
            </p>
          </div>
        )}

        {/* Continue button */}
        <Button 
          onClick={handleSubmit}
          className="w-full h-12 text-base rounded-lg"
          size="lg"
        >
          {existingData?.aboutTitle || existingData?.socials || existingData?.media?.items?.length > 0 ? t('onboarding.step4.continueWithSaved') : t('onboarding.step4.continue')}
        </Button>
        
        <p className="text-center text-sm text-muted-foreground">
          {t('onboarding.step4.autoSaveNote')}
        </p>
      </div>
    </OnboardingLayout>
  );
};