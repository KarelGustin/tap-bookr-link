import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

export const Testimonials = () => {
  return (
    <section id="testimonials" className="py-24 bg-white">
      <div className="container mx-auto px-2">
        <div className="max-w-5xl mx-auto text-center">
          {/* Simplified avatar */}
          <div 
            className="w-24 h-24 mx-auto mb-12 rounded-full flex items-center justify-center"
            style={{ backgroundColor: 'hsl(var(--accent))' }}
          >
            <span className="text-3xl font-black text-gray-900">R</span>
          </div>
          
          <blockquote className="text-4xl md:text-5xl lg:text-6xl font-black text-gray-900 mb-12 leading-tight">
            "Bookr simplifies the process for creators to share multiple parts of themselves in one inclusive link."
          </blockquote>
          
          <div className="mb-12">
            <p className="text-xl font-bold text-gray-900 mb-2">Riley Lemon</p>
            <p className="text-lg text-gray-600 font-semibold">YouTuber, Content Creator</p>
          </div>
          
          <div className="flex items-center justify-center gap-6">
            <button 
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
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};