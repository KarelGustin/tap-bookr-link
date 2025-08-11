import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

export const Testimonials = () => {
  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          {/* Colorful avatar/profile image placeholder */}
          <div className="w-32 h-16 mx-auto mb-8 bg-gradient-to-r from-orange-500 via-green-600 to-orange-500 rounded-full flex items-center justify-center">
            <div className="w-20 h-12 bg-white/20 rounded-full"></div>
          </div>
          
          <blockquote className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-8 leading-tight">
            "Bookr simplifies the process for creators to share multiple parts of themselves in one inclusive link."
          </blockquote>
          
          <div className="mb-8">
            <p className="text-lg text-gray-600 mb-1">Riley Lemon,</p>
            <p className="text-lg text-gray-600">Youtuber, Content Creator</p>
          </div>
          
          <div className="flex items-center justify-center gap-4">
            <button className="w-12 h-12 rounded-full border-2 border-gray-300 flex items-center justify-center hover:border-gray-400 transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <button className="w-12 h-12 rounded-full border-2 border-gray-300 flex items-center justify-center hover:border-gray-400 transition-colors">
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};