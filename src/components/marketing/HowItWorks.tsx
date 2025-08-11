import { Card, CardContent } from "@/components/ui/card";
import { User, Brush, Share2 } from "lucide-react";

export const HowItWorks = () => {
  return (
    <section id="how-it-works" className="py-24 bg-gray-50">
      <div className="container mx-auto px-2 md:px-3">
        <div className="text-center mb-20">
          <h2 className="text-5xl md:text-6xl lg:text-7xl font-black text-gray-900 mb-6 leading-tight">
            How it works
          </h2>
          <p className="text-xl md:text-2xl text-gray-600 font-semibold max-w-2xl mx-auto">
            Three simple steps to your professional booking page.
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-12 max-w-6xl mx-auto">
          {/* Card 1: Claim your handle */}
          <div className="relative text-center group">
            <Card className="border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 bg-white rounded-3xl overflow-hidden">
              <CardContent className="p-10">
                <div 
                  className="w-24 h-24 mx-auto mb-8 rounded-3xl flex items-center justify-center relative group-hover:scale-110 transition-transform duration-300"
                  style={{ backgroundColor: "hsl(var(--accent))" }}
                >
                  <User className="w-12 h-12 text-white" />
                  <div className="absolute -top-3 -right-3 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg">
                    <span className="text-lg font-black text-gray-900">1</span>
                  </div>
                </div>
                <h3 className="text-2xl font-black mb-4 text-gray-900">
                  Claim your handle
                </h3>
                <p className="text-lg text-gray-600 leading-relaxed font-medium">
                  Choose your unique tapbookr.com URL
                </p>
              </CardContent>
            </Card>
            
            <div className="hidden md:block absolute top-1/2 -right-6 transform -translate-y-1/2 z-10">
              <div className="w-12 h-1 bg-gray-300 rounded-full"></div>
            </div>
          </div>

          {/* Card 2: Connect & customize */}
          <div className="relative text-center group">
            <Card className="border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 bg-white rounded-3xl overflow-hidden">
              <CardContent className="p-10">
                <div 
                  className="w-24 h-24 mx-auto mb-8 rounded-3xl flex items-center justify-center relative group-hover:scale-110 transition-transform duration-300"
                  style={{ backgroundColor: "hsl(var(--orange))" }}
                >
                  <Brush className="w-12 h-12 text-white" />
                  <div className="absolute -top-3 -right-3 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg">
                    <span className="text-lg font-black text-gray-900">2</span>
                  </div>
                </div>
                <h3 className="text-2xl font-black mb-4 text-gray-900">
                  Connect & customize
                </h3>
                <p className="text-lg text-gray-600 leading-relaxed font-medium">
                  Add your booking link, logo, and brand your page
                </p>
              </CardContent>
            </Card>
            
            <div className="hidden md:block absolute top-1/2 -right-6 transform -translate-y-1/2 z-10">
              <div className="w-12 h-1 bg-gray-300 rounded-full"></div>
            </div>
          </div>

          {/* Card 3: Publish */}
          <div className="relative text-center group">
            <Card className="border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 bg-white rounded-3xl overflow-hidden">
              <CardContent className="p-10">
                <div 
                  className="w-24 h-24 mx-auto mb-8 rounded-3xl flex items-center justify-center relative group-hover:scale-110 transition-transform duration-300"
                  style={{ backgroundColor: "hsl(var(--primary))" }}
                >
                  <Share2 className="w-12 h-12 text-white" />
                  <div className="absolute -top-3 -right-3 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg">
                    <span className="text-lg font-black text-gray-900">3</span>
                  </div>
                </div>
                <h3 className="text-2xl font-black mb-4 text-gray-900">
                  Publish
                </h3>
                <p className="text-lg text-gray-600 leading-relaxed font-medium">
                  Go live instantly and start directing customers to your beautiful page
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};