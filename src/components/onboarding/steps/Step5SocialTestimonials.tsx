import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, X, Star, MessageCircle, Share2, Upload, User } from 'lucide-react';

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

  // Set initial state based on existing data
  useEffect(() => {
    if (existingData.socialLinks.length > 0) {
      setSocialLinks(existingData.socialLinks);
    }
    if (existingData.testimonials.length > 0) {
      setTestimonials(existingData.testimonials);
    }
  }, [existingData]);

  const addSocialLink = () => {
    const newId = (socialLinks.length + 1).toString();
    setSocialLinks([...socialLinks, { id: newId, title: '', platform: '', url: '' }]);
  };

  const removeSocialLink = (id: string) => {
    setSocialLinks(socialLinks.filter(link => link.id !== id));
  };

  const updateSocialLink = (id: string, field: 'title' | 'platform' | 'url', value: string) => {
    setSocialLinks(socialLinks.map(link => 
      link.id === id ? { ...link, [field]: value } : link
    ));
  };

  const addTestimonial = () => {
    const newTestimonial = {
      customer_name: '',
      review_title: '',
      review_text: '',
      image_url: '',
    };
    setTestimonials([...testimonials, newTestimonial]);
  };

  const removeTestimonial = (index: number) => {
    setTestimonials(testimonials.filter((_, i) => i !== index));
  };

  const updateTestimonial = (index: number, field: 'customer_name' | 'review_title' | 'review_text', value: string) => {
    const updated = [...testimonials];
    updated[index] = { ...updated[index], [field]: value };
    setTestimonials(updated);
  };

  const handleTestimonialImageChange = (index: number, file: File | null) => {
    const updated = [...testimonials];
    if (file) {
      updated[index] = { ...updated[index], _file: file };
    } else {
      updated[index] = { ...updated[index], _file: undefined };
    }
    setTestimonials(updated);
  };

  const handleSubmit = () => {
    // Filter out empty social links
    const validSocialLinks = socialLinks.filter(link => link.title.trim() && link.url.trim());
    
    // Filter out empty testimonials
    const validTestimonials = testimonials.filter(testimonial => 
      testimonial.customer_name.trim() && testimonial.review_title.trim() && testimonial.review_text.trim()
    );

    onNext({
      socialLinks: validSocialLinks,
      testimonials: validTestimonials,
    });
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold text-gray-900">Connect & Build Trust</h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Voeg je sociale media links en klantenbeoordelingen toe om vertrouwen te bouwen en klanten te helpen je te vinden online.
        </p>
      </div>

      {/* Social Links Section */}
      <Card>
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
      </Card>

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
                    {testimonial.image_url ? (
                      <img src={testimonial.image_url} alt="Customer photo" className="w-full h-full object-cover" />
                    ) : testimonial._file ? (
                      <img src={URL.createObjectURL(testimonial._file)} alt="Customer photo preview" className="w-full h-full object-cover" />
                    ) : (
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

      {/* Navigation */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          Terug
        </Button>
        <Button onClick={handleSubmit}>
          Doorgaan naar Footer Instellingen
        </Button>
      </div>
    </div>
  );
};
