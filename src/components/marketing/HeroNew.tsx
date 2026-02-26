import { Button } from "@/components/ui/button";
import { ArrowRight, Menu, X, Sparkles, Calendar, Link2, Instagram } from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { getProfileByHandle } from "@/integrations/firebase/db";
import { useAuth } from "@/contexts/AuthContext";

export const HeroNew = () => {
  const { user } = useAuth();
  const [userInput, setUserInput] = useState("");
  const [handle, setHandle] = useState("demo");
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
      // Check if handle exists in Firestore
      const existingProfile = await getProfileByHandle(handleToCheck);
      setIsHandleAvailable(!existingProfile); // Available if profile doesn't exist
    } catch { 
      setIsHandleAvailable(false); 
    } finally { 
      setIsCheckingHandle(false); 
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setUserInput(value);
    setHandle(sanitizeHandle(value) || "demo");
  };

  useEffect(() => {
    if (!handle || handle === "demo") return;
    const timer = setTimeout(() => checkHandleAvailability(handle), 500);
    return () => clearTimeout(timer);
  }, [handle]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentWordIndex((prev) => (prev + 1) % professions.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* ─── HEADER ─── */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-black/[0.04]">
        <div className="max-w-[1200px] mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-10">
            <Link to="/" className="text-[15px] font-bold tracking-tight text-gray-950">
              TapBookr
            </Link>
            <nav className="hidden md:flex items-center gap-8">
              {[
                { label: "Features", href: "#why-bookr" },
                { label: "Hoe het werkt", href: "#how-it-works" },
                { label: "Reviews", href: "#testimonials" },
                { label: "FAQ", href: "#faq" },
              ].map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  className="text-[13px] text-gray-500 hover:text-gray-950 transition-colors"
                  onClick={(e) => {
                    e.preventDefault();
                    document.getElementById(item.href.substring(1))?.scrollIntoView({ behavior: 'smooth' });
                  }}
                >
                  {item.label}
                </a>
              ))}
            </nav>
          </div>
          
          <div className="flex items-center gap-3">
            <button className="md:hidden p-2 text-gray-600" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
            <div className="hidden md:flex items-center gap-3">
              {user ? (
                <Button className="bg-gray-950 text-white h-9 px-4 text-[13px] font-medium rounded-full" asChild>
                  <Link to="/dashboard">Dashboard</Link>
                </Button>
              ) : (
                <>
                  <Link to="/login" className="text-[13px] text-gray-500 hover:text-gray-950 transition-colors">
                    Log in
                  </Link>
                  <Button className="bg-gray-950 text-white h-9 px-5 text-[13px] font-medium rounded-full hover:bg-gray-800 transition-colors" asChild>
                    <Link to="/onboarding">Gratis beginnen</Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Mobile nav */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-black/[0.04] bg-white">
            <nav className="max-w-[1200px] mx-auto px-6 py-4 space-y-1">
              {[
                { label: "Features", href: "#why-bookr" },
                { label: "Hoe het werkt", href: "#how-it-works" },
                { label: "Reviews", href: "#testimonials" },
                { label: "FAQ", href: "#faq" },
              ].map((item) => (
                <a key={item.href} href={item.href} className="block text-[14px] text-gray-500 hover:text-gray-950 py-2 transition-colors"
                  onClick={(e) => { e.preventDefault(); document.getElementById(item.href.substring(1))?.scrollIntoView({ behavior: 'smooth' }); setIsMobileMenuOpen(false); }}>
                  {item.label}
                </a>
              ))}
              <div className="pt-4 border-t border-black/[0.04] space-y-3">
                {user ? (
                  <Button className="w-full bg-gray-950 text-white h-10 text-[14px] rounded-full" asChild>
                    <Link to="/dashboard">Dashboard</Link>
                  </Button>
                ) : (
                  <>
                    <Link to="/login" className="block text-[14px] text-gray-500 py-2">Log in</Link>
                    <Button className="w-full bg-gray-950 text-white h-10 text-[14px] rounded-full" asChild>
                      <Link to="/onboarding">Gratis beginnen</Link>
                    </Button>
                  </>
                )}
              </div>
            </nav>
          </div>
        )}
      </header>

      {/* ─── HERO ─── */}
      <section className="relative pt-28 pb-0 md:pt-36 overflow-hidden">
        {/* Ambient glow */}
        <div className="absolute inset-0 glow-warm pointer-events-none" />
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-bl from-purple-100/40 via-pink-100/20 to-transparent rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gradient-to-tr from-amber-100/30 to-transparent rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-[1200px] mx-auto px-6">
          {/* Text content */}
          <div className="max-w-3xl mx-auto text-center mb-14 md:mb-16">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200/50 px-4 py-2 rounded-full text-[12px] font-semibold mb-8 tracking-wide">
              <Sparkles className="w-3.5 h-3.5 text-purple-500" />
              <span className="text-gradient-purple">De #1 website builder voor beauty professionals</span>
            </div>

            {/* Headline */}
            <h1 className="text-[42px] md:text-[60px] lg:text-[72px] font-extrabold text-gray-950 leading-[1.05] tracking-[-0.04em] mb-6">
              Jouw beauty business
              <br />
              <span className="text-gradient-purple relative inline-block changing-word">
                {professions.map((word, index) => (
                  <span key={word} className={`word ${index === currentWordIndex ? 'active' : ''}`}>
                    {word}
                  </span>
                ))}
              </span>
              <br />
              verdient dit.
            </h1>

            {/* Subtitle */}
            <p className="text-[17px] md:text-[20px] text-gray-500 leading-[1.6] max-w-xl mx-auto mb-10">
              Bouw een prachtige boekingspagina in minuten. Eén link voor je Instagram bio — professioneel, snel, van jou.
            </p>

            {/* CTA */}
            <div className="max-w-md mx-auto space-y-3">
              {/* Handle Input */}
              <div className="flex items-center rounded-2xl border border-gray-200 bg-white focus-within:border-purple-300 focus-within:ring-4 focus-within:ring-purple-50 transition-all">
                <span className="pl-5 text-[14px] text-gray-400 font-mono select-none">
                  tapbookr.com/
                </span>
                <input
                  type="text"
                  value={userInput}
                  onChange={handleInputChange}
                  placeholder="jouw-naam"
                  className="flex-1 px-1 py-4 text-[14px] text-gray-950 placeholder-gray-300 bg-transparent outline-none font-mono"
                  maxLength={20}
                />
                {userInput && (
                  <div className="flex items-center pr-4">
                    {isCheckingHandle ? (
                      <div className="w-4 h-4 border-2 border-purple-300 border-t-transparent rounded-full animate-spin" />
                    ) : isHandleAvailable ? (
                      <span className="text-[12px] font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">Beschikbaar</span>
                    ) : (
                      <span className="text-[12px] font-semibold text-red-600 bg-red-50 px-2.5 py-1 rounded-full">Bezet</span>
                    )}
                  </div>
                )}
              </div>

              {/* CTA Button — gradient */}
              <Button
                asChild
                className={`w-full h-13 rounded-2xl text-[15px] font-semibold transition-all ${
                  !userInput || !isHandleAvailable 
                    ? 'bg-gray-200 text-gray-400 pointer-events-none' 
                    : 'bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 text-white hover:opacity-90'
                }`}
                disabled={!userInput || !isHandleAvailable}
              >
                <Link to={`/login?handle=${encodeURIComponent(handle)}&signup=true`}>
                  Claim jouw website voor €1
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>

              {/* Trust */}
              <div className="flex items-center justify-center gap-4 text-[12px] text-gray-400 pt-1">
                <span>Eerste maand €1</span>
                <span className="w-1 h-1 rounded-full bg-gray-300" />
                <span>Direct online</span>
                <span className="w-1 h-1 rounded-full bg-gray-300" />
                <span>Geen setup</span>
              </div>
            </div>
          </div>

          {/* ─── PHONE + FLOATING FEATURES ─── */}
          <div className="relative flex justify-center pb-0">
            {/* Glow behind phone */}
            <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-gradient-to-b from-purple-200/30 via-pink-200/20 to-transparent rounded-full blur-[80px] pointer-events-none" />

            <div className="relative">
              {/* Floating feature cards — desktop only */}
              <div className="hidden lg:block">
                {/* Left floating card */}
                <div className="absolute -left-52 top-24 animate-float" style={{ animationDelay: '0s' }}>
                  <div className="bg-white rounded-2xl border border-gray-100 px-5 py-4 w-[200px]">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                        <Calendar className="w-4 h-4 text-white" />
                      </div>
                      <span className="text-[13px] font-semibold text-gray-900">Boekingen</span>
                    </div>
                    <p className="text-[12px] text-gray-500 leading-relaxed">Salonized, Treatwell, Calendly — alles werkt.</p>
                  </div>
                </div>

                {/* Right floating card */}
                <div className="absolute -right-52 top-16 animate-float" style={{ animationDelay: '1s' }}>
                  <div className="bg-white rounded-2xl border border-gray-100 px-5 py-4 w-[200px]">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-pink-500 to-amber-500 flex items-center justify-center">
                        <Link2 className="w-4 h-4 text-white" />
                      </div>
                      <span className="text-[13px] font-semibold text-gray-900">Link in Bio</span>
                    </div>
                    <p className="text-[12px] text-gray-500 leading-relaxed">Eén link. Al je diensten, info en boekingen.</p>
                  </div>
                </div>

                {/* Bottom left floating card */}
                <div className="absolute -left-44 top-[340px] animate-float" style={{ animationDelay: '2s' }}>
                  <div className="bg-white rounded-2xl border border-gray-100 px-5 py-4 w-[190px]">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
                        <Instagram className="w-4 h-4 text-white" />
                      </div>
                      <span className="text-[13px] font-semibold text-gray-900">Instagram</span>
                    </div>
                    <p className="text-[12px] text-gray-500 leading-relaxed">Deel direct vanuit je profiel.</p>
                  </div>
                </div>
              </div>

              {/* Phone Frame */}
              <div className="relative bg-gray-950 rounded-[2.5rem] p-[5px] shadow-[0_0_0_1px_rgba(0,0,0,0.06),0_30px_60px_-15px_rgba(0,0,0,0.2)]">
                {/* Dynamic Island */}
                <div className="absolute top-2 left-1/2 -translate-x-1/2 w-[100px] h-[24px] bg-gray-950 rounded-full z-10" />
                {/* Screen */}
                <div className="bg-white rounded-[2.2rem] overflow-hidden w-[280px] h-[560px] md:w-[320px] md:h-[640px] relative">
                  <iframe
                    src="https://tapbookr.com/tapbookr"
                    className="w-full h-full border-0"
                    title="Live preview"
                    loading="lazy"
                    sandbox="allow-same-origin allow-scripts allow-forms"
                  />
                </div>
              </div>

              {/* Gradient fade at bottom */}
              <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white to-transparent pointer-events-none z-10" />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
