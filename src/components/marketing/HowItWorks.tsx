import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User, Settings, Rocket, ArrowRight, ExternalLink } from "lucide-react";

export const HowItWorks = () => {
  const stepColors = [
    { bg: 'bg-step-yellow', text: 'text-step-yellow-foreground', accent: 'step-yellow' },
    { bg: 'bg-step-teal', text: 'text-step-teal-foreground', accent: 'step-teal' },
    { bg: 'bg-step-pink', text: 'text-step-pink-foreground', accent: 'step-pink' }
  ];

  return (
    <section id="how-it-works" className="py-16 bg-gradient-to-br from-step-teal via-step-blue to-step-lavender">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-white drop-shadow-lg mb-4">
            Hoe het werkt ⚡
          </h2>
          <p className="text-xl text-white/90 max-w-2xl mx-auto drop-shadow">
            In slechts 3 stappen heb je jouw eigen professionele booking pagina klaar.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {[
            {
              step: 1,
              icon: User,
              title: "Claim je handle",
              description: "Kies een unieke naam voor jouw booking pagina. Bijvoorbeeld: bookr.nl/jouw-naam",
              time: "30 seconden",
            },
            {
              step: 2,
              icon: Settings,
              title: "Verbind & personaliseer",
              description: "Verbind je agenda en pas je pagina aan met jouw kleuren, foto's en services.",
              time: "2 minuten",
            },
            {
              step: 3,
              icon: Rocket,
              title: "Publiceer",
              description: "Je pagina gaat direct live. Deel de link en ontvang je eerste boekingen!",
              time: "Direct live",
            }
          ].map((item, index) => (
            <Card key={item.step} className={`relative p-8 text-center ${stepColors[index].bg}/30 backdrop-blur-sm border-white/30 hover:bg-white/40 transition-all duration-500 tilt-effect gamify-hover animate-fade-in sparkle-effect`} style={{animationDelay: `${index * 0.2}s`}}>
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <div className={`bg-gradient-to-r from-step-peach to-step-mint text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm breathing-animation shadow-lg`}>
                  {item.step}
                </div>
              </div>
              
              <div className={`w-16 h-16 mx-auto mb-6 rounded-2xl ${stepColors[index].bg}/40 backdrop-blur-sm flex items-center justify-center border border-white/30 breathing-animation`}>
                <item.icon className={`w-8 h-8 ${stepColors[index].text}`} />
              </div>
              
              <h3 className="text-xl font-bold text-white mb-3 drop-shadow">
                {item.title}
              </h3>
              
              <p className="text-white/90 mb-4 leading-relaxed drop-shadow-sm">
                {item.description}
              </p>
              
              <div className={`inline-block bg-white/20 text-white px-4 py-2 rounded-full text-sm font-medium backdrop-blur-sm border border-white/30`}>
                ⚡ {item.time}
              </div>
            </Card>
          ))}
        </div>

        {/* Call to Action */}
        <div className="text-center bg-white/20 backdrop-blur-sm border border-white/30 rounded-3xl p-12 sparkle-effect">
          <h3 className="text-2xl md:text-3xl font-bold text-white drop-shadow-lg mb-4">
            Klaar om te beginnen? 🚀
          </h3>
          <p className="text-lg text-white/90 mb-8 max-w-2xl mx-auto drop-shadow">
            Sluit je aan bij honderden professionals die hun bookings hebben geautomatiseerd met Bookr.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="celebration" size="xl" className="px-12 py-6 text-xl font-bold shadow-2xl" asChild>
              <a href="/onboarding">
                ✨ Begin nu met bouwen
                <ArrowRight className="w-6 h-6 ml-2" />
              </a>
            </Button>
            <Button variant="pastel" size="xl" className="px-12 py-6 text-xl font-bold backdrop-blur-sm border-2 border-white/40" asChild>
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