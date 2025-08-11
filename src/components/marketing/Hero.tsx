import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";

export const Hero = () => {
  const [userInput, setUserInput] = useState("");
  const [showMenu, setShowMenu] = useState(false);
  const prefix = "TapBookr.com/";

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value.startsWith(prefix)) {
      setUserInput(value.slice(prefix.length));
    } else {
      setUserInput(value);
    }
  };
  return (
    <section className="relative min-h-screen overflow-hidden bg-secondary py-4">
      {/* Floating Header */}
      <div className="container mx-auto max-w-7xl px-2 md:px-3">
        <div className="bg-white rounded-2xl p-3 mb-6">
          <div className="flex items-center justify-between">
            <div className="text-xl font-black text-gray-900">Bookr</div>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-6">
              <a href="#why-bookr" className="text-gray-600 text-sm">Why Bookr</a>
              <a href="#how-it-works" className="text-gray-600 text-sm">How it works</a>
              <a href="#testimonials" className="text-gray-600 text-sm">Testimonials</a>
              <a href="#faq" className="text-gray-600 text-sm">FAQ</a>
            </div>
            
            {/* Mobile + Desktop Actions */}
            <div className="flex items-center gap-2">
              <Button variant="ghost" className="text-gray-600 text-sm px-3 py-2">
                Log in
              </Button>
              <Button className="bg-gray-900 text-white hover:bg-gray-800 rounded-full px-4 py-2 text-sm">
                Sign up free
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
                <a href="#why-bookr" className="text-gray-600 text-sm py-2">Why Bookr</a>
                <a href="#how-it-works" className="text-gray-600 text-sm py-2">How it works</a>
                <a href="#testimonials" className="text-gray-600 text-sm py-2">Testimonials</a>
                <a href="#faq" className="text-gray-600 text-sm py-2">FAQ</a>
              </div>
            </div>
          )}
        </div>

        {/* Hero Content */}
        <div className="flex flex-col lg:flex-row items-center justify-between gap-8 min-h-[calc(100vh-120px)]">
          {/* Left Content */}
          <div className="flex-1 space-y-4 sm:space-y-6 text-left max-w-2xl px-2">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-primary leading-tight tracking-tight">
              Your booking link, made beautiful.
            </h1>
            
            <p className="text-base sm:text-lg md:text-xl text-white leading-relaxed font-medium">
              Bookr wraps your booking software Link in a professional, mobile-ready page that looks like a €1500 website — for just a few euros a month.
            </p>
            
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
                    placeholder="yourname" 
                    className="flex-1 px-2 py-2 sm:py-3 bg-transparent text-gray-900 placeholder-gray-400 text-base sm:text-lg font-medium focus:outline-none"
                  />
                </div>
              </div>
              
              <Button 
                asChild 
                className="w-full bg-purple-400 hover:bg-purple-500 text-gray-900 font-black text-base sm:text-lg py-4 sm:py-6 rounded-full transition-all"
              >
                <Link to="/login">
                  Claim your Bookr
                </Link>
              </Button>
            </div>
          </div>
          
          {/* Right Content - Phone Mockup */}
          <div className="flex-1 flex justify-center items-center mt-6 lg:mt-0 px-2">
            <div className="relative max-w-[280px] sm:max-w-[320px]">
              {/* Phone mockup with yellow background */}
              <div className="w-full aspect-[9/16] bg-primary rounded-[2.5rem] sm:rounded-[3rem] p-3 sm:p-4 shadow-2xl transform rotate-6 sm:rotate-12 hover:rotate-3 sm:hover:rotate-6 transition-transform duration-300">
                <div className="w-full h-full bg-white rounded-[2rem] sm:rounded-[2.5rem] p-4 sm:p-6 flex flex-col overflow-hidden">
                  {/* Status bar */}
                  <div className="flex justify-between items-center mb-3 sm:mb-4 text-xs text-gray-500">
                    <span>15:21</span>
                    <span>5G</span>
                  </div>
                  
                  {/* Profile header */}
                  <div className="text-center mb-4 sm:mb-6">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 bg-blue-600 rounded-full mx-auto mb-2 sm:mb-3 flex items-center justify-center">
                      <span className="text-white font-bold text-lg sm:text-xl">★</span>
                    </div>
                    <h3 className="font-bold text-gray-900 text-sm sm:text-base">Pride Pals</h3>
                    <p className="text-xs sm:text-sm text-gray-600">Upcoming events</p>
                  </div>
                  
                  {/* Links */}
                  <div className="space-y-2 sm:space-y-3 flex-1">
                    <div className="bg-primary/20 rounded-lg p-3 sm:p-4 text-center">
                      <span className="font-medium text-gray-900 text-xs sm:text-sm">Latest additions</span>
                    </div>
                    <div className="bg-orange-100 rounded-lg p-3 sm:p-4 text-center">
                      <span className="font-medium text-gray-900 text-xs sm:text-sm">Podcast</span>
                    </div>
                    <div className="bg-green-100 rounded-lg p-3 sm:p-4 text-center">
                      <span className="font-medium text-gray-900 text-xs sm:text-sm">Newsletter</span>
                    </div>
                  </div>
                  
                  {/* Footer */}
                  <div className="text-center text-xs text-gray-400 mt-3 sm:mt-4">
                    TapBookr.com
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};