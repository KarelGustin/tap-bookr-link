import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Check } from "lucide-react";
import { Link } from "react-router-dom";

export const Pricing = () => {
  const plans = [
    {
      name: "Free",
      price: "€0",
      period: "forever",
      description: "Perfect to get started",
      features: [
        "1 page",
        "1 booking link", 
        "Bookr badge"
      ],
      cta: "Start free",
      popular: false,
      color: "from-muted to-muted/50"
    },
    {
      name: "Starter",
      price: "€3",
      period: "/mo",
      description: "For growing businesses",
      features: [
        "Remove badge",
        "3 media items",
        "Basic colors",
        "All Free features"
      ],
      cta: "Start free",
      popular: true,
      color: "from-primary to-secondary"
    },
    {
      name: "Pro",
      price: "€6", 
      period: "/mo",
      description: "For serious professionals",
      features: [
        "6 media items",
        "Custom accent colors",
        "Analytics (views & clicks)",
        "All Starter features"
      ],
      cta: "Start free",
      popular: false,
      color: "from-secondary to-accent"
    },
    {
      name: "Premium",
      price: "€9",
      period: "/mo", 
      description: "For power users",
      features: [
        "Social feed (last 3 IG posts)",
        "Custom domain",
        "Priority support",
        "All Pro features"
      ],
      cta: "Start free",
      popular: false,
      color: "from-accent to-primary"
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-b from-muted/20 to-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
            Simple pricing
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Start free, upgrade when you need more. No long-term contracts.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
          {plans.map((plan, index) => (
            <Card key={index} className={`border-0 shadow-lg hover:shadow-xl transition-all duration-300 relative ${plan.popular ? 'ring-2 ring-primary scale-105' : ''}`}>
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-gradient-to-r from-primary to-secondary text-white px-4 py-1 rounded-full text-sm font-medium">
                    Most Popular
                  </span>
                </div>
              )}
              
              <CardHeader className="text-center pb-4">
                <div className={`w-12 h-12 mx-auto mb-4 rounded-xl bg-gradient-to-br ${plan.color} flex items-center justify-center`}>
                  <span className="text-white font-bold text-lg">{plan.name[0]}</span>
                </div>
                <CardTitle className="text-xl font-semibold">{plan.name}</CardTitle>
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-3xl font-bold">{plan.price}</span>
                  <span className="text-muted-foreground">{plan.period}</span>
                </div>
                <p className="text-sm text-muted-foreground">{plan.description}</p>
              </CardHeader>
              
              <CardContent className="pt-4">
                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center gap-3 text-sm">
                      <Check className="w-4 h-4 text-primary flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <Button 
                  asChild 
                  className={`w-full ${plan.popular ? 'bg-gradient-to-r from-primary to-secondary text-white' : ''}`}
                  variant={plan.popular ? 'default' : 'outline'}
                >
                  <Link to="/login">{plan.cta}</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};