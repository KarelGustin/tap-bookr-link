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
    <section 
      className="relative min-h-screen overflow-hidden px-4 py-16" 
      style={{ backgroundColor: 'hsl(var(--secondary))' }}
    >
      <div className="container mx-auto max-w-7xl h-full min-h-screen flex flex-col lg:flex-row items-center justify-between gap-12">
        {/* Left Content */}
        <div className="flex-1 space-y-8 text-left max-w-2xl">
          <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black text-white leading-tight tracking-tight">
            Turn Your Booking Link into a{' '}
            <span style={{ color: 'hsl(var(--accent))' }}>
              Real Website
            </span>
            .
          </h1>
          
          <p className="text-xl sm:text-2xl md:text-3xl text-white leading-relaxed font-semibold opacity-95">
            Bookr wraps your existing booking link in a beautiful page — so you look like a pro, not just a link.
          </p>
          
          <p className="text-lg sm:text-xl text-white/80 font-medium">
            Used by hundreds of salons, consultants, trainers and beauty pros.
          </p>
          
          <div className="space-y-4 max-w-lg pt-8">
            <div className="relative">
              <span className="absolute left-8 top-1/2 transform -translate-y-1/2 text-gray-900 text-xl font-semibold pointer-events-none">
                {prefix}
              </span>
              <input 
                type="text" 
                value={userInput}
                onChange={handleInputChange}
                placeholder="yourname" 
                className="w-full px-8 py-6 rounded-3xl bg-white text-gray-900 placeholder-gray-500 text-xl font-semibold focus:outline-none focus:ring-4 focus:ring-white/30 transition-all shadow-lg"
                style={{ paddingLeft: `${prefix.length * 0.65 + 2}rem` }}
              />
            </div>
            <Button 
              asChild 
              size="lg" 
              className="w-full text-xl font-black px-8 py-6 rounded-3xl text-white border-0 transition-all hover:scale-105 hover:shadow-2xl"
              style={{ backgroundColor: 'hsl(var(--accent))' }}
            >
              <Link to="/login">
                Claim your Bookr page
              </Link>
            </Button>
          </div>
        </div>
        
        {/* Right Content - Clean Phone Mockup */}
        <div className="flex-1 flex justify-center items-center mt-12 lg:mt-0">
          <div className="relative w-80 h-[650px] rounded-[3rem] p-2 shadow-2xl" style={{ backgroundColor: 'hsl(var(--accent))' }}>
            <div className="w-full h-full bg-white rounded-[2.5rem] p-8 flex flex-col">
              {/* Header */}
              <div className="flex items-center gap-4 mb-8">
                <div className="w-20 h-20 rounded-3xl flex items-center justify-center" style={{ backgroundColor: 'hsl(var(--primary))' }}>
                  <span className="text-white font-black text-2xl">B</span>
                </div>
                <div>
                  <h3 className="text-gray-900 font-black text-xl">Your Brand</h3>
                  <p className="text-gray-600 font-medium">Professional booking</p>
                </div>
              </div>
              
              {/* Content blocks */}
              <div className="space-y-4 mb-8">
                <div className="h-16 rounded-2xl" style={{ backgroundColor: 'hsl(var(--accent) / 0.2)' }}></div>
                <div className="h-16 rounded-2xl" style={{ backgroundColor: 'hsl(var(--orange) / 0.2)' }}></div>
                <div className="h-16 rounded-2xl" style={{ backgroundColor: 'hsl(var(--primary) / 0.2)' }}></div>
              </div>
              
              {/* CTA Button */}
              <div className="mt-auto">
                <div className="h-16 rounded-2xl flex items-center justify-center" style={{ backgroundColor: 'hsl(var(--primary))' }}>
                  <span className="text-white font-black text-lg">Book Now</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};