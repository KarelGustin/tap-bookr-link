import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { Database, Json } from '@/integrations/supabase/types';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import StripeService from '@/services/stripeService';
import { 
  ChevronDown,
  Settings,
  Palette,
  BarChart3,
  Plus,
  Edit3,
  Save,
  Link as LinkIcon,
  Star,
  Share2,
  Menu,
  Lock,
  ExternalLink,
  LogOut,
  CheckCircle,
  Calendar,
  CreditCard,
  Download,
  X
} from 'lucide-react';
import { LanguageSelector } from '@/components/ui/language-selector';
import { Sidebar as DashboardSidebar } from '@/features/dashboard/components/Sidebar'
import { Header as DashboardHeader } from '@/features/dashboard/components/Header'
import { SectionCard } from '@/features/dashboard/components/SectionCard'
import { useLanguage } from '@/contexts/LanguageContext';

// Strong, shared types (top-level)
export type SocialItem = { title?: string; platform?: string; url?: string };
export type TestimonialItem = { customer_name: string; review_title: string; review_text: string; image_url?: string };
export type Banner = { 
  type: 'color' | 'image'; 
  color?: string; 
  imageUrl?: string;
  heading?: string;
  subheading?: string;
  textColor?: string;
};
export type BannerPartial = Partial<Banner>;
export type MediaItem = { url: string; kind: 'image' };
export type WithFile = TestimonialItem & { _file?: File };
export type ProfileWithTestimonials = Profile & { testimonials?: TestimonialItem[] | null };

type Profile = Database['public']['Tables']['profiles']['Row'];

interface SocialLink {
  id: string;
  platform: string;
  title: string;
  url: string;
  isActive: boolean;
  isSaved: boolean;
}

