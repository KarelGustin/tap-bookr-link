import { useState, useEffect } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/contexts/AuthContext'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { BannerSection } from '@/features/dashboard/components/BannerSection'
import { AboutSection } from '@/features/dashboard/components/AboutSection'
import { SocialsSection } from '@/features/dashboard/components/SocialsSection'
import { MediaSection } from '@/features/dashboard/components/MediaSection'
import { TestimonialsSection } from '@/features/dashboard/components/TestimonialsSection'
import { FooterSection } from '@/features/dashboard/components/FooterSection'
import { CollapsibleDesignSection } from '@/features/dashboard/components/CollapsibleDesignSection'
import { PhoneMockup } from '@/components/PhoneMockup'
import { PaidInvoicesSection } from '@/components/PaidInvoicesSection'
import { 
  Palette, 
  CreditCard, 
  ExternalLink, 
  LogOut, 
  Loader2 
} from 'lucide-react'

interface Profile {
  id: string
  name: string | null
  slogan: string | null
  category: string | null
  handle: string | null
  banner_url: string | null
  avatar_url: string | null
  accent_color: string | null
  theme_mode: string
  booking_mode: string
  booking_url: string | null
  banner: any
  about: any
  media: any
  socials: any
  contact: any
  footer: any
  footer_business_name: string | null
  footer_address: string | null
  footer_email: string | null
  footer_phone: string | null
  footer_hours: any
  footer_next_available: string | null
  footer_cancellation_policy: string | null
  footer_privacy_policy: string | null
  footer_terms_of_service: string | null
  footer_show_maps: boolean | null
  footer_show_attribution: boolean | null
  testimonials: any
  onboarding_completed: boolean | null
  onboarding_step: number | null
  subscription_status: string | null
  user_id: string
  created_at: string
  updated_at: string
  is_business: boolean | null
  use_whatsapp: boolean | null
  whatsapp_number: string | null
  status: string
  subscription_id: string | null
  trial_start_date: string | null
  trial_end_date: string | null
  grace_period_ends_at: string | null
  subscription_started_at: string | null
  preview_expires_at: string | null
  preview_started_at: string | null
  stripe_customer_id: string | null
}

interface DesignState {
  bannerUrl: string
  bannerHeading: string
  bannerSubheading: string
  bannerTextColor: string
  name: string
  slogan: string
  category: string
  avatarUrl: string
  aboutTitle: string
  aboutDescription: string
  footerBusinessName: string
  footerAddress: string
  footerEmail: string
  footerPhone: string
  footerHours: Record<string, { open: string; close: string; closed: boolean }>
  footerNextAvailable: string
  footerCancellationPolicy: string
  footerPrivacyPolicy: string
  footerTermsOfService: string
    footerShowMaps: boolean
  mediaOrder: Array<{ id: string; url: string; alt?: string }>
  socials: Array<{ id: string; title: string; platform?: string; url: string }>
  bookingUrl: string
  bookingMode: 'embed' | 'new_tab'
  testimonials: Array<{ customer_name: string; review_title: string; review_text: string; image_url?: string }>
}

