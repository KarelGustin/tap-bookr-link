import { Card, CardContent } from "@/components/ui/card";
import { User, Settings, Share } from "lucide-react";

export const HowItWorks = () => {
  const steps = [
    {
      step: "1",
      icon: User,
      title: "Claim your handle",
      description: "Choose your unique tapbookr.com URL",
      color: "from-primary to-secondary"
    },
    {
      step: "2", 
      icon: Settings,
      title: "Add your logo, slogan & booking link",
      description: "Customize your page with your brand and connect your booking system",
      color: "from-secondary to-accent"
    },
    {
      step: "3",
      icon: Share,
      title: "Publish and share your tapbookr.com/you",
      description: "Go live instantly and start directing customers to your new booking page",
      color: "from-accent to-primary"
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-b from-muted/20 to-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
            How it works
          </h2>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {steps.map((step, index) => (
            <div key={index} className="relative">
              <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 group cursor-pointer h-full">
                <CardContent className="p-8 text-center">
                  <div className={`w-20 h-20 mx-auto mb-6 rounded-3xl bg-gradient-to-br ${step.color} flex items-center justify-center group-hover:scale-110 transition-transform duration-300 relative`}>
                    <step.icon className="w-10 h-10 text-white" />
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg">
                      <span className="text-sm font-bold text-primary">{step.step}</span>
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold mb-4 text-foreground">
                    {step.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {step.description}
                  </p>
                </CardContent>
              </Card>
              
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2 z-10">
                  <div className="w-8 h-0.5 bg-gradient-to-r from-muted-foreground to-transparent"></div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};