import { Button } from "@/components/ui/button";
import { Menu, X, CheckCircle, XCircle, ArrowRight, Star } from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";

export const Hero = () => {
  const [userInput, setUserInput] = useState("");
  const [handle, setHandle] = useState("demo");
  const [debouncedHandle, setDebouncedHandle] = useState("check1");
  const [selectedCategory, setSelectedCategory] = useState("beauty");
  const [isHandleAvailable, setIsHandleAvailable] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const prefix = "bookr.nl/";

  const categories = [
    { id: "beauty", name: "Beauty & Hair", handle: "check1", color: "from-pink-400 to-purple-500" },
    { id: "fitness", name: "Fitness & Wellness", handle: "check1", color: "from-green-400 to-blue-500" },
    { id: "photography", name: "Photography", handle: "check1", color: "from-blue-400 to-indigo-500" },
    { id: "consulting", name: "Consulting", handle: "check1", color: "from-orange-400 to-red-500" },
    { id: "coaching", name: "Life Coaching", handle: "check1", color: "from-yellow-400 to-orange-500" },
    { id: "massage", name: "Massage & Spa", handle: "check1", color: "from-purple-400 to-pink-500" }
  ];

  const sanitizeHandle = (val: string) =>
    val.toLowerCase().replace(/^\s+|\s+$/g, "").replace(/[^a-z0-9-_]/g, "");

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const extracted = value.startsWith(prefix) ? value.slice(prefix.length) : value;
    setUserInput(extracted);
    setHandle(sanitizeHandle(extracted) || "demo");
    // Simple availability check (you can enhance this with actual API call)
    setIsHandleAvailable(extracted.length > 2 && !["admin", "login", "signup", "www"].includes(extracted.toLowerCase()));
  };

  useEffect(() => {
    const t = setTimeout(() => setDebouncedHandle(handle || "demo"), 300);
    return () => clearTimeout(t);
  }, [handle]);

  const previewUrl = `https://tapbookr.com/tapbookr`;

  return (
    <section className="relative min-h-screen overflow-hidden bg-gradient-to-br from-step-yellow via-step-teal to-step-pink">
      {/* Floating header */}
      <header className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-6xl px-4">
        <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-xl border border-white/30 tilt-effect">
          <div className="flex items-center justify-between px-6 py-3">
            <div className="flex items-center gap-8">
              <div className="font-black text-xl">
                Bookr<span className="text-step-pink">.</span>
              </div>
              
              {/* Desktop Navigation */}
              <nav className="hidden md:flex items-center gap-6">
                <a href="#features" className="text-gray-700 hover:text-step-teal font-medium gamify-hover">Features</a>
                <a href="#how-it-works" className="text-gray-700 hover:text-step-pink font-medium gamify-hover">Hoe het werkt</a>
                <a href="#testimonials" className="text-gray-700 hover:text-step-lavender font-medium gamify-hover">Reviews</a>
                <a href="#pricing" className="text-gray-700 hover:text-step-mint font-medium gamify-hover">Prijzen</a>
              </nav>
            </div>
            
            <div className="flex items-center gap-3">
              {/* Mobile menu button */}
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
              
              {/* Desktop auth buttons */}
              <div className="hidden md:flex items-center gap-3">
                <Button variant="ghost" asChild>
                  <a href="/login">Inloggen</a>
                </Button>
                <Button variant="celebration" asChild className="breathing-animation">
                  <a href="/onboarding">🚀 Gratis beginnen</a>
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Overlay */}
        {isMobileMenuOpen && (
          <div className="md:hidden absolute top-full left-0 right-0 mt-2 bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border border-white/30 p-6 animate-slide-up">
            <nav className="flex flex-col gap-4">
              <a href="#features" className="text-gray-700 hover:text-step-teal font-medium py-2 gamify-hover rounded-lg px-3">Features</a>
              <a href="#how-it-works" className="text-gray-700 hover:text-step-pink font-medium py-2 gamify-hover rounded-lg px-3">Hoe het werkt</a>
              <a href="#testimonials" className="text-gray-700 hover:text-step-lavender font-medium py-2 gamify-hover rounded-lg px-3">Reviews</a>
              <a href="#pricing" className="text-gray-700 hover:text-step-mint font-medium py-2 gamify-hover rounded-lg px-3">Prijzen</a>
              <div className="border-t border-gray-200 pt-4 mt-2">
                <div className="flex flex-col gap-3">
                  <Button variant="pastel" className="justify-start" asChild>
                    <a href="/login">Inloggen</a>
                  </Button>
                  <Button variant="celebration" className="justify-start" asChild>
                    <a href="/onboarding">🚀 Gratis beginnen</a>
                  </Button>
                </div>
              </div>
            </nav>
          </div>
        )}
      </header>

      {/* Hero Content */}
      <div className="container mx-auto max-w-7xl px-4 pt-24">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-12 min-h-[calc(100vh-8rem)]">
          {/* Left Content */}
          <div className="flex-1 space-y-8 text-center lg:text-left max-w-2xl">
            <div className="space-y-6">
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-white leading-tight drop-shadow-lg">
                Jouw eigen
                <br />
                <span className="bg-gradient-to-r from-step-peach to-step-mint bg-clip-text text-transparent">booking pagina</span>
                <br />
                in 2 minuten
              </h1>
              
              <p className="text-lg md:text-xl text-white/90 max-w-lg drop-shadow mx-auto lg:mx-0">
                Geen technische kennis nodig. Maak een professionele booking pagina voor je diensten en ontvang direct boekingen van klanten.
              </p>
              
              {/* Social Proof */}
              <div className="flex items-center justify-center lg:justify-start gap-4 text-sm text-white/80 bg-white/10 rounded-full px-4 py-2 backdrop-blur-sm w-fit mx-auto lg:mx-0">
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 fill-yellow-300 text-yellow-300" />
                  <Star className="w-4 h-4 fill-yellow-300 text-yellow-300" />
                  <Star className="w-4 h-4 fill-yellow-300 text-yellow-300" />
                  <Star className="w-4 h-4 fill-yellow-300 text-yellow-300" />
                  <Star className="w-4 h-4 fill-yellow-300 text-yellow-300" />
                  <span className="ml-1 font-medium text-white">4.9/5</span>
                </div>
                <span>•</span>
                <span>500+ tevreden gebruikers</span>
              </div>
            </div>

            {/* Handle Claim Section */}
            <div className="space-y-4 max-w-md mx-auto lg:mx-0">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-600 text-sm font-medium">
                    bookr.nl/
                  </span>
                  <input
                    type="text"
                    value={userInput}
                    onChange={handleInputChange}
                    placeholder="jouw-naam"
                    className="w-full pl-20 pr-4 py-3 rounded-xl border-2 border-white/30 bg-white/20 backdrop-blur-sm text-white placeholder-white/60 focus:border-step-peach focus:ring-2 focus:ring-step-peach/30 outline-none transition-all gamify-hover"
                    maxLength={20}
                  />
                  {userInput && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      {isHandleAvailable ? (
                        <CheckCircle className="w-5 h-5 text-green-400 animate-bounce" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-400" />
                      )}
                    </div>
                  )}
                </div>
                
                <Button 
                  variant="celebration"
                  size="lg" 
                  className="px-8 font-bold shadow-xl"
                  disabled={!userInput || !isHandleAvailable}
                >
                  🎯 Claim Nu
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
              
              {userInput && !isHandleAvailable && (
                <p className="text-sm text-red-300 bg-red-900/30 rounded-lg px-3 py-2 backdrop-blur-sm">
                  Deze naam is al bezet. Probeer een andere! 🔄
                </p>
              )}
              
              <p className="text-xs text-white/80 bg-white/10 rounded-full px-4 py-2 backdrop-blur-sm text-center">
                ✨ Gratis • 💳 Geen creditcard vereist • ⚡ Direct live
              </p>
            </div>
          </div>
          {/* Right Content - Live iPhone Preview */}
          <div className="flex-1 flex justify-center items-center mt-6 lg:mt-0">
            <div className="relative mx-auto w-full max-w-xs">
              {/* iPhone Frame */}
              <div className="relative bg-background border-8 border-border rounded-[2.5rem] shadow-xl tilt-effect">
                {/* Top Notch */}
                <div className="absolute top-0 inset-x-0 flex justify-center">
                  <div className="bg-border h-6 w-32 rounded-b-2xl"></div>
                </div>
                
                {/* Screen */}
                <div className="relative bg-background rounded-[1.75rem] overflow-hidden h-[600px] w-full">
                  <iframe
                    src={`${previewUrl}?preview=${debouncedHandle}`}
                    className="w-full h-full border-0"
                    title={`Preview van ${userInput || 'je profiel'}`}
                    loading="lazy"
                    scrolling="yes"
                    style={{ 
                      overflow: 'auto',
                      WebkitOverflowScrolling: 'touch'
                    }}
                  />
                </div>
                
                {/* Home Indicator */}
                <div className="absolute bottom-1 inset-x-0 flex justify-center">
                  <div className="bg-border h-1 w-32 rounded-full"></div>
                </div>
              </div>
              
              {/* Caption */}
              <div className="text-center mt-4">
                <p className="text-sm text-white/80 font-medium drop-shadow">
                  Live preview van je profiel ✨
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};