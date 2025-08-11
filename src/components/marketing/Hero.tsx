import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";

export const Hero = () => {
  const [userInput, setUserInput] = useState("");
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
    <section className="relative min-h-screen overflow-hidden bg-gradient-to-br from-secondary via-secondary to-secondary/90 px-3 py-4">
      {/* Header placeholder - keeping same structure */}
      <div className="container mx-auto max-w-7xl">
        <div className="bg-white rounded-full p-4 mb-8 lg:mb-16">
          <div className="flex items-center justify-between">
            <div className="text-2xl font-black text-gray-900">Bookr</div>
            <div className="hidden md:flex items-center gap-6">
              <span className="text-gray-600">Products</span>
              <span className="text-gray-600">Templates</span>
              <span className="text-gray-600">Marketplace</span>
              <span className="text-gray-600">Learn</span>
              <span className="text-gray-600">Pricing</span>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="ghost" className="text-gray-600">Log in</Button>
              <Button className="bg-gray-900 text-white hover:bg-gray-800 rounded-full px-6">
                Sign up free
              </Button>
            </div>
          </div>
        </div>

        {/* Hero Content */}
        <div className="flex flex-col lg:flex-row items-center justify-between gap-12 min-h-[80vh]">
          {/* Left Content */}
          <div className="flex-1 space-y-6 text-left max-w-2xl">
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-primary leading-tight tracking-tight">
              Everything you are. In one, simple link in bio.
            </h1>
            
            <p className="text-lg sm:text-xl md:text-2xl text-white leading-relaxed font-medium">
              Join 70M+ people using Bookr for their link in bio. One link to help you share everything you create, curate and sell from your Instagram, TikTok, Twitter, YouTube and other social media profiles.
            </p>
            
            <div className="space-y-4 max-w-lg pt-6">
              <div className="bg-white rounded-lg p-1">
                <div className="flex items-center">
                  <span className="px-4 py-3 text-gray-500 font-medium text-lg">
                    TapBookr.com/
                  </span>
                  <input 
                    type="text" 
                    value={userInput}
                    onChange={handleInputChange}
                    placeholder="yourname" 
                    className="flex-1 px-2 py-3 bg-transparent text-gray-900 placeholder-gray-400 text-lg font-medium focus:outline-none"
                  />
                </div>
              </div>
              
              <Button 
                asChild 
                className="w-full bg-purple-400 hover:bg-purple-500 text-gray-900 font-black text-lg py-6 rounded-full transition-all"
              >
                <Link to="/login">
                  Claim your Bookr
                </Link>
              </Button>
            </div>
          </div>
          
          {/* Right Content - Phone Mockup */}
          <div className="flex-1 flex justify-center items-center mt-8 lg:mt-0">
            <div className="relative">
              {/* Phone mockup with yellow background */}
              <div className="w-80 h-[600px] bg-primary rounded-[3rem] p-4 shadow-2xl transform rotate-12 hover:rotate-6 transition-transform duration-300">
                <div className="w-full h-full bg-white rounded-[2rem] p-6 flex flex-col overflow-hidden">
                  {/* Status bar */}
                  <div className="flex justify-between items-center mb-4 text-xs text-gray-500">
                    <span>15:21</span>
                    <span>5G</span>
                  </div>
                  
                  {/* Profile header */}
                  <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-blue-600 rounded-full mx-auto mb-3 flex items-center justify-center">
                      <span className="text-white font-bold text-xl">★</span>
                    </div>
                    <h3 className="font-bold text-gray-900">Pride Pals</h3>
                    <p className="text-sm text-gray-600">Upcoming events</p>
                  </div>
                  
                  {/* Links */}
                  <div className="space-y-3 flex-1">
                    <div className="bg-primary/20 rounded-lg p-4 text-center">
                      <span className="font-medium text-gray-900">Latest additions</span>
                    </div>
                    <div className="bg-orange-100 rounded-lg p-4 text-center">
                      <span className="font-medium text-gray-900">Podcast</span>
                    </div>
                    <div className="bg-green-100 rounded-lg p-4 text-center">
                      <span className="font-medium text-gray-900">Newsletter</span>
                    </div>
                  </div>
                  
                  {/* Footer */}
                  <div className="text-center text-xs text-gray-400 mt-4">
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