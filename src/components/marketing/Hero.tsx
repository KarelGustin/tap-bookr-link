import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";

export const Hero = () => {
  const [userInput, setUserInput] = useState("");
  const [handle, setHandle] = useState("demo");
  const [debouncedHandle, setDebouncedHandle] = useState("check1");
  const [selectedCategory, setSelectedCategory] = useState("beauty");
  const [handleAvailable, setHandleAvailable] = useState(true);
  const [showMenu, setShowMenu] = useState(false);
  const prefix = "TapBookr.com/";

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
    setHandleAvailable(extracted.length > 2 && !["admin", "login", "signup", "www"].includes(extracted.toLowerCase()));
  };

  useEffect(() => {
    const t = setTimeout(() => setDebouncedHandle(handle || "demo"), 300);
    return () => clearTimeout(t);
  }, [handle]);

  const previewUrl = `https://tapbookr.com/test`;

  return (
    <section className="relative min-h-screen overflow-hidden bg-secondary py-4">
      {/* Floating Header */}
      <div className="container mx-auto max-w-7xl px-2 md:px-3">
        <div className="bg-white rounded-2xl p-3 mb-6">
          <div className="flex items-center justify-between">
            <div className="text-xl font-black text-gray-900">Bookr</div>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-6">
              <a href="#why-bookr" className="text-gray-600 text-sm">Waarom Bookr</a>
              <a href="#how-it-works" className="text-gray-600 text-sm">Hoe het werkt</a>
              <a href="#testimonials" className="text-gray-600 text-sm">Klantenverhalen</a>
              <a href="#faq" className="text-gray-600 text-sm">Veelgestelde vragen</a>
            </div>
            
            {/* Mobile + Desktop Actions */}
            <div className="flex items-center gap-2">
              <Button asChild variant="ghost" className="text-gray-600 text-sm px-3 py-2">
                <Link to="/login">Inloggen</Link>
              </Button>
              <Button asChild className="bg-gray-900 text-white hover:bg-gray-800 rounded-full px-4 py-2 text-sm">
                <Link to="/login">Gratis aanmelden</Link>
              </Button>
              {/* Mobile Hamburger */}
              <Button 
                variant="ghost" 
                size="sm"
                className="md:hidden p-2 rounded-sm"
                onClick={() => setShowMenu(!showMenu)}
              >
                <Menu className="w-5 h-5 text-gray-600" />
              </Button>
            </div>
          </div>
          
          {/* Mobile Menu Dropdown */}
          {showMenu && (
            <div className="md:hidden mt-3 pt-3 border-t border-gray-100">
              <div className="flex flex-col gap-2">
                <a href="#why-bookr" className="text-gray-600 text-sm py-2">Waarom Bookr</a>
                <a href="#how-it-works" className="text-gray-600 text-sm py-2">Hoe het werkt</a>
                <a href="#testimonials" className="text-gray-600 text-sm py-2">Klantenverhalen</a>
                <a href="#faq" className="text-gray-600 text-sm py-2">Veelgestelde vragen</a>
              </div>
            </div>
          )}
        </div>

        {/* Hero Content */}
        <div className="flex flex-col lg:flex-row items-center justify-between gap-8 min-h-[calc(100vh-120px)]">
          {/* Left Content */}
          <div className="flex-1 space-y-4 sm:space-y-6 text-left max-w-2xl px-2">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-primary leading-tight tracking-tight">
              Je "€1000" Website,<br></br> in 10 Minuten voor €1.
            </h1>
            
            <p className="text-base sm:text-lg md:text-xl text-white leading-relaxed font-medium">
              Lanceer vandaag nog een website om ook onbekende klanten te bereiken en te laten zien wat je doet. Claim je handle, koppel WhatsApp of je boekingssysteem, en begin binnen minuten met het ontvangen van boekingen.
            </p>
            
            {/* Social Proof */}
            <div className="flex items-center gap-4 text-sm text-white/80">
              <div className="flex items-center gap-2">
                <span className="text-yellow-400">★★★★★</span>
                <span>Vertrouwd door 2.000+ bedrijven</span>
              </div>
              {/* <div className="hidden sm:flex items-center gap-2">
                <span>•</span>
                <span>Geen creditcard vereist</span>
              </div> */}
            </div>
            
            <div className="space-y-3 max-w-lg pt-4">
              <div className="bg-white rounded-lg p-1">
                <div className="flex items-center">
                  <span className="px-3 py-2 sm:px-4 sm:py-3 text-gray-500 font-medium text-base sm:text-lg">
                    TapBookr.com/
                  </span>
                  <input 
                    type="text" 
                    value={userInput}
                    onChange={handleInputChange}
                    placeholder="jouw-handle" 
                    className="flex-1 px-2 py-2 sm:py-3 bg-transparent text-gray-900 placeholder-gray-400 text-base sm:text-lg font-medium focus:outline-none"
                  />
                </div>
                {/* Handle availability indicator */}
                {userInput && (
                  <div className="px-3 py-1 text-xs">
                    {handleAvailable ? (
                      <span className="text-green-600 font-medium">✓ Beschikbaar</span>
                    ) : (
                      <span className="text-red-600 font-medium">✗ Niet beschikbaar</span>
                    )}
                  </div>
                )}
              </div>
              
              <Button 
                asChild 
                className={`w-full font-black text-base sm:text-lg py-4 sm:py-6 rounded-full transition-all ${
                  handleAvailable && userInput
                    ? 'bg-purple-400 hover:bg-purple-500 text-gray-900'
                    : 'bg-gray-400 text-gray-600 cursor-not-allowed'
                }`}
                disabled={!handleAvailable || !userInput}
              >
                <Link to="/login">
                  Claim je Bookr Link
                </Link>
              </Button>

              
            </div>
          </div>
          
          {/* Right Content - Live iPhone Preview */}
          <div className="flex-1 flex justify-center items-center mt-6 lg:mt-0 px-2">
            <div className="relative" aria-label="Live iPhone preview">
              {/* iPhone 14 Pro styled frame */}
              <div className="relative bg-black rounded-[2.5rem] p-1.5 shadow-2xl">
                {/* Screen */}
                <div className="bg-white rounded-[2rem] overflow-hidden" style={{ width: "320px", height: "692px" }}>
                  <div className="relative w-full h-full overflow-hidden">
                    <iframe
                      key={debouncedHandle}
                      src={previewUrl}
                      className="w-full h-full"
                      title="Live Mobile Preview"
                      style={{ 
                        border: "none", 
                        transform: "scale(0.9)", 
                        transformOrigin: "top left", 
                        width: "111%", 
                        height: "111%"
                      }}
                      sandbox="allow-scripts allow-same-origin"
                    />
                    {/* Overlay to prevent clicks while allowing scroll */}
                    <div 
                      className="absolute inset-0 pointer-events-none"
                      style={{ 
                        background: 'transparent',
                        zIndex: 10
                      }}
                    />
                  </div>
                </div>
              </div>
              {/* Dynamic Island */}
              <div className="absolute top-1.5 left-1/2 -translate-x-1/2 w-20 h-6 bg-black rounded-b-2xl" />
              {/* Home Indicator */}
              <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-28 h-1 bg-black rounded-full opacity-60" />
              
              {/* Preview label */}
              {/* <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-center">
                <p className="text-sm text-white/80 font-medium">
                  {userInput ? `Preview: ${userInput}` : `${categories.find(c => c.id === selectedCategory)?.name} template`}
                </p>
              </div> */}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};