export default function Dashboard() {
  const [searchParams] = useSearchParams();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [activeSection, setActiveSection] = useState<'design' | 'subscription'>('design');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [bookingUrl, setBookingUrl] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [onboardingCompleted, setOnboardingCompleted] = useState(false);
  const { user, signOut, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { t } = useLanguage();

  // Success message handling
  const success = searchParams.get('success');
  const subscriptionStatus = searchParams.get('subscription');
  const cancellation = searchParams.get('cancellation');
  const billing = searchParams.get('billing');

  // Show success message when coming from successful subscription
  useEffect(() => {
    if (success === 'true' && subscriptionStatus === 'active') {
      toast({
        title: "🎉 Betaling Succesvol!",
        description: "Je abonnement is actief en je website is nu live op tapbookr.com!",
        variant: "default",
      });
      
      // Clear the URL parameters after showing the message
      const url = new URL(window.location.href);
      url.searchParams.delete('success');
      url.searchParams.delete('subscription');
      window.history.replaceState({}, '', url.toString());
      
      // Reload page data after successful payment
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    }
  }, [success, subscriptionStatus, toast]);

  // Handle return from customer portal
  useEffect(() => {
    if (cancellation === 'initiated') {
      toast({
        title: "📝 Abonnement Opzegging",
        description: "Je hebt je abonnement opgezegd. Je website blijft actief tot het einde van je betaalde periode.",
        variant: "default",
      });
      
      // Clear the URL parameter
      const url = new URL(window.location.href);
      url.searchParams.delete('cancellation');
      window.history.replaceState({}, '', url.toString());
    }

    if (billing === 'viewed') {
      toast({
        title: "📊 Facturen Bekeken",
        description: "Je hebt je factuurgeschiedenis bekeken in het Stripe dashboard.",
        variant: "default",
      });
      
      // Clear the URL parameter
      const url = new URL(window.location.href);
      url.searchParams.delete('billing');
      window.history.replaceState({}, '', url.toString());
    }
  }, [cancellation, billing, toast]);

  // Sample social links data
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([
    {
      id: '1',
      platform: 'instagram',
      title: 'Instagram',
      url: '',
      isActive: true,
      isSaved: true
    },
    {
      id: '2',
      platform: 'whatsapp',
      title: 'WhatsApp',
      url: '',
      isActive: true,
      isSaved: false
    },
    {
      id: '3',
      platform: 'tiktok',
      title: 'TikTok',
      url: '',
      isActive: false,
      isSaved: true
    },
    {
      id: '4',
      platform: 'facebook',
      title: 'Facebook',
      url: '',
      isActive: false,
      isSaved: false
    }
  ]);

  // --- Design editor state ---
  const [designLoading, setDesignLoading] = useState(false);
  const [design, setDesign] = useState({
            bannerType: 'image' as 'color' | 'image',
    bannerColor: '#6E56CF',
    bannerImageFile: null as File | null,
    avatarFile: null as File | null,

    // Banner content
    bannerHeading: '',
    bannerSubheading: '',
    bannerTextColor: '#FFFFFF',

    name: '',
    slogan: '',
    category: '',

    aboutTitle: '',
    aboutDescription: '',
    aboutAlignment: 'center' as 'center' | 'left',

    // Footer settings
    footerBusinessName: '',
    footerAddress: '',
    footerEmail: '',
    footerPhone: '',
    footerHours: {
      monday: { open: '09:00', close: '17:00', closed: false },
      tuesday: { open: '09:00', close: '17:00', closed: false },
      wednesday: { open: '09:00', close: '17:00', closed: false },
      thursday: { open: '09:00', close: '17:00', closed: false },
      friday: { open: '09:00', close: '17:00', closed: false },
      saturday: { open: '10:00', close: '16:00', closed: false },
      sunday: { open: '10:00', close: '16:00', closed: true },
    } as Record<string, { open: string; close: string; closed: boolean }>,
    footerNextAvailable: '',
    footerCancellationPolicy: '',
    footerPrivacyPolicy: '',
    footerTermsOfService: '',
    footerShowMaps: true,
    footerShowAttribution: true,

    mediaFiles: [] as File[],
    mediaOrder: [] as string[],
    draggedIndex: null as number | null,

    socials: [] as SocialItem[],

    bookingUrl: '',
    bookingMode: 'embed' as 'embed' | 'new_tab',

    testimonials: [] as TestimonialItem[],
  });

  // Dirty tracking (exclude file objects)
  const dirtySnapshot = (d: typeof design) => JSON.stringify({
    bannerType: d.bannerType,
    bannerColor: d.bannerColor,
    bannerHeading: d.bannerHeading,
    bannerSubheading: d.bannerSubheading,
    bannerTextColor: d.bannerTextColor,
    name: d.name,
    slogan: d.slogan,
    category: d.category,
    aboutTitle: d.aboutTitle,
    aboutDescription: d.aboutDescription,
    aboutAlignment: d.aboutAlignment,
    footerBusinessName: d.footerBusinessName,
    footerAddress: d.footerAddress,
    footerEmail: d.footerEmail,
    footerPhone: d.footerPhone,
    footerHours: d.footerHours,
    footerNextAvailable: d.footerNextAvailable,
    footerCancellationPolicy: d.footerCancellationPolicy,
    footerPrivacyPolicy: d.footerPrivacyPolicy,
    footerTermsOfService: d.footerTermsOfService,
    footerShowMaps: d.footerShowMaps,
    footerShowAttribution: d.footerShowAttribution,
    mediaOrder: d.mediaOrder,
    socials: d.socials,
    bookingUrl: d.bookingUrl,
    bookingMode: 'embed',
    testimonials: d.testimonials,
  });
  const [baseline, setBaseline] = useState('');
  const isDirty = baseline !== '' && baseline !== dirtySnapshot(design);

  const bannerInputRef = useRef<HTMLInputElement | null>(null);
  const avatarInputRef = useRef<HTMLInputElement | null>(null);
  const galleryInputRef = useRef<HTMLInputElement | null>(null);
  const testimonialInputRefs = useRef<Record<number, HTMLInputElement | null>>({});

  const [bannerPreview, setBannerPreview] = useState<string | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [galleryNewPreviews, setGalleryNewPreviews] = useState<string[]>([]);
  const [testimonialPreviews, setTestimonialPreviews] = useState<Record<number, string>>({});
  const [previewKey, setPreviewKey] = useState(0);
  
  // Subscription state
  const [subscription, setSubscription] = useState<{
    id: string;
    status: string;
    stripe_subscription_id: string;
    stripe_customer_id: string;
    current_period_start: string;
    current_period_end: string;
    cancel_at_period_end: boolean;
  } | null>(null);
  const [subscriptionLoading, setSubscriptionLoading] = useState(false);
  const [invoices, setInvoices] = useState<{
    id: string;
    amount: number;
    status: string;
    created_at: string;
  }[]>([]);

  // Voeg deze state toe bij de andere state variabelen
  const [addressSuggestions, setAddressSuggestions] = useState<string[]>([]);
  const [showAddressSuggestions, setShowAddressSuggestions] = useState(false);
  const [addressInputValue, setAddressInputValue] = useState('');

  // Check onboarding completion status
  useEffect(() => {
    const checkOnboardingStatus = async () => {
      if (!user) return;

      try {
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('onboarding_completed')
          .eq('user_id', user.id)
          .single();

        if (error) {
          console.error('Error checking onboarding status:', error);
          return;
        }

        if (profile) {
          const onboardingCompleted = (profile as { onboarding_completed: boolean }).onboarding_completed || false;
          setOnboardingCompleted(onboardingCompleted);
          
          // If onboarding not completed, redirect to onboarding
          if (!onboardingCompleted) {
            navigate('/onboarding');
          }
        }
      } catch (error) {
        console.error('Error checking onboarding status:', error);
      }
    };

    checkOnboardingStatus();
  }, [user, navigate]);

  // Load subscription data from Stripe via Edge Function
  const loadSubscriptionData = useCallback(async () => {
    if (!profile?.id || !profile?.subscription_id) {
      console.log('No profile ID or subscription ID available');
      setSubscription(null);
      setInvoices([]);
      setSubscriptionLoading(false);
      return;
    }
    
    setSubscriptionLoading(true);
    try {
      console.log('Calling Edge Function with profile ID:', profile.id);
      
      // Call Edge Function to get Stripe subscription data
      const { data: subscriptionData, error } = await supabase.functions.invoke('get-stripe-subscription', {
        body: { profileId: profile.id }
      });

      console.log('Edge Function response:', { data: subscriptionData, error });

      if (error) {
        console.log('Error fetching Stripe subscription:', error);
        // Fallback to profile data if Edge Function fails (no synthetic dates)
        const fallbackData = {
          id: profile.id,
          status: profile.subscription_status,
          stripe_subscription_id: profile.subscription_id,
          stripe_customer_id: profile.stripe_customer_id || profile.subscription_id,
          current_period_start: profile.trial_start_date || null,
          current_period_end: profile.trial_end_date || null,
          cancel_at_period_end: false,
        };
        console.log('Using fallback data:', fallbackData);
        setSubscription(fallbackData);
      } else if (subscriptionData) {
        console.log('Successfully loaded Stripe data:', subscriptionData);
        setSubscription(subscriptionData);
      } else {
        console.log('No subscription data returned from Edge Function');
        // Use fallback (no synthetic dates)
        const fallbackData = {
          id: profile.id,
          status: profile.subscription_status,
          stripe_subscription_id: profile.subscription_id,
          stripe_customer_id: profile.stripe_customer_id || profile.subscription_id,
          current_period_start: profile.trial_start_date || null,
          current_period_end: profile.trial_end_date || null,
          cancel_at_period_end: false,
        };
        setSubscription(fallbackData);
      }

      // Since we don't have access to invoices table, create empty array
      setInvoices([]);
      
    } catch (error) {
      console.log('Error loading subscription data:', error);
      // Fallback to profile data (no synthetic dates)
      const fallbackData = {
        id: profile.id,
        status: profile.subscription_status,
        stripe_subscription_id: profile.subscription_id,
        stripe_customer_id: profile.stripe_customer_id || profile.subscription_id,
        current_period_start: profile.trial_start_date || null,
        current_period_end: profile.trial_end_date || null,
        cancel_at_period_end: false,
      };
      console.log('Using fallback data due to error:', fallbackData);
      setSubscription(fallbackData);
      setInvoices([]);
    } finally {
      setSubscriptionLoading(false);
    }
  }, [profile?.id, profile?.subscription_id, profile?.subscription_status, profile?.stripe_customer_id, profile?.trial_start_date, profile?.trial_end_date, profile?.created_at, profile?.updated_at]);

  useEffect(() => {
    loadSubscriptionData();
  }, [loadSubscriptionData]);

  // initialize defaults for socials and testimonials if empty
  useEffect(() => {
    if (!profile) return;
    // if socials is empty in design, prime with defaults
    setDesign((d) => {
      let updatedDesign = d;
      
      if (d.socials.length === 0) {
        updatedDesign = {
          ...updatedDesign,
          socials: [
            { title: 'Instagram', platform: 'instagram', url: '' },
            { title: 'Facebook', platform: 'facebook', url: '' },
            { title: 'WhatsApp', platform: 'whatsapp', url: '' },
            { title: 'LinkedIn', platform: 'linkedin', url: '' },
          ],
        };
      }
      
      // if testimonials is empty, prime with 3 placeholder testimonials
      if (d.testimonials.length === 0) {
        updatedDesign = {
          ...updatedDesign,
          testimonials: [
            { 
              customer_name: 'Sarah Johnson', 
              review_title: 'Amazing service!', 
              review_text: 'I was so impressed with the quality and attention to detail. Highly recommend!',
              image_url: undefined
            },
            { 
              customer_name: 'Mike Chen', 
              review_title: 'Exceeded expectations', 
              review_text: 'Professional, reliable, and delivered exactly what I was looking for.',
              image_url: undefined
            },
            { 
              customer_name: 'Emily Rodriguez', 
              review_title: 'Fantastic experience', 
              review_text: 'The team went above and beyond to make sure everything was perfect.',
              image_url: undefined
            }
          ],
        };
      }
      
      return updatedDesign;
    });
  }, [profile]);

  // Local previews for existing images
  useEffect(() => {
    const b: BannerPartial = (profile?.banner ?? {}) as BannerPartial;
    setBannerPreview(typeof b.imageUrl === 'string' ? b.imageUrl : null);
    setAvatarPreview(profile?.avatar_url || null);
  }, [profile]);

  useEffect(() => {
    if (!profile) return;
    const b: BannerPartial = (profile.banner ?? {}) as BannerPartial;
    const about = (profile.about ?? {}) as { [key: string]: unknown };
    const footer = (profile.footer ?? {}) as { [key: string]: unknown };

    const existingMediaUrls = getExistingMediaUrls();

    const profWithT = profile as ProfileWithTestimonials;
    const tRaw = profWithT.testimonials;
    
    // Check if testimonials are stored in about section
    let testimonialsFromAbout: TestimonialItem[] = [];
    if (typeof about.testimonials === 'object' && Array.isArray(about.testimonials)) {
      testimonialsFromAbout = about.testimonials as TestimonialItem[];
    }

    setDesign((d) => ({
      ...d,
              bannerType: typeof b.imageUrl === 'string' ? 'image' : 'image', // Default to image, fallback to accent color
      bannerColor: typeof b.color === 'string' ? b.color : profile.accent_color || '#6E56CF',
      bannerHeading: typeof b.heading === 'string' ? b.heading : profile.name || '',
      bannerSubheading: typeof b.subheading === 'string' ? b.subheading : profile.slogan || '',
      bannerTextColor: typeof b.textColor === 'string' ? b.textColor : '#FFFFFF',

      name: profile.name || '',
      slogan: profile.slogan || '',
      category: profile.category || '',

      aboutTitle: typeof about.title === 'string' ? (about.title as string) : '',
      aboutDescription: typeof about.description === 'string' ? (about.description as string) : '',
      aboutAlignment: typeof about.alignment === 'string' ? (about.alignment as 'center' | 'left') : 'center',

      // Footer settings (prefer dedicated footer JSON, fallback to about JSON, then profile/name defaults)
      footerBusinessName:
        (profile as unknown as Record<string, unknown>).footer_business_name as string
          ?? (typeof footer.businessName === 'string' ? (footer.businessName as string) : undefined)
          ?? (typeof about.businessName === 'string' ? (about.businessName as string) : undefined)
          ?? profile.name
          ?? '',
      footerAddress:
        (profile as unknown as Record<string, unknown>).footer_address as string
          ?? (typeof footer.address === 'string' ? (footer.address as string) : undefined)
          ?? (typeof about.address === 'string' ? (about.address as string) : undefined)
          ?? '',
      footerEmail:
        (profile as unknown as Record<string, unknown>).footer_email as string
          ?? (typeof footer.email === 'string' ? (footer.email as string) : undefined)
          ?? (typeof about.email === 'string' ? (about.email as string) : undefined)
          ?? '',
      footerPhone:
        (profile as unknown as Record<string, unknown>).footer_phone as string
          ?? (typeof footer.phone === 'string' ? (footer.phone as string) : undefined)
          ?? (typeof about.phone === 'string' ? (about.phone as string) : undefined)
          ?? '',
      footerHours: (() => {
        const col = (profile as unknown as Record<string, unknown>).footer_hours;
        if (col && typeof col === 'object') return col as Record<string, { open: string; close: string; closed: boolean }>;
        if (footer && typeof footer === 'object' && 'hours' in footer && typeof (footer as Record<string, unknown>).hours === 'object') {
          return (footer as Record<string, unknown>).hours as Record<string, { open: string; close: string; closed: boolean }>;
        }
        if (about && typeof about === 'object' && 'hours' in about && typeof (about as Record<string, unknown>).hours === 'object') {
          return (about as Record<string, unknown>).hours as Record<string, { open: string; close: string; closed: boolean }>;
        }
        return {
          monday: { open: '09:00', close: '17:00', closed: false },
          tuesday: { open: '09:00', close: '17:00', closed: false },
          wednesday: { open: '09:00', close: '17:00', closed: false },
          thursday: { open: '09:00', close: '17:00', closed: false },
          friday: { open: '09:00', close: '17:00', closed: false },
          saturday: { open: '10:00', close: '16:00', closed: false },
          sunday: { open: '10:00', close: '16:00', closed: true },
        } as Record<string, { open: string; close: string; closed: boolean }>;
      })(),
      footerNextAvailable:
        (profile as unknown as Record<string, unknown>).footer_next_available as string
          ?? (typeof footer.nextAvailable === 'string' ? (footer.nextAvailable as string) : undefined)
          ?? (typeof about.nextAvailable === 'string' ? (about.nextAvailable as string) : undefined)
          ?? '',
      footerCancellationPolicy:
        (profile as unknown as Record<string, unknown>).footer_cancellation_policy as string
          ?? (typeof footer.cancellationPolicy === 'string' ? (footer.cancellationPolicy as string) : undefined)
          ?? (typeof about.cancellationPolicy === 'string' ? (about.cancellationPolicy as string) : undefined)
          ?? 'Plans changed? Reschedule or cancel 24h in advance to avoid a fee.',
      footerPrivacyPolicy:
        (profile as unknown as Record<string, unknown>).footer_privacy_policy as string
          ?? (typeof footer.privacyPolicy === 'string' ? (footer.privacyPolicy as string) : undefined)
          ?? (typeof about.privacyPolicy === 'string' ? (about.privacyPolicy as string) : undefined)
          ?? 'We only use your details to manage your appointment. No spam.',
      footerTermsOfService:
        (profile as unknown as Record<string, unknown>).footer_terms_of_service as string
          ?? (typeof footer.termsOfService === 'string' ? (footer.termsOfService as string) : undefined)
          ?? (typeof about.termsOfService === 'string' ? (about.termsOfService as string) : undefined)
          ?? 'Secure booking handled by top booking platforms.',
      footerShowMaps:
        ((profile as unknown as Record<string, unknown>).footer_show_maps as boolean)
          ?? (typeof footer.showMaps === 'boolean' ? (footer.showMaps as boolean) : undefined)
          ?? (typeof about.showMaps === 'boolean' ? (about.showMaps as boolean) : undefined)
          ?? true,
      footerShowAttribution:
        ((profile as unknown as Record<string, unknown>).footer_show_attribution as boolean)
          ?? (typeof footer.showAttribution === 'boolean' ? (footer.showAttribution as boolean) : undefined)
          ?? (typeof about.showAttribution === 'boolean' ? (about.showAttribution as boolean) : undefined)
          ?? true,

      socials: Array.isArray(profile.socials) ? (profile.socials as SocialItem[]) : [],

      bookingUrl: profile.booking_url || '',
      bookingMode: 'embed',

      testimonials: Array.isArray(tRaw) ? (tRaw as TestimonialItem[]) : testimonialsFromAbout,

      mediaOrder: existingMediaUrls,
    }));
  }, [profile]);

  // update baseline when profile loads or after save
  useEffect(() => {
    if (!profile) return;
    setBaseline(dirtySnapshot(design));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile]);



  // beforeunload prompt
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (!isDirty) return;
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [isDirty]);

  const sanitizeFileName = (name: string): string => {
    const dot = name.lastIndexOf('.');
    const base = (dot > -1 ? name.slice(0, dot) : name)
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-zA-Z0-9-_]+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
      .toLowerCase();
    const ext = dot > -1 ? name.slice(dot).toLowerCase().replace(/[^a-z0-9.]+/g, '') : '';
    return (base || 'file') + ext;
  };

  const uploadDesignFile = async (bucket: 'avatars' | 'media', file: File) => {
    if (!user) return null;
    const safe = sanitizeFileName(file.name);
    const filePath = `${user.id}/${Date.now()}-${safe}`;
    const { error } = await supabase.storage.from(bucket).upload(filePath, file, {
      cacheControl: '3600',
      upsert: false,
    });
    if (error) return null;
    const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);
    return data?.publicUrl ?? null;
  };

  const saveDesign = async () => {
    if (!user || !profile) return;
    try {
      setDesignLoading(true);

      // Avatar
      let avatar_url = profile.avatar_url || null;
      if (design.avatarFile) {
        const url = await uploadDesignFile('avatars', design.avatarFile);
        if (url) avatar_url = url;
      }

      // Banner
      const banner: Banner = { 
        type: design.bannerType as 'color' | 'image',
        heading: design.bannerHeading || profile.name || '',
        subheading: design.bannerSubheading || profile.slogan || '',
        textColor: design.bannerTextColor || '#FFFFFF'
      };

      if (design.bannerType === 'color') {
        banner.color = design.bannerColor || '#6E56CF';
      } else if (design.bannerType === 'image') {
        if (design.bannerImageFile) {
          const url = await uploadDesignFile('media', design.bannerImageFile);
          if (url) banner.imageUrl = url;
        } else {
          const existing = (profile.banner ?? {}) as Partial<Banner>;
          if (existing.imageUrl) banner.imageUrl = existing.imageUrl;
          if (existing.color) banner.color = existing.color;
        }
      }

      // Testimonials: upload any new images
      const testimonialsForSave: TestimonialItem[] = [];
      for (let i = 0; i < design.testimonials.length; i += 1) {
        const t = design.testimonials[i] as WithFile;
        let image_url = t.image_url;
        if (t._file) {
          const url = await uploadDesignFile('media', t._file);
          if (url) image_url = url;
          delete t._file;
        }
        testimonialsForSave.push({
          customer_name: t.customer_name || '',
          review_title: t.review_title || '',
          review_text: t.review_text || '',
          image_url,
        });
      }

      // About
      const about = {
        title: design.aboutTitle || null,
        description: design.aboutDescription || null,
        alignment: design.aboutAlignment,
        testimonials: testimonialsForSave,
        // Footer settings
        businessName: design.footerBusinessName || null,
        address: design.footerAddress || null,
        email: design.footerEmail || null,
        phone: design.footerPhone || null,
        hours: design.footerHours || null,
        nextAvailable: design.footerNextAvailable || null,
        cancellationPolicy: design.footerCancellationPolicy || null,
        privacyPolicy: design.footerPrivacyPolicy || null,
        termsOfService: design.footerTermsOfService || null,
        showMaps: design.footerShowMaps,
        showAttribution: design.footerShowAttribution,
      };

      // Media: use reordered existing, then append new uploads
      const reorderedExisting: MediaItem[] = design.mediaOrder.map((u) => ({ url: u, kind: 'image' }));
      const newlyUploaded: MediaItem[] = [];
      for (const f of design.mediaFiles) {
        const url = await uploadDesignFile('media', f);
        if (url) newlyUploaded.push({ url, kind: 'image' });
      }
      const media = { items: [...reorderedExisting, ...newlyUploaded] } as Json;

      const updatePayload = {
        name: design.name || null,
        slogan: design.slogan || null,
        category: design.category || null,
        avatar_url,
        banner: banner as Json,
        about: about as Json,
        media,
        socials: design.socials as Json,
        booking_url: design.bookingUrl || null,
        booking_mode: 'embed' as const,
        // testimonials: testimonialsForSave, // Disabled until DB column exists
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase.from('profiles').update(updatePayload).eq('id', profile.id).eq('user_id', user.id);
      if (error) throw error;
      toast({ title: 'Saved', description: 'Your design changes were saved.' });

      // Reset files and refresh profile
      setDesign((d) => ({ ...d, mediaFiles: [], avatarFile: null, bannerImageFile: null }));
      const { data: refreshed } = await supabase.from('profiles').select('*').eq('id', profile.id).eq('user_id', user.id).single();
      if (refreshed) setProfile(refreshed as Profile);
      setBaseline(dirtySnapshot({ ...design, mediaFiles: [], avatarFile: null, bannerImageFile: null }));
      setPreviewKey(prev => prev + 1);
    } catch (e) {
      toast({ title: 'Save failed', description: 'Please try again.', variant: 'destructive' });
    } finally {
      setDesignLoading(false);
    }
  };

  // Add individual save functions for different sections
  const saveBanner = async () => {
    if (!user || !profile) return;
    try {
      setDesignLoading(true);

      // Banner
      const banner: Banner = { 
        type: design.bannerType as 'color' | 'image',
        heading: design.bannerHeading || profile.name || '',
        subheading: design.bannerSubheading || profile.slogan || '',
        textColor: design.bannerTextColor || '#FFFFFF'
      };

      if (design.bannerType === 'color') {
        banner.color = design.bannerColor || '#6E56CF';
      } else if (design.bannerType === 'image') {
        if (design.bannerImageFile) {
          const url = await uploadDesignFile('media', design.bannerImageFile);
          if (url) banner.imageUrl = url;
        } else {
          const existing = (profile.banner ?? {}) as Partial<Banner>;
          if (existing.imageUrl) banner.imageUrl = existing.imageUrl;
          if (existing.color) banner.color = existing.color;
        }
      }

      const bannerJson = banner as Json;

      const { error } = await supabase
        .from('profiles')
        .update({ banner: bannerJson as Json, updated_at: new Date().toISOString() })
        .eq('id', profile.id)
        .eq('user_id', user.id);

      if (error) throw error;
      toast({ title: 'Banner saved', description: 'Your banner changes were saved.' });

      // Reset file and refresh profile
      setDesign((d) => ({ ...d, bannerImageFile: null }));
      const { data: refreshed } = await supabase.from('profiles').select('*').eq('id', profile.id).eq('user_id', user.id).single();
      if (refreshed) setProfile(refreshed as Profile);
      setBaseline(dirtySnapshot({ ...design, bannerImageFile: null }));
      setPreviewKey(prev => prev + 1);
    } catch (e) {
      toast({ title: 'Save failed', description: 'Please try again.', variant: 'destructive' });
    } finally {
      setDesignLoading(false);
    }
  };

  const saveProfile = async () => {
    if (!user || !profile) return;
    try {
      setDesignLoading(true);

      // Avatar
      let avatar_url = profile.avatar_url || null;
      if (design.avatarFile) {
        const url = await uploadDesignFile('avatars', design.avatarFile);
        if (url) avatar_url = url;
      }

      const { error } = await supabase
        .from('profiles')
        .update({ 
          name: design.name || null,
          slogan: design.slogan || null,
          category: design.category || null,
          avatar_url,
          updated_at: new Date().toISOString()
        })
        .eq('id', profile.id)
        .eq('user_id', user.id);

      if (error) throw error;
      toast({ title: 'Profile saved', description: 'Your profile changes were saved.' });

      // Reset file and refresh profile
      setDesign((d) => ({ ...d, avatarFile: null }));
      const { data: refreshed } = await supabase.from('profiles').select('*').eq('id', profile.id).eq('user_id', user.id).single();
      if (refreshed) setProfile(refreshed as Profile);
      setBaseline(dirtySnapshot({ ...design, avatarFile: null }));
      setPreviewKey(prev => prev + 1);
    } catch (e) {
      toast({ title: 'Save failed', description: 'Please try again.', variant: 'destructive' });
    } finally {
      setDesignLoading(false);
    }
  };

  const saveAbout = async () => {
    if (!user || !profile) return;
    try {
      setDesignLoading(true);

      // About - preserve existing testimonials if they exist
      const existingAbout = (profile.about ?? {}) as { [key: string]: unknown };
      const about = {
        title: design.aboutTitle || null,
        description: design.aboutDescription || null,
        alignment: design.aboutAlignment,
        testimonials: existingAbout.testimonials || null,
      } as Json;

      const { error } = await supabase
        .from('profiles')
        .update({ 
          about: about as Json,
          updated_at: new Date().toISOString()
        })
        .eq('id', profile.id)
        .eq('user_id', user.id);

      if (error) throw error;
      toast({ title: 'About section saved', description: 'Your about section changes were saved.' });

      // Refresh profile
      const { data: refreshed } = await supabase.from('profiles').select('*').eq('id', profile.id).eq('user_id', user.id).single();
      if (refreshed) setProfile(refreshed as Profile);
      setBaseline(dirtySnapshot(design));
    } catch (e) {
      toast({ title: 'Save failed', description: 'Please try again.', variant: 'destructive' });
    } finally {
      setDesignLoading(false);
    }
  };

  const saveFooter = async () => {
    if (!user || !profile) return;
    try {
      setDesignLoading(true);

      const footer = {
        businessName: design.footerBusinessName || null,
        address: design.footerAddress || null,
        email: design.footerEmail || null,
        phone: design.footerPhone || null,
        hours: design.footerHours || null,
        nextAvailable: design.footerNextAvailable || null,
        cancellationPolicy: design.footerCancellationPolicy || null,
        privacyPolicy: design.footerPrivacyPolicy || null,
        termsOfService: design.footerTermsOfService || null,
        showMaps: design.footerShowMaps,
        showAttribution: design.footerShowAttribution,
      } as Json;

      const { error } = await supabase
        .from('profiles')
        .update({ 
          // Write to the same columns onboarding uses
          footer_business_name: design.footerBusinessName || null,
          footer_address: design.footerAddress || null,
          footer_email: design.footerEmail || null,
          footer_phone: design.footerPhone || null,
          footer_hours: design.footerHours || null,
          footer_next_available: design.footerNextAvailable || null,
          footer_cancellation_policy: design.footerCancellationPolicy || null,
          footer_privacy_policy: design.footerPrivacyPolicy || null,
          footer_terms_of_service: design.footerTermsOfService || null,
          footer_show_maps: design.footerShowMaps,
          footer_show_attribution: design.footerShowAttribution,
          // Keep JSON footer in sync for backward-compatible readers
          footer: footer as Json,
          // Optionally mirror businessName to profile.name if provided
          name: design.footerBusinessName || profile.name || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', profile.id)
        .eq('user_id', user.id);

      if (error) throw error;
      toast({ title: 'Footer saved', description: 'Your footer settings were saved.' });

      // Refresh profile
      const { data: refreshed } = await supabase.from('profiles').select('*').eq('id', profile.id).eq('user_id', user.id).single();
      if (refreshed) setProfile(refreshed as Profile);
      setBaseline(dirtySnapshot(design));
      setPreviewKey(prev => prev + 1);
    } catch (e) {
      toast({ title: 'Save failed', description: 'Please try again.', variant: 'destructive' });
    } finally {
      setDesignLoading(false);
    }
  };

  const saveMedia = async () => {
    if (!user || !profile) return;
    try {
      setDesignLoading(true);

      // Media: use reordered existing, then append new uploads
      const reorderedExisting: MediaItem[] = design.mediaOrder.map((u) => ({ url: u, kind: 'image' }));
      const newlyUploaded: MediaItem[] = [];
      for (const f of design.mediaFiles) {
        const url = await uploadDesignFile('media', f);
        if (url) newlyUploaded.push({ url, kind: 'image' });
      }
      const media = { items: [...reorderedExisting, ...newlyUploaded] } as Json;

      const { error } = await supabase
        .from('profiles')
        .update({ 
          media: media as Json,
          updated_at: new Date().toISOString()
        })
        .eq('id', profile.id)
        .eq('user_id', user.id);

      if (error) throw error;
      toast({ title: 'Media gallery saved', description: 'Your media gallery changes were saved.' });

      // Reset files and refresh profile
      setDesign((d) => ({ ...d, mediaFiles: [] }));
      const { data: refreshed } = await supabase.from('profiles').select('*').eq('id', profile.id).eq('user_id', user.id).single();
      if (refreshed) setProfile(refreshed as Profile);
      setBaseline(dirtySnapshot({ ...design, mediaFiles: [] }));
      setPreviewKey(prev => prev + 1);
    } catch (e) {
      toast({ title: 'Save failed', description: 'Please try again.', variant: 'destructive' });
    } finally {
      setDesignLoading(false);
    }
  };

  const saveSocials = async () => {
    if (!user || !profile) return;
    try {
      setDesignLoading(true);

      const { error } = await supabase
        .from('profiles')
        .update({ 
          socials: design.socials as Json,
          updated_at: new Date().toISOString()
        })
        .eq('id', profile.id)
        .eq('user_id', user.id);

      if (error) throw error;
      toast({ title: 'Social links saved', description: 'Your social links changes were saved.' });

      // Refresh profile
      const { data: refreshed } = await supabase.from('profiles').select('*').eq('id', profile.id).eq('user_id', user.id).single();
      if (refreshed) setProfile(refreshed as Profile);
      setBaseline(dirtySnapshot(design));
      setPreviewKey(prev => prev + 1);
    } catch (e) {
      toast({ title: 'Save failed', description: 'Please try again.', variant: 'destructive' });
    } finally {
      setDesignLoading(false);
    }
  };

  const saveBooking = async () => {
    if (!user || !profile) return;
    try {
      setDesignLoading(true);

      const { error } = await supabase
        .from('profiles')
        .update({ 
          booking_url: design.bookingUrl || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', profile.id)
        .eq('user_id', user.id);

      if (error) throw error;
      toast({ title: 'Booking settings saved', description: 'Your booking settings were saved.' });

      // Refresh profile
      const { data: refreshed } = await supabase.from('profiles').select('*').eq('id', profile.id).eq('user_id', user.id).single();
      if (refreshed) setProfile(refreshed as Profile);
      setBaseline(dirtySnapshot(design));
      setPreviewKey(prev => prev + 1);
    } catch (e) {
      toast({ title: 'Save failed', description: 'Please try again.', variant: 'destructive' });
    } finally {
      setDesignLoading(false);
    }
  };

  const saveTestimonials = async () => {
    if (!user || !profile) return;
    try {
      setDesignLoading(true);

      // Testimonials: upload any new images
      const testimonialsForSave: TestimonialItem[] = [];
      for (let i = 0; i < design.testimonials.length; i += 1) {
        const t = design.testimonials[i] as WithFile;
        let image_url = t.image_url;
        if (t._file) {
          const url = await uploadDesignFile('media', t._file);
          if (url) image_url = url;
          delete t._file;
        }
        testimonialsForSave.push({
          customer_name: t.customer_name || '',
          review_title: t.review_title || '',
          review_text: t.review_text || '',
          image_url,
        });
      }

      // Note: testimonials column doesn't exist in DB yet, so we'll store in about for now
      const about = {
        title: design.aboutTitle || null,
        description: design.aboutDescription || null,
        alignment: design.aboutAlignment,
        testimonials: testimonialsForSave,
        // Footer settings
        businessName: design.footerBusinessName || null,
        address: design.footerAddress || null,
        email: design.footerEmail || null,
        phone: design.footerPhone || null,
        hours: design.footerHours || null,
        nextAvailable: design.footerNextAvailable || null,
        cancellationPolicy: design.footerCancellationPolicy || null,
        privacyPolicy: design.footerPrivacyPolicy || null,
        termsOfService: design.footerTermsOfService || null,
        showMaps: design.footerShowMaps,
        showAttribution: design.footerShowAttribution,
      } as Json;

      const { error } = await supabase
        .from('profiles')
        .update({ 
          about: about as Json,
          updated_at: new Date().toISOString()
        })
        .eq('id', profile.id);

      if (error) throw error;
      toast({ title: 'Testimonials saved', description: 'Your testimonials were saved.' });

      // Refresh profile
      const { data: refreshed } = await supabase.from('profiles').select('*').eq('id', profile.id).eq('user_id', user.id).single();
      if (refreshed) setProfile(refreshed as Profile);
      setBaseline(dirtySnapshot(design));
      setPreviewKey(prev => prev + 1);
    } catch (e) {
      toast({ title: 'Save failed', description: 'Please try again.', variant: 'destructive' });
    } finally {
      setDesignLoading(false);
    }
  };

  // Auto-save placeholder testimonials when they're first added
  useEffect(() => {
    if (!profile || !user) return;
    
    // Check if we have placeholder testimonials that need to be saved
    const hasPlaceholderTestimonials = design.testimonials.length > 0 && 
      design.testimonials.every(t => 
        t.customer_name === 'Sarah Johnson' || 
        t.customer_name === 'Mike Chen' || 
        t.customer_name === 'Emily Rodriguez'
      );
    
    // Check if testimonials exist in the database
    const about = (profile.about ?? {}) as { [key: string]: unknown };
    const hasTestimonialsInDB = typeof about.testimonials === 'object' && Array.isArray(about.testimonials) && about.testimonials.length > 0;
    
    // If we have placeholder testimonials but none in DB, auto-save them
    if (hasPlaceholderTestimonials && !hasTestimonialsInDB) {
      // Wait a bit for the state to fully update, then auto-save
      const timer = setTimeout(() => {
        saveTestimonials();
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [design.testimonials, profile, user, saveTestimonials]);

  // Function to remove media item from database
  const removeMediaItem = async (url: string, index: number) => {
    if (!user || !profile) return;
    try {
      setDesignLoading(true);

      // Remove from local state
      const newMediaOrder = design.mediaOrder.filter((_, i) => i !== index);
      setDesign((d) => ({ ...d, mediaOrder: newMediaOrder }));

      // Update database
      const reorderedExisting: MediaItem[] = newMediaOrder.map((u) => ({ url: u, kind: 'image' }));
      const media = { items: reorderedExisting } as Json;

      const { error } = await supabase
        .from('profiles')
        .update({ 
          media: media as Json,
          updated_at: new Date().toISOString()
        })
        .eq('id', profile.id)
        .eq('user_id', user.id);

      if (error) throw error;
      toast({ title: 'Image removed', description: 'Image was removed from your gallery.' });

      // Refresh profile
      const { data: refreshed } = await supabase.from('profiles').select('*').eq('id', profile.id).eq('user_id', user.id).single();
      if (refreshed) setProfile(refreshed as Profile);
      setBaseline(dirtySnapshot({ ...design, mediaOrder: newMediaOrder }));
      setPreviewKey(prev => prev + 1);
    } catch (e) {
      toast({ title: 'Remove failed', description: 'Please try again.', variant: 'destructive' });
      // Revert local state on error
      setDesign((d) => ({ ...d, mediaOrder: design.mediaOrder }));
    } finally {
      setDesignLoading(false);
    }
  };

  // Drag & drop media ordering
  const handleMediaDragStart = (index: number) => setDesign((d) => ({ ...d, draggedIndex: index }));
  const handleMediaDragOver = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    e.preventDefault();
    const from = design.draggedIndex;
    if (from === null || from === index) return;
    const next = [...design.mediaOrder];
    const [moved] = next.splice(from, 1);
    next.splice(index, 0, moved);
    setDesign((d) => ({ ...d, mediaOrder: next, draggedIndex: index }));
  };
  const handleMediaDrop = () => setDesign((d) => ({ ...d, draggedIndex: null }));

  useEffect(() => {
    if (user) {
      loadProfile();
    } else if (user === null) {
      setProfileLoading(false);
    }
  }, [user]);

  // Handle URL parameters for Stripe checkout results
  useEffect(() => {
    const success = searchParams.get('success');
    const canceled = searchParams.get('canceled');

    if (success === 'true') {
      toast({
        title: "Betaling Succesvol! 🎉",
        description: "Je abonnement is geactiveerd. Je profiel is nu live!",
      });
      // Refresh profile data to show updated subscription status
      if (user) {
        loadProfile();
      }
    }

    if (canceled === 'true') {
      toast({
        title: "Betaling Geannuleerd",
        description: "Je betaling is geannuleerd. Je kunt het later opnieuw proberen.",
        variant: "destructive",
      });
    }
  }, [searchParams, user, toast]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (profileLoading) {
        console.log('Dashboard loading timeout - checking user state');
        if (!user) {
          setProfileLoading(false);
        }
      }
    }, 5000);

    return () => clearTimeout(timeout);
  }, [profileLoading, user]);

  // Close sidebar on mobile when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sidebarOpen && window.innerWidth < 1024) {
        const sidebar = document.getElementById('sidebar');
        if (sidebar && !sidebar.contains(event.target as Node)) {
          setSidebarOpen(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [sidebarOpen]);

  const loadProfile = async () => {
    try {
      if (!user?.id) {
        console.log('No user ID available');
        return;
      }
      
      console.log('Loading profile for user:', user.id);
      
      // Alleen profile data laden zonder subscriptions (geen permissies)
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      console.log('Profile query result:', { data, error });

      if (error) {
        console.error('Supabase error:', error);
        setProfile(null);
        return;
      }

      if (data) {
        // Log de handle specifiek om te zien of deze wordt geladen
        console.log('Profile loaded successfully:', {
          id: data.id,
          handle: data.handle,
          name: data.name,
          status: data.status,
          user_id: data.user_id
        });
        
        // Controleer of handle aanwezig is
        if (!data.handle) {
          console.error('❌ Profile loaded but handle is missing:', data);
        } else {
          console.log('✅ Handle found:', data.handle);
        }
        
        setProfile(data);
        
        // Load booking URL if it exists
        if (data.booking_url) {
          setBookingUrl(data.booking_url);
        }
        
        // Load social links if they exist
        if (data.socials && typeof data.socials === 'object') {
          const currentSocials = data.socials as Record<string, string>;
          setSocialLinks(prev => 
            prev.map(link => ({
              ...link,
              url: currentSocials[link.platform] || link.url,
              isSaved: !!currentSocials[link.platform]
            }))
          );
        }
      } else {
        console.log('No profile found, showing dashboard without profile');
        setProfile(null);
      }
    } catch (error) {
      console.error('Profile loading error:', error);
      setProfile(null);
    } finally {
      setProfileLoading(false);
    }
  };

  const saveBookingUrl = async () => {
    if (!profile || !user?.id) return;
    
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ booking_url: bookingUrl })
        .eq('id', profile.id)
        .eq('user_id', user.id); // Ensure we're updating the correct user's profile

      if (error) throw error;

      toast({
        title: "Booking URL Saved!",
        description: "Your booking link has been updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Save Failed",
        description: "Failed to save booking URL. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const updateSocialLink = async (linkId: string, newUrl: string) => {
    if (!profile || !user?.id) return;
    
    try {
      // Update local state
      setSocialLinks(prev => 
        prev.map(link => 
          link.id === linkId 
            ? { ...link, url: newUrl, isSaved: false }
            : link
        )
      );

      // Save to database
      const currentSocials = (profile.socials as Record<string, string>) || {};
      const updatedSocials = {
        ...currentSocials,
        [socialLinks.find(l => l.id === linkId)?.platform || '']: newUrl
      };

      const { error } = await supabase
        .from('profiles')
        .update({ socials: updatedSocials })
        .eq('id', profile.id)
        .eq('user_id', user.id); // Ensure we're updating the correct user's profile

      if (error) throw error;

      // Mark as saved
      setSocialLinks(prev => 
        prev.map(link => 
          link.id === linkId 
            ? { ...link, isSaved: true }
            : link
        )
      );

      toast({
        title: "Link Updated!",
        description: "Social link has been saved successfully.",
      });
    } catch (error) {
      toast({
        title: "Update Failed",
        description: "Failed to update social link. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Helper to extract existing media urls from profile.media (supports array or { items: [...] })
  const getExistingMediaUrls = (): string[] => {
    const m: unknown = profile?.media as unknown;
    const urls: string[] = [];
    const pushUrl = (v: unknown) => {
      if (typeof v === 'string') urls.push(v);
      else if (typeof v === 'object' && v !== null) {
        const r = v as Record<string, unknown>;
        if (typeof r.url === 'string') urls.push(r.url);
        else if (typeof r.imageUrl === 'string') urls.push(r.imageUrl);
        else if (typeof r.fileName === 'string') urls.push(r.fileName);
      }
    };
    if (Array.isArray(m)) {
      m.forEach(pushUrl);
    } else if (typeof m === 'object' && m !== null) {
      const items = (m as Record<string, unknown>).items;
      if (Array.isArray(items)) items.forEach(pushUrl);
    }
    return urls;
  };

  // Voeg deze functie toe voor adres suggesties
  const getAddressSuggestions = async (input: string) => {
    if (input.length < 3) {
      setAddressSuggestions([]);
      return;
    }

    try {
      // Google Places Autocomplete API
      const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
      if (!apiKey) {
        console.warn('Google Maps API key niet gevonden');
        return;
      }

      const response = await fetch(
        `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(input)}&types=address&components=country:nl&key=${apiKey}`
      );

      const data = await response.json();
      
      if (data.predictions) {
        const suggestions = data.predictions.map((pred: { description: string }) => pred.description);
        setAddressSuggestions(suggestions);
        setShowAddressSuggestions(true);
      }
    } catch (error) {
      console.error('Error fetching address suggestions:', error);
    }
  };

  // Voeg deze functie toe voor het selecteren van een adres
  const selectAddress = (address: string) => {
    setDesign((d) => ({ ...d, footerAddress: address }));
    setAddressInputValue(address);
    setShowAddressSuggestions(false);
    setAddressSuggestions([]);
  };

  if (authLoading || profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">
            {authLoading ? 'Checking authentication...' : 'Loading your dashboard...'}
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Authentication Required</h2>
          <p className="text-gray-600 mb-6">Please log in to access your dashboard.</p>
          <Button onClick={() => navigate('/login')}>
            Go to Login
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden" />
      )}

      {/* Left Sidebar (refactored) */}
      <DashboardSidebar
        profileName={profile?.name || user.email || 'User'}
        userInitial={profile?.name?.charAt(0)?.toUpperCase() || user.email?.charAt(0)?.toUpperCase() || 'U'}
        activeSection={activeSection}
        onChangeSection={(s) => setActiveSection(s)}
        onSignOut={() => { signOut(); navigate('/') }}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header (refactored) */}
        <DashboardHeader onOpenSidebar={() => setSidebarOpen(true)} title={t('dashboard.title')} />

        {/* Main Content */}
        <main className="flex-1 p-4 lg:p-6">
          <div className="max-w-6xl">
            {/* Welcome Section */}
            {/* {!profile && (
              <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl p-6 lg:p-8 mb-8 text-white">
                <div className="max-w-2xl">
                  <h2 className="text-2xl lg:text-3xl font-bold mb-4">Welcome to Bookr! 🎉</h2>
                  <p className="text-base lg:text-lg mb-6 text-purple-100">
                    Create your $1000 website in minutes. All by yourself.
                  </p>
                  <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
                    <Button 
                      onClick={() => navigate('/onboarding')}
                      size="lg"
                      className="bg-white text-purple-600 hover:bg-gray-100 w-full sm:w-auto"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Get Started
                    </Button>
                    <Button 
                      variant="outline" 
                      size="lg"
                      className="border-white text-black hover:bg-white hover:text-purple-600 w-full sm:w-auto"
                    >
                      <Star className="w-4 h-4 mr-2" />
                      Learn More
                    </Button>
                  </div>
                </div>
              </div>
            )} */}

            <div className="mb-8">
              <h2 className="text-lg font-semibold mb-2">Jouw publieke pagina</h2>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <div className="flex items-center bg-gray-100 rounded-md px-3 py-2">
                  <span className="text-gray-600 mr-2">Handle:</span>
                  <span className="font-mono text-purple-700">@{profile?.handle || '...'}</span>
                </div>
                <div className="flex items-center bg-gray-100 rounded-md px-3 py-2">
                  <span className="text-gray-600 mr-2">URL:</span>
                  <a
                    href={profile?.handle ? `https://tapbookr.com/${profile.handle}` : '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline break-all"
                  >
                    {profile?.handle ? `https://tapbookr.com/${profile.handle}` : '...'}
                  </a>
                </div>
              </div>
            </div>

            {/* Design Section */}
            {activeSection === 'design' && (
              <div className="space-y-8">
                {/* Page Header */}
                <div className="bg-white rounded-lg p-6 border border-gray-200">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900">Pagina Designer</h3>
                      <p className="text-gray-600 mt-1">Pas je publieke pagina aan en zie live preview</p>
                    </div>
                    <Button onClick={saveDesign} disabled={designLoading} size="lg">
                      {designLoading ? 'Opslaan…' : 'Alle Wijzigingen Opslaan'}
                    </Button>
                  </div>
                </div>

                {/* Live Preview Section */}
                <div className="bg-white rounded-lg p-6 border border-gray-200">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h4 className="text-xl font-semibold text-gray-900"> Live Voorvertoning</h4>
                      <p className="text-gray-600 text-sm">Zie hoe je pagina eruit ziet voor bezoekers</p>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        setPreviewKey(prev => prev + 1);
                        const iframes = document.querySelectorAll('iframe[title*="Preview"]');
                        iframes.forEach(iframe => {
                          if (iframe instanceof HTMLIFrameElement) {
                            const currentSrc = iframe.src;
                            iframe.src = '';
                            setTimeout(() => {
                              iframe.src = currentSrc;
                            }, 100);
                          }
                        });
                      }}
                    >
                       Vernieuwen
                    </Button>
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex justify-center">
                      <div className="relative">
                        {/* iPhone Frame */}
                        <div className="relative bg-black rounded-[2.5rem] p-1.5 shadow-2xl">
                          <div className="bg-white rounded-[2rem] overflow-hidden" style={{ width: '320px', height: '692px' }}>
                            <iframe
                              key={previewKey}
                              src={`https://tapbookr.com/${profile?.handle}`}
                              className="w-full h-full"
                              title="iPhone Preview"
                              style={{ 
                                border: 'none',
                                transform: 'scale(0.8)',
                                transformOrigin: 'top left',
                                width: '125%',
                                height: '125%'
                              }}
                            />
                          </div>
                        </div>
                        
                        {/* iPhone Details */}
                        <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-28 h-1 bg-black rounded-full opacity-60"></div>
                        <div className="absolute top-1.5 left-1/2 transform -translate-x-1/2 w-20 h-6 bg-black rounded-b-2xl"></div>
                        <div className="absolute left-0 top-20 w-1 h-8 bg-gray-800 rounded-r-sm"></div>
                        <div className="absolute left-0 top-32 w-1 h-8 bg-gray-800 rounded-r-sm"></div>
                        <div className="absolute right-0 top-24 w-1 h-12 bg-gray-800 rounded-l-sm"></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Design Sections */}
                <div className="space-y-6">
                  {/* 1) Banner Section */}
                  <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                    <div className="bg-gradient-to-r from-blue-50 to-purple-50 px-6 py-4 border-b border-gray-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                            <span className="text-white text-sm font-bold">1</span>
                          </div>
                          <div>
                            <h4 className="text-lg font-semibold text-gray-900">🎨 Banner & Hoofdtekst</h4>
                            <p className="text-sm text-gray-600">Stel je hoofdbanner en titels in</p>
                          </div>
                        </div>
                        <Button onClick={saveBanner} disabled={designLoading} size="sm">
                          {designLoading ? 'Opslaan…' : 'Banner Opslaan'}
                        </Button>
                      </div>
                    </div>
                    
                    <div className="p-6 space-y-4">
                      {/* Banner Type Selection */}
                      <div className="flex gap-3">
                        {/* <Button
                          type="button"
                          variant={design.bannerType === 'color' ? 'default' : 'outline'}
                          onClick={() => setDesign((d) => ({ ...d, bannerType: 'color' }))}
                        >
                          🎨 Kleur gebruiken
                        </Button> */}
                        <Button
                          type="button"
                          variant={design.bannerType === 'image' ? 'default' : 'outline'}
                          onClick={() => setDesign((d) => ({ ...d, bannerType: 'image' }))}
                        >
                          📷 Afbeelding gebruiken
                        </Button>
                      </div>

                      {/* Banner Content Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label>Categorie</Label>
                          <Input
                            placeholder="bijv. Fotograaf, Designer, Consultant"
                            value={design.category}
                            onChange={(e) => setDesign((d) => ({ ...d, category: e.target.value }))}
                          />
                        </div>
                        <div>
                          <Label>Tekstkleur</Label>
                          <Input
                            type="color"
                            value={design.bannerTextColor}
                            onChange={(e) => setDesign((d) => ({ ...d, bannerTextColor: e.target.value }))}
                            className="w-24 p-1"
                          />
                        </div>
                        <div>
                          <Label>Banner Hoofdtitel</Label>
                          <Input
                            placeholder="Je hoofdtitel voor de banner"
                            value={design.bannerHeading}
                            onChange={(e) => setDesign((d) => ({ ...d, bannerHeading: e.target.value }))}
                          />
                        </div>
                        <div>
                          <Label>Banner Ondertitel</Label>
                          <Input
                            placeholder="Je ondertitel of tagline"
                            value={design.bannerSubheading}
                            onChange={(e) => setDesign((d) => ({ ...d, bannerSubheading: e.target.value }))}
                          />
                        </div>
                      </div>

                      {/* Banner Background */}
                      {design.bannerType === 'color' ? (
                        <div className="flex items-center gap-3">
                          <Label className="w-32">Achtergrondkleur</Label>
                          <Input
                            type="color"
                            value={design.bannerColor}
                            onChange={(e) => setDesign((d) => ({ ...d, bannerColor: e.target.value }))}
                            className="w-24 p-1"
                          />
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <Label>Banner afbeelding</Label>
                          <div className="flex items-center gap-3">
                            <Button type="button" variant="outline" onClick={() => bannerInputRef.current?.click()}>
                              {bannerPreview ? ' Banner wijzigen' : ' Banner uploaden'}
                            </Button>
                            <input
                              ref={bannerInputRef}
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files?.[0] || null;
                                setDesign((d) => ({ ...d, bannerImageFile: file }));
                                if (file) setBannerPreview(URL.createObjectURL(file));
                              }}
                            />
                          </div>
                          
                          {/* Current banner preview */}
                          <div className="mt-2">
                            <p className="text-xs text-gray-500 mb-1">Huidige banner</p>
                            <div className="w-full max-w-md aspect-[3/1] rounded-md overflow-hidden border bg-gray-100">
                              {bannerPreview ? (
                                <img src={bannerPreview} className="w-full h-full object-cover" />
                              ) : (
                                (() => {
                                  const bPreview: BannerPartial = (profile?.banner ?? {}) as BannerPartial;
                                  const color = typeof bPreview.color === 'string' ? bPreview.color : '#e5e7eb';
                                  return <div style={{ backgroundColor: color }} className="w-full h-full" />;
                                })()
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* 2) Profile Section */}
                  <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                    <div className="bg-gradient-to-r from-green-50 to-blue-50 px-6 py-4 border-b border-gray-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                            <span className="text-white text-sm font-bold">2</span>
                          </div>
                          <div>
                            <h4 className="text-lg font-semibold text-gray-900"> Profiel & Avatar</h4>
                            <p className="text-sm text-gray-600">Upload je profielfoto en stel basisinformatie in</p>
                          </div>
                        </div>
                        <Button onClick={saveProfile} disabled={designLoading} size="sm">
                          {designLoading ? 'Opslaan…' : 'Profiel Opslaan'}
                        </Button>
                      </div>
                    </div>
                    
                    <div className="p-6 space-y-4">
                      <div className="flex items-center gap-3">
                        <Button type="button" variant="outline" onClick={() => avatarInputRef.current?.click()}>
                          {avatarPreview ? ' Avatar wijzigen' : ' Avatar uploaden'}
                        </Button>
                        <input
                          ref={avatarInputRef}
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0] || null;
                            setDesign((d) => ({ ...d, avatarFile: file }));
                            if (file) setAvatarPreview(URL.createObjectURL(file));
                          }}
                        />
                      </div>
                      
                      {/* Current avatar preview */}
                      <div className="flex items-center gap-3">
                        <div className="w-16 h-16 rounded-full overflow-hidden border bg-gray-100">
                          {avatarPreview ? (
                            <img src={avatarPreview} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                              <span className="text-gray-400 text-lg">👤</span>
                            </div>
                          )}
                        </div>
                        <p className="text-sm text-gray-600">Huidige profielfoto</p>
                      </div>
                      
                      <div className="text-sm text-gray-500 bg-blue-50 p-3 rounded-lg">
                        💡 <strong>Tip:</strong> De "Maak kennis met" sectie gebruikt deze foto. Gebruik een foto van jezelf om meer vertrouwen te wekken bij bezoekers.
                      </div>
                    </div>
                  </div>

                  {/* 3) About Section */}
                  <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                    <div className="bg-gradient-to-r from-purple-50 to-pink-50 px-6 py-4 border-b border-gray-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center">
                            <span className="text-white text-sm font-bold">3</span>
                          </div>
                          <div>
                            <h4 className="text-lg font-semibold text-gray-900">📝 Over Sectie</h4>
                            <p className="text-sm text-gray-600">Schrijf je verhaal en stel tekstuitlijning in</p>
                          </div>
                        </div>
                        <Button onClick={saveAbout} disabled={designLoading} size="sm">
                          {designLoading ? 'Opslaan…' : 'Over Opslaan'}
                        </Button>
                      </div>
                    </div>
                    
                    <div className="p-6 space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label>Titel</Label>
                          <Input 
                            value={design.aboutTitle} 
                            onChange={(e) => setDesign((d) => ({ ...d, aboutTitle: e.target.value }))}
                            placeholder="Je over-sectie titel"
                          />
                        </div>
                        {/* <div>
                          <Label>Tekstuitlijning</Label>
                          <div className="flex gap-2">
                            <Button
                              type="button"
                              variant={design.aboutAlignment === 'center' ? 'default' : 'outline'}
                              size="sm"
                              onClick={() => setDesign((d) => ({ ...d, aboutAlignment: 'center' }))}
                            >
                              🎯 Midden
                            </Button>
                            <Button
                              type="button"
                              variant={design.aboutAlignment === 'left' ? 'default' : 'outline'}
                              size="sm"
                              onClick={() => setDesign((d) => ({ ...d, aboutAlignment: 'left' }))}
                            >
                              ⬅️ Links
                            </Button>
                          </div>
                        </div> */}
                      </div>
                      
                      <div>
                        <Label>Beschrijving</Label>
                        <Textarea 
                          rows={6} 
                          value={design.aboutDescription} 
                          onChange={(e) => setDesign((d) => ({ ...d, aboutDescription: e.target.value }))}
                          placeholder="Vertel je verhaal hier. Gebruik Enter/Return om nieuwe paragrafen te maken."
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          💡 Gebruik Enter/Return om nieuwe paragrafen te maken. Regelafbrekingen worden bewaard.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* 4) Media Gallery Section */}
                  <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                    <div className="bg-gradient-to-r from-orange-50 to-red-50 px-6 py-4 border-b border-gray-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
                            <span className="text-white text-sm font-bold">4</span>
                          </div>
                          <div>
                            <h4 className="text-lg font-semibold text-gray-900">️ Media Galerij</h4>
                            <p className="text-sm text-gray-600">Upload en orden je beste werk (maximaal 6 afbeeldingen)</p>
                          </div>
                        </div>
                        <Button onClick={saveMedia} disabled={designLoading} size="sm">
                          {designLoading ? 'Opslaan…' : 'Galerij Opslaan'}
                        </Button>
                      </div>
                    </div>
                    
                    <div className="p-6 space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <span className="font-medium">{design.mediaOrder.length + galleryNewPreviews.length}/6</span>
                          <span>afbeeldingen geüpload</span>
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => galleryInputRef.current?.click()}
                          disabled={design.mediaOrder.length + galleryNewPreviews.length >= 6}
                        >
                          📤 Afbeelding toevoegen
                        </Button>
                        <input
                          ref={galleryInputRef}
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            if (design.mediaOrder.length + galleryNewPreviews.length >= 6) return;
                            setDesign((d) => ({ ...d, mediaFiles: [...d.mediaFiles, file] }));
                            setGalleryNewPreviews((p) => [...p, URL.createObjectURL(file)]);
                          }}
                        />
                      </div>
                      
                      {/* Gallery Grid */}
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                        {design.mediaOrder.map((u, i) => (
                          <div
                            key={u + i}
                            className={`aspect-[4/5] rounded-lg overflow-hidden border-2 relative ${
                              design.draggedIndex === i ? 'ring-2 ring-blue-500' : 'border-gray-200'
                            }`}
                            draggable
                            onDragStart={() => handleMediaDragStart(i)}
                            onDragOver={(e) => handleMediaDragOver(e, i)}
                            onDrop={handleMediaDrop}
                          >
                            <img src={u} className="w-full h-full object-cover" />
                            <Button
                              type="button"
                              variant="destructive"
                              size="sm"
                              className="absolute top-1 right-1 w-6 h-6 p-0 rounded-full opacity-80 hover:opacity-100"
                              onClick={() => removeMediaItem(u, i)}
                              disabled={designLoading}
                            >
                              ×
                            </Button>
                            <div className="absolute bottom-1 left-1 right-1 bg-black/50 text-white text-xs p-1 rounded text-center">
                              {i + 1}
                            </div>
                          </div>
                        ))}
                        
                        {galleryNewPreviews.map((u, i) => (
                          <div key={`new-${i}`} className="aspect-[4/5] rounded-lg overflow-hidden border-2 border-blue-300 relative">
                            <img src={u} className="w-full h-full object-cover" />
                            <Button
                              type="button"
                              variant="destructive"
                              size="sm"
                              className="absolute top-1 right-1 w-6 h-6 p-0 rounded-full opacity-80 hover:opacity-100"
                              onClick={() => {
                                setDesign((d) => ({ 
                                  ...d, 
                                  mediaFiles: d.mediaFiles.filter((_, idx) => idx !== i) 
                                }));
                                setGalleryNewPreviews((p) => p.filter((_, idx) => idx !== i));
                              }}
                            >
                              ×
                            </Button>
                            <div className="absolute bottom-1 left-1 right-1 bg-blue-500/80 text-white text-xs p-1 rounded text-center">
                              Nieuw
                            </div>
                          </div>
                        ))}
                        
                        {design.mediaOrder.length + galleryNewPreviews.length === 0 && (
                          <div className="col-span-full text-center py-8 text-gray-500">
                            <div className="text-4xl mb-2">🖼️</div>
                            <p>Nog geen afbeeldingen geüpload</p>
                            <p className="text-sm">Sleep afbeeldingen hierheen of klik op "Afbeelding toevoegen"</p>
                          </div>
                        )}
                      </div>
                      
                      <p className="text-xs text-gray-500 text-center">
                         Sleep afbeeldingen om ze te herordenen. De volgorde bepaalt hoe ze op je publieke pagina worden getoond.
                      </p>
                    </div>
                  </div>

                  {/* 5) Social Links Section */}
                  <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                    <div className="bg-gradient-to-r from-indigo-50 to-cyan-50 px-6 py-4 border-b border-gray-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center">
                            <span className="text-white text-sm font-bold">5</span>
                          </div>
                          <div>
                            <h4 className="text-lg font-semibold text-gray-900">🔗 Sociale Links</h4>
                            <p className="text-sm text-gray-600">Voeg links naar je sociale media toe</p>
                          </div>
                        </div>
                        <Button onClick={saveSocials} disabled={designLoading} size="sm">
                          {designLoading ? 'Opslaan…' : 'Sociale Links Opslaan'}
                        </Button>
                      </div>
                    </div>
                    
                    <div className="p-6 space-y-4">
                      {design.socials.map((s, i) => (
                        <div key={i} className="grid grid-cols-1 md:grid-cols-3 gap-3 p-4 bg-gray-50 rounded-lg">
                          <Input
                            placeholder="Titel (bijv. Instagram)"
                            value={s.title || ''}
                            onChange={(e) => {
                              const next = [...design.socials];
                              next[i] = { ...next[i], title: e.target.value };
                              setDesign((d) => ({ ...d, socials: next }));
                            }}
                          />
                          <Input
                            placeholder="Platform (optioneel)"
                            value={s.platform || ''}
                            onChange={(e) => {
                              const next = [...design.socials];
                              next[i] = { ...next[i], platform: e.target.value };
                              setDesign((d) => ({ ...d, socials: next }));
                            }}
                          />
                          <div className="flex gap-2">
                            <Input
                              placeholder="https://..."
                              value={s.url || ''}
                              onChange={(e) => {
                                const next = [...design.socials];
                                next[i] = { ...next[i], url: e.target.value };
                                setDesign((d) => ({ ...d, socials: next }));
                              }}
                            />
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => {
                                const next = design.socials.filter((_, idx) => idx !== i);
                                setDesign((d) => ({ ...d, socials: next }));
                              }}
                            >
                              🗑️
                            </Button>
                          </div>
                        </div>
                      ))}
                      
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setDesign((d) => ({ ...d, socials: [...d.socials, { title: '', url: '' }] }))}
                        className="w-full"
                      >
                        ➕ Sociale link toevoegen
                      </Button>
                    </div>
                  </div>

                  {/* 6) Booking Section */}
                  <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                    <div className="bg-gradient-to-r from-emerald-50 to-teal-50 px-6 py-4 border-b border-gray-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
                            <span className="text-white text-sm font-bold">6</span>
                          </div>
                          <div>
                            <h4 className="text-lg font-semibold text-gray-900">📅 Boeken</h4>
                            <p className="text-sm text-gray-600">Stel je boekingssysteem in</p>
                          </div>
                        </div>
                        <Button onClick={saveBooking} disabled={designLoading} size="sm">
                          {designLoading ? 'Opslaan…' : 'Boeken Opslaan'}
                        </Button>
                      </div>
                    </div>
                    
                    <div className="p-6 space-y-4">
                      <div>
                        <Label>Boekings-URL</Label>
                        <Input
                          placeholder="https://..."
                          value={design.bookingUrl}
                          onChange={(e) => setDesign((d) => ({ ...d, bookingUrl: e.target.value }))}
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          💡 Embed modus wordt standaard gebruikt. Je boekingssysteem wordt direct in je pagina getoond.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* 7) Testimonials Section */}
                  <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                    <div className="bg-gradient-to-r from-amber-50 to-yellow-50 px-6 py-4 border-b border-gray-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center">
                            <span className="text-white text-sm font-bold">7</span>
                          </div>
                          <div>
                            <h4 className="text-lg font-semibold text-gray-900">⭐ Aanbevelingen</h4>
                            <p className="text-sm text-gray-600">Voeg klantbeoordelingen toe om vertrouwen te wekken</p>
                          </div>
                        </div>
                        <Button onClick={saveTestimonials} disabled={designLoading} size="sm">
                          {designLoading ? 'Opslaan…' : 'Aanbevelingen Opslaan'}
                        </Button>
                      </div>
                    </div>
                    
                    <div className="p-6 space-y-4">
                      {/* Status indicators */}
                      <div className="flex items-center gap-2">
                        {design.testimonials.length > 0 && design.testimonials.every(t => 
                          t.customer_name === 'Sarah Johnson' || 
                          t.customer_name === 'Mike Chen' || 
                          t.customer_name === 'Emily Rodriguez'
                        ) && (
                          <span className="px-3 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full">
                            🎭 Gebruikt placeholders
                          </span>
                        )}
                        {(() => {
                          const about = (profile?.about ?? {}) as { [key: string]: unknown };
                          const hasTestimonialsInDB = typeof about.testimonials === 'object' && Array.isArray(about.testimonials) && about.testimonials.length > 0;
                          
                          if (design.testimonials.length > 0 && !hasTestimonialsInDB) {
                            return (
                              <span className="px-3 py-1 text-xs bg-blue-100 text-blue-800 rounded-full animate-pulse">
                                💾 Auto-opslaan...
                              </span>
                            );
                          }
                          return null;
                        })()}
                      </div>
                      
                      <p className="text-sm text-gray-600 bg-amber-50 p-3 rounded-lg">
                        💡 <strong>Tip:</strong> Placeholder aanbevelingen worden standaard getoond en automatisch opgeslagen. 
                        Je kunt ze altijd bewerken, vervangen of verwijderen.
                      </p>
                      
                      {/* Testimonials Grid */}
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {design.testimonials.map((t, i) => (
                          <div key={i} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                            <div className="flex items-start gap-3 mb-3">
                              <div className="w-20 aspect-[4/5] rounded-md overflow-hidden border bg-white flex-shrink-0">
                                {testimonialPreviews[i] ? (
                                  <img src={testimonialPreviews[i]} className="w-full h-full object-cover" />
                                ) : t.image_url ? (
                                  <img src={t.image_url} className="w-full h-full object-cover" />
                                ) : (
                                  <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                                    <span className="text-gray-400 text-sm">📷</span>
                                  </div>
                                )}
                              </div>
                              <div className="flex-1">
                                <Input
                                  placeholder="Klantnaam"
                                  value={t.customer_name}
                                  onChange={(e) => {
                                    const next = [...design.testimonials];
                                    next[i] = { ...next[i], customer_name: e.target.value };
                                    setDesign((d) => ({ ...d, testimonials: next }));
                                  }}
                                  className="mb-2"
                                />
                                <Input
                                  placeholder="Beoordelingstitel"
                                  value={t.review_title}
                                  onChange={(e) => {
                                    const next = [...design.testimonials];
                                    next[i] = { ...next[i], review_title: e.target.value };
                                    setDesign((d) => ({ ...d, testimonials: next }));
                                  }}
                                  className="mb-2"
                                />
                                <Textarea
                                  placeholder="Beoordelingstekst"
                                  value={t.review_text}
                                  onChange={(e) => {
                                    const next = [...design.testimonials];
                                    next[i] = { ...next[i], review_text: e.target.value };
                                    setDesign((d) => ({ ...d, testimonials: next }));
                                  }}
                                  rows={3}
                                />
                              </div>
                            </div>
                            
                            <div className="flex items-center justify-between">
                              <Button
                                type="button"
                                variant="outline"
                                onClick={() => {
                                  if (!testimonialInputRefs.current[i]) return;
                                  testimonialInputRefs.current[i]!.click();
                                }}
                                size="sm"
                              >
                                {testimonialPreviews[i] || t.image_url ? '🔄 Afbeelding wijzigen' : '📤 Afbeelding uploaden'}
                              </Button>
                              <input
                                ref={(el) => (testimonialInputRefs.current[i] = el)}
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (!file) return;
                                  setTestimonialPreviews((p) => ({ ...p, [i]: URL.createObjectURL(file) }));
                                  const next = [...design.testimonials] as WithFile[];
                                  next[i] = { ...next[i], _file: file };
                                  setDesign((d) => ({ ...d, testimonials: next }));
                                }}
                              />
                              <Button
                                type="button"
                                variant="outline"
                                onClick={() => setDesign((d) => ({ ...d, testimonials: d.testimonials.filter((_, idx) => idx !== i) }))}
                                size="sm"
                              >
                                🗑️ Verwijderen
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          disabled={design.testimonials.length >= 6}
                          onClick={() => setDesign((d) => ({ ...d, testimonials: [...d.testimonials, { customer_name: '', review_title: '', review_text: '' }] }))}
                        >
                          ➕ Aanbeveling toevoegen
                        </Button>
                        {design.testimonials.length > 0 && (
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => setDesign((d) => ({ ...d, testimonials: [] }))}
                            className="text-red-600 hover:text-red-700"
                          >
                            🗑️ Alles Wissen
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* 8) Footer Section */}
                  <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                    <div className="bg-gradient-to-r from-slate-50 to-gray-50 px-6 py-4 border-b border-gray-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-slate-500 rounded-lg flex items-center justify-center">
                            <span className="text-white text-sm font-bold">8</span>
                          </div>
                          <div>
                            <h4 className="text-lg font-semibold text-gray-900">🏢 Footer Instellingen</h4>
                            <p className="text-sm text-gray-600">Configureer je footer informatie en beleid</p>
                          </div>
                        </div>
                        <Button onClick={saveFooter} disabled={designLoading} size="sm">
                          {designLoading ? 'Opslaan…' : 'Footer Opslaan'}
                        </Button>
                      </div>
                    </div>
                    
                    <div className="p-6 space-y-6">
                      {/* Business Information */}
                      <div>
                        <h5 className="font-medium text-gray-900 mb-3"> Bedrijfsinformatie</h5>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label>Bedrijfsnaam</Label>
                            <Input 
                              placeholder="Je bedrijfsnaam"
                              value={design.footerBusinessName}
                              onChange={(e) => setDesign((d) => ({ ...d, footerBusinessName: e.target.value }))}
                            />
                          </div>
                          <div>
                            <Label>Adres</Label>
                            <div className="relative">
                              <Input 
                                placeholder="Begin te typen voor adres suggesties..."
                                value={addressInputValue || design.footerAddress}
                                onChange={(e) => {
                                  const value = e.target.value;
                                  setAddressInputValue(value);
                                  setDesign((d) => ({ ...d, footerAddress: value }));
                                  
                                  // Debounce voor API calls
                                  clearTimeout((window as unknown as { addressTimeout: NodeJS.Timeout }).addressTimeout);
                                  (window as unknown as { addressTimeout: NodeJS.Timeout }).addressTimeout = setTimeout(() => {
                                    getAddressSuggestions(value);
                                  }, 300);
                                }}
                                onFocus={() => {
                                  if (addressSuggestions.length > 0) {
                                    setShowAddressSuggestions(true);
                                  }
                                }}
                                onBlur={() => {
                                  // Delay hiding suggestions to allow clicking
                                  setTimeout(() => setShowAddressSuggestions(false), 200);
                                }}
                              />
                              
                              {/* Address Suggestions Dropdown */}
                              {showAddressSuggestions && addressSuggestions.length > 0 && (
                                <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                                  {addressSuggestions.map((suggestion, index) => (
                                    <button
                                      key={index}
                                      type="button"
                                      className="w-full text-left px-4 py-3 hover:bg-gray-50 focus:bg-gray-50 focus:outline-none border-b border-gray-100 last:border-b-0"
                                      onClick={() => selectAddress(suggestion)}
                                    >
                                      <div className="flex items-center space-x-3">
                                        <span className="text-gray-400">📍</span>
                                        <span className="text-gray-900">{suggestion}</span>
                                      </div>
                                    </button>
                                  ))} 
                                  
                                </div>
                              )}
                            </div>
                            
                            <p className="text-xs text-gray-500 mt-1">
                              💡 Begin te typen om adres suggesties te krijgen. We gebruiken Google Places voor accurate adressen.
                            </p>
                          </div>
                          <div>
                            <Label>E-mail</Label>
                            <Input 
                              type="email"
                              placeholder="jouw@email.com"
                              value={design.footerEmail}
                              onChange={(e) => setDesign((d) => ({ ...d, footerEmail: e.target.value }))}
                            />
                          </div>
                          <div>
                            <Label>Telefoon</Label>
                            <Input 
                              type="tel"
                              placeholder="+31 (0) 6 12345678"
                              value={design.footerPhone}
                              onChange={(e) => setDesign((d) => ({ ...d, footerPhone: e.target.value }))}
                            />
                          </div>
                          <div>
                            <Label>Openingstijden</Label>
                            <div className="space-y-3 mt-1">
                              <Tabs defaultValue="monday" className="w-full">
                                <TabsList className="grid w-full grid-cols-7">
                                  <TabsTrigger value="monday">Ma</TabsTrigger>
                                  <TabsTrigger value="tuesday">Di</TabsTrigger>
                                  <TabsTrigger value="wednesday">Wo</TabsTrigger>
                                  <TabsTrigger value="thursday">Do</TabsTrigger>
                                  <TabsTrigger value="friday">Vr</TabsTrigger>
                                  <TabsTrigger value="saturday">Za</TabsTrigger>
                                  <TabsTrigger value="sunday">Zo</TabsTrigger>
                                </TabsList>

                                {Object.entries(design.footerHours).map(([day, hours]) => (
                                  <TabsContent key={day} value={day} className="space-y-4">
                                    <div className="flex items-center justify-between">
                                      <h3 className="text-sm font-medium">
                                        {day === 'monday' && 'Maandag'}
                                        {day === 'tuesday' && 'Dinsdag'}
                                        {day === 'wednesday' && 'Woensdag'}
                                        {day === 'thursday' && 'Donderdag'}
                                        {day === 'friday' && 'Vrijdag'}
                                        {day === 'saturday' && 'Zaterdag'}
                                        {day === 'sunday' && 'Zondag'}
                                      </h3>
                                      <div className="flex items-center space-x-2">
                                        <Checkbox
                                          id={`${day}-closed`}
                                          checked={hours.closed}
                                          onCheckedChange={(checked) =>
                                            setDesign((d) => ({
                                              ...d,
                                              footerHours: {
                                                ...d.footerHours,
                                                [day]: { ...d.footerHours[day], closed: Boolean(checked) }
                                              }
                                            }))
                                          }
                                        />
                                        <Label htmlFor={`${day}-closed`}>Gesloten</Label>
                                      </div>
                                    </div>

                                    {!hours.closed && (
                                      <div className="grid grid-cols-2 gap-4">
                                        <div>
                                          <Label htmlFor={`${day}-open`}>Openingstijd</Label>
                                          <Input
                                            id={`${day}-open`}
                                            type="time"
                                            value={hours.open}
                                            onChange={(e) =>
                                              setDesign((d) => ({
                                                ...d,
                                                footerHours: {
                                                  ...d.footerHours,
                                                  [day]: { ...d.footerHours[day], open: e.target.value }
                                                }
                                              }))
                                            }
                                          />
                                        </div>
                                        <div>
                                          <Label htmlFor={`${day}-close`}>Sluitingstijd</Label>
                                          <Input
                                            id={`${day}-close`}
                                            type="time"
                                            value={hours.close}
                                            onChange={(e) =>
                                              setDesign((d) => ({
                                                ...d,
                                                footerHours: {
                                                  ...d.footerHours,
                                                  [day]: { ...d.footerHours[day], close: e.target.value }
                                                }
                                              }))
                                            }
                                          />
                                        </div>
                                      </div>
                                    )}
                                  </TabsContent>
                                ))}
                              </Tabs>
                            </div>
                          </div>
                          {/* <div>
                            <Label>Volgende Beschikbaar</Label>
                            <Input 
                              placeholder="Di 14:30 (optioneel)"
                              value={design.footerNextAvailable}
                              onChange={(e) => setDesign((d) => ({ ...d, footerNextAvailable: e.target.value }))}
                            />
                          </div> */}
                        </div>
                      </div>

                      {/* Policies */}
                      <div>
                        <h5 className="font-medium text-gray-900 mb-3">📜 Beleid & Vertrouwen</h5>
                        <div className="grid gap-4">
                          <div>
                            <Label>Annuleringsbeleid</Label>
                            <Textarea 
                              rows={2}
                              placeholder="Plannen gewijzigd? Herplan of annuleer 24 uur van tevoren om een vergoeding te voorkomen."
                              value={design.footerCancellationPolicy}
                              onChange={(e) => setDesign((d) => ({ ...d, footerCancellationPolicy: e.target.value }))}
                            />
                          </div>
                          <div>
                            <Label>Privacybeleid</Label>
                            <Textarea 
                              rows={2}
                              placeholder="We gebruiken je gegevens alleen om je afspraak te beheren. Geen spam."
                              value={design.footerPrivacyPolicy}
                              onChange={(e) => setDesign((d) => ({ ...d, footerPrivacyPolicy: e.target.value }))}
                            />
                          </div>
                          <div>
                            <Label>Algemene Voorwaarden</Label>
                            <Textarea 
                              rows={2}
                              placeholder="Veilige boeking afgehandeld door toonaangevende boekingsplatforms."
                              value={design.footerTermsOfService}
                              onChange={(e) => setDesign((d) => ({ ...d, footerTermsOfService: e.target.value }))}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Display Options */}
                      <div>
                        <h5 className="font-medium text-gray-900 mb-3">⚙️ Weergave-opties</h5>
                        <div className="flex items-center space-x-6">
                          <div className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id="showMaps"
                              checked={design.footerShowMaps}
                              onChange={(e) => setDesign((d) => ({ ...d, footerShowMaps: e.target.checked }))}
                              className="rounded"
                            />
                            <Label htmlFor="showMaps">️ Google Maps tonen</Label>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Final Save Button */}
                  <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <div className="text-center">
                      <p className="text-gray-600 mb-4">
                        💾 Alle wijzigingen worden automatisch opgeslagen per sectie, maar je kunt ook alles tegelijk opslaan
                      </p>
                      <Button onClick={saveDesign} disabled={designLoading} size="lg">
                        {designLoading ? '💾 Opslaan…' : ' Alle Wijzigingen Opslaan'}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Subscription Section */}
            {activeSection === 'subscription' && (
              <div className="bg-white rounded-lg p-6 border border-gray-200 space-y-8">
                {/* Header */}
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">Abonnement Beheer</h3>
                    <p className="text-gray-600 mt-1">Beheer je abonnement en bekijk je facturering</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${profile?.subscription_status === 'active' ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
                    <span className={`text-sm font-medium ${profile?.subscription_status === 'active' ? 'text-green-600' : 'text-gray-500'}`}>
                      {profile?.subscription_status === 'active' ? 'Live' : 'Offline'}
                    </span>
                  </div>
                </div>

                {/* Current Plan Status */}
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h4 className="text-xl font-bold text-gray-900">Huidig Abonnement</h4>
                      <p className="text-gray-600">Je abonnement status en volgende factuurdatum</p>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold text-green-600">€9</div>
                      <div className="text-sm text-gray-500">per maand</div>
                      <div className="text-xs text-green-600 font-medium">Eerste maand €1</div>
                    </div>
                  </div>
                  
                  {subscriptionLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                      <p className="ml-3 text-gray-600">Laden...</p>
                    </div>
                  ) : profile?.subscription_status ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                      {/* Status Card */}
                      <div className="bg-white rounded-lg p-4 border border-green-200 shadow-sm">
                        <div className="flex items-center mb-3">
                          <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                          <span className="font-semibold text-gray-900">Status</span>
                        </div>
                        <div className="flex items-center">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            profile.subscription_status === 'active' 
                              ? 'bg-green-100 text-green-800' 
                              : profile.subscription_status === 'past_due'
                              ? 'bg-yellow-100 text-yellow-800'
                              : profile.subscription_status === 'canceled'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {profile.subscription_status === 'active' ? 'Actief' : 
                             profile.subscription_status === 'past_due' ? 'Vervallen' : 
                             profile.subscription_status === 'canceled' ? 'Geannuleerd' : 
                             profile.subscription_status === 'inactive' ? 'Inactief' :
                             profile.subscription_status || 'Onbekend'}
                          </span>
                        </div>
                      </div>
                      
                      {/* Next Billing Card */}
                      <div className="bg-white rounded-lg p-4 border border-green-200 shadow-sm">
                        <div className="flex items-center mb-3">
                          <Calendar className="w-5 h-5 text-blue-500 mr-2" />
                          <span className="font-semibold text-gray-900">Volgende Factuur</span>
                        </div>
                        <p className="text-sm text-gray-600">
                          {subscription?.current_period_end
                            ? new Date(subscription.current_period_end).toLocaleDateString('nl-NL', { day: 'numeric', month: 'long', year: 'numeric' })
                            : 'Niet beschikbaar'}
                        </p>
                      </div>
                      
                      {/* Subscription Start Card */}
                      <div className="bg-white rounded-lg p-4 border border-green-200 shadow-sm">
                        <div className="flex items-center mb-3">
                          <CreditCard className="w-5 h-5 text-green-500 mr-2" />
                          <span className="font-semibold text-gray-900">Gestart Op</span>
                        </div>
                        <p className="text-sm text-gray-600">
                          {subscription?.current_period_start
                            ? new Date(subscription.current_period_start).toLocaleDateString('nl-NL', { day: 'numeric', month: 'long', year: 'numeric' })
                            : 'Niet beschikbaar'}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CreditCard className="w-8 h-8 text-gray-400" />
                      </div>
                      <h5 className="text-lg font-semibold text-gray-900 mb-2">Geen actief abonnement</h5>
                      <p className="text-gray-600 mb-6">Start je abonnement om je website live te krijgen</p>
                      <Button 
                        onClick={() => navigate('/onboarding?step=7')}
                        className="bg-green-600 hover:bg-green-700 text-white px-6 py-3"
                        size="lg"
                      >
                        <CreditCard className="w-4 h-4 mr-2" />
                        Start Abonnement
                      </Button>
                    </div>
                  )}
                </div>

                {/* Plan Features */}
                <div className="bg-white rounded-lg p-6 border border-gray-200">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Wat je krijgt met je abonnement</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                      <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <span className="font-medium text-gray-900">Onbeperkte bewerkingen</span>
                        <p className="text-sm text-gray-600">Wijzig je pagina wanneer je wilt</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                      <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <span className="font-medium text-gray-900">
                          Live pagina -{' '}
                          <span className="text-green-600 break-all">
                            tapbookr.com/{profile?.handle}
                          </span>
                        </span>
                        <p className="text-sm text-gray-600">Je pagina is altijd online beschikbaar</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                      <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <span className="font-medium text-gray-900">Premium ondersteuning</span>
                        <p className="text-sm text-gray-600">24/7 hulp wanneer je het nodig hebt</p>
                      </div>
                    </div>
                    
                    {/* <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                      <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <span className="font-medium text-gray-900">Geen verborgen kosten</span>
                        <p className="text-sm text-gray-600">Altijd €9 per maand, eerste maand €1</p>
                      </div>
                    </div> */}
                  </div>
                </div>

                {/* Actions */}
                {profile?.subscription_status === 'active' && (
                  <div className="bg-white rounded-lg p-6 border border-gray-200">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">Abonnement Beheren</h4>
                    <div className="flex flex-col gap-3">
                      <Button 
                        variant="outline"
                        className="w-full border-green-200 text-green-700 hover:bg-green-50"
                        onClick={() => StripeService.redirectToCustomerPortal({
                          profileId: profile?.id || '',
                          returnUrl: `${window.location.origin}/dashboard`,
                          section: 'manage'
                        })}
                      >
                        <Settings className="w-4 h-4 mr-2" />
                        Abonnement Beheren
                      </Button>
                      
                      <Button 
                        variant="outline"
                        className="w-full border-red-200 text-red-700 hover:bg-red-50"
                        onClick={() => {
                          if (confirm('Weet je zeker dat je je abonnement wilt opzeggen? Je website gaat offline zodra je abonnement stopt.')) {
                            StripeService.redirectToCustomerPortal({
                              profileId: profile?.id || '',
                              returnUrl: `${window.location.origin}/dashboard`,
                              section: 'cancel'
                            });
                          }
                        }}
                      >
                        <X className="w-4 h-4 mr-2" />
                        Abonnement Opzeggen
                      </Button>
                    </div>
                  </div>
                )}

                {/* Billing History */}
                <div className="bg-white rounded-lg p-6 border border-gray-200">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Factuurgeschiedenis</h4>
                  <div className="bg-gray-50 rounded-lg p-4">
                    {profile?.subscription_status === 'active' ? (
                      <div className="text-center py-8">
                        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                          <CheckCircle className="w-6 h-6 text-green-500" />
                        </div>
                        <p className="text-gray-500">Je abonnement is actief</p>
                        <p className="text-sm text-gray-400 mt-1">Facturen zijn beschikbaar via je Stripe dashboard</p>
                        <Button 
                          variant="outline"
                          size="sm"
                          className="mt-3 border-green-200 text-green-700 hover:bg-green-50"
                          onClick={() => StripeService.redirectToCustomerPortal({
                            profileId: profile?.id || '',
                            returnUrl: `${window.location.origin}/dashboard`,
                            section: 'billing'
                          })}
                        >
                          <ExternalLink className="w-4 h-4 mr-2" />
                          Bekijk Facturen
                        </Button>
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                          <CreditCard className="w-6 h-6 text-gray-400" />
                        </div>
                        <p className="text-gray-500">Nog geen facturen beschikbaar</p>
                        <p className="text-sm text-gray-400 mt-1">Facturen verschijnen hier na je eerste betaling</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Pricing Info */}
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-6 border border-green-200">
                  <div className="text-center">
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">Transparante prijzen</h4>
                    <p className="text-gray-600 mb-4">Geen verrassingen, altijd duidelijke prijzen</p>
                    <div className="flex items-center justify-center space-x-6">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">€1</div>
                        <div className="text-sm text-gray-500">Eerste maand</div>
                      </div>
                      <div className="text-gray-400">→</div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">€9</div>
                        <div className="text-sm text-gray-500">Daarna per maand</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>

        {/* Dashboard Footer */}
        <footer className="bg-white border-t border-gray-200 px-4 lg:px-6 py-4">
          <div className="flex flex-col sm:flex-row items-center justify-between space-y-2 sm:space-y-0">
            <div className="text-sm text-gray-500">
              © 2024 Bookr. All rights reserved.
            </div>
            <div className="flex items-center space-x-4 text-sm text-gray-500">
              <button className="hover:text-gray-700 transition-colors">Report</button>
              <button className="hover:text-gray-700 transition-colors">Privacy</button>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
