import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
export const Hero = () => {
  return (
    <section 
      className="relative min-h-screen overflow-hidden px-4 py-8" 
      style={{ backgroundColor: 'hsl(var(--hero-background))' }}
    >
      <div className="container mx-auto max-w-7xl h-full min-h-screen flex flex-col lg:flex-row items-center justify-between">
        {/* Left Content */}
        <div className="flex-1 space-y-8 text-left max-w-2xl lg:pr-12">
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-white leading-tight tracking-tight">
            Turn Your Booking Link into a{' '}
            <span style={{ color: 'hsl(var(--accent))' }}>
              Real Website
            </span>
            .
          </h1>
          
          <p className="text-lg sm:text-xl md:text-2xl text-white leading-relaxed font-medium opacity-90">
            Bookr wraps your existing booking link in a professional, customizable template — giving you an online presence that builds trust and gets more bookings.
          </p>
          
          <p className="text-base sm:text-lg text-white opacity-75">
            Perfect for salons, trainers, coaches, and service providers who want to look like a brand, not just a link.
          </p>
          
          <div className="space-y-4 max-w-md pt-6">
            <input 
              type="text" 
              placeholder="bookr.io/yourname" 
              className="w-full px-6 py-4 rounded-2xl bg-white text-gray-800 placeholder-gray-500 text-lg font-medium focus:outline-none focus:ring-4 focus:ring-white/20 transition-all" 
            />
            <Button 
              asChild 
              size="lg" 
              className="w-full text-lg font-bold px-8 py-4 rounded-2xl text-white border-0 transition-all hover:scale-105 hover:shadow-lg"
              style={{ backgroundColor: 'hsl(var(--linktree-pink))' }}
            >
              <Link to="/login">
                Claim Your Bookr Page
              </Link>
            </Button>
          </div>
        </div>
        
        {/* Right Content - Phone Mockup */}
        <div className="flex-1 flex justify-center items-center mt-12 lg:mt-0">
          <div className="relative w-80 h-[600px] bg-gradient-to-br from-orange-400 to-pink-500 rounded-[3rem] p-8 shadow-2xl transform rotate-12 hover:rotate-6 transition-transform duration-300">
            <div className="w-full h-full bg-white rounded-[2rem] p-6 flex flex-col">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mb-4 flex items-center justify-center">
                <span className="text-white font-bold text-xl">B</span>
              </div>
              <h3 className="text-gray-800 font-bold text-xl mb-2">Your Brand</h3>
              <p className="text-gray-600 text-sm mb-6">Professional booking page</p>
              
              <div className="space-y-3">
                <div className="h-12 bg-gradient-to-r from-blue-100 to-purple-100 rounded-xl"></div>
                <div className="h-12 bg-gradient-to-r from-pink-100 to-orange-100 rounded-xl"></div>
                <div className="h-12 bg-gradient-to-r from-green-100 to-blue-100 rounded-xl"></div>
              </div>
              
              <div className="mt-auto">
                <div className="h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                  <span className="text-white font-semibold">Book Now</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};