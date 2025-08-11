import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate, Link } from 'react-router-dom';
import { Database } from '@/integrations/supabase/types';
import { 
  ChevronDown,
  Settings,
  Palette,
  BarChart3,
  Plus,
  Edit3,
  Save,
  Link as LinkIcon,
  Image as ImageIcon,
  Star,
  Share2,
  Menu,
  X as CloseIcon,
  Lock,
  ExternalLink
} from 'lucide-react';

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
  const [previewOpen, setPreviewOpen] = useState(true);
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
      url: 'https://instagram.com/username',
      isActive: true,
      isSaved: true
    },
    {
      id: '2',
      platform: 'whatsapp',
      title: 'WhatsApp',
      url: 'https://wa.me/1234567890',
      isActive: true,
      isSaved: false
    },
    {
      id: '3',
      platform: 'tiktok',
      title: 'TikTok',
      url: 'https://tiktok.com/@username',
      isActive: false,
      isSaved: true
    },
    {
      id: '4',
      platform: 'facebook',
      title: 'Facebook',
      url: 'https://facebook.com/username',
      isActive: false,
      isSaved: false
    }
  ]);

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
              <CloseIcon className="w-4 h-4" />
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
                                placeholder={`https://${link.platform}.com/username`}
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
              <div className="bg-white rounded-lg p-6 border border-gray-200">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Design Settings</h3>
                <p className="text-gray-600">Customize your profile appearance, colors, and layout here.</p>
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

      {/* Right Sidebar - Mobile Preview */}
      <div className={`hidden lg:block w-80 bg-gray-100 border-l border-gray-200 p-6 ${previewOpen ? '' : 'hidden'}`}>
        <div className="bg-white rounded-3xl shadow-lg p-4 mx-auto" style={{ width: '280px', height: '560px' }}>
          {/* Mobile Preview Header */}
          <div className="text-center mb-6">
            {profile ? (
              <>
                <div className="w-16 h-16 bg-gray-300 rounded-full mx-auto mb-3 flex items-center justify-center">
                  <ImageIcon className="w-8 h-8 text-gray-500" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">@{profile.handle}</h3>
                {profile.slogan && (
                  <p className="text-sm text-gray-600 mt-1">{profile.slogan}</p>
                )}
              </>
            ) : (
              <>
                <div className="w-16 h-16 bg-purple-100 rounded-full mx-auto mb-3 flex items-center justify-center">
                  <Plus className="w-8 h-8 text-purple-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Create Profile</h3>
                <p className="text-sm text-gray-600 mt-1">Get started with Bookr</p>
              </>
            )}
          </div>

          {/* Mobile Preview Content */}
          <div className="space-y-3">
            {profile ? (
              socialLinks.filter(link => link.isActive).map((link) => (
                <div key={link.id} className="w-full h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                  <span className="text-sm text-gray-500">{link.title}</span>
                </div>
              ))
            ) : (
              <div className="w-full h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <span className="text-sm text-purple-600 font-medium">Start Building</span>
              </div>
            )}
            
            {profile && socialLinks.filter(link => link.isActive).length === 0 && (
              <>
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
            {profile ? (
              <Button className="w-full" size="sm">
                <Star className="w-4 h-4 mr-2" />
                Join {profile.handle} on Bookr
              </Button>
            ) : (
              <div className="w-full h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                <span className="text-sm text-gray-500">Preview Mode</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Preview Toggle */}
      <div className="lg:hidden fixed bottom-4 right-4 z-30">
        <Button
          onClick={() => setPreviewOpen(!previewOpen)}
          className="w-12 h-12 rounded-full shadow-lg"
        >
          <ImageIcon className="w-5 h-5" />
        </Button>
      </div>

      {/* Mobile Preview Overlay */}
      {previewOpen && (
        <div className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40">
          <div className="absolute bottom-4 right-4 left-4">
            <div className="bg-white rounded-3xl shadow-lg p-4 mx-auto" style={{ width: '280px', height: '560px' }}>
              {/* Mobile Preview Header */}
              <div className="text-center mb-6">
                {profile ? (
                  <>
                    <div className="w-16 h-16 bg-gray-300 rounded-full mx-auto mb-3 flex items-center justify-center">
                      <ImageIcon className="w-8 h-8 text-gray-500" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">@{profile.handle}</h3>
                    {profile.slogan && (
                      <p className="text-sm text-gray-600 mt-1">{profile.slogan}</p>
                    )}
                  </>
                ) : (
                  <>
                    <div className="w-16 h-16 bg-purple-100 rounded-full mx-auto mb-3 flex items-center justify-center">
                      <Plus className="w-8 h-8 text-purple-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">Create Profile</h3>
                    <p className="text-sm text-gray-600 mt-1">Get started with Bookr</p>
                  </>
                )}
              </div>

              {/* Mobile Preview Content */}
              <div className="space-y-3">
                {profile ? (
                  socialLinks.filter(link => link.isActive).map((link) => (
                    <div key={link.id} className="w-full h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                      <span className="text-sm text-gray-500">{link.title}</span>
                    </div>
                  ))
                ) : (
                  <div className="w-full h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <span className="text-sm text-purple-600 font-medium">Start Building</span>
                  </div>
                )}
                
                {profile && socialLinks.filter(link => link.isActive).length === 0 && (
                  <>
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
                {profile ? (
                  <Button className="w-full" size="sm">
                    <Star className="w-4 h-4 mr-2" />
                    Join {profile.handle} on Bookr
                  </Button>
                ) : (
                  <div className="w-full h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                    <span className="text-sm text-gray-500">Preview Mode</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Close Button */}
          <Button
            onClick={() => setPreviewOpen(false)}
            className="absolute top-4 right-4 w-10 h-10 rounded-full"
            variant="secondary"
          >
            <CloseIcon className="w-5 h-5" />
          </Button>
        </div>
      )}
    </div>
  );
}
