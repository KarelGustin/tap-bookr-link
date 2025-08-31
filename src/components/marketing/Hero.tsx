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
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const prefix = "bookr.nl/";

  const professions = ["Nailtech", "Kapper", "Tattoo artist", "Salon", "Masseur", "Schoonheidsspecialist"];

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

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentWordIndex((prev) => (prev + 1) % professions.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const previewUrl = `https://tapbookr.com/tapbookr`;

  return (
    <section className="relative min-h-screen overflow-hidden bg-gray-50">
      {/* Floating header */}
      <header className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-6xl px-4">
        <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border border-gray-200">
          <div className="flex items-center justify-between px-6 py-3">
            <div className="flex items-center gap-8">
              <div className="font-black text-xl">
                Bookr<span className="text-step-pink">.</span>
              </div>
              
              {/* Desktop Navigation */}
              <nav className="hidden md:flex items-center gap-6">
                <a href="#features" className="text-gray-700 hover:text-gray-900 font-medium">Features</a>
                <a href="#how-it-works" className="text-gray-700 hover:text-gray-900 font-medium">Hoe het werkt</a>
                <a href="#testimonials" className="text-gray-700 hover:text-gray-900 font-medium">Reviews</a>
                <a href="#pricing" className="text-gray-700 hover:text-gray-900 font-medium">Prijzen</a>
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
                <Button variant="default" asChild>
                  <a href="/onboarding">Maak Account</a>
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
                    <a href="/onboarding">Maak Account</a>
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
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 leading-relaxed">
                Elke{" "}
                <span className="changing-word inline-block">
                  {professions.map((profession, index) => (
                    <span
                      key={profession}
                      className={`word ${index === currentWordIndex ? 'active' : ''} text-step-pink`}
                      style={{
                        fontWeight: 'bold'
                      }}
                    >
                      {profession}
                    </span>
                  ))}
                </span>
                <br />
                heeft een boeking link.
                <br />
                <span className="text-step-purple">
                  Maak nu je eigen website!
                </span>
              </h1>
              
              <p className="text-lg md:text-xl text-gray-700 max-w-lg mx-auto lg:mx-0 font-medium">
                Je eigen website om je boeking link, in minder dan 5 minuten!
              </p>
              
              {/* Social Proof */}
              <div className="flex items-center justify-center lg:justify-start gap-4 text-sm text-gray-700 bg-white/80 rounded-full px-4 py-2 backdrop-blur-sm w-fit mx-auto lg:mx-0 border border-gray-200">
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span className="ml-1 font-medium text-gray-900">4.9/5</span>
                </div>
                <span>•</span>
                <span>500+ tevreden gebruikers</span>
              </div>
            </div>

            {/* Handle Claim Section */}
            <div className="space-y-4 max-w-md mx-auto lg:mx-0">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm font-medium">
                    tapbookr.nl/
                  </span>
                  <input
                    type="text"
                    value={userInput}
                    onChange={handleInputChange}
                    placeholder="jouw-naam"
                    className="w-full pl-20 pr-4 py-3 rounded-xl border-2 border-gray-300 bg-white text-gray-900 placeholder-gray-500 focus:border-step-peach focus:ring-2 focus:ring-step-peach/30 outline-none transition-all"
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
                  variant="default"
                  size="lg" 
                  className="px-8 font-bold shadow-xl"
                  disabled={!userInput || !isHandleAvailable}
                >
                  🎯 Claim Nu
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
              
              {userInput && !isHandleAvailable && (
                <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2 border border-red-200">
                  Deze naam is al bezet. Probeer een andere! 🔄
                </p>
              )}
              
              <p className="text-xs text-gray-600 bg-white/80 rounded-full px-4 py-2 backdrop-blur-sm text-center border border-gray-200">
                 💳 Eerste maand €1 • ⚡ Direct live
              </p>
            </div>
          </div>
          {/* Right Content - Live iPhone Preview */}
          <div className="flex-1 flex justify-center items-center mt-6 lg:mt-0">
            <div className="relative mx-auto w-full max-w-xs">
              {/* iPhone Frame */}
              <div className="relative bg-background border-8 border-border rounded-[2.5rem] shadow-xl">
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
                <p className="text-sm text-gray-600 font-medium">
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