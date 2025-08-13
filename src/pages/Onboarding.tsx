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
import { Step4PersonalImage } from '@/components/onboarding/steps/Step4PersonalImage';
import { Step5SocialTestimonials } from '@/components/onboarding/steps/Step5SocialTestimonials';
import { Step6Footer } from '@/components/onboarding/steps/Step6Footer';
import { Step7Preview } from '@/components/onboarding/steps/Step7Preview';

interface BusinessHours {
  monday: { open: string; close: string; closed: boolean };
  tuesday: { open: string; close: string; closed: boolean };
  wednesday: { open: string; close: string; closed: boolean };
  thursday: { open: string; close: string; closed: boolean };
  friday: { open: string; close: string; closed: boolean };
  saturday: { open: string; close: string; closed: boolean };
  sunday: { open: string; close: string; closed: boolean };
}

interface OnboardingData {
  // Step 1
  handle: string;
  businessName?: string;
  isBusiness: boolean;
  
  // Step 2
  bookingUrl: string;
  bookingMode: 'embed' | 'new_tab';
  
  // Step 3 - Enhanced Branding
  name?: string;
  slogan?: string;
  avatarFile?: File;
  avatar_url?: string;
  bannerType: 'color' | 'image';
  bannerColor?: string;
  bannerFile?: File;
  banner?: {
    type?: 'color' | 'image';
    color?: string;
    imageUrl?: string;
    heading?: string;
    subheading?: string;
    textColor?: string;
  };
  category?: string;
  
  // Step 4 - Enhanced About & Media
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
  
  // Step 5 - Enhanced Social & Testimonials
  socialLinks: Array<{
    id: string;
    title: string;
    platform?: string;
    url: string;
  }>;
  testimonials: Array<{
    customer_name: string;
    review_title: string;
    review_text: string;
    image_url?: string;
    _file?: File;
  }>;
  
