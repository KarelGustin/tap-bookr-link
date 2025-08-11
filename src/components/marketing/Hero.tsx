import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

export const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden px-4 py-8" style={{background: 'var(--gradient-hero)'}}>
      <div className="w-full max-w-2xl mx-auto text-center space-y-8">
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight">
          Everything you are. In one, simple link in bio.
        </h1>
        
        <p className="text-base sm:text-lg text-white/90 leading-relaxed max-w-xl mx-auto">
          Join 70M+ people using Bookr for their link in bio. One link to help you share everything you create, curate and sell from your Instagram, TikTok, Twitter, YouTube and other social media profiles.
        </p>
        
        <div className="space-y-4 max-w-sm mx-auto">
          <input 
            type="text" 
            placeholder="bookr.com/" 
            className="w-full px-4 py-4 rounded-lg border-0 text-base text-gray-600"
          />
          <Button 
            asChild 
            size="lg" 
            className="w-full text-base px-6 py-4 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 hover:from-purple-500 hover:to-pink-500 text-white border-0"
          >
            <Link to="/login">
              Claim your Bookr
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};