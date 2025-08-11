import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Step1Handle } from '@/components/onboarding/steps/Step1Handle';
import { Step2Booking } from '@/components/onboarding/steps/Step2Booking';
import { Step3Branding } from '@/components/onboarding/steps/Step3Branding';
import { Step4Extras } from '@/components/onboarding/steps/Step4Extras';
import { Step5Preview } from '@/components/onboarding/steps/Step5Preview';

interface OnboardingData {
  // Step 1
  handle: string;
  businessName?: string;
  isBusiness: boolean;
  
  // Step 2
  bookingUrl: string;
  bookingMode: 'embed' | 'new_tab';
  
  // Step 3
  name?: string;
  slogan?: string;
  avatarFile?: File;
  bannerType: 'color' | 'image';
  bannerColor?: string;
  bannerFile?: File;
  category?: string;
  
  // Step 4
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
  
  // Profile ID for updates
  profileId?: string;
}

export default function Onboarding() {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentStep = parseInt(searchParams.get('step') || '1');
  const [onboardingData, setOnboardingData] = useState<Partial<OnboardingData>>({});
  const [isPublishing, setIsPublishing] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();

  // Redirect if no user
  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  const updateStep = (step: number) => {
    setSearchParams({ step: step.toString() });
  };

  const uploadFile = async (file: File, path: string): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `${path}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('media')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('media')
        .getPublicUrl(filePath);

      return data.publicUrl;
    } catch (error) {
      console.error('Upload error:', error);
      return null;
    }
  };

  const saveProfileData = async (data: Partial<OnboardingData>, status: 'draft' | 'published' = 'draft') => {
    if (!user) return null;

    try {
      // Upload files first
      let avatarUrl: string | undefined;
      let bannerUrl: string | undefined;
      let aboutPhotoUrl: string | undefined;
      const mediaUrls: string[] = [];

      if (data.avatarFile) {
        avatarUrl = await uploadFile(data.avatarFile, 'avatars') || undefined;
      }

      if (data.bannerFile) {
        bannerUrl = await uploadFile(data.bannerFile, 'banners') || undefined;
      }

      if (data.aboutPhotoFile) {
        aboutPhotoUrl = await uploadFile(data.aboutPhotoFile, 'about') || undefined;
      }

      if (data.mediaFiles) {
        for (const file of data.mediaFiles) {
          const url = await uploadFile(file, 'media');
          if (url) mediaUrls.push(url);
        }
      }

      // Prepare profile data
      const profileData = {
        user_id: user.id,
        handle: data.handle?.toLowerCase(),
        name: data.name || (data.isBusiness ? data.businessName : undefined),
        slogan: data.slogan,
        category: data.category,
        avatar_url: avatarUrl,
        booking_url: data.bookingUrl,
        booking_mode: data.bookingMode || 'embed',
        status,
        banner: {
          type: data.bannerType || 'color',
          color: data.bannerColor,
          imageUrl: bannerUrl,
        },
        about: {
          title: data.aboutTitle,
          description: data.aboutDescription,
          photoUrl: aboutPhotoUrl,
        },
        socials: data.socials || {},
        media: {
          items: mediaUrls.map(url => ({ url, kind: 'image' })),
        },
      };

      if (data.profileId) {
        // Update existing profile
        const { error } = await supabase
          .from('profiles')
          .update(profileData)
          .eq('id', data.profileId);

        if (error) throw error;
        return data.profileId;
      } else {
        // Create new profile
        const { data: newProfile, error } = await supabase
          .from('profiles')
          .insert(profileData)
          .select('id')
          .single();

        if (error) throw error;
        return newProfile.id;
      }
    } catch (error: any) {
      console.error('Save error:', error);
      toast({
        title: "Save Error",
        description: error.message || "Failed to save profile data",
        variant: "destructive",
      });
      return null;
    }
  };

  // Step handlers
  const handleStep1 = async (data: { handle: string; businessName?: string; isBusiness: boolean }) => {
    const updatedData = { ...onboardingData, ...data };
    setOnboardingData(updatedData);

    // Create draft profile to lock handle
    const profileId = await saveProfileData(updatedData, 'draft');
    if (profileId) {
      setOnboardingData(prev => ({ ...prev, profileId }));
      updateStep(2);
    }
  };

  const handleStep2 = async (data: { bookingUrl: string; bookingMode: 'embed' | 'new_tab' }) => {
    const updatedData = { ...onboardingData, ...data };
    setOnboardingData(updatedData);
    await saveProfileData(updatedData, 'draft');
    updateStep(3);
  };

  const handleStep3 = async (data: {
    name?: string;
    slogan?: string;
    avatarFile?: File;
    bannerType: 'color' | 'image';
    bannerColor?: string;
    bannerFile?: File;
    category?: string;
  }) => {
    const updatedData = { ...onboardingData, ...data };
    setOnboardingData(updatedData);
    await saveProfileData(updatedData, 'draft');
    updateStep(4);
  };

  const handleStep4 = async (data: {
    aboutTitle?: string;
    aboutDescription?: string;
    aboutPhotoFile?: File;
    socials: any;
    mediaFiles: File[];
  }) => {
    const updatedData = { ...onboardingData, ...data };
    setOnboardingData(updatedData);
    await saveProfileData(updatedData, 'draft');
    updateStep(5);
  };

  const handlePublish = async () => {
    setIsPublishing(true);
    const profileId = await saveProfileData(onboardingData, 'published');
    if (profileId) {
      toast({
        title: "Profile Published! 🎉",
        description: "Your Bookr page is now live and ready for bookings.",
      });
    }
    setIsPublishing(false);
  };

  const handleSaveDraft = async () => {
    await saveProfileData(onboardingData, 'draft');
    toast({
      title: "Draft Saved",
      description: "Your progress has been saved. You can finish later.",
    });
    navigate('/edit');
  };

  const handleEditPage = () => {
    navigate('/edit');
  };

  // Navigation handlers
  const goBack = () => {
    if (currentStep > 1) {
      updateStep(currentStep - 1);
    }
  };

  const skipToStep5 = () => {
    updateStep(5);
  };

  // Determine if profile can be published
  const canPublish = !!(onboardingData.handle && onboardingData.bookingUrl && 
    (!onboardingData.isBusiness || onboardingData.name || onboardingData.businessName));

  if (!user) {
    return null; // Will redirect via useEffect
  }

  // Render current step
  switch (currentStep) {
    case 1:
      return <Step1Handle onNext={handleStep1} />;
    
    case 2:
      return (
        <Step2Booking 
          onNext={handleStep2} 
          onBack={goBack} 
        />
      );
    
    case 3:
      return (
        <Step3Branding 
          onNext={handleStep3} 
          onBack={goBack}
          requiresName={onboardingData.isBusiness || false}
        />
      );
    
    case 4:
      return (
        <Step4Extras 
          onNext={handleStep4} 
          onBack={goBack}
          onSkip={skipToStep5}
        />
      );
    
    case 5:
      return (
        <Step5Preview 
          onPublish={handlePublish}
          onSaveDraft={handleSaveDraft}
          onEditPage={handleEditPage}
          onBack={goBack}
          profileData={{
            handle: onboardingData.handle || '',
            name: onboardingData.name || onboardingData.businessName,
            bookingUrl: onboardingData.bookingUrl || '',
          }}
          canPublish={canPublish}
          isPublishing={isPublishing}
        />
      );
    
    default:
      // Invalid step, redirect to step 1
      updateStep(1);
      return null;
  }
}