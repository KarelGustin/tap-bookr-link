import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Loader2, CheckCircle, User, Settings, CreditCard, Clock, Palette, ExternalLink, LogOut } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/integrations/supabase/client'
import { useToast } from '@/hooks/use-toast'
import { Navigate, useSearchParams, useNavigate } from 'react-router-dom'
import { PaidInvoicesSection } from '@/components/PaidInvoicesSection'
import { SectionCard } from '@/features/dashboard/components/SectionCard'
import { BannerSection } from '@/features/dashboard/components/BannerSection'
import { AboutSection } from '@/features/dashboard/components/AboutSection'
import { SocialsSection } from '@/features/dashboard/components/SocialsSection'
import { MediaSection } from '@/features/dashboard/components/MediaSection'
import { PhoneMockup } from '@/components/PhoneMockup'
import { FooterSection } from '@/features/dashboard/components/FooterSection'

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

  // Load design data from profile
  useEffect(() => {
    if (profile) {
      const bannerData = (profile.banner as any) || {}
      const aboutData = (profile.about as any) || {}
      const mediaData = (profile.media as any) || { items: [] }
      const socialsData = (profile.socials as any) || {}
      const testimonialsData = (profile.testimonials as any) || []

      // Convert socials object to array with IDs
      const socialsArray = Object.entries(socialsData).map(([platform, data]: [string, any], index) => ({
        id: `${platform}_${index}`,
        title: data?.title || platform,
        platform,
        url: data?.url || ''
      }))

      // Convert media items to proper format
      const mediaArray = (mediaData.items || []).map((item: any, index: number) => ({
        id: `media_${index}`,
        url: typeof item === 'string' ? item : item.imageUrl,
        alt: typeof item === 'object' ? item.description : undefined
      }))

      setDesign({
        bannerUrl: profile.banner_url || bannerData.imageUrl || '',
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
      })
    }
  }, [profile])

  const handleSave = async () => {
    if (!profile) return
    
    setIsSaving(true)
    try {
      // Update profile with design changes
      const updates = {
        name: design.name,
        slogan: design.slogan,
        category: design.category,
        banner_url: design.bannerUrl,
        avatar_url: design.avatarUrl,
        banner: {
          heading: design.bannerHeading,
          subheading: design.bannerSubheading,
          textColor: design.bannerTextColor,
        },
        about: {
          title: design.aboutTitle,
          description: design.aboutDescription,
          socialLinks: design.socials,
          testimonials: design.testimonials,
        },
        media: {
          items: design.mediaOrder
        },
        socials: design.socials.reduce((acc, social) => {
          if (social.platform) {
            acc[social.platform] = {
              title: social.title,
              url: social.url
            }
          }
          return acc
        }, {} as any),
        booking_url: design.bookingUrl,
        booking_mode: design.bookingMode,
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
        testimonials: design.testimonials,
        updated_at: new Date().toISOString()
      }

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
          <div className="space-y-6">
            {/* iPhone Mockup Preview */}
            <div className="mb-6">
              <PhoneMockup 
                profileUrl={`https://tapbookr.com/${profile.handle || profile.id}`}
                userName={profile.name || undefined}
              />
            </div>

            {/* Banner Section */}
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

            {/* About Section */}
            <AboutSection
              avatarUrl={design.avatarUrl}
              aboutTitle={design.aboutTitle}
              aboutDescription={design.aboutDescription}
              onUpdate={(updates) => setDesign(prev => ({ ...prev, ...updates }))}
            />

            {/* Socials Section */}
            <SocialsSection
              socials={design.socials}
              onUpdate={(socials) => setDesign(prev => ({ ...prev, socials }))}
            />

            {/* Media Section */}
            <MediaSection
              mediaItems={design.mediaOrder}
              onUpdate={(mediaOrder) => setDesign(prev => ({ ...prev, mediaOrder }))}
            />

            {/* Booking */}
            <SectionCard title="Boeking">
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
            </SectionCard>

            {/* Footer Section */}
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

            {/* Save Button */}
            <div className="sticky bottom-4">
              <Button
                onClick={handleSave}
                disabled={isSaving}
                className="w-full h-12 text-base font-medium shadow-lg"
                size="lg"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Opslaan...
                  </>
                ) : (
                  "Wijzigingen Opslaan"
                )}
              </Button>
            </div>
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
