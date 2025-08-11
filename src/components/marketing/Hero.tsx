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
      className="relative min-h-screen overflow-hidden px-3 sm:px-6 py-16 bg-gradient-to-br from-accent to-background"
    >
      <div className="container mx-auto max-w-7xl h-full min-h-screen flex flex-col lg:flex-row items-center justify-between gap-12">
        {/* Left Content */}
        <div className="flex-1 space-y-3 sm:space-y-4 text-left max-w-2xl">
          <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black text-secondary leading-tight tracking-tight font-poppins">
            Turn Your Booking Link into a{' '}
            <span className="text-primary">
              Real Website
            </span>
            .
          </h1>
          
          <p className="text-xl sm:text-2xl md:text-3xl text-secondary/90 leading-relaxed font-semibold opacity-95 font-poppins">
            Bookr wraps your existing booking link in a beautiful page — so you look like a pro, not just a link.
          </p>
          
          <p className="text-lg sm:text-xl text-secondary/70 font-medium font-poppins">
            Used by hundreds of salons, consultants, trainers and beauty pros.
          </p>
          
          <div className="space-y-4 max-w-lg pt-4">
            <div className="relative">
              <span className="absolute left-6 top-1/2 transform -translate-y-1/2 text-secondary/60 text-lg font-medium pointer-events-none font-poppins z-10">
                {prefix}
              </span>
              <input 
                type="text" 
                value={userInput}
                onChange={handleInputChange}
                placeholder="yourname" 
                className="w-full px-6 py-5 rounded-2xl bg-white text-secondary placeholder-secondary/40 text-lg font-medium focus:outline-none focus:ring-4 focus:ring-primary/20 transition-all shadow-lg font-poppins border border-border"
                style={{ paddingLeft: `${8.5}rem` }}
              />
            </div>
            <Button 
              asChild 
              size="lg" 
              className="w-full text-lg font-bold px-6 py-5 rounded-2xl bg-primary hover:bg-primary/90 text-white border-0 transition-all hover:scale-105 hover:shadow-xl font-poppins"
            >
              <Link to="/login">
                Claim your Bookr page
              </Link>
            </Button>
          </div>
        </div>
        
        {/* Right Content - Clean Phone Mockup */}
        <div className="flex-1 flex justify-center items-center mt-12 lg:mt-0">
          <div className="relative w-80 h-[650px] rounded-[3rem] p-2 shadow-2xl bg-primary">
            <div className="w-full h-full bg-white rounded-[2.5rem] p-8 flex flex-col">
              {/* Header */}
              <div className="flex items-center gap-4 mb-8">
                <div className="w-20 h-20 rounded-3xl bg-secondary flex items-center justify-center">
                  <span className="text-white font-black text-2xl font-poppins">B</span>
                </div>
                <div>
                  <h3 className="text-secondary font-black text-xl font-poppins">Your Brand</h3>
                  <p className="text-secondary/70 font-medium font-poppins">Professional booking</p>
                </div>
              </div>
              
              {/* Content blocks */}
              <div className="space-y-4 mb-8">
                <div className="h-16 bg-primary/20 rounded-2xl"></div>
                <div className="h-16 bg-orange/20 rounded-2xl"></div>
                <div className="h-16 bg-secondary/20 rounded-2xl"></div>
              </div>
              
              {/* CTA Button */}
              <div className="mt-auto">
                <div className="h-16 bg-secondary rounded-2xl flex items-center justify-center">
                  <span className="text-white font-black text-lg font-poppins">Book Now</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};