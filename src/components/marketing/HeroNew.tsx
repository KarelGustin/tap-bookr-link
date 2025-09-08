import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, ArrowRight, Star, Menu, X } from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export const HeroNew = () => {
  const { user } = useAuth();
  const [userInput, setUserInput] = useState("");
  const [handle, setHandle] = useState("demo");
  const [debouncedHandle, setDebouncedHandle] = useState("demo");
  const [isHandleAvailable, setIsHandleAvailable] = useState(true);
  const [isCheckingHandle, setIsCheckingHandle] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);

  const professions = ["Kapper", "Nailtechnician", "Masseur", "Personal Trainer", "Tattoo Artist", "Beautician"];

  const sanitizeHandle = (val: string) =>
    val.toLowerCase().replace(/^\s+|\s+$/g, "").replace(/[^a-z0-9-_]/g, "");

  const checkHandleAvailability = async (handleToCheck: string) => {
    if (!handleToCheck || handleToCheck.length < 3) {
      setIsHandleAvailable(false);
      return;
    }

    const reservedHandles = ["admin", "login", "signup", "www", "api", "app", "bookr", "tapbookr"];
    if (reservedHandles.includes(handleToCheck.toLowerCase())) {
      setIsHandleAvailable(false);
      return;
    }

    setIsCheckingHandle(true);
    try {
      const { data, error } = await supabase.rpc('is_handle_available', {
        handle_to_check: handleToCheck
      });

      if (error) {
        setIsHandleAvailable(false);
      } else {
        setIsHandleAvailable(data || false);
      }
    } catch (error) {
      setIsHandleAvailable(false);
    } finally {
      setIsCheckingHandle(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setUserInput(value);
    const sanitizedHandle = sanitizeHandle(value) || "demo";
    setHandle(sanitizedHandle);
  };

  useEffect(() => {
    const t = setTimeout(() => setDebouncedHandle(handle || "demo"), 300);
    return () => clearTimeout(t);
  }, [handle]);

  useEffect(() => {
    if (!handle || handle === "demo") return;
    
    const timer = setTimeout(() => {
      checkHandleAvailability(handle);
    }, 500);

    return () => clearTimeout(timer);
  }, [handle]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentWordIndex((prev) => (prev + 1) % professions.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Use external tapbookr.com URL for iframe
  const previewUrl = 'https://tapbookr.com/tapbookr';

  return (
    <div className="min-h-screen bg-white">
      {/* Simple, clean header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-200">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between max-w-6xl">
          <div className="flex items-center gap-8">
            <Link to="/" className="text-2xl font-bold text-gray-900">
              TapBookr
            </Link>
            
            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-8">
              <a 
                href="#why-bookr" 
                className="text-gray-600 hover:text-gray-900 transition-colors cursor-pointer"
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById('why-bookr')?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                Features
              </a>
              <a 
                href="#testimonials" 
                className="text-gray-600 hover:text-gray-900 transition-colors cursor-pointer"
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById('testimonials')?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                Reviews
              </a>
              <a 
                href="#faq" 
                className="text-gray-600 hover:text-gray-900 transition-colors cursor-pointer"
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById('faq')?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                FAQ
              </a>
            </nav>
          </div>
          
          <div className="flex items-center gap-4">
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
              {user ? (
                <Button 
                  className="bg-primary hover:bg-primary-hover text-white px-6 py-2 rounded-full font-medium transition-all"
                  asChild
                >
                  <Link to="/dashboard">Ga naar dashboard</Link>
                </Button>
              ) : (
                <>
                  <Button variant="ghost" asChild>
                    <Link to="/login">Log in</Link>
                  </Button>
                  <Button 
                    className="bg-primary hover:bg-primary-hover text-white px-6 py-2 rounded-full font-medium transition-all"
                    asChild
                  >
                    <Link to="/onboarding">Sign up free</Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 bg-white">
            <nav className="container mx-auto px-4 py-4 space-y-4">
              <a 
                href="#why-bookr" 
                className="block text-gray-600 hover:text-gray-900 py-2 cursor-pointer"
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById('why-bookr')?.scrollIntoView({ behavior: 'smooth' });
                  setIsMobileMenuOpen(false);
                }}
              >
                Features
              </a>
              <a 
                href="#testimonials" 
                className="block text-gray-600 hover:text-gray-900 py-2 cursor-pointer"
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById('testimonials')?.scrollIntoView({ behavior: 'smooth' });
                  setIsMobileMenuOpen(false);
                }}
              >
                Reviews
              </a>
              <a 
                href="#faq" 
                className="block text-gray-600 hover:text-gray-900 py-2 cursor-pointer"
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById('faq')?.scrollIntoView({ behavior: 'smooth' });
                  setIsMobileMenuOpen(false);
                }}
              >
                FAQ
              </a>
              <div className="pt-4 border-t border-gray-200 space-y-3">
                {user ? (
                  <Button className="w-full bg-primary hover:bg-primary-hover text-white" asChild>
                    <Link to="/dashboard">Ga naar dashboard</Link>
                  </Button>
                ) : (
                  <>
                    <Button variant="ghost" className="w-full justify-start" asChild>
                      <Link to="/login">Log in</Link>
                    </Button>
                    <Button className="w-full bg-primary hover:bg-primary-hover text-white" asChild>
                      <Link to="/onboarding">Sign up free</Link>
                    </Button>
                  </>
                )}
              </div>
            </nav>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section className="pt-24 pb-16 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="flex flex-col lg:flex-row items-center gap-12 min-h-[80vh]">
            {/* Left Content */}
            <div className="flex-1 text-center lg:text-left max-w-2xl">
              <div className="space-y-8">
                {/* Badge */}
                <div className="inline-flex items-center gap-2 bg-primary-light text-black px-4 py-2 rounded-full text-sm font-medium">
                  <Star className="w-4 h-4 fill-current" />
                  #1 kleine website builder
                </div>

                {/* Main Headline */}
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                  Elke{" "}
                  <span className="relative inline-block">
                    <span className="text-primary">
                      {professions[currentWordIndex]}
                    </span>
                  </span>
                  {" "}verdient een 
                  <span className="block text-primary">
                    mooie website
                  </span>
                </h1>

                {/* Subtitle */}
                <p className="text-xl text-gray-600 max-w-lg mx-auto lg:mx-0">
                  Krijg meer klanten met een professionele compacte website.
                </p>

                {/* Social Proof */}
                <div className="flex items-center justify-center lg:justify-start gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    ))}
                    <span className="ml-1 font-medium">4.9/5</span>
                  </div>
                  <span>•</span>
                  <span>500+ tevreden gebruikers</span>
                </div>

                {/* CTA Section */}
                <div className="space-y-4 max-w-md mx-auto lg:mx-0">
                  {/* Handle Input */}
                  <div className="relative">
                    <div className="flex rounded-2xl border-2 border-gray-200 bg-white focus-within:border-primary transition-colors">
                      <span className="flex items-center pl-4 text-gray-500 text-sm font-medium">
                        tapbookr.com/
                      </span>
                      <input
                        type="text"
                        value={userInput}
                        onChange={handleInputChange}
                        placeholder="jouw-naam"
                        className="flex-1 px-2 py-4 text-gray-900 placeholder-gray-400 bg-transparent outline-none"
                        maxLength={20}
                      />
                      {userInput && (
                        <div className="flex items-center pr-4">
                          {isCheckingHandle ? (
                            <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                          ) : isHandleAvailable ? (
                            <CheckCircle className="w-5 h-5 text-green-500" />
                          ) : (
                            <XCircle className="w-5 h-5 text-red-500" />
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* CTA Button */}
                  <Button
                    asChild
                    className={`w-full bg-primary hover:bg-primary-hover text-white py-4 rounded-2xl font-semibold text-lg transition-all ${
                      !userInput || !isHandleAvailable ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105 hover:shadow-lg'
                    }`}
                    disabled={!userInput || !isHandleAvailable}
                  >
                    <Link to={`/login?handle=${encodeURIComponent(handle)}&signup=true`}>
                      Claim jouw website voor €1
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </Link>
                  </Button>

                  {/* Availability Message */}
                  {userInput && !isHandleAvailable && (
                    <p className="text-sm text-red-600 text-center bg-red-50 rounded-lg px-3 py-2">
                      Deze naam is al bezet. Probeer een andere! 
                    </p>
                  )}

                  {/* Trust indicators */}
                  <p className="text-xs text-gray-500 text-center">
                    💳 Eerste maand €1 • ⚡ Instant online • 🚀 Geen setup kosten
                  </p>
                </div>
              </div>
            </div>

            {/* Right Content - Phone Preview */}
            <div className="flex-1 flex justify-center items-center">
              <div className="relative w-full max-w-sm">
                {/* Phone Frame */}
                <div className="relative bg-gray-900 rounded-[2.5rem] p-2 shadow-2xl">
                  {/* Screen */}
                  <div className="bg-white rounded-[2rem] overflow-hidden h-[600px] relative">
                    <iframe
                      src={previewUrl}
                      className="w-full h-full border-0"
                      title="Live preview"
                      loading="lazy"
                      sandbox="allow-same-origin allow-scripts allow-forms"
                    />
                  </div>
                </div>
                
                {/* Floating elements */}
                <div className="absolute -left-4 top-1/4 bg-white rounded-2xl shadow-lg p-4 max-w-48">
                  <p className="text-sm font-medium text-gray-900">Live preview</p>
                  
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};