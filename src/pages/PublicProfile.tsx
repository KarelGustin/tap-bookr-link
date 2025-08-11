import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { Calendar, ExternalLink, Mail, Phone, MapPin } from 'lucide-react';
import NotFound from './NotFound';

export default function PublicProfile() {
  const { handle } = useParams();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (handle) {
      loadProfile();
    }
  }, [handle]);

  const loadProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('handle', handle)
        .eq('status', 'published')
        .maybeSingle();

      if (error) throw error;

      if (!data) {
        setNotFound(true);
        return;
      }

      setProfile(data);
    } catch (error) {
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  };

  // SEO: dynamic title, meta description, and canonical
  useEffect(() => {
    if (!profile) return;
    document.title = `${profile.name} – ${profile.slogan ?? 'Book appointments'}`;
    let meta = document.querySelector('meta[name="description"]') as HTMLMetaElement | null;
    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute('name', 'description');
      document.head.appendChild(meta);
    }
    meta.setAttribute('content', `${profile.name}${profile.slogan ? ' – ' + profile.slogan : ''}`.slice(0, 160));
  }, [profile]);

  useEffect(() => {
    let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!link) {
      link = document.createElement('link');
      link.setAttribute('rel', 'canonical');
      document.head.appendChild(link);
    }
    link.setAttribute('href', window.location.href);
  }, [handle]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (notFound || !profile) {
    return <NotFound />;
  }

  const initials = profile.name
    ?.split(' ')
    .map((n: string) => n[0])
    .join('')
    .toUpperCase() || '?';

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/50 to-accent/20">
      <div className="w-full">
        {/* Default Mobile-First Hero Section */}
        <Card className="border-0 shadow-none bg-transparent rounded-none overflow-hidden">
          <div className="relative w-full aspect-[4/3] sm:aspect-[16/9]">
            {profile.banner_url || profile.avatar_url ? (
              <img
                src={profile.banner_url || profile.avatar_url}
                alt={`${profile.name || 'Business'} cover image`}
                className="h-full w-full object-cover"
                loading="eager"
              />
            ) : (
              <div className="h-full w-full bg-gradient-to-b from-accent/40 to-muted" />
            )}
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-b from-transparent to-background/95" />
          </div>
          <CardContent className="p-0">
            <div className="text-center">
              <h1 className="text-3xl font-extrabold tracking-tight">{profile.name || 'Your Business Name'}</h1>
              {profile.slogan && (
                <p className="mt-1 text-sm text-muted-foreground">{profile.slogan}</p>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="grid lg:grid-cols-3">
          {/* Profile Card */}
          <div className="lg:col-span-1">
            <Card className="border-0 shadow-none bg-transparent">
              <CardContent className="p-0">
                <div className="flex flex-col items-center text-center space-y-4">
                  <Avatar className="w-24 h-24">
                    <AvatarImage src={profile.avatar_url} alt={`${profile.name || "Profile"} avatar`} />
                    <AvatarFallback className="text-lg">{initials}</AvatarFallback>
                  </Avatar>
                  
                  <div className="space-y-2">
                    <h1 className="text-2xl font-bold">{profile.name}</h1>
                    {profile.category && (
                      <Badge variant="secondary">{profile.category}</Badge>
                    )}
                    {profile.slogan && (
                      <p className="text-muted-foreground">{profile.slogan}</p>
                    )}
                  </div>

                  {profile.booking_url && (
                    <Button asChild className="w-full" size="lg">
                      <a href={profile.booking_url} target="_blank" rel="noopener noreferrer">
                        <Calendar className="mr-2 h-4 w-4" />
                        Book Appointment
                      </a>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Content */}
          <div className="lg:col-span-2">
            {/* About */}
            {profile.about?.description && (
              <Card className="border-0 shadow-none bg-transparent">
                <CardContent className="p-0">
                  <h2 className="text-xl font-semibold mb-4">About</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    {profile.about.description}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Contact Information */}
            {(profile.contact?.email || profile.contact?.phone || profile.contact?.location) && (
              <Card className="border-0 shadow-none bg-transparent">
                <CardContent className="p-0">
                  <h2 className="text-xl font-semibold mb-4">Contact</h2>
                  <div className="space-y-3">
                    {profile.contact?.email && (
                      <div className="flex items-center space-x-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <a 
                          href={`mailto:${profile.contact.email}`}
                          className="text-muted-foreground hover:text-foreground"
                        >
                          {profile.contact.email}
                        </a>
                      </div>
                    )}
                    {profile.contact?.phone && (
                      <div className="flex items-center space-x-2">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <a 
                          href={`tel:${profile.contact.phone}`}
                          className="text-muted-foreground hover:text-foreground"
                        >
                          {profile.contact.phone}
                        </a>
                      </div>
                    )}
                    {profile.contact?.location && (
                      <div className="flex items-center space-x-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">{profile.contact.location}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Social Links */}
            {profile.socials && Object.keys(profile.socials).length > 0 && (
              <Card className="border-0 shadow-none bg-transparent">
                <CardContent className="p-0">
                  <h2 className="text-xl font-semibold mb-4">Connect</h2>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(profile.socials).map(([platform, url]: [string, any]) => (
                      <Button key={platform} variant="outline" size="sm" asChild>
                        <a href={url} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="mr-2 h-4 w-4" />
                          {platform.charAt(0).toUpperCase() + platform.slice(1)}
                        </a>
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}