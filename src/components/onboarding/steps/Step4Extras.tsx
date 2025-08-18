import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { OnboardingLayout } from '../OnboardingLayout';
import { Upload, User, Instagram, Facebook, Linkedin, Youtube, MessageCircle, GripVertical } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { toast } from '@/components/ui/use-toast';

interface Step4ExtrasProps {
  onNext: (data: {
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
    // Support different media formats from DB - flexible typing
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    media?: any;
    // Add fields from Step4PersonalImage
    aboutTitle?: string;
    aboutDescription?: string;
    avatar_url?: string;
  };
}

export const Step4Extras = ({ onNext, onBack, handle, existingData }: Step4ExtrasProps) => {
  const { t } = useLanguage();
  const [aboutAlignment, setAboutAlignment] = useState<'center' | 'left'>(existingData?.aboutAlignment || 'center');
  const [aboutPhotoFile, setAboutPhotoFile] = useState<File | null>(existingData?.aboutPhotoFile || null);
  const [aboutPhotoPreview, setAboutPhotoPreview] = useState<string | null>(null);
  const [socials, setSocials] = useState({
    instagram: existingData?.socials?.instagram || '',
    facebook: existingData?.socials?.facebook || '',
    linkedin: existingData?.socials?.linkedin || '',
    youtube: existingData?.socials?.youtube || '',
    whatsapp: existingData?.socials?.whatsapp || '',
  });
  const [mediaFiles, setMediaFiles] = useState<File[]>(existingData?.mediaFiles || []);
  const [mediaPreviews, setMediaPreviews] = useState<string[]>([]);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [isUploadingMedia, setIsUploadingMedia] = useState(false);

  const aboutPhotoInputRef = useRef<HTMLInputElement>(null);
  const mediaInputRef = useRef<HTMLInputElement>(null);

  // Get about content from Step4PersonalImage
  const aboutTitle = existingData?.aboutTitle || t('onboarding.step4.aboutYou.title');
  const aboutDescription = existingData?.aboutDescription || t('onboarding.step4.aboutYou.subtitle');
  const avatarUrl = existingData?.avatar_url;

  // Helper: extract possible media URLs from various DB shapes
  const extractMediaUrls = (raw: unknown): string[] => {
    const urls: string[] = [];
    const pushFromObject = (obj: Record<string, unknown>) => {
      if (typeof obj.url === 'string') urls.push(obj.url);
      else if (typeof obj.imageUrl === 'string') urls.push(obj.imageUrl);
      else if (typeof (obj as Record<string, unknown>).image_url === 'string') urls.push((obj as Record<string, unknown>).image_url as string);
      else if (typeof (obj as Record<string, unknown>).file_url === 'string') urls.push((obj as Record<string, unknown>).file_url as string);
    };
    if (!raw) return urls;
    if (Array.isArray(raw)) {
      raw.forEach(item => {
        if (typeof item === 'string') urls.push(item);
        else if (typeof item === 'object' && item !== null) pushFromObject(item as Record<string, unknown>);
      });
      return urls;
    }
    if (typeof raw === 'object') {
      const obj = raw as Record<string, unknown>;
      // Common shapes: { items: [...] }, { media: [...] }, { files: [...] }
      if (Array.isArray(obj.items)) {
        (obj.items as unknown[]).forEach(item => {
          if (typeof item === 'string') urls.push(item);
          else if (typeof item === 'object' && item !== null) pushFromObject(item as Record<string, unknown>);
        });
      } else if (Array.isArray(obj.media)) {
        (obj.media as unknown[]).forEach(item => {
          if (typeof item === 'string') urls.push(item);
          else if (typeof item === 'object' && item !== null) pushFromObject(item as Record<string, unknown>);
        });
      } else if (Array.isArray(obj.files)) {
        (obj.files as unknown[]).forEach(item => {
          if (typeof item === 'string') urls.push(item);
          else if (typeof item === 'object' && item !== null) pushFromObject(item as Record<string, unknown>);
        });
      } else {
        // Single object fallback
        pushFromObject(obj);
      }
    }
    return urls;
  };

  useEffect(() => {
    // Initialize media previews from existing data (robust to different shapes)
    const rawMedia = existingData?.media as unknown;
    const urls = extractMediaUrls(rawMedia);
    if (urls.length > 0) {
      setMediaPreviews(urls);
    }
    
    // Initialize about photo preview from existing data
    if (existingData?.aboutPhotoFile) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setAboutPhotoPreview(e.target?.result as string);
      };
      reader.readAsDataURL(existingData.aboutPhotoFile);
    }
  }, [existingData]);

  // Keep socials in sync if existingData updates after mount (supports object or array shapes)
  useEffect(() => {
    const raw = existingData?.socials as unknown;
    if (!raw) return;
    const next = { ...socials };

    if (Array.isArray(raw)) {
      for (const item of raw) {
        if (typeof item === 'object' && item !== null) {
          const obj = item as Record<string, unknown>;
          const platform = (obj.platform || obj.title) as string | undefined;
          const url = obj.url as string | undefined;
          if (platform && url) {
            const key = platform.toLowerCase();
            if (key.includes('insta')) next.instagram = url;
            else if (key.includes('face')) next.facebook = url;
            else if (key.includes('link')) next.linkedin = url;
            else if (key.includes('you')) next.youtube = url;
            else if (key.includes('whats') || key.includes('wa.me')) next.whatsapp = url;
          }
        }
      }
      setSocials(next);
      return;
    }

    // Object shape (platform: url)
    if (typeof raw === 'object' && raw !== null) {
      const obj = raw as Record<string, unknown>;
      setSocials(prev => ({
        instagram: typeof obj.instagram === 'string' ? obj.instagram : prev.instagram,
        facebook: typeof obj.facebook === 'string' ? obj.facebook : prev.facebook,
        linkedin: typeof obj.linkedin === 'string' ? obj.linkedin : prev.linkedin,
        youtube: typeof obj.youtube === 'string' ? obj.youtube : prev.youtube,
        whatsapp: typeof obj.whatsapp === 'string' ? obj.whatsapp : prev.whatsapp,
      }));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [existingData?.socials]);

  // Sync media previews with existingData changes
  useEffect(() => {
    const rawMedia = existingData?.media as unknown;
    const urls = extractMediaUrls(rawMedia);
    
    console.log('🔧 Media sync - Raw media:', rawMedia);
    console.log('🔧 Media sync - Extracted URLs:', urls);
    
    if (urls.length > 0) {
      setMediaPreviews(urls);
    } else {
      // Reset to empty if no media in existingData
      setMediaPreviews([]);
      setMediaFiles([]);
    }
  }, [existingData?.media]);

  const handleAboutPhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAboutPhotoFile(file);
      const reader = new FileReader();
      reader.onload = () => setAboutPhotoPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleMediaChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    // Check if adding these files would exceed the limit (count existing previews + new files)
    const currentCount = mediaPreviews.length;
    const maxAllowed = 6;
    const availableSlots = maxAllowed - currentCount;
    
    if (availableSlots <= 0) {
      // Show error message that limit is reached
      toast({
        title: "Maximum bereikt",
        description: "Je kunt maximaal 6 afbeeldingen toevoegen. Verwijder eerst een afbeelding om een nieuwe toe te voegen.",
        variant: "destructive",
      });
      return;
    }
    
    // Only take the files that fit within the limit
    const newFiles = files.slice(0, availableSlots);
    
    if (newFiles.length > 0) {
      setIsUploadingMedia(true);
      
      try {
        const updatedMediaFiles = [...mediaFiles, ...newFiles];
        setMediaFiles(updatedMediaFiles);
        
        // Create previews for new files
        const previewPromises = newFiles.map(file => {
          return new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.readAsDataURL(file);
          });
        });
        
        // Wait for all previews to be created
        const newPreviews = await Promise.all(previewPromises);
        setMediaPreviews(prev => [...prev, ...newPreviews]);
        
        // Show success message
        if (newFiles.length < files.length) {
          toast({
            title: "Afbeeldingen toegevoegd",
            description: `${newFiles.length} van ${files.length} afbeeldingen toegevoegd. Maximum van 6 afbeeldingen bereikt.`,
          });
        } else {
          toast({
            title: "Afbeeldingen toegevoegd",
            description: `${newFiles.length} afbeeldingen toegevoegd.`,
          });
        }
      } catch (error) {
        console.error('Error processing media files:', error);
        toast({
          title: "Fout bij verwerken",
          description: "Er is een fout opgetreden bij het verwerken van de afbeeldingen. Probeer het opnieuw.",
          variant: "destructive",
        });
      } finally {
        setIsUploadingMedia(false);
      }
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
      aboutAlignment,
      aboutPhotoFile: aboutPhotoFile || undefined,
      socials: Object.fromEntries(
        Object.entries(socials).filter(([_, value]) => value.trim())
      ),
      mediaFiles,
    });
  };

  // Users can always proceed from this step, even without media
  // But block if currently uploading media
  const canGoNext = !isUploadingMedia;

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
      title={aboutTitle}
      subtitle={aboutDescription}
      onBack={onBack}
      handle={handle}
      canGoNext={canGoNext}
    >
      <div className="space-y-8">
        {/* About section */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">
            {t('onboarding.step4.aboutYou.title')}
            {existingData?.aboutAlignment && (
              <span className="ml-2 text-sm text-muted-foreground">
                {t('onboarding.step4.aboutYou.alreadySaved')}
              </span>
            )}
          </h3>
          
          {/* About Photo */}
          {/* <div className="space-y-2">
            <Label className="text-base font-medium">
              Upload een foto van jezelf
            </Label>
            <p className="text-sm text-muted-foreground">
              Een foto van jezelf of je bedrijf. Zorgt ervoor dat je profiel meer persoonlijkheid krijgt.
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
                    Verander foto
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
                    Verwijder foto
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
                Upload een foto
              </Button>
            )}
            
            <input
              ref={aboutPhotoInputRef}
              
              type="file"
              accept="image/*"
              onChange={handleAboutPhotoChange}
              className="hidden"
            />
          </div> */}
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
            {(() => {
              const totalMediaCount = mediaPreviews.length;
              return (
                <p className="text-sm text-muted-foreground">
                  {totalMediaCount}/6 {t('onboarding.step4.mediaGallery.images')}
                </p>
              );
            })()}
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

          {/* Upload button - always visible but disabled when limit reached */}
          {(() => {
            const totalMediaCount = mediaPreviews.length;
            return (
              <Button
                type="button"
                variant="outline"
                onClick={() => mediaInputRef.current?.click()}
                disabled={totalMediaCount >= 6 || isUploadingMedia}
                className={`w-full h-12 border-dashed ${
                  totalMediaCount >= 6 || isUploadingMedia
                    ? 'opacity-50 cursor-not-allowed bg-gray-100' 
                    : 'hover:bg-gray-50'
                }`}
              >
                {isUploadingMedia ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-2"></div>
                    Uploaden...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    {totalMediaCount >= 6 
                      ? `Maximum bereikt (6/6 afbeeldingen)`
                      : `${t('onboarding.step4.mediaGallery.addMedia')} (${6 - totalMediaCount} ${t('onboarding.step4.mediaGallery.remaining')})`
                    }
                  </>
                )}
              </Button>
            );
          })()}
          
          {/* Help text */}
          {(() => {
            const totalMediaCount = mediaPreviews.length;
            return (
              <p className="text-xs text-muted-foreground text-center">
                {totalMediaCount >= 6 
                  ? "Verwijder eerst een afbeelding om een nieuwe toe te voegen"
                  : "Sleep afbeeldingen om de volgorde te wijzigen"
                }
              </p>
            );
          })()}
          
          <input
            ref={mediaInputRef}
            type="file"
            accept="image/*,video/*"
            multiple
            onChange={handleMediaChange}
            className="hidden"
          />
        </div>

        {/* Preview Section - Only show when there's content */}
        {(aboutTitle || aboutDescription || aboutPhotoPreview || avatarUrl || mediaPreviews.length > 0 || Object.values(socials).some(s => s)) && (
          <div className="space-y-3">
            <Label className="text-base font-medium">
              Preview
            </Label>
            <div className="border rounded-lg overflow-hidden bg-white">
              <div className="bg-gray-100 p-3 border-b">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  </div>
                  <div className="text-xs text-gray-600">{t('common.urlPrefix')}{handle || 'yourhandle'}</div>
                </div>
              </div>
              
              <div className="space-y-0">
                {/* About Section */}
                {(aboutTitle || aboutDescription || aboutPhotoPreview || avatarUrl) && (
                  <div className="p-4 bg-gray-50">
                    {(aboutPhotoPreview || avatarUrl) && (
                      <div className="flex justify-center mb-3">
                        <div className="w-16 h-16 rounded-lg overflow-hidden border-2 border-white shadow-md">
                          <img 
                            src={aboutPhotoPreview || avatarUrl || ''} 
                            alt="About photo" 
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              console.error('Error loading about photo:', e);
                            }}
                          />
                        </div>
                      </div>
                    )}
                    {aboutTitle && (
                      <h2 className="text-lg font-semibold text-center mb-2">
                        {aboutTitle}
                      </h2>
                    )}
                    {aboutDescription && (
                      <p className="text-sm text-gray-600 text-center leading-relaxed">
                        {aboutDescription}
                      </p>
                    )}
                  </div>
                )}
                
                {/* Social Links */}
                {Object.values(socials).some(s => s) && (
                  <div className="p-4 border-b">
                    <h3 className="text-sm font-medium text-gray-700 mb-3 text-center">Social Media</h3>
                    <div className="flex flex-wrap justify-center gap-3">
                      {socialPlatforms.map(({ key, icon: Icon, label }) => {
                        if (socials[key]) {
                          return (
                            <div key={key} className="flex items-center space-x-2 px-3 py-2 bg-gray-100 rounded-full text-xs">
                              <Icon className="w-4 h-4" />
                              <span className="text-gray-700">{label}</span>
                              {socials[key] && (
                                <span className="text-gray-500 text-xs truncate max-w-20">
                                  {socials[key].includes('http') ? '✓' : '...'}
                                </span>
                              )}
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
                    <h3 className="text-sm font-medium text-gray-700 mb-3 text-center">Werk & Resultaten</h3>
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
                      {mediaPreviews.length} {mediaPreviews.length === 1 ? 'afbeelding' : 'afbeeldingen'}
                    </p>
                  </div>
                )}
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              Dit is een preview van je profiel. Je kunt deze wijzigen totdat je pagina wordt gepubliceerd.
            </p>
          </div>
        )}

        {/* Continue button */}
        <Button 
          onClick={handleSubmit}
          disabled={!canGoNext}
          className="w-full h-12 text-base rounded-lg"
          size="lg"
        >
          {isUploadingMedia ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Uploaden...
            </>
          ) : (
            (aboutTitle || aboutDescription || aboutPhotoPreview || avatarUrl || mediaPreviews.length > 0 || Object.values(socials).some(s => s)) ? "Verder gaan" : "Voltooien"
          )}
        </Button>
        
        <p className="text-center text-sm text-muted-foreground">
          Je kunt je profiel wijzigen totdat je pagina wordt gepubliceerd.
        </p>
      </div>
    </OnboardingLayout>
  );
};