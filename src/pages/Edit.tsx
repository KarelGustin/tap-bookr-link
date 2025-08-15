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
import { Database } from '@/integrations/supabase/types';
import { 
  ArrowLeft, 
  ExternalLink, 
  Eye, 
  Settings, 
  Palette, 
  BarChart3, 
  Users, 
  Zap,
  Instagram,
  Facebook,
  Twitter,
  Linkedin,
  Youtube,
  Mail,
  Phone,
  MapPin,
  Plus,
  Edit3,
  Trash2,
  Link as LinkIcon,
  Image as ImageIcon,
  Star,
  Calendar,
  Lock,
  ChevronRight,
  Sparkles
} from 'lucide-react';

type Profile = Database['public']['Tables']['profiles']['Row'];

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
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeSection, setActiveSection] = useState('links');
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      checkOnboardingStatus();
    }
  }, [user]);

  const checkOnboardingStatus = async () => {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('onboarding_completed')
        .eq('user_id', user.id)
        .single();

      if (error) {
        console.error('Error checking onboarding status:', error);
        navigate('/onboarding');
        return;
      }

      if (profile && !(profile as any).onboarding_completed) {
        navigate('/onboarding');
        return;
      }

      // If onboarding is completed, load the profile
      loadProfile();
    } catch (error) {
      console.error('Error checking onboarding status:', error);
      navigate('/onboarding');
    }
  };

  const loadProfile = async () => {
    try {
      if (!user?.id) {
        console.log('No user ID available');
        return;
      }

      console.log('Loading profile for user:', user.id);
      
      // Add a small delay to ensure profile is saved after onboarding
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      console.log('Profile data:', data);

      if (!data) {
        console.log('No profile found, redirecting to onboarding');
        navigate('/onboarding');
        return;
      }

      console.log('Profile loaded successfully:', data.handle);
      setProfile(data);
    } catch (error) {
      console.error('Profile loading error:', error);
      const errorMessage = error instanceof Error ? error.message : "Failed to load profile";
      
      // If it's a "not found" type error or no profile exists, redirect to onboarding
      if (errorMessage.includes('not found') || errorMessage.includes('No rows returned') || errorMessage.includes('Failed to load profile')) {
        console.log('Redirecting to onboarding due to profile error');
        navigate('/onboarding');
        return;
      }
      
      toast({
        title: "Error",
        description: errorMessage,
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
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to save profile";
      toast({
        title: "Error",
        description: errorMessage,
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
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to publish profile";
      toast({
        title: "Error",
        description: errorMessage,
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
    <div className="min-h-screen bg-gray-50 flex">
      {/* Left Sidebar */}
      <div className="w-64 bg-gray-100 border-r border-gray-200 flex flex-col">
        <div className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">My Bookr</h2>
          
          {/* Navigation Menu */}
          <nav className="space-y-1">
            <div className="mb-4">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Profile</h3>
              <div className="space-y-1">
                <button
                  onClick={() => setActiveSection('links')}
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
                  onClick={() => setActiveSection('design')}
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
                  onClick={() => setActiveSection('insights')}
                  className={`w-full flex items-center px-3 py-2 text-sm rounded-md transition-colors ${
                    activeSection === 'insights' 
                      ? 'bg-gray-200 text-gray-900' 
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <BarChart3 className="w-4 h-4 mr-3" />
                  Insights
                </button>
              </div>
            </div>

            <div className="mb-4">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Tools</h3>
              <div className="space-y-1">
                <button className="w-full flex items-center px-3 py-2 text-sm rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors">
                  <Zap className="w-4 h-4 mr-3" />
                  Social planner
                </button>
                <button className="w-full flex items-center px-3 py-2 text-sm rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors">
                  <Users className="w-4 h-4 mr-3" />
                  Instagram auto-reply
                </button>
                <button className="w-full flex items-center px-3 py-2 text-sm rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors">
                  <LinkIcon className="w-4 h-4 mr-3" />
                  Link shortener
                </button>
                <button className="w-full flex items-center px-3 py-2 text-sm rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors">
                  <Sparkles className="w-4 h-4 mr-3" />
                  Post ideas
                </button>
              </div>
            </div>
          </nav>

          {/* Growth Tools */}
          <div className="mt-auto pt-6 border-t border-gray-200">
            <div className="bg-green-50 rounded-lg p-4">
              <div className="flex items-center mb-2">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                  <Sparkles className="w-4 h-4 text-green-600" />
                </div>
                <h4 className="text-sm font-semibold text-green-900">New growth tools</h4>
              </div>
              <button className="text-sm text-green-700 hover:text-green-800 font-medium">
                Get started →
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link to="/" className="flex items-center text-sm text-gray-600 hover:text-gray-900">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Home
              </Link>
              <h1 className="text-xl font-semibold text-gray-900">Edit Profile</h1>
            </div>
            <div className="flex items-center space-x-3">
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
        </header>

        {/* Main Content */}
        <main className="flex-1 p-6">
          <div className="max-w-4xl">
            {/* Profile Header */}
            <div className="bg-white rounded-lg p-6 mb-6 border border-gray-200">
              <div className="flex items-start space-x-4">
                <div className="w-20 h-20 bg-gray-300 rounded-full flex items-center justify-center">
                  <ImageIcon className="w-8 h-8 text-gray-500" />
                </div>
                <div className="flex-1">
                  <div className="mb-4">
                    <Label htmlFor="handle" className="text-sm font-medium text-gray-700">Handle</Label>
                    <div className="flex items-center mt-1">
                      <span className="text-lg font-semibold text-gray-900">@{profile.handle}</span>
                    </div>
                  </div>
                  <div className="mb-4">
                    <Label htmlFor="bio" className="text-sm font-medium text-gray-700">Add bio</Label>
                    <Textarea
                      id="bio"
                      placeholder="Tell people about yourself..."
                      value={profile.slogan || ''}
                      onChange={(e) => setProfile({ ...profile, slogan: e.target.value })}
                      className="mt-1"
                      rows={3}
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                      <Instagram className="w-4 h-4 text-gray-500" />
                    </div>
                    <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                      <Twitter className="w-4 h-4 text-gray-500" />
                    </div>
                    <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                      <Mail className="w-4 h-4 text-gray-500" />
                    </div>
                    <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                      <Plus className="w-4 h-4 text-gray-500" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mb-6 space-y-3">
              <Button className="w-full" size="lg">
                <Plus className="mr-2 h-4 w-4" />
                + Add
              </Button>
              <div className="flex space-x-3">
                <Button variant="outline" className="flex-1">
                  Add collection
                </Button>
                <Button variant="ghost" className="text-gray-600">
                  View archive <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </div>

            {/* Links Section */}
            {activeSection === 'links' && (
              <div className="space-y-4">
                {/* Instagram Link */}
                <Card className="border border-gray-200">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center mb-3">
                          <h3 className="font-medium text-gray-900 mr-2">Instagram</h3>
                          <Edit3 className="w-4 h-4 text-gray-400 cursor-pointer" />
                        </div>
                        <div className="flex items-center mb-3">
                          <span className="text-sm text-gray-500 mr-2">URL</span>
                          <Edit3 className="w-4 h-4 text-gray-400 cursor-pointer" />
                        </div>
                        <div className="flex items-center space-x-2">
                          <Instagram className="w-4 h-4 text-gray-400" />
                          <LinkIcon className="w-4 h-4 text-gray-400" />
                          <ImageIcon className="w-4 h-4 text-gray-400" />
                          <Star className="w-4 h-4 text-gray-400" />
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <Lock className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-500">0 clicks</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-6 bg-gray-200 rounded-full relative">
                          <div className="w-4 h-4 bg-white rounded-full absolute left-0.5 top-0.5"></div>
                        </div>
                        <Trash2 className="w-4 h-4 text-gray-400 cursor-pointer" />
                      </div>
                    </div>
                    <div className="mt-3 bg-yellow-50 border border-yellow-200 rounded-md p-3">
                      <div className="flex items-start">
                        <div className="w-4 h-4 bg-yellow-400 rounded-full flex items-center justify-center mr-2 mt-0.5">
                          <span className="text-xs text-white">!</span>
                        </div>
                        <div className="text-sm text-yellow-800">
                          Finish connecting your Instagram to display it on your Bookr. 
                          <button className="text-yellow-700 font-medium ml-1 hover:underline">Connect Instagram</button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* WhatsApp Link */}
                <Card className="border border-gray-200">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center mb-3">
                          <h3 className="font-medium text-gray-900 mr-2">WhatsApp</h3>
                          <Edit3 className="w-4 h-4 text-gray-400 cursor-pointer" />
                        </div>
                        <div className="flex items-center mb-3">
                          <span className="text-sm text-gray-500 mr-2">URL</span>
                          <Edit3 className="w-4 h-4 text-gray-400 cursor-pointer" />
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="w-4 h-4 bg-green-500 rounded flex items-center justify-center">
                            <span className="text-white text-xs font-bold">W</span>
                          </div>
                          <LinkIcon className="w-4 h-4 text-gray-400" />
                          <ImageIcon className="w-4 h-4 text-gray-400" />
                          <Star className="w-4 h-4 text-gray-400" />
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <Lock className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-500">0 clicks</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-6 bg-gray-200 rounded-full relative">
                          <div className="w-4 h-4 bg-white rounded-full absolute left-0.5 top-0.5"></div>
                        </div>
                        <Trash2 className="w-4 h-4 text-gray-400 cursor-pointer" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* TikTok Link */}
                <Card className="border border-gray-200">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center mb-3">
                          <h3 className="font-medium text-gray-900 mr-2">TikTok</h3>
                          <Edit3 className="w-4 h-4 text-gray-400 cursor-pointer" />
                        </div>
                        <div className="flex items-center mb-3">
                          <span className="text-sm text-gray-500 mr-2">URL</span>
                          <Edit3 className="w-4 h-4 text-gray-400 cursor-pointer" />
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="w-4 h-4 bg-black rounded flex items-center justify-center">
                            <span className="text-white text-xs font-bold">T</span>
                          </div>
                          <LinkIcon className="w-4 h-4 text-gray-400" />
                          <ImageIcon className="w-4 h-4 text-gray-400" />
                          <Star className="w-4 h-4 text-gray-400" />
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <Lock className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-500">0 clicks</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-6 bg-gray-200 rounded-full relative">
                          <div className="w-4 h-4 bg-white rounded-full absolute left-0.5 top-0.5"></div>
                        </div>
                        <Trash2 className="w-4 h-4 text-gray-400 cursor-pointer" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Facebook Link */}
                <Card className="border border-gray-200">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center mb-3">
                          <h3 className="font-medium text-gray-900 mr-2">Facebook</h3>
                          <Edit3 className="w-4 h-4 text-gray-400 cursor-pointer" />
                        </div>
                        <div className="flex items-center mb-3">
                          <span className="text-sm text-gray-500 mr-2">URL</span>
                          <Edit3 className="w-4 h-4 text-gray-400 cursor-pointer" />
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="w-4 h-4 bg-blue-600 rounded flex items-center justify-center">
                            <span className="text-white text-xs font-bold">f</span>
                          </div>
                          <LinkIcon className="w-4 h-4 text-gray-400" />
                          <ImageIcon className="w-4 h-4 text-gray-400" />
                          <Star className="w-4 h-4 text-gray-400" />
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <Lock className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-500">0 clicks</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-6 bg-gray-200 rounded-full relative">
                          <div className="w-4 h-4 bg-white rounded-full absolute left-0.5 top-0.5"></div>
                        </div>
                        <Trash2 className="w-4 h-4 text-gray-400 cursor-pointer" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Design Section */}
            {activeSection === 'design' && (
              <div className="bg-white rounded-lg p-6 border border-gray-200">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Design Settings</h3>
                <p className="text-gray-600">Design customization options will be available here.</p>
              </div>
            )}

            {/* Insights Section */}
            {activeSection === 'insights' && (
              <div className="bg-white rounded-lg p-6 border border-gray-200">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Analytics & Insights</h3>
                <p className="text-gray-600">View your profile analytics and visitor insights here.</p>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Right Sidebar - Mobile Preview */}
      <div className="w-80 bg-gray-100 border-l border-gray-200 p-6">
        <div className="bg-white rounded-3xl shadow-lg p-4 mx-auto" style={{ width: '280px', height: '560px' }}>
          {/* Mobile Preview Header */}
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-gray-300 rounded-full mx-auto mb-3 flex items-center justify-center">
              <ImageIcon className="w-8 h-8 text-gray-500" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">@{profile.handle}</h3>
            {profile.slogan && (
              <p className="text-sm text-gray-600 mt-1">{profile.slogan}</p>
            )}
          </div>

          {/* Mobile Preview Content */}
          <div className="space-y-3">
            <div className="w-full h-12 bg-gray-200 rounded-lg flex items-center justify-center">
              <span className="text-sm text-gray-500">No links yet</span>
            </div>
            <div className="w-full h-12 bg-gray-200 rounded-lg flex items-center justify-center">
              <span className="text-sm text-gray-500">No links yet</span>
            </div>
            <div className="w-full h-12 bg-gray-200 rounded-lg flex items-center justify-center">
              <span className="text-sm text-gray-500">No links yet</span>
            </div>
          </div>

          {/* Mobile Preview Footer */}
          <div className="absolute bottom-4 left-4 right-4">
            <Button className="w-full" size="sm">
              <Star className="w-4 h-4 mr-2" />
              Join {profile.handle} on Bookr
            </Button>
            <div className="flex justify-center space-x-4 mt-3 text-xs text-gray-500">
              <button className="hover:text-gray-700">Report</button>
              <button className="hover:text-gray-700">Privacy</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}