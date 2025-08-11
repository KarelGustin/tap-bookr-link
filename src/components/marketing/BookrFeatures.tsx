import { Card, CardContent } from "@/components/ui/card";
import { Calendar, Image, User, Smartphone } from "lucide-react";

export const BookrFeatures = () => {
  const features = [
    {
      icon: Calendar,
      title: "Embedded booking",
      description: "Salonized/Treatwell/Calendly integration",
      color: "from-primary to-secondary"
    },
    {
      icon: Image,
      title: "Media slider",
      description: "Showcase your best work with photos",
      color: "from-secondary to-accent"
    },
    {
      icon: User,
      title: "About & socials",
      description: "Tell your story and connect social media",
      color: "from-accent to-primary"
    },
    {
      icon: Smartphone,
      title: "Mobile‑first template",
      description: "One simple, responsive design",
      color: "from-primary to-accent"
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
            Everything you need
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            All the essential features to create a professional booking experience
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {features.map((feature, index) => (
            <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 group cursor-pointer">
              <CardContent className="p-6 text-center">
                <div className={`w-14 h-14 mx-auto mb-4 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-lg font-semibold mb-2 text-foreground">
                  {feature.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};