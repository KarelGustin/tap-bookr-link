import { useState, useEffect, useRef } from 'react';
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
  ExternalLink
} from 'lucide-react';

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
  const [activeSection, setActiveSection] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [bookingUrl, setBookingUrl] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const { user, signOut, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

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
    bannerType: 'color' as 'color' | 'image',
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
      bannerType: typeof b.imageUrl === 'string' ? 'image' : 'color',
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
                    setActiveSection('overview');
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center px-3 py-2 text-sm rounded-md transition-colors ${
                    activeSection === 'overview' 
                      ? 'bg-gray-200 text-gray-900' 
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <BarChart3 className="w-4 h-4 mr-3" />
                  Overview
                </button>
                <button
                  onClick={() => {
                    setActiveSection('links');
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center px-3 py-2 text-sm rounded-md transition-colors ${
                    activeSection === 'links' 
                      ? 'bg-gray-200 text-gray-900' 
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <LinkIcon className="w-4 h-4 mr-3" />
                  Links
                </button>
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
              </div>
            </div>
          </nav>
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
              <h1 className="text-xl lg:text-2xl font-bold text-gray-900">Dashboard</h1>
            </div>
            <div className="flex items-center space-x-2 lg:space-x-3">
              {profile ? (
                <>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => navigate('/edit')}
                    className="hidden sm:inline-flex"
                  >
                    <Edit3 className="w-4 h-4 mr-2" />
                    Edit Profile
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => navigate(`/${profile.handle}`)}
                    className="hidden sm:inline-flex"
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    View Public Page
                  </Button>
                </>
              ) : (
                <Button 
                  onClick={() => navigate('/onboarding')}
                  className="bg-purple-600 hover:bg-purple-700 hidden sm:inline-flex"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Your Profile
                </Button>
              )}
              <Button variant="outline" size="sm" className="hidden lg:inline-flex">
                <Palette className="w-4 h-4 mr-2" />
                Design
              </Button>
              <Button variant="outline" size="sm" className="hidden lg:inline-flex">
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
              <Button variant="outline" size="sm">
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Button>
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

            {/* Overview Section */}
            {activeSection === 'overview' && (
              <div className="space-y-6">
                {/* Stats Grid - Locked as Placeholders */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
                  <Card className="opacity-60">
                    <CardContent className="p-4 lg:p-6">
                      <div className="flex items-center justify-between">
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-gray-600">Total Views</p>
                          <p className="text-xl lg:text-2xl font-bold text-gray-400">Coming Soon</p>
                        </div>
                        <div className="w-10 h-10 lg:w-12 lg:h-12 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                          <Lock className="w-5 h-5 lg:w-6 lg:h-6 text-gray-400" />
                        </div>
                      </div>
                      <div className="mt-3 lg:mt-4 flex items-center text-sm text-gray-400">
                        <span>Feature locked - Coming in next update</span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="opacity-60">
                    <CardContent className="p-4 lg:p-6">
                      <div className="flex items-center justify-between">
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-gray-600">Total Clicks</p>
                          <p className="text-xl lg:text-2xl font-bold text-gray-400">Coming Soon</p>
                        </div>
                        <div className="w-10 h-10 lg:w-12 lg:h-12 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                          <Lock className="w-5 h-5 lg:w-6 lg:h-6 text-gray-400" />
                        </div>
                      </div>
                      <div className="mt-3 lg:mt-4 flex items-center text-sm text-gray-400">
                        <span>Feature locked - Coming in next update</span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="opacity-60">
                    <CardContent className="p-4 lg:p-6">
                      <div className="flex items-center justify-between">
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-gray-600">Conversion Rate</p>
                          <p className="text-xl lg:text-2xl font-bold text-gray-400">Coming Soon</p>
                        </div>
                        <div className="w-10 h-10 lg:w-12 lg:h-12 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                          <Lock className="w-5 h-5 lg:w-6 lg:h-6 text-gray-400" />
                        </div>
                      </div>
                      <div className="mt-3 lg:mt-4 flex items-center text-sm text-gray-400">
                        <span>Feature locked - Coming in next update</span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="opacity-60">
                    <CardContent className="p-4 lg:p-6">
                      <div className="flex items-center justify-between">
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-gray-600">Top Link</p>
                          <p className="text-xl lg:text-2xl font-bold text-gray-400">Coming Soon</p>
                        </div>
                        <div className="w-10 h-10 lg:w-12 lg:h-12 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                          <Lock className="w-5 h-5 lg:w-6 lg:h-6 text-gray-400" />
                        </div>
                      </div>
                      <div className="mt-3 lg:mt-4 flex items-center text-sm text-gray-400">
                        <span>Feature locked - Coming in next update</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Recent Activity - Locked as Placeholder */}
                <Card className="opacity-60">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Lock className="w-5 h-5 mr-2" />
                      Recent Activity
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8">
                      <Lock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-500 mb-2">Feature Locked</h3>
                      <p className="text-gray-400">Recent activity tracking will be available in the next update</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Links Section */}
            {activeSection === 'links' && (
              <div className="space-y-6">
                {/* Booking Link Section */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <LinkIcon className="w-5 h-5 mr-2" />
                      Booking Link
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="bookingUrl" className="text-sm font-medium text-gray-700">
                          Your Booking Software URL
                        </Label>
                        <p className="text-sm text-gray-500 mt-1">
                          Add your Calendly, Salonized, Treatwell, or any other booking software link
                        </p>
                      </div>
                      <div className="flex space-x-3">
                        <Input
                          id="bookingUrl"
                          type="url"
                          placeholder="https://calendly.com/yourname"
                          value={bookingUrl}
                          onChange={(e) => setBookingUrl(e.target.value)}
                          className="flex-1"
                        />
                        <Button 
                          onClick={saveBookingUrl}
                          disabled={isSaving}
                          className="bg-purple-600 hover:bg-purple-700"
                        >
                          {isSaving ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                          ) : (
                            <Save className="w-4 h-4 mr-2" />
                          )}
                          Save
                        </Button>
                      </div>
                      {/* Save Status Indicator */}
                      {profile?.booking_url && (
                        <div className="flex items-center space-x-2">
                          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                          <span className="text-sm text-green-600 font-medium">Saved</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Social Links Section */}
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold text-gray-900">Social Links</h2>
                  
                  {socialLinks.map((link) => (
                    <Card key={link.id} className="border border-gray-200">
                      <CardContent className="p-4">
                        <div className="space-y-4">
                          {/* Link Title */}
                          <div className="flex items-center justify-between">
                            <h3 className="font-medium text-gray-900">{link.title}</h3>
                            {/* Save Status Indicator */}
                            <div className="flex items-center space-x-2">
                              <div className={`w-3 h-3 rounded-full animate-pulse ${
                                link.isSaved ? 'bg-green-500' : 'bg-red-500'
                              }`}></div>
                              <span className={`text-sm font-medium ${
                                link.isSaved ? 'text-green-600' : 'text-red-600'
                              }`}>
                                {link.isSaved ? 'Saved' : 'Not Saved'}
                              </span>
                            </div>
                          </div>
                          
                          {/* URL Input */}
                          <div>
                            <Label htmlFor={`url-${link.id}`} className="text-sm font-medium text-gray-700">
                              URL
                            </Label>
                            <div className="flex space-x-3 mt-1">
                              <Input
                                id={`url-${link.id}`}
                                type="url"
                                placeholder={`Enter your ${link.title} profile URL`}
                                value={link.url}
                                onChange={(e) => {
                                  setSocialLinks(prev => 
                                    prev.map(l => 
                                      l.id === link.id 
                                        ? { ...l, url: e.target.value, isSaved: false }
                                        : l
                                    )
                                  );
                                }}
                                className="flex-1"
                              />
                              <Button 
                                onClick={() => updateSocialLink(link.id, link.url)}
                                disabled={link.isSaved}
                                variant={link.isSaved ? "outline" : "default"}
                                className={link.isSaved ? "text-green-600 border-green-600" : ""}
                              >
                                {link.isSaved ? (
                                  <span className="text-green-600">✓</span>
                                ) : (
                                  <Save className="w-4 h-4 mr-2" />
                                )}
                                {link.isSaved ? 'Saved' : 'Save'}
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Design Section */}
            {activeSection === 'design' && (
              <div className="bg-white rounded-lg p-6 border border-gray-200 space-y-8">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Design your public page</h3>
                  <Button onClick={saveDesign} disabled={designLoading}>
                    {designLoading ? 'Saving…' : 'Save changes'}
                  </Button>
                </div>

                <Separator />

                {/* 1) Banner */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">Banner</h4>
                    <Button onClick={saveBanner} disabled={designLoading} size="sm">
                      {designLoading ? 'Saving…' : 'Save Banner'}
                    </Button>
                  </div>
                  <div className="flex gap-3">
                    <Button
                      type="button"
                      variant={design.bannerType === 'color' ? 'default' : 'outline'}
                      onClick={() => setDesign((d) => ({ ...d, bannerType: 'color' }))}
                    >
                      Use color
                    </Button>
                    <Button
                      type="button"
                      variant={design.bannerType === 'image' ? 'default' : 'outline'}
                      onClick={() => setDesign((d) => ({ ...d, bannerType: 'image' }))}
                    >
                      Use image
                    </Button>
                  </div>

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
                      <Label>Category</Label>
                      <Input
                        placeholder="e.g., Photographer, Designer, Consultant"
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
                      <Label>Banner Heading</Label>
                      <Input
                        placeholder="Your main banner title (optional - uses name if empty)"
                        value={design.bannerHeading}
                        onChange={(e) => setDesign((d) => ({ ...d, bannerHeading: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label>Banner Subheading</Label>
                      <Input
                        placeholder="Your banner subtitle or tagline (optional - uses slogan if empty)"
                        value={design.bannerSubheading}
                        onChange={(e) => setDesign((d) => ({ ...d, bannerSubheading: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label>Text Color</Label>
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
                      <Label className="w-32">Color</Label>
                      <Input
                        type="color"
                        value={design.bannerColor}
                        onChange={(e) => setDesign((d) => ({ ...d, bannerColor: e.target.value }))}
                        className="w-24 p-1"
                      />
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Label>Banner image</Label>
                      <div className="flex items-center gap-3">
                        <Button type="button" variant="outline" onClick={() => bannerInputRef.current?.click()}>
                          {bannerPreview ? 'Change banner' : 'Upload banner'}
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
                        <p className="text-xs text-muted-foreground mb-1">Current banner</p>
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
                    <h4 className="font-medium">Profile</h4>
                    <Button onClick={saveProfile} disabled={designLoading} size="sm">
                      {designLoading ? 'Saving…' : 'Save Profile'}
                    </Button>
                  </div>
                  <div className="space-y-2">
                    <Label>Avatar</Label>
                    <div className="flex items-center gap-3">
                      <Button type="button" variant="outline" onClick={() => avatarInputRef.current?.click()}>
                        {avatarPreview ? 'Change avatar' : 'Upload avatar'}
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
                      <p className="text-xs text-muted-foreground">Currently used avatar</p>
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Name, category, and slogan are now configured in the Banner section above.
                  </div>
                </div>

                <Separator />

                {/* 3) About */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">About section</h4>
                    <Button onClick={saveAbout} disabled={designLoading} size="sm">
                      {designLoading ? 'Saving…' : 'Save About'}
                    </Button>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-3">
                    <div>
                      <Label>Title</Label>
                      <Input value={design.aboutTitle} onChange={(e) => setDesign((d) => ({ ...d, aboutTitle: e.target.value }))} />
                    </div>
                    <div>
                      <Label>Text Alignment</Label>
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          variant={design.aboutAlignment === 'center' ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setDesign((d) => ({ ...d, aboutAlignment: 'center' }))}
                        >
                          Center
                        </Button>
                        <Button
                          type="button"
                          variant={design.aboutAlignment === 'left' ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setDesign((d) => ({ ...d, aboutAlignment: 'left' }))}
                        >
                          Left
                        </Button>
                      </div>
                    </div>
                    <div className="sm:col-span-2">
                      <Label>Description</Label>
                      <Textarea 
                        rows={6} 
                        value={design.aboutDescription} 
                        onChange={(e) => setDesign((d) => ({ ...d, aboutDescription: e.target.value }))}
                        placeholder="Enter your description here. Use Enter/Return to create new paragraphs."
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Use Enter/Return to create new paragraphs. Line breaks will be preserved.
                      </p>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* 4) Media gallery */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">Media gallery</h4>
                    <Button onClick={saveMedia} disabled={designLoading} size="sm">
                      {designLoading ? 'Saving…' : 'Save Gallery'}
                    </Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">Up to 6 images</p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>{design.mediaOrder.length + galleryNewPreviews.length}/6</span>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => galleryInputRef.current?.click()}
                        disabled={design.mediaOrder.length + galleryNewPreviews.length >= 6}
                      >
                        + Add image
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
                      <p className="text-xs text-muted-foreground">No images yet</p>
                    )}
                  </div>
                </div>

                <Separator />

                {/* 5) Social links */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">Social links</h4>
                    <Button onClick={saveSocials} disabled={designLoading} size="sm">
                      {designLoading ? 'Saving…' : 'Save Socials'}
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {design.socials.map((s, i) => (
                      <div key={i} className="grid sm:grid-cols-3 gap-2">
                        <Input
                          placeholder="Title (e.g., Instagram)"
                          value={s.title || ''}
                          onChange={(e) => {
                            const next = [...design.socials];
                            next[i] = { ...next[i], title: e.target.value };
                            setDesign((d) => ({ ...d, socials: next }));
                          }}
                        />
                        <Input
                          placeholder="Platform (optional)"
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
                            Remove
                          </Button>
                        </div>
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setDesign((d) => ({ ...d, socials: [...d.socials, { title: '', url: '' }] }))}
                    >
                      Add social
                    </Button>
                  </div>
                </div>

                <Separator />

                {/* 6) Booking */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">Booking</h4>
                    <Button onClick={saveBooking} disabled={designLoading} size="sm">
                      {designLoading ? 'Saving…' : 'Save Booking'}
                    </Button>
                  </div>
                  <div className="grid sm:grid-cols-3 gap-3">
                    <div className="sm:col-span-3">
                      <Label>Booking URL</Label>
                      <Input
                        placeholder="https://..."
                        value={design.bookingUrl}
                        onChange={(e) => setDesign((d) => ({ ...d, bookingUrl: e.target.value }))}
                      />
                      <p className="text-xs text-muted-foreground mt-1">Embed mode is used by default.</p>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* 7) Testimonials */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">Testimonials</h4>
                      {design.testimonials.length > 0 && design.testimonials.every(t => 
                        t.customer_name === 'Sarah Johnson' || 
                        t.customer_name === 'Mike Chen' || 
                        t.customer_name === 'Emily Rodriguez'
                      ) && (
                        <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full">
                          Using placeholders
                        </span>
                      )}
                      {(() => {
                        // Check if testimonials exist in the database
                        const about = (profile?.about ?? {}) as { [key: string]: unknown };
                        const hasTestimonialsInDB = typeof about.testimonials === 'object' && Array.isArray(about.testimonials) && about.testimonials.length > 0;
                        
                        if (design.testimonials.length > 0 && !hasTestimonialsInDB) {
                          return (
                            <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full animate-pulse">
                              Auto-saving...
                            </span>
                          );
                        }
                        return null;
                      })()}
                    </div>
                    <Button onClick={saveTestimonials} disabled={designLoading} size="sm">
                      {designLoading ? 'Saving…' : 'Save Testimonials'}
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Add a few short reviews (image optional). Placeholder testimonials are shown by default and will be automatically saved to your public page. You can edit, replace, or remove them anytime.
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
                        placeholder="Customer name"
                        value={t.customer_name}
                        onChange={(e) => {
                          const next = [...design.testimonials];
                          next[i] = { ...next[i], customer_name: e.target.value };
                          setDesign((d) => ({ ...d, testimonials: next }));
                        }}
                      />
                      <Input
                        placeholder="Review title"
                        value={t.review_title}
                        onChange={(e) => {
                          const next = [...design.testimonials];
                          next[i] = { ...next[i], review_title: e.target.value };
                          setDesign((d) => ({ ...d, testimonials: next }));
                        }}
                      />
                      <Input
                        placeholder="Review text"
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
                          Remove
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
                      + Add testimonial
                    </Button>
                    {design.testimonials.length > 0 && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setDesign((d) => ({ ...d, testimonials: [] }))}
                        className="text-red-600 hover:text-red-700"
                      >
                        Clear All
                      </Button>
                    )}
                  </div>
                </div>

                <Separator />

                {/* 8) Footer */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">Footer Settings</h4>
                    <Button onClick={saveAbout} disabled={designLoading} size="sm">
                      {designLoading ? 'Saving…' : 'Save Footer'}
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Configure your footer information and policies. This appears at the bottom of your public page.
                  </p>
                  
                  {/* Business Information */}
                  <div className="grid sm:grid-cols-2 gap-3">
                    <div>
                      <Label>Business Name</Label>
                      <Input 
                        placeholder="Your business name"
                        value={design.footerBusinessName}
                        onChange={(e) => setDesign((d) => ({ ...d, footerBusinessName: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label>Address</Label>
                      <Input 
                        placeholder="Your business address"
                        value={design.footerAddress}
                        onChange={(e) => setDesign((d) => ({ ...d, footerAddress: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label>Email</Label>
                      <Input 
                        type="email"
                        placeholder="your@email.com"
                        value={design.footerEmail}
                        onChange={(e) => setDesign((d) => ({ ...d, footerEmail: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label>Phone</Label>
                      <Input 
                        type="tel"
                        placeholder="+1 (555) 123-4567"
                        value={design.footerPhone}
                        onChange={(e) => setDesign((d) => ({ ...d, footerPhone: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label>Business Hours</Label>
                      <Input 
                        placeholder="Mon-Fri 9AM-6PM, Sat 10AM-4PM"
                        value={design.footerHours}
                        onChange={(e) => setDesign((d) => ({ ...d, footerHours: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label>Next Available</Label>
                      <Input 
                        placeholder="Tue 14:30 (optional)"
                        value={design.footerNextAvailable}
                        onChange={(e) => setDesign((d) => ({ ...d, footerNextAvailable: e.target.value }))}
                      />
                    </div>
                  </div>

                  {/* Policies */}
                  <div className="space-y-3">
                    <h5 className="font-medium text-sm">Policies & Trust</h5>
                    <div className="grid gap-3">
                      <div>
                        <Label>Cancellation Policy</Label>
                        <Textarea 
                          rows={2}
                          placeholder="Plans changed? Reschedule or cancel 24h in advance to avoid a fee."
                          value={design.footerCancellationPolicy}
                          onChange={(e) => setDesign((d) => ({ ...d, footerCancellationPolicy: e.target.value }))}
                        />
                      </div>
                      <div>
                        <Label>Privacy Policy</Label>
                        <Textarea 
                          rows={2}
                          placeholder="We only use your details to manage your appointment. No spam."
                          value={design.footerPrivacyPolicy}
                          onChange={(e) => setDesign((d) => ({ ...d, footerPrivacyPolicy: e.target.value }))}
                        />
                      </div>
                      <div>
                        <Label>Terms of Service</Label>
                        <Textarea 
                          rows={2}
                          placeholder="Secure booking handled by top booking platforms."
                          value={design.footerTermsOfService}
                          onChange={(e) => setDesign((d) => ({ ...d, footerTermsOfService: e.target.value }))}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Display Options */}
                  <div className="space-y-3">
                    <h5 className="font-medium text-sm">Display Options</h5>
                    <div className="flex items-center space-x-6">
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="showMaps"
                          checked={design.footerShowMaps}
                          onChange={(e) => setDesign((d) => ({ ...d, footerShowMaps: e.target.checked }))}
                          className="rounded"
                        />
                        <Label htmlFor="showMaps">Show Google Maps</Label>
                      </div>
                     
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="showAttribution"
                          checked={design.footerShowAttribution}
                          onChange={(e) => setDesign((d) => ({ ...d, footerShowAttribution: e.target.checked }))}
                          className="rounded"
                        />
                        <Label htmlFor="showAttribution">Show "Powered by Bookr"</Label>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button onClick={saveDesign} disabled={designLoading}>{designLoading ? 'Saving…' : 'Save changes'}</Button>
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
