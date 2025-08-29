import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User, Settings, Rocket, ArrowRight, ExternalLink } from "lucide-react";

export const HowItWorks = () => {
  const steps = [
    {
      step: 1,
      icon: User,
      title: "Claim je handle",
      description: "Kies een unieke naam voor jouw booking pagina. Bijvoorbeeld: bookr.nl/jouw-naam",
      time: "30 seconden",
      color: "from-step-yellow/20 to-step-peach/20"
    },
    {
      step: 2,
      icon: Settings,
      title: "Verbind & personaliseer",
      description: "Verbind je agenda en pas je pagina aan met jouw kleuren, foto's en services.",
      time: "2 minuten",  
      color: "from-step-teal/20 to-step-mint/20"
    },
    {
      step: 3,
      icon: Rocket,
      title: "Publiceer",
      description: "Je pagina gaat direct live. Deel de link en ontvang je eerste boekingen!",
      time: "Direct live",
      color: "from-step-pink/20 to-step-lavender/20"
    }
  ];

  return (
    <section id="how-it-works" className="py-24 bg-gradient-to-br from-step-yellow/10 via-step-teal/10 to-step-pink/10">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Hoe het werkt
          </h2>
          <p className="text-xl text-gray-700 max-w-3xl mx-auto">
            Van idee tot live website in slechts 3 eenvoudige stappen.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {steps.map((item, index) => (
            <Card key={item.step} className={`relative p-8 text-center bg-gradient-to-br ${item.color} backdrop-blur-sm border border-white/20 hover:border-gray-300 transition-all duration-500 tilt-effect gamify-hover animate-fade-in sparkle-effect`} style={{animationDelay: `${index * 0.2}s`}}>
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <div className={`bg-gradient-to-r from-step-peach to-step-mint text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm breathing-animation shadow-lg`}>
                  {item.step}
                </div>
              </div>
              
              <div className={`w-16 h-16 mx-auto mb-6 rounded-2xl bg-gray-100 flex items-center justify-center border border-gray-200 breathing-animation`}>
                <item.icon className={`w-8 h-8 text-gray-900`} />
              </div>
              
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                {item.title}
              </h3>
              
              <p className="text-gray-800 mb-4 leading-relaxed">
                {item.description}
              </p>
              
              <div className={`inline-block bg-gray-100 text-gray-700 px-4 py-2 rounded-full text-sm font-medium border border-gray-200`}>
                ⚡ {item.time}
              </div>
            </Card>
          ))}
        </div>

        {/* Call to Action */}
        <div className="text-center bg-white/80 backdrop-blur-sm border border-gray-200 rounded-3xl p-12 sparkle-effect">
          <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
            Klaar om te beginnen? 🚀
          </h3>
          <p className="text-lg text-gray-700 mb-8 max-w-2xl mx-auto">
            Sluit je aan bij honderden professionals die hun bookings hebben geautomatiseerd met Bookr.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="default" size="xl" className="px-12 py-6 text-xl font-bold shadow-2xl bg-gray-900 text-white hover:bg-gray-800" asChild>
              <a href="/onboarding">
                ✨ Begin nu met bouwen
                <ArrowRight className="w-6 h-6 ml-2" />
              </a>
            </Button>
            <Button variant="outline" size="xl" className="px-12 py-6 text-xl font-bold border-2 border-gray-300 text-gray-900 hover:bg-gray-50" asChild>
              <a href="#demo">
                👀 Bekijk live demo
                <ExternalLink className="w-6 h-6 ml-2" />
              </a>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};