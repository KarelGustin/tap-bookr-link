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
      time: "10 seconden",
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
    <section id="how-it-works" className="py-24 bg-gradient-to-br from-purple-500 to-indigo-600">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
            Hoe het werkt
          </h2>
          <p className="text-xl text-white/90 max-w-3xl mx-auto">
            Van idee tot live website in slechts 3 eenvoudige stappen.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {steps.map((item, index) => (
            <Card key={item.step} className="relative p-8 text-center bg-white border border-gray-200 shadow-sm hover:shadow-xl transition-all duration-300 hover:scale-105 rounded-2xl group">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <div className="bg-tapbookr-green text-white w-10 h-10 rounded-full flex items-center justify-center font-bold text-base shadow-lg group-hover:scale-110 transition-transform duration-300">
                  {item.step}
                </div>
              </div>
              
              <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-tapbookr-green-subtle flex items-center justify-center border border-tapbookr-green-light group-hover:scale-110 transition-transform duration-300">
                <item.icon className="w-10 h-10 text-tapbookr-green" />
              </div>
              
              <h3 className="text-2xl font-bold text-gray-900 mb-4 leading-tight">
                {item.title}
              </h3>
              
              <p className="text-gray-700 mb-6 leading-relaxed text-base">
                {item.description}
              </p>
              
              <div className="inline-block bg-tapbookr-green-subtle text-tapbookr-green px-4 py-2 rounded-full text-sm font-semibold border border-tapbookr-green-light">
                ⚡ {item.time}
              </div>
            </Card>
          ))}
        </div>

        {/* Call to Action */}
        <div className="text-center bg-white/10 backdrop-blur-sm border border-white/20 rounded-3xl p-12">
          <h3 className="text-3xl md:text-4xl font-bold text-white mb-6 leading-tight">
            Klaar om te beginnen? 🚀
          </h3>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto leading-relaxed">
            Sluit je aan bij honderden professionals die hun bookings hebben geautomatiseerd met Bookr.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="tapbookr" size="lg" className="hover:scale-105 transition-transform duration-200" asChild>
              <a href="/onboarding">
                ✨ Begin nu met bouwen
                <ArrowRight className="w-6 h-6 ml-2" />
              </a>
            </Button>
            <Button variant="outline" size="lg" className="bg-white/10 border-white/30 text-white hover:bg-white/20 hover:scale-105 transition-all duration-200" asChild>
              <a href="https://tapbookr.com/tapbookr" target="_blank" rel="noopener noreferrer">
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