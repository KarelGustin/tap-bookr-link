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
    <section className="py-24 bg-white">
      <div className="container mx-auto px-6">
        <div className="text-center mb-20">
          <h2 className="text-5xl md:text-6xl lg:text-7xl font-black text-gray-900 mb-6 leading-tight">
            Simple pricing
          </h2>
          <p className="text-xl md:text-2xl text-gray-600 font-semibold max-w-3xl mx-auto">
            Start free, upgrade when you need more. No long-term contracts.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
          {plans.map((plan, index) => (
            <Card key={index} className={`border-0 shadow-xl hover:shadow-2xl transition-all duration-300 relative rounded-3xl overflow-hidden ${plan.popular ? 'ring-4 ring-yellow-400 scale-105' : ''}`}>
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                  <span 
                    className="px-6 py-2 rounded-full text-sm font-black text-gray-900"
                    style={{ backgroundColor: 'hsl(var(--accent))' }}
                  >
                    Most Popular
                  </span>
                </div>
              )}
              
              <CardHeader className="text-center pb-6 pt-8">
                <div 
                  className="w-16 h-16 mx-auto mb-6 rounded-3xl flex items-center justify-center"
                  style={{ backgroundColor: plan.popular ? 'hsl(var(--accent))' : 'hsl(var(--muted))' }}
                >
                  <span className={`font-black text-2xl ${plan.popular ? 'text-gray-900' : 'text-gray-600'}`}>
                    {plan.name[0]}
                  </span>
                </div>
                <CardTitle className="text-2xl font-black text-gray-900">{plan.name}</CardTitle>
                <div className="flex items-baseline justify-center gap-1 mb-2">
                  <span className="text-4xl font-black text-gray-900">{plan.price}</span>
                  <span className="text-lg text-gray-600 font-semibold">{plan.period}</span>
                </div>
                <p className="text-base text-gray-600 font-medium">{plan.description}</p>
              </CardHeader>
              
              <CardContent className="px-8 pb-8">
                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center gap-3">
                      <Check className="w-5 h-5 flex-shrink-0" style={{ color: 'hsl(var(--primary))' }} />
                      <span className="text-gray-700 font-medium">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <Button 
                  asChild 
                  className={`w-full py-4 rounded-2xl font-black text-lg transition-all hover:scale-105 ${
                    plan.popular 
                      ? 'text-gray-900 hover:shadow-lg' 
                      : 'border-2 text-gray-900 hover:shadow-lg'
                  }`}
                  style={{ 
                    backgroundColor: plan.popular ? 'hsl(var(--accent))' : 'transparent',
                    borderColor: plan.popular ? 'transparent' : 'hsl(var(--accent))'
                  }}
                  variant="ghost"
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