import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate, Link } from 'react-router-dom';
import { Database } from '@/integrations/supabase/types';
import { 
  ChevronDown,
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
  Plus,
  Edit3,
  Trash2,
  Link as LinkIcon,
  Image as ImageIcon,
  Star,
  Calendar,
  Lock,
  ChevronRight,
  Sparkles,
  Share2,
  AlertTriangle,
  X,
  MoreVertical,
  FolderOpen,
  Archive,
  ExternalLink
} from 'lucide-react';

type Profile = Database['public']['Tables']['profiles']['Row'];

interface SocialLink {
  id: string;
  platform: string;
  title: string;
  url: string;
  isActive: boolean;
  clicks: number;
}

export default function Profile() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeSection, setActiveSection] = useState('links');
  const [showMaintenanceAlert, setShowMaintenanceAlert] = useState(true);
  const { user, signOut, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Sample social links data
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([
    {
      id: '1',
      platform: 'instagram',
      title: 'Instagram',
      url: 'https://instagram.com/username',
      isActive: false,
      clicks: 0
    },
    {
      id: '2',
      platform: 'whatsapp',
      title: 'WhatsApp',
      url: 'https://wa.me/1234567890',
      isActive: false,
      clicks: 0
    },
    {
      id: '3',
      platform: 'tiktok',
      title: 'TikTok',
      url: 'https://tiktok.com/@username',
      isActive: false,
      clicks: 0
    },
    {
      id: '4',
      platform: 'facebook',
      title: 'Facebook',
      url: 'https://facebook.com/username',
      isActive: false,
      clicks: 0
    }
  ]);

  useEffect(() => {
    if (user) {
      checkOnboardingStatus();
    } else if (user === null) {
      // User is not authenticated
      setProfileLoading(false);
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

  useEffect(() => {
    // If we're still loading after 5 seconds, something might be wrong
    const timeout = setTimeout(() => {
      if (profileLoading) {
        console.log('Profile loading timeout - checking user state');
        if (!user) {
          setProfileLoading(false);
        }
      }
    }, 5000);

    return () => clearTimeout(timeout);
  }, [profileLoading, user]);

  const loadProfile = async () => {
    try {
      if (!user?.id) {
        console.log('No user ID available');
        return;
      }
      
      console.log('Loading profile for user:', user.id);
      console.log('User object:', user);
      
      // Test the Supabase connection first
      const { data: testData, error: testError } = await supabase
        .from('profiles')
        .select('count')
        .limit(1);
      
      console.log('Supabase connection test:', { testData, testError });
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      console.log('Profile query result:', { data, error });
      console.log('Query details:', {
        table: 'profiles',
        user_id: user.id,
        query: `SELECT * FROM profiles WHERE user_id = '${user.id}'`
      });

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      console.log('Profile data:', data);

      if (!data) {
        console.log('No profile found, redirecting to onboarding');
        // Redirect to onboarding if no profile exists
        navigate('/onboarding');
        return;
      }

      console.log('Profile loaded successfully:', data.handle);
      setProfile(data);
    } catch (error) {
      console.error('Profile loading error:', error);
      const errorMessage = error instanceof Error ? error.message : "Failed to load profile";
      
      // Check if it's a "not found" type error
      if (errorMessage.includes('not found') || errorMessage.includes('No rows returned')) {
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
      setProfileLoading(false);
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
          slogan: profile.slogan,
        })
        .eq('id', profile.id);

      if (error) throw error;

      toast({
        title: "Saved!",
        description: "Your profile has been updated.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save profile",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const toggleLink = (linkId: string) => {
    setSocialLinks(prev => 
      prev.map(link => 
        link.id === linkId 
          ? { ...link, isActive: !link.isActive }
          : link
      )
    );
  };

  const deleteLink = (linkId: string) => {
    setSocialLinks(prev => prev.filter(link => link.id !== linkId));
    toast({
      title: "Link deleted",
      description: "Social link has been removed.",
    });
  };

  if (authLoading || profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">
            {authLoading ? 'Checking authentication...' : 'Loading your profile...'}
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
          <p className="text-gray-600 mb-6">Please log in to access your profile dashboard.</p>
          <Button onClick={() => navigate('/login')}>
            Go to Login
          </Button>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Profile Not Found</h2>
          <p className="text-gray-600 mb-6">Redirecting you to complete your profile setup...</p>
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Left Sidebar */}
      <div className="w-64 bg-gray-100 border-r border-gray-200 flex flex-col">
        <div className="p-6">
          {/* User Account */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-semibold">
                  {profile.name?.charAt(0)?.toUpperCase() || 'U'}
                </span>
              </div>
              <span className="font-semibold text-gray-900">{profile.name || 'User'}</span>
            </div>
            <ChevronDown className="w-4 h-4 text-gray-500" />
          </div>
          
          {/* Navigation Menu */}
          <nav className="space-y-1">
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">My Bookr</h3>
                <ChevronDown className="w-4 h-4 text-gray-500" />
              </div>
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
                <button className="w-full flex items-center px-3 py-2 text-sm rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors">
                  <FolderOpen className="w-4 h-4 mr-3" />
                  Shop
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
                <button className="w-full flex items-center px-3 py-2 text-sm rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors">
                  <Star className="w-4 h-4 mr-3" />
                  Earn
                  <span className="ml-2 px-2 py-1 text-xs bg-green-100 text-green-700 rounded-full">NEW</span>
                </button>
              </div>
            </div>

            <div className="mb-4">
              <button className="w-full flex items-center px-3 py-2 text-sm rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors">
                <Users className="w-4 h-4 mr-3" />
                Audience
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

            <div className="mb-4">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Tools</h3>
              <div className="space-y-1">
                <button className="w-full flex items-center px-3 py-2 text-sm rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors">
                  <Zap className="w-4 h-4 mr-3" />
                  Social planner
                </button>
                <button className="w-full flex items-center px-3 py-2 text-sm rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors">
                  <Instagram className="w-4 h-4 mr-3" />
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
            <h1 className="text-2xl font-bold text-gray-900">My Bookr</h1>
            <div className="flex items-center space-x-3">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => navigate('/edit')}
              >
                <Edit3 className="w-4 h-4 mr-2" />
                Edit Profile
              </Button>
              <Button variant="outline" size="sm">
                <Palette className="w-4 h-4 mr-2" />
                Design
              </Button>
              <Button variant="outline" size="sm">
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
        <main className="flex-1 p-6">
          <div className="max-w-4xl">
            {/* Maintenance Alert */}
            {showMaintenanceAlert && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                <div className="flex items-start">
                  <AlertTriangle className="w-5 h-5 text-yellow-600 mr-3 mt-0.5" />
                  <div className="flex-1">
                    <h3 className="text-sm font-medium text-yellow-800">Scheduled Maintenance</h3>
                    <p className="text-sm text-yellow-700 mt-1">
                      Bookr will be briefly unavailable for 10-20 minutes on Monday, August 11th from 7:15 AM GMT+2.
                    </p>
                    <button 
                      onClick={() => setShowMaintenanceAlert(false)}
                      className="text-sm text-yellow-700 hover:text-yellow-800 font-medium mt-2"
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
              </div>
            )}

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
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="ml-2"
                        onClick={() => navigate(`/${profile.handle}`)}
                      >
                        <ExternalLink className="w-4 h-4 mr-1" />
                        View Public Page
                      </Button>
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
                  <FolderOpen className="mr-2 h-4 w-4" />
                  Add collection
                </Button>
                <Button variant="ghost" className="text-gray-600">
                  <Archive className="mr-2 h-4 w-4" />
                  View archive <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </div>

            {/* Links Section */}
            {activeSection === 'links' && (
              <div className="space-y-4">
                {socialLinks.map((link) => (
                  <Card key={link.id} className="border border-gray-200">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center mb-3">
                            <h3 className="font-medium text-gray-900 mr-2">{link.title}</h3>
                            <Edit3 className="w-4 h-4 text-gray-400 cursor-pointer" />
                          </div>
                          <div className="flex items-center mb-3">
                            <span className="text-sm text-gray-500 mr-2">URL</span>
                            <Edit3 className="w-4 h-4 text-gray-400 cursor-pointer" />
                          </div>
                          <div className="flex items-center space-x-2">
                            <MoreVertical className="w-4 h-4 text-gray-400" />
                            <LinkIcon className="w-4 h-4 text-gray-400" />
                            <ImageIcon className="w-4 h-4 text-gray-400" />
                            <Star className="w-4 h-4 text-gray-400" />
                            <Calendar className="w-4 h-4 text-gray-400" />
                            <Lock className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-gray-500">{link.clicks} clicks</span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <div 
                            className={`w-10 h-6 rounded-full relative cursor-pointer ${
                              link.isActive ? 'bg-purple-500' : 'bg-gray-200'
                            }`}
                            onClick={() => toggleLink(link.id)}
                          >
                            <div className={`w-4 h-4 bg-white rounded-full absolute top-0.5 transition-all ${
                              link.isActive ? 'right-0.5' : 'left-0.5'
                            }`} />
                          </div>
                          <Trash2 
                            className="w-4 h-4 text-gray-400 cursor-pointer hover:text-red-500" 
                            onClick={() => deleteLink(link.id)}
                          />
                        </div>
                      </div>
                      
                      {/* Instagram Warning Banner */}
                      {link.platform === 'instagram' && !link.isActive && (
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
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Design Section */}
            {activeSection === 'design' && (
              <div className="bg-white rounded-lg p-6 border border-gray-200">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Design Settings</h3>
                <p className="text-gray-600">Customize your profile appearance, colors, and layout here.</p>
              </div>
            )}

            {/* Insights Section */}
            {activeSection === 'insights' && (
              <div className="bg-white rounded-lg p-6 border border-gray-200">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Analytics & Insights</h3>
                <p className="text-gray-600">View your profile analytics, visitor insights, and performance metrics here.</p>
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
            {socialLinks.filter(link => link.isActive).map((link) => (
              <div key={link.id} className="w-full h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                <span className="text-sm text-gray-500">{link.title}</span>
              </div>
            ))}
            {socialLinks.filter(link => link.isActive).length === 0 && (
              <>
                <div className="w-full h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                  <span className="text-sm text-gray-500">No links yet</span>
                </div>
                <div className="w-full h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                  <span className="text-sm text-gray-500">No links yet</span>
                </div>
                <div className="w-full h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                  <span className="text-sm text-gray-500">No links yet</span>
                </div>
              </>
            )}
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
