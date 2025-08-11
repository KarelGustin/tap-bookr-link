import { Card, CardContent } from "@/components/ui/card";
import { Sparkles, Scissors, Zap } from "lucide-react";

export const WhyBookr = () => {
  const features = [
    {
      icon: Sparkles,
      title: "Looks pro, converts better",
      description: "A clean template that builds trust and drives bookings.",
      color: "from-primary to-secondary"
    },
    {
      icon: Scissors,
      title: "Built for salons & services",
      description: "Nails, brows, grooming, consulting—your work, presented right.",
      color: "from-secondary to-accent"
    },
    {
      icon: Zap,
      title: "Live in minutes",
      description: "Paste your booking link, upload a few photos, publish.",
      color: "from-accent to-primary"
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
            Why Bookr?
          </h2>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {features.map((feature, index) => (
            <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 group cursor-pointer">
              <CardContent className="p-8 text-center">
                <div className={`w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-4 text-foreground">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
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