export default function Dashboard() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [activeSection, setActiveSection] = useState<'design' | 'subscription'>('design')
  const [isSaving, setIsSaving] = useState(false)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const { user, signOut, loading: authLoading } = useAuth()
  const { toast } = useToast()

  const [design, setDesign] = useState<DesignState>({
    bannerUrl: '',
    bannerHeading: '',
    bannerSubheading: '',
    bannerTextColor: '#FFFFFF',
    name: '',
    slogan: '',
    category: '',
    avatarUrl: '',
    aboutTitle: '',
    aboutDescription: '',
    footerBusinessName: '',
    footerAddress: '',
    footerEmail: '',
    footerPhone: '',
    footerHours: {},
    footerNextAvailable: '',
    footerCancellationPolicy: '',
    footerPrivacyPolicy: '',
    footerTermsOfService: '',
    footerShowMaps: true,
    mediaOrder: [],
    socials: [],
    bookingUrl: '',
    bookingMode: 'embed',
    testimonials: [],
  })
  
  // Success message handling
  const success = searchParams.get('success')
  const subscriptionStatus = searchParams.get('subscription')

  // Show success message when coming from successful subscription
  useEffect(() => {
    if (success === 'true' && subscriptionStatus === 'active') {
      const handleSubscriptionSuccess = async () => {
        if (!profile?.id) return
        
        try {
          const { data, error } = await supabase.functions.invoke('handle-subscription-success', {
            body: { profileId: profile.id }
          })
          
          if (error) {
            console.error('Error handling subscription success:', error)
          }
        } catch (error) {
          console.error('Error calling subscription success handler:', error)
        }
      }
      
      handleSubscriptionSuccess()
      
      toast({
        title: "🎉 Betaling Succesvol!",
        description: "Je abonnement is actief en je website is nu live op tapbookr.com!",
        variant: "default",
      })
      
      const url = new URL(window.location.href)
      url.searchParams.delete('success')
      url.searchParams.delete('subscription')
      window.history.replaceState({}, '', url.toString())
      
      setTimeout(() => {
        window.location.reload()
      }, 2000)
    }
  }, [success, subscriptionStatus, toast, profile?.id])

  // Load profile data
  useEffect(() => {
    const loadProfile = async () => {
      if (!user) return
      
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', user.id)
          .single()
        
        if (error) throw error
        setProfile(data)
      } catch (error) {
        console.error('Error loading profile:', error)
        toast({
          title: "Fout",
          description: "Kon profiel niet laden.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }
    
    loadProfile()
  }, [user, toast])

  // Check onboarding completion
  useEffect(() => {
    if (profile && !profile.onboarding_completed) {
      navigate('/onboarding')
    }
  }, [profile, navigate])

  // Load design data from profile with better data handling
  useEffect(() => {
    if (profile) {
      console.log('Loading profile data:', profile)
      
      const bannerData = (profile.banner as any) || {}
      const aboutData = (profile.about as any) || {}
      const mediaData = (profile.media as any) || { items: [] }
      // Parse socials data safely - fix for character-by-character parsing bug
      let socialsData = {}
      try {
        const rawSocials = profile.socials
        if (typeof rawSocials === 'string') {
          socialsData = JSON.parse(rawSocials)
        } else if (typeof rawSocials === 'object' && rawSocials !== null) {
          socialsData = rawSocials
        }
        // Ensure we have an object, not an array or other type
        if (Array.isArray(socialsData) || typeof socialsData !== 'object') {
          socialsData = {}
        }
      } catch (error) {
        console.error('Error parsing socials data:', error)
        socialsData = {}
      }

      const testimonialsData = (profile.testimonials as any) || []

      // Handle banner URL - prioritize actual banner_url field first
      let bannerUrl = ''
      if (profile.banner_url) {
        bannerUrl = profile.banner_url
      } else if (bannerData.imageUrl) {
        bannerUrl = bannerData.imageUrl
      } else if (bannerData.url) {
        bannerUrl = bannerData.url
      }

      // Convert socials object to array with proper IDs and data
      const socialsArray = Object.entries(socialsData).map(([platform, data]: [string, any], index) => {
        if (typeof data === 'string') {
          // Handle simple string URLs (legacy format)
          return {
            id: `${platform}_${index}`,
            title: platform.charAt(0).toUpperCase() + platform.slice(1),
            platform,
            url: data
          }
        } else if (typeof data === 'object' && data !== null) {
          // Handle object format (current format)
          return {
            id: `${platform}_${index}`,
            title: data.title || platform.charAt(0).toUpperCase() + platform.slice(1),
            platform,
            url: data.url || ''
          }
        }
        return {
          id: `${platform}_${index}`,
          title: platform.charAt(0).toUpperCase() + platform.slice(1),
          platform,
          url: ''
        }
      }).filter(social => social.url.trim()) // Filter out empty URLs

      // Convert media items to proper format with better URL handling
      const mediaArray = (mediaData.items || []).map((item: any, index: number) => {
        let url = ''
        let alt = ''
        
        if (typeof item === 'string') {
          url = item
        } else if (typeof item === 'object' && item !== null) {
          url = item.imageUrl || item.url || ''
          alt = item.description || item.alt || ''
        }
        
        return {
          id: `media_${index}`,
          url,
          alt
        }
      }).filter(item => item.url) // Only include items with valid URLs

      const newDesignState = {
        bannerUrl,
        bannerHeading: bannerData.heading || '',
        bannerSubheading: bannerData.subheading || '',
        bannerTextColor: bannerData.textColor || '#FFFFFF',
        name: profile.name || '',
        slogan: profile.slogan || '',
        category: profile.category || '',
        avatarUrl: profile.avatar_url || '',
        aboutTitle: aboutData.title || '',
        aboutDescription: aboutData.description || '',
        footerBusinessName: profile.footer_business_name || '',
        footerAddress: profile.footer_address || '',
        footerEmail: profile.footer_email || '',
        footerPhone: profile.footer_phone || '',
        footerHours: (profile.footer_hours as Record<string, any>) || {},
        footerNextAvailable: profile.footer_next_available || '',
        footerCancellationPolicy: profile.footer_cancellation_policy || '',
        footerPrivacyPolicy: profile.footer_privacy_policy || '',
        footerTermsOfService: profile.footer_terms_of_service || '',
        footerShowMaps: profile.footer_show_maps ?? true,
        mediaOrder: mediaArray,
        socials: socialsArray,
        bookingUrl: profile.booking_url || '',
        bookingMode: (profile.booking_mode as 'embed' | 'new_tab') || 'embed',
        testimonials: testimonialsData.map((t: any) => ({
          customer_name: t.customer_name || '',
          review_title: t.review_title || '',
          review_text: t.review_text || '',
          image_url: t.image_url
        }))
      }

      console.log('Setting design state:', newDesignState)
      setDesign(newDesignState)
    }
  }, [profile])

  const handleSectionSave = async (section: string) => {
    if (!profile?.id) return
    
    try {
      let updates: any = { updated_at: new Date().toISOString() }
      
      switch (section) {
        case 'banner':
          updates = {
            ...updates,
            banner_url: design.bannerUrl,
            name: design.name,
            slogan: design.slogan,
            category: design.category,
          }
          break
        case 'about':
          updates = {
            ...updates,
            avatar_url: design.avatarUrl,
            about: JSON.stringify({
              title: design.aboutTitle,
              description: design.aboutDescription
            }),
          }
          break
        case 'socials':
          updates = {
            ...updates,
            socials: JSON.stringify(
              design.socials.reduce((acc, social) => {
                if (social.platform && social.url) {
                  acc[social.platform] = {
                    title: social.title,
                    url: social.url
                  }
                }
                return acc
              }, {} as any)
            ),
          }
          break
        case 'media':
          updates = {
            ...updates,
            media: JSON.stringify({
              items: design.mediaOrder
            }),
          }
          break
        case 'testimonials':
          updates = {
            ...updates,
            testimonials: design.testimonials,
          }
          break
        case 'booking':
          updates = {
            ...updates,
            booking_url: design.bookingUrl,
            booking_mode: design.bookingMode,
          }
          break
        case 'footer':
          updates = {
            ...updates,
            footer_business_name: design.footerBusinessName,
            footer_address: design.footerAddress,
            footer_email: design.footerEmail,
            footer_phone: design.footerPhone,
            footer_next_available: design.footerNextAvailable,
            footer_cancellation_policy: design.footerCancellationPolicy,
            footer_privacy_policy: design.footerPrivacyPolicy,
            footer_terms_of_service: design.footerTermsOfService,
            footer_show_maps: design.footerShowMaps,
            footer_hours: design.footerHours,
          }
          break
      }

      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', profile.id)

      if (error) throw error
      
      // Reload profile to get fresh data
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', profile.id)
        .single()
      
      if (data) {
        setProfile(data)
      }
    } catch (error) {
      console.error('Error saving profile section:', error)
      throw error
    }
  }

  const handleSave = async () => {
    if (!profile) return
    
    setIsSaving(true)
    console.log('Saving design state:', design)
    
    try {
      // Preserve existing profile data and merge with changes
      const existingBanner = (profile.banner as any) || {}
      const existingAbout = (profile.about as any) || {}
      const existingMedia = (profile.media as any) || { items: [] }
      
      // Build banner data with all fields preserved
      const bannerData = {
        ...existingBanner,
        heading: design.bannerHeading,
        subheading: design.bannerSubheading,
        textColor: design.bannerTextColor,
        imageUrl: design.bannerUrl, // Also save in banner object for consistency
      }

      // Build about data with all fields preserved  
      const aboutData = {
        ...existingAbout,
        title: design.aboutTitle,
        description: design.aboutDescription,
        testimonials: design.testimonials, // Use design.testimonials as single source
      }

      // Build media data preserving structure
      const mediaData = {
        ...existingMedia,
        items: design.mediaOrder.map(item => ({
          imageUrl: item.url,
          url: item.url,
          description: item.alt || '',
          alt: item.alt || ''
        }))
      }

      // Convert socials array back to object format for DB
      const socialsData = design.socials.reduce((acc, social) => {
        if (social.platform && social.url) {
          acc[social.platform] = {
            title: social.title,
            url: social.url
          }
        }
        return acc
      }, {} as any)

      const updates = {
        // Basic profile fields
        name: design.name,
        slogan: design.slogan,
        category: design.category,
        banner_url: design.bannerUrl, // Primary banner URL field
        avatar_url: design.avatarUrl,
        booking_url: design.bookingUrl,
        booking_mode: design.bookingMode,
        
        // JSON fields with preserved data
        banner: bannerData,
        about: aboutData,
        media: mediaData,
        socials: socialsData,
        
        // Footer fields
        footer_business_name: design.footerBusinessName,
        footer_address: design.footerAddress,
        footer_email: design.footerEmail,
        footer_phone: design.footerPhone,
        footer_next_available: design.footerNextAvailable,
        footer_cancellation_policy: design.footerCancellationPolicy,
        footer_privacy_policy: design.footerPrivacyPolicy,
        footer_terms_of_service: design.footerTermsOfService,
        footer_show_maps: design.footerShowMaps,
        footer_hours: design.footerHours,
        
        // Use design.testimonials as single source of truth
        testimonials: design.testimonials,
        updated_at: new Date().toISOString()
      }

      console.log('Saving updates:', updates)

      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', profile.id)

      if (error) throw error

      toast({
        title: "✅ Opgeslagen!",
        description: "Je wijzigingen zijn succesvol opgeslagen.",
      })
      
      // Reload profile to get fresh data
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', profile.id)
        .single()
      
      if (data) {
        console.log('Reloaded profile:', data)
        setProfile(data)
      }
    } catch (error) {
      console.error('Error saving profile:', error)
      toast({
        title: "❌ Fout",
        description: "Er is een fout opgetreden bij het opslaan.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Dashboard laden...</p>
        </div>
      </div>
    )
  }

  if (!user || !profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 flex items-center justify-center">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold">Toegang geweigerd</h2>
          <p className="text-muted-foreground">Log in om je dashboard te bekijken.</p>
          <Button onClick={() => navigate('/login')}>
            Inloggen
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5">
      {/* Mobile-First Header */}
      <div className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
              <span className="text-primary-foreground text-sm font-semibold">
                {profile.name?.charAt(0)?.toUpperCase() || 'U'}
              </span>
            </div>
            <h1 className="text-xl font-bold">Dashboard</h1>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(`/${profile.handle}`)}
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Preview
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={signOut}
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Content Container */}
      <div className="container mx-auto px-4 py-6 max-w-2xl">
        {/* Navigation Tabs */}
        <div className="mb-6">
          <div className="flex space-x-1 p-1 bg-muted rounded-lg">
            <button
              onClick={() => setActiveSection('design')}
              className={`flex-1 flex items-center justify-center px-4 py-2 rounded-md text-sm font-medium transition-all ${
                activeSection === 'design'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Palette className="w-4 h-4 mr-2" />
              Design
            </button>
            <button
              onClick={() => setActiveSection('subscription')}
              className={`flex-1 flex items-center justify-center px-4 py-2 rounded-md text-sm font-medium transition-all ${
                activeSection === 'subscription'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <CreditCard className="w-4 h-4 mr-2" />
              Abonnement
            </button>
          </div>
        </div>

        {/* Section Content */}
        {activeSection === 'design' ? (
          <div className="space-y-4">
            {/* iPhone Mockup Preview */}
            <div className="mb-6">
              <PhoneMockup 
                profileUrl={`/${profile.handle || profile.id}`}
                userName={profile.name || undefined}
              />
            </div>

            {/* Collapsible Sections */}
            <CollapsibleDesignSection
              id="banner"
              title="Banner & Profiel"
              onSave={() => handleSectionSave('banner')}
              data={design}
              fieldName="banner"
              defaultOpen={true}
            >
              <BannerSection
                bannerUrl={design.bannerUrl}
                bannerHeading={design.bannerHeading}
                bannerSubheading={design.bannerSubheading}
                bannerTextColor={design.bannerTextColor}
                name={design.name}
                slogan={design.slogan}
                category={design.category}
                onUpdate={(updates) => setDesign(prev => ({ ...prev, ...updates }))}
              />
            </CollapsibleDesignSection>

            <CollapsibleDesignSection
              id="about"
              title="Over Mij"
              onSave={() => handleSectionSave('about')}
              data={design}
              fieldName="about"
            >
              <AboutSection
                avatarUrl={design.avatarUrl}
                aboutTitle={design.aboutTitle}
                aboutDescription={design.aboutDescription}
                onUpdate={(updates) => setDesign(prev => ({ ...prev, ...updates }))}
              />
            </CollapsibleDesignSection>

            {/* Social Media Section - Temporarily disabled */}
            {/* <CollapsibleDesignSection
              id="socials"
              title="Sociale Media"
              onSave={() => handleSectionSave('socials')}
              data={design}
              fieldName="socials"
            >
              <SocialsSection
                socials={design.socials}
                onUpdate={(socials) => setDesign(prev => ({ ...prev, socials }))}
              />
            </CollapsibleDesignSection> */}

            <CollapsibleDesignSection
              id="media"
              title="Media"
              onSave={() => handleSectionSave('media')}
              data={design}
              fieldName="media"
            >
              <MediaSection
                mediaItems={design.mediaOrder}
                onUpdate={(mediaOrder) => setDesign(prev => ({ ...prev, mediaOrder }))}
              />
            </CollapsibleDesignSection>

            <CollapsibleDesignSection
              id="testimonials"
              title="Testimonials"
              onSave={() => handleSectionSave('testimonials')}
              data={design}
              fieldName="testimonials"
            >
              <TestimonialsSection
                testimonials={design.testimonials}
                onUpdate={(testimonials) => setDesign(prev => ({ ...prev, testimonials }))}
              />
            </CollapsibleDesignSection>

            <CollapsibleDesignSection
              id="booking"
              title="Boeking"
              onSave={() => handleSectionSave('booking')}
              data={design}
              fieldName="booking"
            >
              <div className="space-y-4">
                <div>
                  <Label htmlFor="bookingUrl">Jouw Booking URL</Label>
                  <Input
                    id="bookingUrl"
                    placeholder="https://calendly.com/jouwpagina"
                    value={design.bookingUrl}
                    onChange={(e) => setDesign(prev => ({ ...prev, bookingUrl: e.target.value }))}
                  />
                </div>
              </div>
            </CollapsibleDesignSection>

            <CollapsibleDesignSection
              id="footer"
              title="Footer & Contact"
              onSave={() => handleSectionSave('footer')}
              data={design}
              fieldName="footer"
            >
              <FooterSection
                footerBusinessName={design.footerBusinessName}
                footerAddress={design.footerAddress}
                footerEmail={design.footerEmail}
                footerPhone={design.footerPhone}
                footerHours={design.footerHours}
                footerNextAvailable={design.footerNextAvailable}
                footerCancellationPolicy={design.footerCancellationPolicy}
                footerPrivacyPolicy={design.footerPrivacyPolicy}
                footerTermsOfService={design.footerTermsOfService}
                footerShowMaps={design.footerShowMaps}
                onUpdate={(updates) => setDesign(prev => ({ ...prev, ...updates }))}
              />
            </CollapsibleDesignSection>
          </div>
        ) : (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CreditCard className="w-5 h-5 mr-2" />
                  Abonnement Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <Badge variant={profile.subscription_status === 'active' ? 'default' : 'secondary'}>
                      {profile.subscription_status === 'active' ? 'Actief' : 'Inactief'}
                    </Badge>
                    <p className="text-sm text-muted-foreground mt-2">
                {profile.subscription_status === 'active' 
                  ? 'Je website is live en toegankelijk'
                  : 'Activeer je abonnement om je website live te zetten'
                }
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Paid Invoices */}
            <PaidInvoicesSection profileId={profile.id} />
          </div>
        )}
      </div>
    </div>
  )
}
