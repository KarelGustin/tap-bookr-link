import { useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { SectionCard } from './SectionCard'
import { Plus, X, Star, Upload, User } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/integrations/supabase/client'
import { sanitizeFilename } from '@/lib/utils'

interface Testimonial {
  customer_name: string
  review_title: string
  review_text: string
  image_url?: string
  _file?: File
}

interface TestimonialsSectionProps {
  testimonials: Testimonial[]
  onUpdate: (testimonials: Testimonial[]) => void
}

export function TestimonialsSection({ testimonials, onUpdate }: TestimonialsSectionProps) {
  const { toast } = useToast()
  const { user } = useAuth()
  const [isSaving, setIsSaving] = useState(false)

  const addTestimonial = () => {
    const newTestimonial = {
      customer_name: '',
      review_title: '',
      review_text: '',
      image_url: '',
    }
    onUpdate([...testimonials, newTestimonial])
  }

  const removeTestimonial = (index: number) => {
    onUpdate(testimonials.filter((_, i) => i !== index))
  }

  const updateTestimonial = (index: number, field: 'customer_name' | 'review_title' | 'review_text', value: string) => {
    const updated = [...testimonials]
    updated[index] = { ...updated[index], [field]: value }
    onUpdate(updated)
  }

  const handleTestimonialImageChange = async (index: number, file: File | null) => {
    if (file) {
      try {
        setIsSaving(true)
        
        if (!user) {
          toast({
            title: "Authenticatie vereist",
            description: "Je moet ingelogd zijn om foto's te uploaden.",
            variant: "destructive",
          })
          return
        }
        
        const sanitizedName = sanitizeFilename(file.name)
        const fileName = `${user.id}/testimonial-${Date.now()}-${sanitizedName}`
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('media')
          .upload(fileName, file)

        if (uploadError) {
          console.error('❌ Error uploading testimonial image:', uploadError)
          toast({
            title: "Upload mislukt",
            description: "Kon foto niet uploaden. Probeer het opnieuw.",
            variant: "destructive",
          })
          return
        }

        const { data: { publicUrl } } = supabase.storage
          .from('media')
          .getPublicUrl(uploadData.path)

        const updated = [...testimonials]
        updated[index] = { 
          ...updated[index], 
          image_url: publicUrl,
          _file: undefined 
        }

        onUpdate(updated)
        
        toast({
          title: "Foto geüpload",
          description: "Klantfoto is succesvol geüpload.",
        })
      } catch (error) {
        console.error('❌ Error uploading testimonial image:', error)
        toast({
          title: "Upload fout",
          description: "Er ging iets mis bij het uploaden.",
          variant: "destructive",
        })
      } finally {
        setIsSaving(false)
      }
    } else {
      // Remove image
      const updated = [...testimonials]
      updated[index] = { 
        ...updated[index], 
        image_url: '',
        _file: undefined 
      }
      onUpdate(updated)
    }
  }

  return (
    <SectionCard 
      title="Klantenbeoordelingen"
      cta={
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addTestimonial}
          disabled={testimonials.length >= 6}
          className="flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Toevoegen
        </Button>
      }
    >
      <div className="space-y-6">
        {isSaving && (
          <div className="flex items-center justify-center gap-2 text-sm text-blue-600">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            <span>Foto uploaden...</span>
          </div>
        )}

        <div className="flex items-center gap-2 text-muted-foreground">
          <Star className="w-4 h-4" />
          <p className="text-sm">Toon potentiële klanten wat anderen over jou zeggen</p>
        </div>

        <div className="space-y-4">
          {testimonials.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Star className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>Nog geen beoordelingen toegevoegd</p>
              <p className="text-sm">Voeg je eerste klantenbeoordeling toe om vertrouwen te bouwen</p>
            </div>
          )}

          {testimonials.map((testimonial, index) => (
            <div key={`testimonial-${index}`} className="p-4 border border-border rounded-lg space-y-4 bg-card">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Beoordeling {index + 1}</h4>
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
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor={`customer-${index}`}>Klant Naam</Label>
                  <Input
                    id={`customer-${index}`}
                    placeholder="Sarah Johnson"
                    value={testimonial.customer_name}
                    onChange={(e) => updateTestimonial(index, 'customer_name', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor={`title-${index}`}>Beoordeling Titel</Label>
                  <Input
                    id={`title-${index}`}
                    placeholder="Geweldige service!"
                    value={testimonial.review_title}
                    onChange={(e) => updateTestimonial(index, 'review_title', e.target.value)}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor={`review-${index}`}>Beoordeling Tekst</Label>
                <Textarea
                  id={`review-${index}`}
                  placeholder="Vertel wat de klant over je service zei..."
                  value={testimonial.review_text}
                  onChange={(e) => updateTestimonial(index, 'review_text', e.target.value)}
                  rows={3}
                  className="min-h-[80px] resize-none"
                />
              </div>

              <div className="space-y-2">
                <Label>Klant Foto (Optioneel)</Label>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-muted border-2 border-dashed border-border flex items-center justify-center overflow-hidden flex-shrink-0">
                    {testimonial.image_url && testimonial.image_url.trim() ? (
                      <img 
                        src={testimonial.image_url} 
                        alt="Customer photo" 
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          console.error('❌ Failed to load testimonial image:', testimonial.image_url)
                          e.currentTarget.style.display = 'none'
                        }}
                      />
                    ) : testimonial._file && testimonial._file instanceof File ? (
                      <img 
                        src={URL.createObjectURL(testimonial._file)} 
                        alt="Customer photo preview" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="w-4 h-4 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex flex-col gap-1 flex-1">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const input = document.createElement('input')
                        input.type = 'file'
                        input.accept = 'image/*'
                        input.onchange = (e) => {
                          const file = (e.target as HTMLInputElement).files?.[0]
                          if (file) {
                            handleTestimonialImageChange(index, file)
                          }
                        }
                        input.click()
                      }}
                      className="h-8 text-xs"
                    >
                      <Upload className="w-3 h-3 mr-1" />
                      {testimonial.image_url || testimonial._file ? 'Wijzigen' : 'Upload'}
                    </Button>
                    {(testimonial.image_url || testimonial._file) && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleTestimonialImageChange(index, null)}
                        className="h-6 text-xs text-muted-foreground hover:text-destructive"
                      >
                        <X className="w-3 h-3 mr-1" />
                        Verwijder
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}

          {testimonials.length > 0 && testimonials.length < 6 && (
            <Button
              type="button"
              variant="outline"
              onClick={addTestimonial}
              className="w-full h-12 rounded-lg"
            >
              <Plus className="w-4 h-4 mr-2" />
              Nog een Beoordeling Toevoegen
            </Button>
          )}
        </div>

        {testimonials.length > 0 && (
          <p className="text-xs text-muted-foreground text-center">
            Je kunt maximaal 6 beoordelingen toevoegen
          </p>
        )}
      </div>
    </SectionCard>
  )
}