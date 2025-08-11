import { Card, CardContent } from "@/components/ui/card";
import { User, Settings, Share } from "lucide-react";

export const HowItWorks = () => {
  const steps = [
    {
      step: "1",
      icon: User,
      title: "Claim your handle",
      description: "Choose your unique bookr.io URL",
      bgColor: "hsl(var(--accent))"
    },
    {
      step: "2", 
      icon: Settings,
      title: "Connect & customize",
      description: "Add your booking link, logo, and brand your page",
      bgColor: "hsl(var(--orange))"
    },
    {
      step: "3",
      icon: Share,
      title: "Publish",
      description: "Go live instantly and start directing customers to your beautiful page",
      bgColor: "hsl(var(--primary))"
    }
  ];

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
          {steps.map((step, index) => (
            <div key={index} className="relative text-center group">
              <Card className="border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 bg-white rounded-3xl overflow-hidden">
                <CardContent className="p-10">
                  <div 
                    className="w-24 h-24 mx-auto mb-8 rounded-3xl flex items-center justify-center relative group-hover:scale-110 transition-transform duration-300"
                    style={{ backgroundColor: step.bgColor }}
                  >
                    <step.icon className="w-12 h-12 text-white" />
                    <div className="absolute -top-3 -right-3 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg">
                      <span className="text-lg font-black text-gray-900">{step.step}</span>
                    </div>
                  </div>
                  <h3 className="text-2xl font-black mb-4 text-gray-900">
                    {step.title}
                  </h3>
                  <p className="text-lg text-gray-600 leading-relaxed font-medium">
                    {step.description}
                  </p>
                </CardContent>
              </Card>
              
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-1/2 -right-6 transform -translate-y-1/2 z-10">
                  <div className="w-12 h-1 bg-gray-300 rounded-full"></div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};