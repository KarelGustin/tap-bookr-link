import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, ExternalLink, Eye } from 'lucide-react';

const categories = [
  'Consultant',
  'Coach',
  'Therapist',
  'Designer',
  'Developer',
  'Photographer',
  'Trainer',
  'Other'
];

export default function Edit() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      loadProfile();
    }
  }, [user]);

  const loadProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user?.id)
        .maybeSingle();

      if (error) throw error;

      if (!data) {
        navigate('/onboarding');
        return;
      }

      setProfile(data);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to load profile",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!profile) return;
    
    setSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          name: profile.name,
          category: profile.category,
          slogan: profile.slogan,
          about: profile.about,
          booking_url: profile.booking_url,
        })
        .eq('id', profile.id);

      if (error) throw error;

      toast({
        title: "Saved!",
        description: "Your profile has been updated.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save profile",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async () => {
    if (!profile) return;
    
    setSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ status: 'published' })
        .eq('id', profile.id);

      if (error) throw error;

      setProfile({ ...profile, status: 'published' });
      toast({
        title: "Published!",
        description: "Your profile is now live.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to publish profile",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!profile) {
    return null;
  }

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <nav className="border-b bg-background/95 backdrop-blur">
        <div className="container flex h-14 items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link to="/" className="flex items-center text-sm text-muted-foreground hover:text-foreground">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Home
            </Link>
            <h1 className="font-semibold">Edit Profile</h1>
          </div>
          <div className="flex items-center space-x-2">
            {profile.status === 'published' && (
              <Button asChild variant="outline" size="sm">
                <Link to={`/${profile.handle}`}>
                  <Eye className="mr-2 h-4 w-4" />
                  View Live
                </Link>
              </Button>
            )}
            <Button onClick={signOut} variant="ghost" size="sm">
              Sign Out
            </Button>
          </div>
        </div>
      </nav>

      <div className="container py-8 max-w-4xl">
        <div className="grid gap-6">
          {/* Basic Info */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>
                Your public profile information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={profile.name || ''}
                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="handle">Handle</Label>
                  <Input
                    id="handle"
                    value={profile.handle || ''}
                    disabled
                    className="bg-muted"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select 
                  value={profile.category || ''} 
                  onValueChange={(value) => setProfile({ ...profile, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select your profession" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="slogan">Professional Slogan</Label>
                <Input
                  id="slogan"
                  value={profile.slogan || ''}
                  onChange={(e) => setProfile({ ...profile, slogan: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="about">About</Label>
                <Textarea
                  id="about"
                  value={profile.about?.description || ''}
                  onChange={(e) => setProfile({ 
                    ...profile, 
                    about: { ...profile.about, description: e.target.value }
                  })}
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bookingUrl">Booking URL</Label>
                <Input
                  id="bookingUrl"
                  value={profile.booking_url || ''}
                  onChange={(e) => setProfile({ ...profile, booking_url: e.target.value })}
                />
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex justify-between">
            <div className="space-x-2">
              <Button onClick={handleSave} disabled={saving}>
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
              {profile.status === 'draft' && (
                <Button onClick={handlePublish} disabled={saving} variant="default">
                  Publish Profile
                </Button>
              )}
            </div>
            {profile.status === 'published' && (
              <div className="flex items-center text-sm text-muted-foreground">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                Published at /{profile.handle}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}