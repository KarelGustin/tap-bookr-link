import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

export const Testimonials = () => {
  return (
    <section id="testimonials" className="py-24 bg-gradient-to-br from-rose-400 to-pink-500">
      <div className="container mx-auto px-4 md:px-8">
        <div className="max-w-6xl mx-auto text-center">
          {/* Simplified avatar */}
          <div className="w-32 h-32 mx-auto mb-12 rounded-full flex items-center justify-center bg-white/20 border-4 border-white/30 backdrop-blur-sm shadow-2xl">
            <span className="text-4xl font-black text-white">R</span>
          </div>
          
          <blockquote className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-12 leading-tight max-w-4xl mx-auto">
            "TapBookr maakte het zo makkelijk om een website voor mijn bedrijf te hebben. Het heeft ook mijn boekingen gestimuleerd en ik ben zo blij dat ik het heb gevonden!"
          </blockquote>
          
          <div className="mb-12">
            <p className="text-2xl font-bold text-white mb-2">Riley Lemon</p>
            <p className="text-xl text-white/90 font-semibold">Nagelstylist, Ondernemer</p>
          </div>
          
          {/* Rating stars */}
          <div className="flex items-center justify-center gap-2 mb-8">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="w-8 h-8 rounded-full bg-yellow-400 flex items-center justify-center">
                <span className="text-white font-bold text-sm">★</span>
              </div>
            ))}
          </div>
          
          {/* Social proof */}
          <div className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-6 py-3">
            <span className="text-white/90 font-medium">Lid van 500+ tevreden ondernemers</span>
          </div>
        </div>
      </div>
    </section>
  );
};