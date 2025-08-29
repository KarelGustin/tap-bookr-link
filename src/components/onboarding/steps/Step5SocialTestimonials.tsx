import { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, X, Star, MessageCircle, Share2, Upload, User } from 'lucide-react';
import { OnboardingLayout } from '../OnboardingLayout';
import { supabase } from '../../../integrations/supabase/client';
import { useToast } from '../../../hooks/use-toast';
import { sanitizeFilename } from '../../../lib/utils';
import { useAuth } from '../../../contexts/AuthContext';

interface Step5SocialTestimonialsProps {
  onNext: (data: {
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
  }) => void;
  onBack: () => void;
  handle?: string;
  existingData: {
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
  };
}

export const Step5SocialTestimonials = ({ onNext, onBack, existingData, handle }: Step5SocialTestimonialsProps) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [socialLinks, setSocialLinks] = useState(existingData.socialLinks.length > 0 ? existingData.socialLinks : [
    { id: '1', title: 'Instagram', platform: 'instagram', url: '' },
    { id: '2', title: 'Facebook', platform: 'facebook', url: '' },
    { id: '3', title: 'LinkedIn', platform: 'linkedin', url: '' },
    { id: '4', title: 'YouTube', platform: 'youtube', url: '' },
  ]);
  const [testimonials, setTestimonials] = useState(existingData.testimonials.length > 0 ? existingData.testimonials : [
    {
      customer_name: '',
      review_title: 'Geweldige service!',
      review_text: 'Ze overtrof mijn verwachtingen volledig.',
      image_url: '',
    },
    {
      customer_name: '',
      review_title: 'Fantastische ervaring',
      review_text: 'Zeer professioneel en betrouwbaar.',
      image_url: '',
    },
  ]);
  const [isSaving, setIsSaving] = useState(false);

  // Auto-save function for testimonials
  const autoSaveTestimonials = useCallback(async (updatedTestimonials: typeof testimonials) => {
    if (!handle) {
      console.log('🔧 No handle available for auto-save');
      return;
    }

    setIsSaving(true);
    try {
      console.log('🔧 Auto-saving testimonials:', updatedTestimonials);
      
      // Find the profile by handle
      const { data: profile, error: findError } = await supabase
        .from('profiles')
        .select('id')
        .eq('handle', handle)
        .single();

      if (findError) {
        console.error('❌ Error finding profile for auto-save:', findError);
        return;
      }

      if (profile) {
        // Clean testimonials data by removing _file property
        const cleanTestimonials = updatedTestimonials.map(testimonial => {
          const { _file, ...cleanTestimonial } = testimonial;
          return cleanTestimonial;
        });

        // Save to testimonials column
        const { error: updateError } = await supabase
          .from('profiles')
          .update({
            testimonials: cleanTestimonials,
            updated_at: new Date().toISOString()
          })
          .eq('id', profile.id);

        if (updateError) {
          console.error('❌ Error auto-saving testimonials:', updateError);
        } else {
          console.log('✅ Testimonials auto-saved successfully');
        }

        // Also save to about section for backward compatibility
        const { data: existingProfile, error: getError } = await supabase
          .from('profiles')
          .select('about')
          .eq('id', profile.id)
          .single();

        if (getError) {
          console.error('❌ Error getting existing about data for testimonials:', getError);
          return;
        }

        // Merge existing about data with new testimonials
        const existingAbout = existingProfile?.about || {};
        const updatedAbout = {
          ...(typeof existingAbout === 'object' ? existingAbout : {}),
          testimonials: cleanTestimonials
        };

        const { error: aboutUpdateError } = await supabase
          .from('profiles')
          .update({
            about: updatedAbout,
            updated_at: new Date().toISOString()
          })
          .eq('id', profile.id);

        if (aboutUpdateError) {
          console.error('❌ Error auto-saving testimonials to about section:', aboutUpdateError);
        } else {
          console.log('✅ Testimonials auto-saved to about section successfully');
        }
      }
    } catch (error) {
      console.error('❌ Error in auto-save:', error);
    } finally {
      setIsSaving(false);
    }
  }, [handle]);

  // Auto-save function for social links
  const autoSaveSocialLinks = useCallback(async (updatedSocialLinks: typeof socialLinks) => {
    if (!handle) {
      console.log('🔧 No handle available for auto-save');
      return;
    }

    setIsSaving(true);
    try {
      console.log('🔧 Auto-saving social links:', updatedSocialLinks);
      
      // Find the profile by handle
      const { data: profile, error: findError } = await supabase
        .from('profiles')
        .select('id')
        .eq('handle', handle)
        .single();

      if (findError) {
        console.error('❌ Error finding profile for auto-save:', findError);
        return;
      }

      if (profile) {
        // Get existing about data to preserve other fields
        const { data: existingProfile, error: getError } = await supabase
          .from('profiles')
          .select('about')
          .eq('id', profile.id)
          .single();

        if (getError) {
          console.error('❌ Error getting existing about data:', getError);
          return;
        }

        // Merge existing about data with new social links
        const existingAbout = existingProfile?.about || {};
        const updatedAbout = {
          ...(typeof existingAbout === 'object' ? existingAbout : {}),
          socialLinks: updatedSocialLinks
        };

        // Save social links to about section
        const { error: updateError } = await supabase
          .from('profiles')
          .update({
            about: updatedAbout,
            updated_at: new Date().toISOString()
          })
          .eq('id', profile.id);

        if (updateError) {
          console.error('❌ Error auto-saving social links:', updateError);
        } else {
          console.log('✅ Social links auto-saved successfully');
        }
      }
    } catch (error) {
      console.error('❌ Error in auto-save:', error);
    } finally {
      setIsSaving(false);
    }
  }, [handle]);

  // Loading existing data effect
  useEffect(() => {
    console.log('🔧 Step5SocialTestimonials: Loading existing data:', existingData);
    
    if (existingData.socialLinks && existingData.socialLinks.length > 0) {
      setSocialLinks(existingData.socialLinks);
    }
    
    if (existingData.testimonials && existingData.testimonials.length > 0) {
      console.log('✅ Loading existing testimonials:', existingData.testimonials);
      
      const testimonialsWithDebug = existingData.testimonials.map((testimonial, index) => {
        console.log(`🔧 Testimonial ${index} loaded:`, {
          customer_name: testimonial.customer_name,
          review_title: testimonial.review_title,
          review_text: testimonial.review_text,
          image_url: testimonial.image_url,
          image_url_length: testimonial.image_url?.length || 0,
          image_url_valid: !!(testimonial.image_url && testimonial.image_url.trim().length > 0),
          has_file: '_file' in testimonial
        });
        
        return {
          ...testimonial,
          // Ensure image_url is properly preserved and not overwritten by empty _file
          image_url: testimonial.image_url || '',
          _file: undefined, // Clear _file for loaded testimonials since we have the URL
        };
      });
      
      setTestimonials(testimonialsWithDebug);
    }
  }, [existingData]);

  const addSocialLink = () => {
    const newId = (socialLinks.length + 1).toString();
    const updatedSocialLinks = [...socialLinks, { id: newId, title: '', platform: '', url: '' }];
    setSocialLinks(updatedSocialLinks);
    
    // Auto-save social links
    autoSaveSocialLinks(updatedSocialLinks);
  };

  const removeSocialLink = (id: string) => {
    const updatedSocialLinks = socialLinks.filter(link => link.id !== id);
    setSocialLinks(updatedSocialLinks);
    
    // Auto-save after removing social link
    autoSaveSocialLinks(updatedSocialLinks);
  };

  const updateSocialLink = (id: string, field: 'title' | 'platform' | 'url', value: string) => {
    const updatedSocialLinks = socialLinks.map(link => 
      link.id === id ? { ...link, [field]: value } : link
    );
    setSocialLinks(updatedSocialLinks);
    
    // Auto-save after updating social link
    autoSaveSocialLinks(updatedSocialLinks);
  };

  const addTestimonial = () => {
    const newTestimonial = {
      customer_name: '',
      review_title: '',
      review_text: '',
      image_url: '',
    };
    const updatedTestimonials = [...testimonials, newTestimonial];
    setTestimonials(updatedTestimonials);
    
    // Auto-save after adding testimonial
    autoSaveTestimonials(updatedTestimonials);
  };

  const removeTestimonial = (index: number) => {
    const updatedTestimonials = testimonials.filter((_, i) => i !== index);
    setTestimonials(updatedTestimonials);
    
    // Auto-save after removing testimonial
    autoSaveTestimonials(updatedTestimonials);
  };

  const updateTestimonial = (index: number, field: 'customer_name' | 'review_title' | 'review_text', value: string) => {
    const updated = [...testimonials];
    updated[index] = { ...updated[index], [field]: value };
    setTestimonials(updated);
    
    // Auto-save after updating testimonial
    autoSaveTestimonials(updated);
  };

  const handleTestimonialImageChange = async (index: number, file: File | null) => {
    const updated = [...testimonials];
    
    if (file) {
      try {
        setIsSaving(true);
        
        // Check if user is authenticated
        if (!user) {
          toast({
            title: "Authenticatie vereist",
            description: "Je moet ingelogd zijn om foto's te uploaden.",
            variant: "destructive",
          });
          return;
        }
        
        // Sanitize filename to prevent Supabase Storage errors
        const sanitizedName = sanitizeFilename(file.name);
        // Include user ID as folder prefix to respect RLS policies
        const fileName = `${user.id}/testimonial-${Date.now()}-${sanitizedName}`;
        
        console.log('📤 Uploading testimonial image:', {
          userId: user.id,
          original: file.name,
          sanitized: sanitizedName,
          final: fileName
        });
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('media')
          .upload(fileName, file);

        if (uploadError) {
          console.error('❌ Error uploading testimonial image:', uploadError);
          setIsSaving(false);
          toast({
            title: "Upload mislukt",
            description: "Kon foto niet uploaden. Probeer het opnieuw.",
            variant: "destructive",
          });
          return;
        }

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('media')
          .getPublicUrl(uploadData.path);

        // Update testimonial with image URL
        updated[index] = { 
          ...updated[index], 
          image_url: publicUrl,
          _file: undefined 
        };

        console.log('✅ Testimonial image uploaded:', publicUrl);
        
        // Update the component state immediately to show the new image
        setTestimonials(updated);
        setIsSaving(false);
        
        toast({
          title: "Foto geüpload",
          description: "Klantfoto is succesvol geüpload.",
        });
        
        // Auto-save after successful upload
        autoSaveTestimonials(updated);
      } catch (error) {
        console.error('❌ Error uploading testimonial image:', error);
        setIsSaving(false);
        toast({
          title: "Upload fout",
          description: "Er ging iets mis bij het uploaden.",
          variant: "destructive",
        });
        return;
      }
    } else {
      // Remove image
      updated[index] = { 
        ...updated[index], 
        image_url: '',
        _file: undefined 
      };
      
      setTestimonials(updated);
      
      // Auto-save after removing image
      autoSaveTestimonials(updated);
      return;
    }
    
    // Note: Auto-save is handled in the upload success block above
  };

  const handleSubmit = () => {
    console.log('🔧 Step5SocialTestimonials: Submitting data...');
    console.log('🔧 Current testimonials:', testimonials);
    console.log('🔧 Current social links:', socialLinks);
    
    // Filter out empty social links
    const validSocialLinks = socialLinks.filter(link => link.title.trim() && link.url.trim());
    console.log('✅ Valid social links:', validSocialLinks);
    
    // Filter out empty testimonials
    const validTestimonials = testimonials.filter(testimonial => 
      testimonial.customer_name.trim() && testimonial.review_title.trim() && testimonial.review_text.trim()
    );
    console.log('✅ Valid testimonials:', validTestimonials);
    
    // Log each testimonial for debugging
    validTestimonials.forEach((testimonial, index) => {
      console.log(`🔧 Submitting testimonial ${index}:`, {
        customer_name: testimonial.customer_name,
        review_title: testimonial.review_title,
        review_text: testimonial.review_text,
        image_url: testimonial.image_url,
        has_file: '_file' in testimonial
      });
    });

    const submitData = {
      socialLinks: validSocialLinks,
      testimonials: validTestimonials,
    };
    
    console.log('🔧 Final submit data:', submitData);
    console.log('🔧 Submit data type:', typeof submitData);
    console.log('🔧 Submit data JSON:', JSON.stringify(submitData, null, 2));
    
    // Call onNext with the data
    console.log('🔧 Calling onNext with data...');
    onNext(submitData);
    console.log('🔧 onNext called successfully');
  };

  const canGoNext = () => {
    // User can always proceed from this step as it's optional
    return true;
  };

  return (
    <OnboardingLayout 
      currentStep={6}
      totalSteps={7}
      onBack={onBack} 
      onNext={handleSubmit}
      canGoNext={canGoNext()}
      handle={handle}
    >
      <div className="max-w-4xl mx-auto p-6 space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold text-gray-900">Verbind & Bouw Vertrouwen</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Voeg je klantenbeoordelingen toe om vertrouwen te bouwen en klanten te helpen je te vinden online.
          </p>
          {isSaving && (
            <div className="flex items-center justify-center gap-2 text-sm text-blue-600">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              <span>Opslaan...</span>
            </div>
          )}
        </div>

        {/* Social Links Section */}
        {/* <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <Share2 className="w-6 h-6 text-primary" />
              <div>
                <CardTitle>Social Media Links</CardTitle>
                <CardDescription>
                  Help klanten je te vinden op sociale media. Voeg je Instagram, Facebook, LinkedIn of andere platforms toe die je gebruikt.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {socialLinks.map((link) => (
              <div key={link.id} className="grid grid-cols-1 md:grid-cols-3 gap-3 p-4 border border-gray-200 rounded-lg">
                <div>
                  <Label htmlFor={`title-${link.id}`}>Platform Naam</Label>
                  <Input
                    id={`title-${link.id}`}
                    placeholder="e.g., Instagram, Facebook, LinkedIn"
                    value={link.title}
                    onChange={(e) => updateSocialLink(link.id, 'title', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor={`platform-${link.id}`}>Platform Type (Optional)</Label>
                  <Input
                    id={`platform-${link.id}`}
                    placeholder="e.g., instagram, facebook"
                    value={link.platform}
                    onChange={(e) => updateSocialLink(link.id, 'platform', e.target.value)}
                  />
                </div>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <Label htmlFor={`url-${link.id}`}>Profile URL</Label>
                    <Input
                      id={`url-${link.id}`}
                      placeholder="https://instagram.com/yourusername"
                      value={link.url}
                      onChange={(e) => updateSocialLink(link.id, 'url', e.target.value)}
                    />
                  </div>
                  {socialLinks.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeSocialLink(link.id)}
                      className="mt-6"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
            
            <Button
              type="button"
              variant="outline"
              onClick={addSocialLink}
              className="w-full"
            >
              <Plus className="w-4 h-4 mr-2" />
              Nog een Sociale Platform Toevoegen
            </Button>
          </CardContent>
        </Card> */}

        {/* Testimonials Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <Star className="w-6 h-6 text-primary" />
              <div>
                <CardTitle>Klantenbeoordelingen</CardTitle>
                <CardDescription>
                  Toon potentiële klanten wat anderen over jou zeggen. Voeg klantenfoto's toe om beoordelingen persoonlijker en betrouwbaarder te maken.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="p-4 border border-gray-200 rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-gray-900">Testimonial {index + 1}</h4>
                  {testimonials.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeTestimonial(index)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor={`customer-${index}`}>Klant Naam</Label>
                    <Input
                      id={`customer-${index}`}
                      placeholder="e.g., Sarah Johnson"
                      value={testimonial.customer_name}
                      onChange={(e) => updateTestimonial(index, 'customer_name', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor={`title-${index}`}>Beoordeling Titel</Label>
                    <Input
                      id={`title-${index}`}
                      placeholder="e.g., Amazing service!"
                      value={testimonial.review_title}
                      onChange={(e) => updateTestimonial(index, 'review_title', e.target.value)}
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor={`review-${index}`}>Beoordeling Tekst</Label>
                  <Textarea
                    id={`review-${index}`}
                    placeholder="Tell us what the customer said about your service..."
                    value={testimonial.review_text}
                    onChange={(e) => updateTestimonial(index, 'review_text', e.target.value)}
                    rows={3}
                  />
                </div>

                {/* Customer Photo Upload */}
                <div className="space-y-2">
                  <Label className="text-base font-medium">Klant Foto (Optioneel)</Label>
                  <p className="text-sm text-muted-foreground">
                    Een klantfoto maakt beoordelingen persoonlijker en betrouwbaarder.
                  </p>
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-lg bg-muted border-2 border-dashed border-border flex items-center justify-center overflow-hidden">
                      {testimonial.image_url && testimonial.image_url.trim().length > 0 ? (
                        <img 
                          src={testimonial.image_url} 
                          alt="Customer photo" 
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            console.error('❌ Failed to load testimonial image:', testimonial.image_url);
                            // Hide the broken image and show placeholder instead
                            e.currentTarget.style.display = 'none';
                            const placeholder = e.currentTarget.nextElementSibling as HTMLElement;
                            if (placeholder) placeholder.style.display = 'flex';
                          }}
                        />
                      ) : testimonial._file && testimonial._file instanceof File ? (
                        <img 
                          src={URL.createObjectURL(testimonial._file)} 
                          alt="Customer photo preview" 
                          className="w-full h-full object-cover"
                        />
                      ) : null}
                      {/* Placeholder icon - shown when no image or when image fails to load */}
                      {(!testimonial.image_url || testimonial.image_url.trim().length === 0) && 
                       (!testimonial._file || !(testimonial._file instanceof File)) && (
                        <User className="w-6 h-6 text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex flex-col gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          const input = document.createElement('input');
                          input.type = 'file';
                          input.accept = 'image/*';
                          input.onchange = (e) => {
                            const file = (e.target as HTMLInputElement).files?.[0];
                            if (file) {
                              handleTestimonialImageChange(index, file);
                            }
                          };
                          input.click();
                        }}
                        className="h-10"
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        {testimonial.image_url || testimonial._file ? 'Change Photo' : 'Upload Photo'}
                      </Button>
                      {(testimonial.image_url || testimonial._file) && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleTestimonialImageChange(index, null)}
                          className="h-8 text-sm text-muted-foreground hover:text-destructive"
                        >
                          <X className="w-4 h-4 mr-2" />
                          Verwijder Foto
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            <Button
              type="button"
              variant="outline"
              onClick={addTestimonial}
              className="w-full"
              disabled={testimonials.length >= 6}
            >
              <Plus className="w-4 h-4 mr-2" />
              Nog een Beoordeling Toevoegen
            </Button>
            
            <p className="text-sm text-gray-500 text-center">
              Je kunt maximaal 6 beoordelingen toevoegen. Klantenfoto's helpen vertrouwen te bouwen en beoordelingen persoonlijker te maken.
            </p>
          </CardContent>
        </Card>
      </div>
    </OnboardingLayout>
  );
};
