import { Card, CardContent } from "@/components/ui/card";
import { Link, Palette, Rocket } from "lucide-react";

export const HowItWorks = () => {
  return (
    <section id="how-it-works" className="py-24 bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Build in 60 seconds
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Three simple steps to your professional booking page. No coding, no waiting, no headaches.
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8 mb-20">
          {/* Card 1: Claim your handle */}
          <div className="text-center">
            <Card className="border border-gray-200 bg-white rounded-2xl">
              <CardContent className="p-8">
                <div 
                  className="w-20 h-20 mx-auto mb-6 rounded-2xl flex items-center justify-center relative"
                  style={{ backgroundColor: "hsl(var(--accent))" }}
                >
                  <Link className="w-10 h-10 text-white" />
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-white rounded-full flex items-center justify-center border border-gray-200">
                    <span className="text-sm font-bold text-gray-900">1</span>
                  </div>
                </div>
                <h3 className="text-xl font-bold mb-3 text-gray-900">
                  Claim your handle
                </h3>
                <p className="text-gray-600 leading-relaxed mb-4">
                  Pick your perfect handle. Make it memorable and easy to share.
                </p>
                <div className="text-sm text-gray-500 font-medium">
                  30 seconds
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Card 2: Connect & customize */}
          <div className="text-center">
            <Card className="border border-gray-200 bg-white rounded-2xl">
              <CardContent className="p-8">
                <div 
                  className="w-20 h-20 mx-auto mb-6 rounded-2xl flex items-center justify-center relative"
                  style={{ backgroundColor: "hsl(var(--accent))" }}
                >
                  <Palette className="w-10 h-10 text-white z-20" />
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-white rounded-full flex items-center justify-center border border-gray-200">
                    <span className="text-sm font-bold text-gray-900">2</span>
                  </div>
                </div>
                <h3 className="text-xl font-bold mb-3 text-gray-900">
                  Connect & customize
                </h3>
                <p className="text-gray-600 leading-relaxed mb-4">
                  Connect your existing booking tool and customize colors, fonts, and layout.
                </p>
                <div className="text-sm text-gray-500 font-medium">
                  3.5 minutes
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Card 3: Publish */}
          <div className="text-center">
            <Card className="border border-gray-200 bg-white rounded-2xl">
              <CardContent className="p-8">
                <div 
                  className="w-20 h-20 mx-auto mb-6 rounded-2xl flex items-center justify-center relative"
                  style={{ backgroundColor: "hsl(var(--primary))" }}
                >
                  <Rocket className="w-10 h-10 text-white" />
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-white rounded-full flex items-center justify-center border border-gray-200">
                    <span className="text-sm font-bold text-gray-900">3</span>
                  </div>
                </div>
                <h3 className="text-xl font-bold mb-3 text-gray-900">
                  Publish
                </h3>
                <p className="text-gray-600 leading-relaxed mb-4">
                  Hit publish and start taking bookings immediately. No waiting, no delays.
                </p>
                <div className="text-sm text-gray-500 font-medium">
                  15 seconds
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <div className="bg-white border border-gray-200 rounded-2xl p-8 md:p-12 max-w-4xl mx-auto">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">
              Ready to get started?
            </h3>
            <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
              Join 2,000+ businesses who've already transformed their booking experience. 
              Your professional page is just 60 seconds away.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
              <a
                href="/onboarding"
                className="bg-primary text-gray-900 font-semibold px-8 py-4 rounded-xl text-lg"
              >
                Start building now
              </a>
              <a
                href="https://tapbookr.com/check1"
                target="_blank"
                rel="noreferrer"
                className="border-2 border-gray-300 text-gray-700 font-semibold px-8 py-4 rounded-xl text-lg"
              >
                See live demo
              </a>
            </div>
            
            <div className="text-sm text-gray-500">
              <p>✓ 7-day Free Trial • ✓ Just €10 a month, and no expensive design fees• ✓ Cancel anytime</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};