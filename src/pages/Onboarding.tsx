import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { OnboardingLayout } from '@/components/onboarding/OnboardingLayout';
import { OnboardingProgress } from '@/components/onboarding/OnboardingProgress';
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
  const [currentStep, setCurrentStep] = useState(1);
  const [onboardingData, setOnboardingData] = useState<OnboardingData>({
    handle: '',
    isBusiness: false,
    bookingUrl: '',
    bookingMode: 'embed',
    bannerType: 'color',
    socials: {},
    mediaFiles: [],
  });
  const [isPublishing, setIsPublishing] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Redirect if no user
  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  // Test database connection and policies
  useEffect(() => {
    const testDatabaseConnection = async () => {
      if (!user) return;
      
      console.log('Testing database connection...');
      try {
        // Test if we can read from profiles table
        const { data: readTest, error: readError } = await supabase
          .from('profiles')
          .select('id')
          .limit(1);
        
        console.log('Read test result:', { data: readTest, error: readError });
        
        // Test if we can insert a test record (it will be rolled back)
        const { data: insertTest, error: insertError } = await supabase
          .from('profiles')
          .insert({
            user_id: user.id,
            handle: 'test-handle-' + Date.now(),
            status: 'draft'
          })
          .select('id');
        
        console.log('Insert test result:', { data: insertTest, error: insertError });
        
        // Clean up test record
        if (insertTest?.[0]?.id) {
          await supabase
            .from('profiles')
            .delete()
            .eq('id', insertTest[0].id);
        }
        
      } catch (error) {
        console.error('Database connection test failed:', error);
      }
    };
    
    testDatabaseConnection();
  }, [user]);

  const updateStep = (step: number) => {
    setCurrentStep(step);
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
    console.log('saveProfileData called with:', { data, status, user: user?.id });
    
    if (!user) {
      console.log('No user found, returning null');
      return null;
    }

    try {
      console.log('Starting file uploads...');
      // Upload files first
      let avatarUrl: string | undefined;
      let bannerUrl: string | undefined;
      let aboutPhotoUrl: string | undefined;
      const mediaUrls: string[] = [];

      if (data.avatarFile) {
        console.log('Uploading avatar file...');
        avatarUrl = await uploadFile(data.avatarFile, 'avatars') || undefined;
        console.log('Avatar upload result:', avatarUrl);
      }

      if (data.bannerFile) {
        console.log('Uploading banner file...');
        bannerUrl = await uploadFile(data.bannerFile, 'banners') || undefined;
        console.log('Banner upload result:', bannerUrl);
      }

      if (data.aboutPhotoFile) {
        console.log('Uploading about photo file...');
        aboutPhotoUrl = await uploadFile(data.aboutPhotoFile, 'about') || undefined;
        console.log('About photo upload result:', aboutPhotoUrl);
      }

      if (data.mediaFiles) {
        console.log('Uploading media files...');
        for (const file of data.mediaFiles) {
          const url = await uploadFile(file, 'media');
          if (url) mediaUrls.push(url);
        }
        console.log('Media files upload result:', mediaUrls);
      }

      // Determine the name field - prioritize business name for businesses
      let displayName: string | undefined;
      if (data.isBusiness && data.businessName) {
        displayName = data.businessName;
      } else if (data.name) {
        displayName = data.name;
      }

      // Prepare profile data matching Supabase schema
      const profileData = {
        user_id: user.id, // This links the profile to the logged-in user
        handle: data.handle?.toLowerCase() || '',
        name: displayName, // Use business name for businesses, personal name for individuals
        slogan: data.slogan,
        category: data.category,
        avatar_url: avatarUrl,
        booking_url: data.bookingUrl,
        booking_mode: data.bookingMode || 'embed',
        status,
        accent_color: '#6E56CF',
        theme_mode: 'light',
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
        contact: {
          // Add contact information if available
          email: user.email,
          // Add other contact fields as needed
        },
      };

      console.log('Prepared profile data:', profileData);
      console.log('User linking info:', { userId: user.id, userEmail: user.email });

      if (data.profileId) {
        console.log('Updating existing profile with ID:', data.profileId);
        // Update existing profile using Supabase
        const { error } = await supabase
          .from('profiles')
          .update(profileData)
          .eq('id', data.profileId);

        if (error) {
          console.error('Update error:', error);
          throw error;
        }
        console.log('Profile updated successfully');
        return data.profileId;
      } else {
        console.log('Creating new profile...');
        // Create new profile using Supabase
        const { data: newProfile, error } = await supabase
          .from('profiles')
          .insert(profileData)
          .select('id')
          .single();

        if (error) {
          console.error('Insert error:', error);
          throw error;
        }
        console.log('Profile created successfully:', newProfile);
        return newProfile.id;
      }
    } catch (error) {
      console.error('Save error:', error);
      toast({
        title: "Save Error",
        description: error instanceof Error ? error.message : "Failed to save profile data",
        variant: "destructive",
      });
      return null;
    }
  };

  // Step handlers
  const handleStep1 = async (data: { handle: string; businessName?: string; isBusiness: boolean }) => {
    console.log('Step 1 data received:', data);
    const updatedData = { ...onboardingData, ...data };
    console.log('Updated onboarding data:', updatedData);
    setOnboardingData(updatedData);

    // Create draft profile to lock handle
    console.log('Attempting to save profile data...');
    const profileId = await saveProfileData(updatedData, 'draft');
    console.log('Profile save result:', profileId);
    
    if (profileId) {
      console.log('Profile saved successfully, updating step...');
      setOnboardingData(prev => ({ ...prev, profileId }));
      updateStep(2);
    } else {
      console.log('Profile save failed');
      toast({
        title: "Save Failed",
        description: "Failed to save your profile. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleStep2 = async (data: { bookingUrl: string; bookingMode: 'embed' | 'new_tab' }) => {
    const updatedData = { ...onboardingData, ...data };
    setOnboardingData(updatedData);
    
    // Save progress
    const profileId = await saveProfileData(updatedData, 'draft');
    if (profileId) {
      setOnboardingData(prev => ({ ...prev, profileId }));
      updateStep(3);
    } else {
      toast({
        title: "Save Failed",
        description: "Failed to save your booking information. Please try again.",
        variant: "destructive",
      });
    }
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
    
    // Save progress
    const profileId = await saveProfileData(updatedData, 'draft');
    if (profileId) {
      setOnboardingData(prev => ({ ...prev, profileId }));
      updateStep(4);
    } else {
      toast({
        title: "Save Failed",
        description: "Failed to save your branding information. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleStep4 = async (data: {
    aboutTitle?: string;
    aboutDescription?: string;
    aboutPhotoFile?: File;
    socials: OnboardingData['socials'];
    mediaFiles: File[];
  }) => {
    const updatedData = { ...onboardingData, ...data };
    setOnboardingData(updatedData);
    
    // Save progress
    const profileId = await saveProfileData(updatedData, 'draft');
    if (profileId) {
      setOnboardingData(prev => ({ ...prev, profileId }));
      updateStep(5);
    } else {
      toast({
        title: "Save Failed",
        description: "Failed to save your additional information. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handlePublish = async () => {
    setIsPublishing(true);
    console.log('Publishing profile with data:', onboardingData);
    
    try {
      const profileId = await saveProfileData(onboardingData, 'published');
      if (profileId) {
        console.log('Profile published successfully with ID:', profileId);
        toast({
          title: "Profile Published! 🎉",
          description: "Your Bookr page is now live and ready for bookings.",
        });
        // Redirect to dashboard after successful publishing
        navigate('/dashboard');
      } else {
        console.log('Profile publishing failed');
        toast({
          title: "Publishing Failed",
          description: "Failed to publish your profile. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Publishing error:', error);
      toast({
        title: "Publishing Error",
        description: "An error occurred while publishing your profile.",
        variant: "destructive",
      });
    } finally {
      setIsPublishing(false);
    }
  };

  const handleSaveDraft = async () => {
    try {
      const profileId = await saveProfileData(onboardingData, 'draft');
      if (profileId) {
        toast({
          title: "Draft Saved",
          description: "Your progress has been saved. You can finish later.",
        });
        navigate('/dashboard');
      } else {
        toast({
          title: "Save Failed",
          description: "Failed to save your draft. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Draft save error:', error);
      toast({
        title: "Save Error",
        description: "An error occurred while saving your draft.",
        variant: "destructive",
      });
    }
  };

  const handleEditPage = () => {
    navigate('/dashboard');
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
  const canPublish = () => {
    const requiredFields = [
      onboardingData.handle,
      onboardingData.bookingUrl,
    ];
    
    // For businesses, require business name
    if (onboardingData.isBusiness) {
      requiredFields.push(onboardingData.businessName);
    }
    
    // For individuals, require personal name
    if (!onboardingData.isBusiness) {
      requiredFields.push(onboardingData.name);
    }
    
    // Check if all required fields are filled
    const hasAllRequired = requiredFields.every(field => field && field.trim().length > 0);
    
    console.log('Publish validation:', {
      requiredFields,
      hasAllRequired,
      isBusiness: onboardingData.isBusiness,
      businessName: onboardingData.businessName,
      personalName: onboardingData.name
    });
    
    return hasAllRequired;
  };

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
          canPublish={canPublish()}
          isPublishing={isPublishing}
        />
      );
    
    default:
      // Invalid step, redirect to step 1
      updateStep(1);
      return null;
  }
}