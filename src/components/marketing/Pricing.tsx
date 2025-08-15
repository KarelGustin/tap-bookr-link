import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Check } from "lucide-react";
import { Link } from "react-router-dom";

export const Pricing = () => {
  const plans = [
    {
      name: "Gratis",
      price: "€0",
      period: "voor altijd",
      description: "Perfect om te beginnen",
      features: [
        "1 pagina",
        "1 boekingslink", 
        "Bookr badge"
      ],
      cta: "Start gratis",
      popular: false,
      color: "from-muted to-muted/50"
    },
    {
      name: "Starter",
      price: "€3",
      period: "/maand",
      description: "Voor groeiende bedrijven",
      features: [
        "Badge verwijderen",
        "3 media items",
        "Basis kleuren",
        "Alle gratis functies"
      ],
      cta: "Start gratis",
      popular: true,
      color: "from-primary to-secondary"
    },
    {
      name: "Pro",
      price: "€6", 
      period: "/maand",
      description: "Voor serieuze professionals",
      features: [
        "6 media items",
        "Aangepaste accentkleuren",
        "Analytics (weergaven & klikken)",
        "Alle Starter functies"
      ],
      cta: "Start gratis",
      popular: false,
      color: "from-secondary to-accent"
    },
    {
      name: "Premium",
      price: "€9",
      period: "/maand", 
      description: "Voor power users",
      features: [
        "Sociale feed (laatste 3 IG posts)",
        "Aangepast domein",
        "Prioriteit ondersteuning",
        "Alle Pro functies"
      ],
      cta: "Start gratis",
      popular: false,
      color: "from-accent to-primary"
    }
  ];

  return (
    <section className="py-24 bg-white">
      <div className="container mx-auto px-6">
        <div className="text-center mb-20">
          <h2 className="text-5xl md:text-6xl lg:text-7xl font-black text-gray-900 mb-6 leading-tight">
            Eenvoudige prijzen
          </h2>
          <p className="text-xl md:text-2xl text-gray-600 font-semibold max-w-3xl mx-auto">
            Start gratis, upgrade wanneer je meer nodig hebt. Geen langdurige contracten.
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
                    Meest Populair
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