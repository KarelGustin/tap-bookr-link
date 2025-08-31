import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

export const Testimonials = () => {
  return (
    <section id="testimonials" className="py-24 bg-gradient-to-br from-rose-400 to-pink-500">
      <div className="container mx-auto px-2 md:px-3">
        <div className="max-w-5xl mx-auto text-center">
          {/* Simplified avatar */}
          <div className="w-24 h-24 mx-auto mb-12 rounded-full flex items-center justify-center bg-tapbookr-green-subtle border-4 border-tapbookr-green-light">
            <span className="text-3xl font-black text-tapbookr-green">R</span>
          </div>
          
          <blockquote className="text-4xl md:text-5xl lg:text-6xl font-black text-white mb-12 leading-tight">
            "TapBookr maakte het zo makkelijk om een website voor mijn bedrijf te hebben. Het heeft ook mijn boekingen gestimuleerd en ik ben zo blij dat ik het heb gevonden!"
          </blockquote>
          
          <div className="mb-12">
            <p className="text-xl font-bold text-white mb-2">Riley Lemon</p>
            <p className="text-lg text-white/80 font-semibold">Nagelstylist, Ondernemer</p>
          </div>
          
          <div className="flex items-center justify-center gap-6">
            {/* <button 
              className="w-16 h-16 rounded-full border-3 flex items-center justify-center hover:scale-105 transition-all duration-200"
              style={{ borderColor: 'hsl(var(--accent))' }}
            >
              <ArrowLeft className="w-6 h-6" style={{ color: 'hsl(var(--accent))' }} />
            </button>
            <button 
              className="w-16 h-16 rounded-full border-3 flex items-center justify-center hover:scale-105 transition-all duration-200"
              style={{ borderColor: 'hsl(var(--accent))' }}
            >
              <ArrowRight className="w-6 h-6" style={{ color: 'hsl(var(--accent))' }} />
            </button> */}
          </div>
        </div>
      </div>
    </section>
  );
};