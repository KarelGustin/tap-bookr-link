import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate, Link } from 'react-router-dom';
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
  const [profile, setProfile] = useState<Profile | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [activeSection, setActiveSection] = useState('design');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [bookingUrl, setBookingUrl] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [onboardingCompleted, setOnboardingCompleted] = useState(false);
  const { user, signOut, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { t } = useLanguage();

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
    footerHours: '',
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
  const [subscription, setSubscription] = useState<any>(null);
  const [subscriptionLoading, setSubscriptionLoading] = useState(false);
  const [invoices, setInvoices] = useState<any[]>([]);

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
          const onboardingCompleted = (profile as any).onboarding_completed || false;
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

  // Load subscription data
  const loadSubscriptionData = useCallback(async () => {
    if (!profile?.id) return;
    
    setSubscriptionLoading(true);
    try {
      // Load subscription
      const { data: subscriptionData, error: subError } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('profile_id', profile.id)
        .single();

      if (subError && subError.code !== 'PGRST116') {
        console.error('Error loading subscription:', subError);
      } else {
        setSubscription(subscriptionData);
      }

      // Load invoices
      const { data: invoicesData, error: invError } = await supabase
        .from('invoices')
        .select('*')
        .eq('profile_id', profile.id)
        .order('created_at', { ascending: false });

      if (invError) {
        console.error('Error loading invoices:', invError);
      } else {
        setInvoices(invoicesData || []);
      }
    } catch (error) {
      console.error('Error loading subscription data:', error);
    } finally {
      setSubscriptionLoading(false);
    }
  }, [profile?.id]);

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

      // Footer settings
      footerBusinessName: typeof about.businessName === 'string' ? (about.businessName as string) : profile.name || '',
      footerAddress: typeof about.address === 'string' ? (about.address as string) : '',
      footerEmail: typeof about.email === 'string' ? (about.email as string) : '',
      footerPhone: typeof about.phone === 'string' ? (about.phone as string) : '',
      footerHours: typeof about.hours === 'string' ? (about.hours as string) : '',
      footerNextAvailable: typeof about.nextAvailable === 'string' ? (about.nextAvailable as string) : '',
      footerCancellationPolicy: typeof about.cancellationPolicy === 'string' ? (about.cancellationPolicy as string) : 'Plans changed? Reschedule or cancel 24h in advance to avoid a fee.',
      footerPrivacyPolicy: typeof about.privacyPolicy === 'string' ? (about.privacyPolicy as string) : 'We only use your details to manage your appointment. No spam.',
      footerTermsOfService: typeof about.termsOfService === 'string' ? (about.termsOfService as string) : 'Secure booking handled by top booking platforms.',
      footerShowMaps: typeof about.showMaps === 'boolean' ? (about.showMaps as boolean) : true,
      footerShowAttribution: typeof about.showAttribution === 'boolean' ? (about.showAttribution as boolean) : true,

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

      const { error } = await supabase.from('profiles').update(updatePayload).eq('id', profile.id);
      if (error) throw error;
      toast({ title: 'Saved', description: 'Your design changes were saved.' });

      // Reset files and refresh profile
      setDesign((d) => ({ ...d, mediaFiles: [], avatarFile: null, bannerImageFile: null }));
      const { data: refreshed } = await supabase.from('profiles').select('*').eq('id', profile.id).single();
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
        .eq('id', profile.id);

      if (error) throw error;
      toast({ title: 'Banner saved', description: 'Your banner changes were saved.' });

      // Reset file and refresh profile
      setDesign((d) => ({ ...d, bannerImageFile: null }));
      const { data: refreshed } = await supabase.from('profiles').select('*').eq('id', profile.id).single();
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
        .eq('id', profile.id);

      if (error) throw error;
      toast({ title: 'Profile saved', description: 'Your profile changes were saved.' });

      // Reset file and refresh profile
      setDesign((d) => ({ ...d, avatarFile: null }));
      const { data: refreshed } = await supabase.from('profiles').select('*').eq('id', profile.id).single();
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
      toast({ title: 'About section saved', description: 'Your about section changes were saved.' });

      // Refresh profile
      const { data: refreshed } = await supabase.from('profiles').select('*').eq('id', profile.id).single();
      if (refreshed) setProfile(refreshed as Profile);
      setBaseline(dirtySnapshot(design));
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
        .eq('id', profile.id);

      if (error) throw error;
      toast({ title: 'Media gallery saved', description: 'Your media gallery changes were saved.' });

      // Reset files and refresh profile
      setDesign((d) => ({ ...d, mediaFiles: [] }));
      const { data: refreshed } = await supabase.from('profiles').select('*').eq('id', profile.id).single();
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
        .eq('id', profile.id);

      if (error) throw error;
      toast({ title: 'Social links saved', description: 'Your social links changes were saved.' });

      // Refresh profile
      const { data: refreshed } = await supabase.from('profiles').select('*').eq('id', profile.id).single();
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
        .eq('id', profile.id);

      if (error) throw error;
      toast({ title: 'Booking settings saved', description: 'Your booking settings were saved.' });

      // Refresh profile
      const { data: refreshed } = await supabase.from('profiles').select('*').eq('id', profile.id).single();
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
      const { data: refreshed } = await supabase.from('profiles').select('*').eq('id', profile.id).single();
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
        .eq('id', profile.id);

      if (error) throw error;
      toast({ title: 'Image removed', description: 'Image was removed from your gallery.' });

      // Refresh profile
      const { data: refreshed } = await supabase.from('profiles').select('*').eq('id', profile.id).single();
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
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      console.log('Profile query result:', { data, error });

      if (error) {
        console.error('Supabase error:', error);
        // Don't redirect on error, just show dashboard without profile
        setProfile(null);
        return;
      }

      if (data) {
        console.log('Profile loaded successfully:', data.handle);
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

      {/* Left Sidebar */}
      <div 
        id="sidebar"
        className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-gray-100 border-r border-gray-200 flex flex-col transform transition-transform duration-300 ease-in-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="p-4 lg:p-6">
          {/* Mobile Close Button */}
          <div className="flex items-center justify-between mb-6 lg:hidden">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-semibold">
                  {profile?.name?.charAt(0)?.toUpperCase() || user.email?.charAt(0)?.toUpperCase() || 'U'}
                </span>
              </div>
              <span className="font-semibold text-gray-900">
                {profile?.name || user.email || 'User'}
              </span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden"
            >
              <ChevronDown className="w-4 h-4" />
            </Button>
          </div>

          {/* Desktop User Account */}
          <div className="hidden lg:flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-semibold">
                  {profile?.name?.charAt(0)?.toUpperCase() || user.email?.charAt(0)?.toUpperCase() || 'U'}
                </span>
              </div>
              <span className="font-semibold text-gray-900">
                {profile?.name || user.email || 'User'}
              </span>
            </div>
            <ChevronDown className="w-4 h-4 text-gray-500" />
          </div>
          
          {/* Navigation Menu */}
          <nav className="space-y-1">
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Dashboard</h3>
                <ChevronDown className="w-4 h-4 text-gray-500" />
              </div>
              <div className="space-y-1">
                <button
                  onClick={() => {
                    setActiveSection('design');
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center px-3 py-2 text-sm rounded-md transition-colors ${
                    activeSection === 'design' 
                      ? 'bg-gray-200 text-gray-900' 
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <Palette className="w-4 h-4 mr-3" />
                  Design
                </button>
                <button
                  onClick={() => {
                    setActiveSection('subscription');
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center px-3 py-2 text-sm rounded-md transition-colors ${
                    activeSection === 'subscription' 
                      ? 'bg-gray-200 text-gray-900' 
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <BarChart3 className="w-4 h-4 mr-3" />
                  Abonnement
                </button>
              </div>
            </div>
          </nav>
          
          {/* User Actions */}
          <div className="mt-auto pt-6 border-t border-gray-200">
            <div className="space-y-2">
              <button
                onClick={() => {
                  signOut();
                  navigate('/');
                }}
                className="w-full flex items-center px-3 py-2 text-sm rounded-md text-red-600 hover:text-red-700 hover:bg-red-50 transition-colors"
              >
                <LogOut className="w-4 h-4 mr-3" />
                Uitloggen
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-4 lg:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden"
              >
                <Menu className="w-5 h-5" />
              </Button>
              <h1 className="text-xl lg:text-2xl font-bold text-gray-900">{t('dashboard.title')}</h1>
            </div>
            <div className="flex items-center space-x-2 lg:space-x-3">
              <LanguageSelector />
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 p-4 lg:p-6">
          <div className="max-w-6xl">
            {/* Welcome Section */}
            {!profile && (
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
            )}

            {/* Design Section */}
            {activeSection === 'design' && (
              <div className="bg-white rounded-lg p-6 border border-gray-200 space-y-8">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Ontwerp je publieke pagina</h3>
                  <Button onClick={saveDesign} disabled={designLoading}>
                    {designLoading ? 'Opslaan…' : 'Wijzigingen opslaan'}
                  </Button>
                </div>

                {/* Live Preview */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium text-gray-700">Live Voorvertoning</h4>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        setPreviewKey(prev => prev + 1);
                        // Force iframe refresh for external domain
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
                      className="text-xs"
                    >
                      Voorvertoning Vernieuwen
                    </Button>
                  </div>
                  <div className="relative">
                    {/* iPhone Mockup Preview - Always Mobile */}
                    <div className="flex justify-center">
                      <div className="relative">
                        {/* iPhone Frame - iPhone 14 Pro dimensions */}
                        <div className="relative bg-black rounded-[2.5rem] p-1.5 shadow-2xl">
                          {/* Screen */}
                          <div className="bg-white rounded-[2rem] overflow-hidden" style={{ width: '320px', height: '692px' }}>
                            <iframe
                              key={previewKey}
                              src={`https://tapbookr.com/${profile?.handle}?preview=${previewKey}`}
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
                        
                        {/* Home Indicator */}
                        <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-28 h-1 bg-black rounded-full opacity-60"></div>
                        
                        {/* Dynamic Island */}
                        <div className="absolute top-1.5 left-1/2 transform -translate-x-1/2 w-20 h-6 bg-black rounded-b-2xl"></div>
                        
                        {/* Volume Buttons */}
                        <div className="absolute left-0 top-20 w-1 h-8 bg-gray-800 rounded-r-sm"></div>
                        <div className="absolute left-0 top-32 w-1 h-8 bg-gray-800 rounded-r-sm"></div>
                        
                        {/* Power Button */}
                        <div className="absolute right-0 top-24 w-1 h-12 bg-gray-800 rounded-l-sm"></div>
                      </div>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* 1) Banner */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">Landingspagina Banner</h4>
                    <Button onClick={saveBanner} disabled={designLoading} size="sm">
                      {designLoading ? 'Opslaan…' : 'Banner Opslaan'}
                    </Button>
                  </div>
                  <div className="flex gap-3">
                    <Button
                      type="button"
                      variant={design.bannerType === 'color' ? 'default' : 'outline'}
                      onClick={() => setDesign((d) => ({ ...d, bannerType: 'color' }))}
                    >
                      Kleur gebruiken
                    </Button>
                    <Button
                      type="button"
                      variant={design.bannerType === 'image' ? 'default' : 'outline'}
                      onClick={() => setDesign((d) => ({ ...d, bannerType: 'image' }))}
                    >
                      Afbeelding gebruiken
                    </Button>
                  </div>
                  <p className="text-sm text-gray-500">
                    Afbeelding is standaard geselecteerd. Als er geen afbeelding wordt geüpload, wordt de TapBookr accentkleur gebruikt als fallback.
                  </p>

                  {/* Banner Content */}
                  <div className="space-y-3">
                    {/* <div>
                      <Label>Name</Label>
                      <Input
                        placeholder="Your business or personal name"
                        value={design.name}
                        onChange={(e) => setDesign((d) => ({ ...d, name: e.target.value }))}
                      />
                    </div> */}
                    <div>
                      <Label>Categorie</Label>
                      <Input
                        placeholder="bijv. Fotograaf, Designer, Consultant"
                        value={design.category}
                        onChange={(e) => setDesign((d) => ({ ...d, category: e.target.value }))}
                      />
                    </div>
                    {/* <div>
                      <Label>Slogan</Label>
                      <Input
                        placeholder="Your business tagline or description"
                        value={design.slogan}
                        onChange={(e) => setDesign((d) => ({ ...d, slogan: e.target.value }))}
                      />
                    </div> */}
                    <div>
                      <Label>Banner Hoofdtitel</Label>
                      <Input
                        placeholder="Je hoofdtitel voor de banner (optioneel - gebruikt naam als leeg)"
                        value={design.bannerHeading}
                        onChange={(e) => setDesign((d) => ({ ...d, bannerHeading: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label>Banner Ondertitel</Label>
                      <Input
                        placeholder="Je ondertitel of tagline voor de banner (optioneel - gebruikt slogan als leeg)"
                        value={design.bannerSubheading}
                        onChange={(e) => setDesign((d) => ({ ...d, bannerSubheading: e.target.value }))}
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
                  </div>

                  {design.bannerType === 'color' ? (
                    <div className="flex items-center gap-3">
                      <Label className="w-32">Kleur</Label>
                      <Input
                        type="color"
                        value={design.bannerColor}
                        onChange={(e) => setDesign((d) => ({ ...d, bannerColor: e.target.value }))}
                        className="w-24 p-1"
                      />
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Label>Banner afbeelding</Label>
                      <div className="flex items-center gap-3">
                        <Button type="button" variant="outline" onClick={() => bannerInputRef.current?.click()}>
                          {bannerPreview ? 'Banner wijzigen' : 'Banner uploaden'}
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
                        <p className="text-xs text-muted-foreground mb-1">Huidige banner</p>
                        <div className="w-full max-w-md aspect-[3/1] rounded-md overflow-hidden border bg-muted/30">
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

                <Separator />

                {/* 2) Profile */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">Profiel</h4>
                    <Button onClick={saveProfile} disabled={designLoading} size="sm">
                      {designLoading ? 'Opslaan…' : 'Profiel Opslaan'}
                    </Button>
                  </div>
                  <div className="space-y-2">
                    <Label>Avatar</Label>
                    <div className="flex items-center gap-3">
                      <Button type="button" variant="outline" onClick={() => avatarInputRef.current?.click()}>
                        {avatarPreview ? 'Avatar wijzigen' : 'Avatar uploaden'}
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
                    <div className="mt-2 flex items-center gap-3">
                      <div className="w-16 h-16 rounded-full overflow-hidden border bg-muted/30">
                        {avatarPreview ? (
                          <img src={avatarPreview} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full" />
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">Momenteel gebruikte avatar</p>
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Naam, categorie en slogan worden nu geconfigureerd in de Banner sectie hierboven.
                  </div>
                </div>

                <Separator />

                {/* 3) About */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">Over sectie</h4>
                    <Button onClick={saveAbout} disabled={designLoading} size="sm">
                      {designLoading ? 'Opslaan…' : 'Over Opslaan'}
                    </Button>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-3">
                    <div>
                      <Label>Titel</Label>
                      <Input value={design.aboutTitle} onChange={(e) => setDesign((d) => ({ ...d, aboutTitle: e.target.value }))} />
                    </div>
                    <div>
                      <Label>Tekstuitlijning</Label>
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          variant={design.aboutAlignment === 'center' ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setDesign((d) => ({ ...d, aboutAlignment: 'center' }))}
                        >
                          Midden
                        </Button>
                        <Button
                          type="button"
                          variant={design.aboutAlignment === 'left' ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setDesign((d) => ({ ...d, aboutAlignment: 'left' }))}
                        >
                          Links
                        </Button>
                      </div>
                    </div>
                    <div className="sm:col-span-2">
                      <Label>Beschrijving</Label>
                      <Textarea 
                        rows={6} 
                        value={design.aboutDescription} 
                        onChange={(e) => setDesign((d) => ({ ...d, aboutDescription: e.target.value }))}
                        placeholder="Voer je beschrijving hier in. Gebruik Enter/Return om nieuwe paragrafen te maken."
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Gebruik Enter/Return om nieuwe paragrafen te maken. Regelafbrekingen worden bewaard.
                      </p>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* 4) Media gallery */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">Media galerij</h4>
                    <Button onClick={saveMedia} disabled={designLoading} size="sm">
                      {designLoading ? 'Opslaan…' : 'Galerij Opslaan'}
                    </Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">Maximaal 6 afbeeldingen</p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>{design.mediaOrder.length + galleryNewPreviews.length}/6</span>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => galleryInputRef.current?.click()}
                        disabled={design.mediaOrder.length + galleryNewPreviews.length >= 6}
                      >
                        + Afbeelding toevoegen
                      </Button>
                      <input
                        ref={galleryInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          // limit to max 6
                          if (design.mediaOrder.length + galleryNewPreviews.length >= 6) return;
                          setDesign((d) => ({ ...d, mediaFiles: [...d.mediaFiles, file] }));
                          setGalleryNewPreviews((p) => [...p, URL.createObjectURL(file)]);
                        }}
                      />
                    </div>
                  </div>
                  <div className="flex gap-3 overflow-x-auto pb-2">
                    {design.mediaOrder.map((u, i) => (
                      <div
                        key={u + i}
                        className={`w-32 aspect-[4/5] rounded-md overflow-hidden border bg-muted/30 flex-shrink-0 relative ${design.draggedIndex === i ? 'ring-2 ring-primary' : ''}`}
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
                      </div>
                    ))}
                    {galleryNewPreviews.map((u, i) => (
                      <div key={`new-${i}`} className="w-32 aspect-[4/5] rounded-md overflow-hidden border bg-muted/30 flex-shrink-0 opacity-80 relative">
                        <img src={u} className="w-full h-full object-cover" />
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="absolute top-1 right-1 w-6 h-6 p-0 rounded-full opacity-80 hover:opacity-100"
                          onClick={() => {
                            // Remove from new files and previews
                            setDesign((d) => ({ 
                              ...d, 
                              mediaFiles: d.mediaFiles.filter((_, idx) => idx !== i) 
                            }));
                            setGalleryNewPreviews((p) => p.filter((_, idx) => idx !== i));
                          }}
                        >
                          ×
                        </Button>
                      </div>
                    ))}
                    {design.mediaOrder.length + galleryNewPreviews.length === 0 && (
                      <p className="text-xs text-muted-foreground">Nog geen afbeeldingen</p>
                    )}
                  </div>
                </div>

                <Separator />

                {/* 5) Social links */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">Sociale links</h4>
                    <Button onClick={saveSocials} disabled={designLoading} size="sm">
                      {designLoading ? 'Opslaan…' : 'Sociale Links Opslaan'}
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {design.socials.map((s, i) => (
                      <div key={i} className="grid sm:grid-cols-3 gap-2">
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
                            Verwijderen
                          </Button>
                        </div>
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setDesign((d) => ({ ...d, socials: [...d.socials, { title: '', url: '' }] }))}
                    >
                      Sociale link toevoegen
                    </Button>
                  </div>
                </div>

                <Separator />

                {/* 6) Booking */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">Boeken</h4>
                    <Button onClick={saveBooking} disabled={designLoading} size="sm">
                      {designLoading ? 'Opslaan…' : 'Boeken Opslaan'}
                    </Button>
                  </div>
                  <div className="grid sm:grid-cols-3 gap-3">
                    <div className="sm:col-span-3">
                      <Label>Boekings-URL</Label>
                      <Input
                        placeholder="https://..."
                        value={design.bookingUrl}
                        onChange={(e) => setDesign((d) => ({ ...d, bookingUrl: e.target.value }))}
                      />
                      <p className="text-xs text-muted-foreground mt-1">Embed modus wordt standaard gebruikt.</p>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* 7) Testimonials */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">Aanbevelingen</h4>
                      {design.testimonials.length > 0 && design.testimonials.every(t => 
                        t.customer_name === 'Sarah Johnson' || 
                        t.customer_name === 'Mike Chen' || 
                        t.customer_name === 'Emily Rodriguez'
                      ) && (
                        <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full">
                          Gebruikt placeholders
                        </span>
                      )}
                      {(() => {
                        // Check if testimonials exist in the database
                        const about = (profile?.about ?? {}) as { [key: string]: unknown };
                        const hasTestimonialsInDB = typeof about.testimonials === 'object' && Array.isArray(about.testimonials) && about.testimonials.length > 0;
                        
                        if (design.testimonials.length > 0 && !hasTestimonialsInDB) {
                          return (
                            <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full animate-pulse">
                              Auto-opslaan...
                            </span>
                          );
                        }
                        return null;
                      })()}
                    </div>
                    <Button onClick={saveTestimonials} disabled={designLoading} size="sm">
                      {designLoading ? 'Opslaan…' : 'Aanbevelingen Opslaan'}
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Voeg een paar korte beoordelingen toe (afbeelding optioneel). Placeholder aanbevelingen worden standaard getoond en worden automatisch opgeslagen op je publieke pagina. Je kunt ze altijd bewerken, vervangen of verwijderen.
                  </p>
                  {design.testimonials.map((t, i) => (
                    <div key={i} className="grid sm:grid-cols-4 gap-2 items-start">
                      <div className="sm:col-span-4 flex items-center gap-3">
                        <div className="w-32 aspect-[4/5] rounded-md overflow-hidden border bg-muted/30 flex-shrink-0">
                          {testimonialPreviews[i] ? (
                            <img src={testimonialPreviews[i]} className="w-full h-full object-cover" />
                          ) : t.image_url ? (
                            <img src={t.image_url} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">No image</div>
                          )}
                        </div>
                        <div>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                              if (!testimonialInputRefs.current[i]) return;
                              testimonialInputRefs.current[i]!.click();
                            }}
                          >
                            {testimonialPreviews[i] || t.image_url ? 'Change image' : 'Upload image'}
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
                              // temporarily stash file path on testimonial via image_url placeholder to mark change
                              const next = [...design.testimonials] as WithFile[];
                              next[i] = { ...next[i], _file: file };
                              setDesign((d) => ({ ...d, testimonials: next }));
                            }}
                          />
                        </div>
                      </div>
                      <Input
                        placeholder="Klantnaam"
                        value={t.customer_name}
                        onChange={(e) => {
                          const next = [...design.testimonials];
                          next[i] = { ...next[i], customer_name: e.target.value };
                          setDesign((d) => ({ ...d, testimonials: next }));
                        }}
                      />
                      <Input
                        placeholder="Beoordelingstitel"
                        value={t.review_title}
                        onChange={(e) => {
                          const next = [...design.testimonials];
                          next[i] = { ...next[i], review_title: e.target.value };
                          setDesign((d) => ({ ...d, testimonials: next }));
                        }}
                      />
                      <Input
                        placeholder="Beoordelingstekst"
                        value={t.review_text}
                        onChange={(e) => {
                          const next = [...design.testimonials];
                          next[i] = { ...next[i], review_text: e.target.value };
                          setDesign((d) => ({ ...d, testimonials: next }));
                        }}
                      />
                      <div className="sm:col-span-4">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setDesign((d) => ({ ...d, testimonials: d.testimonials.filter((_, idx) => idx !== i) }))}
                        >
                          Verwijderen
                        </Button>
                      </div>
                    </div>
                  ))}
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      disabled={design.testimonials.length >= 6}
                      onClick={() => setDesign((d) => ({ ...d, testimonials: [...d.testimonials, { customer_name: '', review_title: '', review_text: '' }] }))}
                    >
                      + Aanbeveling toevoegen
                    </Button>
                    {design.testimonials.length > 0 && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setDesign((d) => ({ ...d, testimonials: [] }))}
                        className="text-red-600 hover:text-red-700"
                      >
                        Alles Wissen
                      </Button>
                    )}
                  </div>
                </div>

                <Separator />

                {/* 8) Footer */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">Footer Instellingen</h4>
                    <Button onClick={saveAbout} disabled={designLoading} size="sm">
                      {designLoading ? 'Opslaan…' : 'Footer Opslaan'}
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Configureer je footer informatie en beleid. Dit verschijnt onderaan je publieke pagina.
                  </p>
                  
                  {/* Business Information */}
                  <div className="grid sm:grid-cols-2 gap-3">
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
                      <Input 
                        placeholder="Je bedrijfsadres"
                        value={design.footerAddress}
                        onChange={(e) => setDesign((d) => ({ ...d, footerAddress: e.target.value }))}
                      />
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
                      <Input 
                        placeholder="Ma-Vr 9:00-18:00, Za 10:00-16:00"
                        value={design.footerHours}
                        onChange={(e) => setDesign((d) => ({ ...d, footerHours: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label>Volgende Beschikbaar</Label>
                      <Input 
                        placeholder="Di 14:30 (optioneel)"
                        value={design.footerNextAvailable}
                        onChange={(e) => setDesign((d) => ({ ...d, footerNextAvailable: e.target.value }))}
                      />
                    </div>
                  </div>

                  {/* Policies */}
                  <div className="space-y-3">
                    <h5 className="font-medium text-sm">Beleid & Vertrouwen</h5>
                    <div className="grid gap-3">
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
                  <div className="space-y-3">
                    <h5 className="font-medium text-sm">Weergave-opties</h5>
                    <div className="flex items-center space-x-6">
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="showMaps"
                          checked={design.footerShowMaps}
                          onChange={(e) => setDesign((d) => ({ ...d, footerShowMaps: e.target.checked }))}
                          className="rounded"
                        />
                        <Label htmlFor="showMaps">Google Maps tonen</Label>
                      </div>
                     
                      {/* <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="showAttribution"
                          checked={design.footerShowAttribution}
                          onChange={(e) => setDesign((d) => ({ ...d, footerShowAttribution: e.target.checked }))}
                          className="rounded"
                        />
                        <Label htmlFor="showAttribution">Show "Powered by Bookr"</Label>
                      </div> */}
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button onClick={saveDesign} disabled={designLoading}>{designLoading ? 'Opslaan…' : 'Wijzigingen opslaan'}</Button>
                </div>
              </div>
            )}

            {/* Subscription Section */}
            {activeSection === 'subscription' && (
              <div className="bg-white rounded-lg p-6 border border-gray-200 space-y-8">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Abonnement Beheer</h3>
                </div>

                {/* Current Plan */}
                <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-6 border border-purple-200">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900">Huidig Abonnement</h4>
                      <p className="text-sm text-gray-600">Beheer je abonnement en facturering</p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-purple-600">€9</div>
                      <div className="text-sm text-gray-500">per maand</div>
                    </div>
                  </div>
                  
                  {subscriptionLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                    </div>
                  ) : subscription ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                      <div className="bg-white rounded-lg p-4 border border-purple-200">
                        <div className="flex items-center mb-2">
                          <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                          <span className="font-medium text-gray-900">Status</span>
                        </div>
                        <p className="text-sm text-gray-600 capitalize">{subscription.status || 'Inactief'}</p>
                      </div>
                      
                      <div className="bg-white rounded-lg p-4 border border-purple-200">
                        <div className="flex items-center mb-2">
                          <Calendar className="w-5 h-5 text-blue-500 mr-2" />
                          <span className="font-medium text-gray-900">Volgende Factuur</span>
                        </div>
                        <p className="text-sm text-gray-600">
                          {subscription.current_period_end 
                            ? new Date(subscription.current_period_end).toLocaleDateString('nl-NL', {
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric'
                              })
                            : 'Niet beschikbaar'
                          }
                        </p>
                      </div>
                      
                      <div className="bg-white rounded-lg p-4 border border-purple-200">
                        <div className="flex items-center mb-2">
                          <CreditCard className="w-5 h-5 text-purple-500 mr-2" />
                          <span className="font-medium text-gray-900">Betaalmethode</span>
                        </div>
                        <p className="text-sm text-gray-600">
                          {subscription.stripe_customer_id ? '•••• •••• •••• ••••' : 'Niet ingesteld'}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-gray-600 mb-4">Je hebt nog geen actief abonnement</p>
                      <Button 
                        onClick={() => StripeService.redirectToCheckout({ profileId: profile?.id || '' })}
                        className="bg-purple-600 hover:bg-purple-700"
                      >
                        Start Abonnement
                      </Button>
                    </div>
                  )}
                </div>

                {/* Plan Features */}
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-gray-900">Wat je krijgt</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-start space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                      <div>
                        <span className="font-medium text-gray-900">Onbeperkte bewerkingen</span>
                        <p className="text-sm text-gray-600">Wijzig je pagina wanneer je wilt</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <span className="font-medium text-gray-900">
                          Live pagina -{' '}
                          <span className="text-purple-600 break-all">
                            TapBookr.com/{profile?.handle}
                          </span>
                        </span>
                        <p className="text-sm text-gray-600">Je pagina is altijd online beschikbaar</p>
                      </div>
                    </div>
                    
                    {/* <div className="flex items-start space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                      <div>
                        <span className="font-medium text-gray-900">Analytics</span>
                        <p className="text-sm text-gray-600">Bekijk bezoekers en interacties</p>
                      </div>
                    </div> */}
                    
                    <div className="flex items-start space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                      <div>
                        <span className="font-medium text-gray-900">Klantondersteuning</span>
                        <p className="text-sm text-gray-600">24/7 hulp wanneer je het nodig hebt</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-3 pt-6 border-t border-gray-200">
                  {subscription ? (
                    <>
                      <Button 
                        variant="outline"
                        className="w-full"
                        onClick={() => StripeService.redirectToCustomerPortal({ profileId: profile?.id || '' })}
                      >
                        <CreditCard className="w-4 h-4 mr-2" />
                        Beheer Abonnement
                      </Button>
                      
                      <Button 
                        variant="outline"
                        className="w-full"
                        onClick={() => {
                          toast({
                            title: "Facturen downloaden",
                            description: "Deze functie wordt binnenkort toegevoegd.",
                          });
                        }}
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Facturen downloaden
                      </Button>
                    </>
                  ) : (
                    <Button 
                      onClick={() => StripeService.redirectToCheckout({ profileId: profile?.id || '' })}
                      className="w-full bg-purple-600 hover:bg-purple-700"
                    >
                      <CreditCard className="w-4 h-4 mr-2" />
                      Start Abonnement
                    </Button>
                  )}
                </div>

                {/* Billing History */}
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-gray-900">Factuurgeschiedenis</h4>
                  <div className="bg-gray-50 rounded-lg p-4">
                    {invoices.length > 0 ? (
                      <div className="space-y-3">
                        {invoices.map((invoice) => (
                          <div key={invoice.id} className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
                            <div>
                              <p className="font-medium text-gray-900">
                                {invoice.created_at 
                                  ? new Date(invoice.created_at).toLocaleDateString('nl-NL', {
                                      month: 'long',
                                      year: 'numeric'
                                    })
                                  : 'Onbekende datum'
                                }
                              </p>
                              <p className="text-sm text-gray-500">
                                €{(invoice.amount || 0) / 100},00
                              </p>
                              <p className="text-xs text-gray-400 capitalize">
                                {invoice.status || 'onbekend'}
                              </p>
                            </div>
                            <Button variant="outline" size="sm">
                              <Download className="w-4 h-4 mr-2" />
                              Download
                            </Button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-gray-500">Nog geen facturen beschikbaar</p>
                      </div>
                    )}
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