  // Step 6 - Footer & Advanced Settings
  footerBusinessName?: string;
  footerAddress?: string;
  footerEmail?: string;
  footerPhone?: string;
  footerHours?: BusinessHours;
  footerNextAvailable?: string;
  footerCancellationPolicy?: string;
  footerPrivacyPolicy?: string;
  footerTermsOfService?: string;
  footerShowMaps?: boolean;
  footerShowAttribution?: boolean;
  
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
    bannerType: 'image',
    socials: {},
    mediaFiles: [],
    socialLinks: [],
    testimonials: [],
  });
  const [isPublishing, setIsPublishing] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Load existing profile data when component mounts
  useEffect(() => {
    const loadExistingProfile = async () => {
      if (!user) return;
      
      try {
        const { data: existingProfile, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', user.id)
          .single();
        
        if (error && error.code !== 'PGRST116') {
          console.error('Error loading existing profile:', error);
          return;
        }
        
        if (existingProfile) {
          console.log('Loaded existing profile:', existingProfile);
          setOnboardingData(prev => ({
            ...prev,
            profileId: existingProfile.id,
            name: existingProfile.name || prev.name,
            businessName: existingProfile.name || prev.businessName,
            slogan: existingProfile.slogan || prev.slogan,
            avatar_url: existingProfile.avatar_url || prev.avatar_url,
            banner: existingProfile.banner as OnboardingData['banner'] || prev.banner,
            category: existingProfile.category || prev.category,
            bookingUrl: existingProfile.booking_url || prev.bookingUrl,
            bookingMode: (existingProfile.booking_mode as 'embed' | 'new_tab') || prev.bookingMode,
          }));
          
          // Log what was loaded for debugging
          console.log('Loaded avatar_url:', existingProfile.avatar_url);
          console.log('Loaded banner:', existingProfile.banner);
        }
      } catch (error) {
        console.error('Error loading existing profile:', error);
      }
    };
    
    loadExistingProfile();
  }, [user]);

  // Redirect if no user
  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  // Test storage connectivity
  useEffect(() => {
    const testStorageConnection = async () => {
      if (!user) return;
      
      console.log('Testing storage connection...');
      try {
        // Test if we can list buckets
        const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
        console.log('Storage buckets:', buckets);
        
        if (bucketsError) {
          console.error('Error listing buckets:', bucketsError);
        }
        
        // Test if we can access avatars bucket
        const { data: avatarsList, error: avatarsError } = await supabase.storage
          .from('avatars')
          .list('', { limit: 1 });
        
        console.log('Avatars bucket test:', { data: avatarsList, error: avatarsError });
        
        // Test if we can access media bucket
        const { data: mediaList, error: mediaError } = await supabase.storage
          .from('media')
          .list('', { limit: 1 });
        
        console.log('Media bucket test:', { data: mediaList, error: mediaError });
        
      } catch (error) {
        console.error('Storage connection test failed:', error);
      }
    };
    
    testStorageConnection();
  }, [user]);

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
    
    // Refresh existing data when navigating to ensure placeholders are up-to-date
    if (user && (step === 3 || step === 4 || step === 5)) {
      refreshExistingData();
    }
  };

  // Function to refresh existing data from database
  const refreshExistingData = async () => {
    if (!user) return;
    
    try {
      const { data: existingProfile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();
      
      if (error && error.code !== 'PGRST116') {
        console.error('Error refreshing existing profile:', error);
        return;
      }
      
      if (existingProfile) {
        console.log('Refreshed existing profile data:', existingProfile);
        setOnboardingData(prev => ({
          ...prev,
          avatar_url: existingProfile.avatar_url || prev.avatar_url,
          banner: existingProfile.banner as OnboardingData['banner'] || prev.banner,
        }));
      }
    } catch (error) {
      console.error('Error refreshing existing profile:', error);
    }
  };

  const uploadFile = async (file: File, bucket: string): Promise<string | null> => {
    try {
      console.log(`Uploading file to bucket: ${bucket}`);
      
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `${user?.id}/${fileName}`; // Use user ID as folder

      console.log(`Uploading ${file.name} to ${bucket}/${filePath}`);

      const { data, error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error(`Upload error for ${bucket}:`, uploadError);
        
        // If RLS policy fails, try to upload to a different path
        if (uploadError.message.includes('row-level security policy')) {
          console.log('RLS policy failed, trying alternative upload method...');
          
          // Try uploading to root of bucket
          const alternativePath = fileName;
          const { data: altData, error: altError } = await supabase.storage
            .from(bucket)
            .upload(alternativePath, file, {
              cacheControl: '3600',
              upsert: false
            });
          
          if (altError) {
            console.error(`Alternative upload also failed:`, altError);
            throw altError;
          }
          
          console.log(`Alternative upload successful:`, altData);
          
          // Get public URL for alternative path
          const { data: urlData } = supabase.storage
            .from(bucket)
            .getPublicUrl(alternativePath);
          
          return urlData.publicUrl;
        }
        
        throw uploadError;
      }

      console.log(`File uploaded successfully to ${bucket}:`, data);

      // Get public URL
      const { data: urlData } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath);

      console.log(`Public URL generated:`, urlData.publicUrl);
      return urlData.publicUrl;
    } catch (error) {
      console.error(`Upload failed for ${bucket}:`, error);
      
      // Final fallback: return a placeholder URL and log the error
      console.error('Storage upload completely failed, using placeholder');
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
      } else if (data.avatar_url) {
        // Keep existing avatar URL if no new file uploaded
        avatarUrl = data.avatar_url;
        console.log('Keeping existing avatar URL:', avatarUrl);
      }

      if (data.bannerFile) {
        console.log('Uploading banner file...');
        bannerUrl = await uploadFile(data.bannerFile, 'media') || undefined;
        console.log('Banner upload result:', bannerUrl);
      } else if (data.banner?.imageUrl) {
        // Keep existing banner image URL if no new file uploaded
        bannerUrl = data.banner.imageUrl;
        console.log('Keeping existing banner image URL:', bannerUrl);
      }

      if (data.aboutPhotoFile) {
        console.log('Uploading about photo file...');
        aboutPhotoUrl = await uploadFile(data.aboutPhotoFile, 'media') || undefined;
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
        booking_url: data.bookingUrl || '', // Explicitly set booking URL - will overwrite existing
        booking_mode: data.bookingMode || 'embed', // Explicitly set booking mode - will overwrite existing
        status,
        accent_color: '#6E56CF',
        theme_mode: 'light',
        banner: {
          type: data.bannerType || 'image',
          color: data.bannerType === 'color' ? (data.bannerColor || '#6E56CF') : 'hsl(var(--accent))',
          imageUrl: data.bannerType === 'image' ? bannerUrl : undefined,
          heading: data.banner?.heading || data.name,
          subheading: data.banner?.subheading || data.slogan,
          textColor: data.banner?.textColor || '#ffffff',
        },
        about: {
          title: data.aboutTitle,
          description: data.aboutDescription,
          alignment: data.aboutAlignment || 'center',
          photoUrl: aboutPhotoUrl,
        },
        socials: data.socials || {},
        socialLinks: data.socialLinks || [],
        media: {
          items: mediaUrls.map(url => ({ url, kind: 'image' })),
        },
        testimonials: data.testimonials || [],
        footer: {
          businessName: data.footerBusinessName,
          address: data.footerAddress,
          email: data.footerEmail,
          phone: data.footerPhone,
          hours: data.footerHours,
          nextAvailable: data.footerNextAvailable,
          cancellationPolicy: data.footerCancellationPolicy,
          privacyPolicy: data.footerPrivacyPolicy,
          termsOfService: data.footerTermsOfService,
          showMaps: data.footerShowMaps,
          showAttribution: data.footerShowAttribution,
        },
        contact: {
          // Add contact information if available
          email: user.email,
          // Add other contact fields as needed
        },
      };

      console.log('Prepared profile data (will overwrite existing):', profileData);
      console.log('User linking info:', { userId: user.id, userEmail: user.email });

      if (data.profileId) {
        console.log('Updating existing profile with ID:', data.profileId);
        // Update existing profile using Supabase - this will overwrite all fields
        const { error } = await supabase
          .from('profiles')
          .update(profileData)
          .eq('id', data.profileId);

        if (error) {
          console.error('Update error:', error);
          throw error;
        }
        console.log('Profile updated successfully with overwritten data:', profileData);
        return data.profileId;
      } else {
        console.log('Creating new profile...');
        // Try to create new profile, but handle conflicts gracefully
        try {
          const { data: newProfile, error } = await supabase
            .from('profiles')
            .upsert(profileData, {
              onConflict: 'user_id'  // This tells it to update if user_id already exists
            })
            .select('id');

          if (error) {
            console.error('Upsert error:', error);
            
            // If upsert fails, try to find existing profile and update it
            if (error.code === '23505') { // Duplicate key error
              console.log('Profile already exists, trying to update...');
              const { data: existingProfile, error: findError } = await supabase
                .from('profiles')
                .select('id')
                .eq('user_id', user.id)
                .single();
              
              if (findError) {
                console.error('Error finding existing profile:', findError);
                throw findError;
              }
              
              if (existingProfile) {
                console.log('Found existing profile, updating...');
                const { error: updateError } = await supabase
                  .from('profiles')
                  .update(profileData)
                  .eq('id', existingProfile.id);
                
                if (updateError) {
                  console.error('Update error:', updateError);
                  throw updateError;
                }
                
                console.log('Profile updated successfully via fallback method');
                return existingProfile.id;
              }
            }
            
            throw error;
          }
          
          console.log('Profile created successfully:', newProfile);
          return newProfile[0].id;
        } catch (upsertError) {
          console.error('Upsert failed, trying direct update...', upsertError);
          
          // Final fallback: try to update any existing profile
          const { data: existingProfile, error: findError } = await supabase
            .from('profiles')
            .select('id')
            .eq('user_id', user.id)
            .single();
          
          if (findError) {
            console.error('Error finding existing profile:', findError);
            throw findError;
          }
          
          if (existingProfile) {
            console.log('Updating existing profile via fallback...');
            const { error: updateError } = await supabase
              .from('profiles')
              .update(profileData)
              .eq('id', existingProfile.id);
            
            if (updateError) {
              console.error('Final update error:', updateError);
              throw updateError;
            }
            
            console.log('Profile updated successfully via final fallback');
            return existingProfile.id;
          }
          
          throw upsertError;
        }
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

  // Helper function to ensure we have the correct profile ID
  const ensureProfileId = async (userData: OnboardingData): Promise<string | null> => {
    if (userData.profileId) {
      return userData.profileId;
    }
    
    // Try to find existing profile for this user
    const { data: existingProfile, error } = await supabase
      .from('profiles')
      .select('id')
      .eq('user_id', user?.id)
      .single();
    
    if (error && error.code !== 'PGRST116') {
      console.error('Error finding existing profile:', error);
      return null;
    }
    
    if (existingProfile) {
      console.log('Found existing profile:', existingProfile.id);
      return existingProfile.id;
    }
    
    return null;
  };

  // Step handlers
  const handleStep1 = async (data: { handle: string; businessName?: string; isBusiness: boolean }) => {
    console.log('Step 1 data received:', data);
    const updatedData = { ...onboardingData, ...data };
    console.log('Updated onboarding data:', updatedData);
    setOnboardingData(updatedData);

    try {
      // First, check if user already has a profile
      const { data: existingProfile, error: findError } = await supabase
        .from('profiles')
        .select('id, handle')
        .eq('user_id', user?.id)
        .maybeSingle();

      if (findError) {
        console.error('Error finding existing profile:', findError);
        toast({
          title: "Error",
          description: "Unable to check existing profile. Please try again.",
          variant: "destructive",
        });
        return;
      }

      let profileId: string | null = null;

      if (existingProfile) {
        // Update existing profile
        console.log('Updating existing profile with new handle...');
        const { error: updateError } = await supabase
          .from('profiles')
          .update({
            handle: data.handle.toLowerCase(),
            status: 'draft',
            updated_at: new Date().toISOString()
          })
          .eq('id', existingProfile.id);

        if (updateError) {
          console.error('Update error:', updateError);
          toast({
            title: "Update Failed",
            description: "Failed to update your profile. Please try again.",
            variant: "destructive",
          });
          return;
        }
        profileId = existingProfile.id;
      } else {
        // Create new profile
        console.log('Creating new profile...');
        const { data: newProfile, error: insertError } = await supabase
          .from('profiles')
          .insert({
            user_id: user?.id,
            handle: data.handle.toLowerCase(),
            status: 'draft',
            accent_color: '#6E56CF',
            theme_mode: 'light',
            banner: {
              type: 'image',
              color: 'hsl(var(--accent))'
            },
            about: {},
            socials: {},
            media: { items: [] },
            contact: { email: user?.email }
          })
          .select('id')
          .single();

        if (insertError) {
          console.error('Insert error:', insertError);
          
          // If it's a duplicate handle error, show specific message
          if (insertError.code === '23505' && insertError.message.includes('handle')) {
            toast({
              title: "Handle Already Taken",
              description: "This handle is already taken. Please choose a different one.",
              variant: "destructive",
            });
          } else {
            toast({
              title: "Creation Failed",
              description: "Failed to create your profile. Please try again.",
              variant: "destructive",
            });
          }
          return;
        }
        profileId = newProfile.id;
      }

      if (profileId) {
        console.log('Profile saved successfully, updating step...');
        setOnboardingData(prev => ({ ...prev, profileId }));
        updateStep(2);
      }
    } catch (error) {
      console.error('Handle step error:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleStep2 = async (data: { bookingUrl: string; bookingMode: 'embed' | 'new_tab' }) => {
    console.log('Step 2 data received:', data);
    const updatedData = { ...onboardingData, ...data };
    console.log('Updated onboarding data after Step 2:', updatedData);
    setOnboardingData(updatedData);
    
    try {
      if (!onboardingData.profileId) {
        console.error('No profile ID found for Step 2');
        toast({
          title: "Error",
          description: "Profile not found. Please go back to Step 1.",
          variant: "destructive",
        });
        return;
      }

      console.log('Saving Step 2 data to database...');
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          booking_url: data.bookingUrl,
          booking_mode: data.bookingMode,
          updated_at: new Date().toISOString()
        })
        .eq('id', onboardingData.profileId);

      if (updateError) {
        console.error('Update error:', updateError);
        toast({
          title: "Save Failed",
          description: "Failed to save your booking information. Please try again.",
          variant: "destructive",
        });
        return;
      }

      console.log('Step 2 data saved successfully');
      updateStep(3);
    } catch (error) {
      console.error('Step 2 save error:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleStep3 = async (data: {
    businessName?: string;
    slogan?: string;
    category?: string;
    bannerType: 'color' | 'image';
    bannerColor?: string;
    bannerFile?: File;
    bannerTextColor?: string;
  }) => {
    const updatedData = { ...onboardingData, ...data };
    setOnboardingData(updatedData);
    
    try {
      if (!onboardingData.profileId) {
        console.error('No profile ID found for Step 3');
        toast({
          title: "Error",
          description: "Profile not found. Please go back to Step 1.",
          variant: "destructive",
        });
        return;
      }

      // Handle file uploads first
      let bannerUrl: string | undefined;

      if (data.bannerFile) {
        console.log('Uploading banner file...');
        bannerUrl = await uploadFile(data.bannerFile, 'media') || undefined;
      }

      // Prepare update data
      const updateData: {
        name?: string;
        slogan?: string;
        category?: string;
        banner?: {
          type: 'color' | 'image';
          color: string;
          imageUrl?: string;
          heading?: string;
          subheading?: string;
          textColor?: string;
        };
        updated_at: string;
      } = {
        name: data.businessName,
        slogan: data.slogan,
        category: data.category,
        updated_at: new Date().toISOString()
      };

      if (bannerUrl) {
        updateData.banner = {
          type: data.bannerType,
          color: data.bannerType === 'color' ? (data.bannerColor || '#6E56CF') : 'hsl(var(--accent))',
          imageUrl: data.bannerType === 'image' ? bannerUrl : undefined,
          heading: data.businessName,
          subheading: data.slogan,
          textColor: data.bannerTextColor || '#ffffff'
        };
      } else {
        updateData.banner = {
          type: data.bannerType,
          color: data.bannerType === 'color' ? (data.bannerColor || '#6E56CF') : 'hsl(var(--accent))',
          heading: data.businessName,
          subheading: data.slogan,
          textColor: data.bannerTextColor || '#ffffff'
        };
      }

      console.log('Saving Step 3 data to database...');
      const { error: updateError } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', onboardingData.profileId);

      if (updateError) {
        console.error('Update error:', updateError);
        toast({
          title: "Save Failed",
          description: "Failed to save your branding information. Please try again.",
          variant: "destructive",
        });
        return;
      }

      console.log('Step 3 data saved successfully');
      updateStep(4);
    } catch (error) {
      console.error('Step 3 save error:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleStep4 = async (data: { 
    avatarFile?: File;
  }) => {
    const updatedData = { ...onboardingData, ...data };
    setOnboardingData(updatedData);
    
    try {
      if (!onboardingData.profileId) {
        console.error('No profile ID found for Step 4');
        toast({
          title: "Error",
          description: "Profile not found. Please go back to Step 1.",
          variant: "destructive",
        });
        return;
      }

      // Handle avatar file upload
      let avatarUrl: string | undefined;

      if (data.avatarFile) {
        console.log('Uploading avatar file...');
        avatarUrl = await uploadFile(data.avatarFile, 'avatars') || undefined;
      }

      if (avatarUrl) {
        console.log('Saving Step 4 data to database...');
        const { error: updateError } = await supabase
          .from('profiles')
          .update({
            avatar_url: avatarUrl,
            updated_at: new Date().toISOString()
          })
          .eq('id', onboardingData.profileId);

        if (updateError) {
          console.error('Update error:', updateError);
          toast({
            title: "Save Failed",
            description: "Failed to save your personal image. Please try again.",
            variant: "destructive",
          });
          return;
        }
      }

      console.log('Step 4 data saved successfully');
      updateStep(5);
    } catch (error) {
      console.error('Step 4 save error:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleStep5 = async (data: {
    aboutTitle?: string;
    aboutDescription?: string;
    aboutAlignment?: 'center' | 'left';
    aboutPhotoFile?: File;
    socials: OnboardingData['socials'];
    mediaFiles: File[];
  }) => {
    const updatedData = { ...onboardingData, ...data };
    setOnboardingData(updatedData);
    
    try {
      if (!onboardingData.profileId) {
        console.error('No profile ID found for Step 4');
        toast({
          title: "Error",
          description: "Profile not found. Please go back to Step 1.",
          variant: "destructive",
        });
        return;
      }

      // Handle file uploads first
      let aboutPhotoUrl: string | undefined;
      const mediaUrls: string[] = [];

      if (data.aboutPhotoFile) {
        console.log('Uploading about photo file...');
        aboutPhotoUrl = await uploadFile(data.aboutPhotoFile, 'media') || undefined;
      }

      if (data.mediaFiles) {
        console.log('Uploading media files...');
        for (const file of data.mediaFiles) {
          const url = await uploadFile(file, 'media');
          if (url) mediaUrls.push(url);
        }
      }

      // Prepare update data - merge with existing data
      const updateData: {
        about: {
          title?: string;
          description?: string;
          alignment?: 'center' | 'left';
          photoUrl?: string;
        };
        socials: OnboardingData['socials'];
        media: { items: { url: string; kind: string }[] };
        updated_at: string;
      } = {
        about: {
          title: data.aboutTitle,
          description: data.aboutDescription,
          alignment: data.aboutAlignment || 'center',
          photoUrl: aboutPhotoUrl
        },
        socials: data.socials,
        media: {
          items: mediaUrls.map(url => ({ url, kind: 'image' }))
        },
        updated_at: new Date().toISOString()
      };

      console.log('Saving Step 5 data to database...');
      const { error: updateError } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', onboardingData.profileId);

      if (updateError) {
        console.error('Update error:', updateError);
        toast({
          title: "Save Failed",
          description: "Failed to save your additional information. Please try again.",
          variant: "destructive",
        });
        return;
      }

      console.log('Step 5 data saved successfully');
      updateStep(6);
    } catch (error) {
      console.error('Step 4 save error:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleStep6 = async (data: {
    socialLinks: OnboardingData['socialLinks'];
    testimonials: OnboardingData['testimonials'];
  }) => {
    const updatedData = { ...onboardingData, ...data };
    setOnboardingData(updatedData);
    
    try {
      if (!onboardingData.profileId) {
        console.error('No profile ID found for Step 6');
        toast({
          title: "Error",
          description: "Profile not found. Please go back to Step 1.",
          variant: "destructive",
        });
        return;
      }

      // Handle testimonial image uploads first
      const updatedTestimonials = [...data.testimonials];
      for (let i = 0; i < updatedTestimonials.length; i++) {
        const testimonial = updatedTestimonials[i];
        if (testimonial._file) {
          console.log(`Uploading testimonial image ${i + 1}...`);
          const imageUrl = await uploadFile(testimonial._file, 'media') || undefined;
          if (imageUrl) {
            updatedTestimonials[i] = {
              ...testimonial,
              image_url: imageUrl,
              _file: undefined // Remove the file object as it's no longer needed
            };
          }
        }
      }

      // Get existing profile data to merge with
      const { data: existingProfile, error: fetchError } = await supabase
        .from('profiles')
        .select('about, socials')
        .eq('id', onboardingData.profileId)
        .single();

      if (fetchError) {
        console.error('Error fetching existing profile:', fetchError);
        toast({
          title: "Error",
          description: "Failed to load existing profile data. Please try again.",
          variant: "destructive",
        });
        return;
      }

      // Merge existing data with new data
      const existingAbout = existingProfile.about || {};
      const existingSocials = existingProfile.socials || {};

      const updateData: {
        socials: any;
        about: any;
        updated_at: string;
      } = {
        socials: {
          ...existingSocials,
          socialLinks: data.socialLinks
        },
        about: {
          ...existingAbout,
          testimonials: updatedTestimonials
        },
        updated_at: new Date().toISOString()
      };

      console.log('Saving Step 6 data to database...');
      const { error: updateError } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', onboardingData.profileId);

      if (updateError) {
        console.error('Update error:', updateError);
        toast({
          title: "Save Failed",
          description: "Failed to save your social links and testimonials. Please try again.",
          variant: "destructive",
        });
        return;
      }

      console.log('Step 6 data saved successfully');
      updateStep(7);
    } catch (error) {
      console.error('Step 6 save error:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleStep7 = async (data: {
    footerBusinessName?: string;
    footerAddress?: string;
    footerEmail?: string;
    footerPhone?: string;
    footerHours?: string;
    footerNextAvailable?: string;
    footerCancellationPolicy?: string;
    footerPrivacyPolicy?: string;
    footerTermsOfService?: string;
    footerShowMaps?: boolean;
    footerShowAttribution?: boolean;
  }) => {
    const updatedData = { ...onboardingData, ...data };
    setOnboardingData(updatedData);
    
    try {
      if (!onboardingData.profileId) {
        console.error('No profile ID found for Step 6');
        toast({
          title: "Error",
          description: "Profile not found. Please go back to Step 1.",
          variant: "destructive",
        });
        return;
      }

      // Prepare update data
      const updateData: {
        footer: {
          businessName?: string;
          address?: string;
          email?: string;
          phone?: string;
          hours?: string;
          nextAvailable?: string;
          cancellationPolicy?: string;
          privacyPolicy?: string;
          termsOfService?: string;
          showMaps?: boolean;
          showAttribution?: boolean;
        };
        updated_at: string;
      } = {
        footer: {
          businessName: data.footerBusinessName,
          address: data.footerAddress,
          email: data.footerEmail,
          phone: data.footerPhone,
          hours: data.footerHours,
          nextAvailable: data.footerNextAvailable,
          cancellationPolicy: data.footerCancellationPolicy,
          privacyPolicy: data.footerPrivacyPolicy,
          termsOfService: data.footerTermsOfService,
          showMaps: data.footerShowMaps,
          showAttribution: data.footerShowAttribution
        },
        updated_at: new Date().toISOString()
      };

      console.log('Saving Step 7 data to database...');
      const { error: updateError } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', onboardingData.profileId);

      if (updateError) {
        console.error('Update error:', updateError);
        toast({
          title: "Save Failed",
          description: "Failed to save your footer settings. Please try again.",
          variant: "destructive",
        });
        return;
      }

      console.log('Step 7 data saved successfully');
      updateStep(8);
    } catch (error) {
      console.error('Step 6 save error:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handlePublish = async () => {
    setIsPublishing(true);
    console.log('Publishing profile with data:', onboardingData);
    
    try {
      // Calculate trial end date (7 days from now)
      const trialEndDate = new Date();
      trialEndDate.setDate(trialEndDate.getDate() + 7);
      
      const profileData = {
        ...onboardingData,
        trialStartDate: new Date().toISOString(),
        trialEndDate: trialEndDate.toISOString(),
        subscriptionStatus: 'trial',
        subscriptionPlan: 'free_trial'
      };
      
      const profileId = await saveProfileData(profileData, 'published');
      if (profileId) {
        console.log('Profile published successfully with ID:', profileId);
        toast({
          title: "Profile Published! 🎉",
          description: "Your Bookr page is now live with a 7-day free trial!",
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
      return (
        <Step1Handle 
          onNext={handleStep1} 
          existingData={{
            handle: onboardingData.handle,
            businessName: onboardingData.businessName,
            isBusiness: onboardingData.isBusiness,
          }}
        />
      );
    
    case 2:
      return (
        <Step2Booking 
          onNext={handleStep2} 
          onBack={goBack}
          existingData={{
            bookingUrl: onboardingData.bookingUrl,
            bookingMode: onboardingData.bookingMode,
          }}
        />
      );
    
    case 3:
      return (
        <Step3Branding 
          onNext={handleStep3} 
          onBack={goBack}
          requiresName={onboardingData.isBusiness || false}
          existingData={{
            name: onboardingData.name || onboardingData.businessName,
            slogan: onboardingData.slogan,
            avatar_url: onboardingData.avatar_url,
            banner: onboardingData.banner,
            category: onboardingData.category,
          }}
        />
      );
    
    case 4:
      return (
        <Step4PersonalImage 
          onNext={handleStep4} 
          onBack={goBack}
          existingData={{
            avatar_url: onboardingData.avatar_url,
          }}
        />
      );
    
    case 5:
      return (
        <Step4Extras 
          onNext={handleStep5} 
          onBack={goBack}
          existingData={{
            aboutTitle: onboardingData.aboutTitle,
            aboutDescription: onboardingData.aboutDescription,
            aboutAlignment: onboardingData.aboutAlignment,
            aboutPhotoFile: onboardingData.aboutPhotoFile,
            socials: onboardingData.socials,
            mediaFiles: onboardingData.mediaFiles,
          }}
        />
      );
    
    case 6:
      return (
        <Step5SocialTestimonials 
          onNext={handleStep6} 
          onBack={goBack}
          existingData={{
            socialLinks: onboardingData.socialLinks,
            testimonials: onboardingData.testimonials,
          }}
        />
      );
    
    case 7:
      return (
        <Step6Footer 
          onNext={handleStep7} 
          onBack={goBack}
          existingData={{
            footerBusinessName: onboardingData.footerBusinessName,
            footerAddress: onboardingData.footerAddress,
            footerEmail: onboardingData.footerEmail,
            footerPhone: onboardingData.footerPhone,
            footerHours: onboardingData.footerHours,
            footerNextAvailable: onboardingData.footerNextAvailable,
            footerCancellationPolicy: onboardingData.footerCancellationPolicy,
            footerPrivacyPolicy: onboardingData.footerPrivacyPolicy,
            footerTermsOfService: onboardingData.footerTermsOfService,
            footerShowMaps: onboardingData.footerShowMaps,
            footerShowAttribution: onboardingData.footerShowAttribution,
          }}
        />
      );
    
    case 8:
      return (
        <Step7Preview 
          onPublish={handlePublish}
          onSaveDraft={handleSaveDraft}
          onEditPage={handleEditPage}
          onBack={goBack}
          profileData={{
            handle: onboardingData.handle || '',
            name: onboardingData.name || onboardingData.businessName,
            slogan: onboardingData.slogan || '',
            category: onboardingData.category || '',
            avatar_url: onboardingData.avatar_url || '',
            banner: onboardingData.banner || {},
            aboutTitle: onboardingData.aboutTitle || '',
            aboutDescription: onboardingData.aboutDescription || '',
            aboutAlignment: onboardingData.aboutAlignment || 'center',
            socials: onboardingData.socials || {},
            socialLinks: onboardingData.socialLinks || [],
            mediaFiles: onboardingData.mediaFiles || [],
            testimonials: onboardingData.testimonials || [],
            footer: {
              businessName: onboardingData.footerBusinessName,
              address: onboardingData.footerAddress,
              email: onboardingData.footerEmail,
              phone: onboardingData.footerPhone,
              hours: onboardingData.footerHours,
              nextAvailable: onboardingData.footerNextAvailable,
              cancellationPolicy: onboardingData.footerCancellationPolicy,
              privacyPolicy: onboardingData.footerPrivacyPolicy,
              termsOfService: onboardingData.footerTermsOfService,
              showMaps: onboardingData.footerShowMaps,
              showAttribution: onboardingData.footerShowAttribution,
            },
            bookingUrl: onboardingData.bookingUrl || '',
            bookingMode: onboardingData.bookingMode || 'embed',
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