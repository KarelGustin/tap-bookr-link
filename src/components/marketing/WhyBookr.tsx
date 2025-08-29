import { Card, CardContent } from "@/components/ui/card";
import { Clock, Zap, TrendingUp } from "lucide-react";

export const WhyBookr = () => {
  const features = [
    {
      title: "Direct professioneel eruitzien",
      description: "Voeg je naam, logo en een paar foto's toe. Bookr verandert je simpele boekingslink in een strakke website waar klanten op vertrouwen—geen webkennis nodig.",
      icon: Clock,
      stat: "+40% vertrouwen"
    },
    {
      title: "Werkt met wat je al gebruikt",
      description: "Plak je Salonized, Treatwell of Calendly link. We integreren het mooi in je pagina—geen code, geen setup, gewoon plakken en publiceren.",
      icon: Zap,
      stat: "0 setup tijd"
    },
    {
      title: "Meer boekingen, minder heen en weer",
      description: "Duidelijke diensten, sociale links en een één-klik \"Boek nu.\" Minder DM's, minder no-shows, meer klanten in je agenda.",
      icon: TrendingUp,
      stat: "+21% boekingen"
    }
  ];

  const pastelColors = ['step-pink', 'step-lavender', 'step-mint', 'step-peach', 'step-teal', 'step-blue'];

  return (
    <section id="why-bookr" className="py-16 bg-gradient-to-br from-step-mint via-step-peach to-step-lavender">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-white drop-shadow-lg mb-4">
            Waarom kiezen voor Bookr? 🌟
          </h2>
          <p className="text-xl text-white/90 max-w-2xl mx-auto drop-shadow">
            Stop met het missen van potentiële klanten. Bookr maakt het eenvoudig om boekingen te ontvangen.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className={`p-6 bg-${pastelColors[index % pastelColors.length]}/20 backdrop-blur-sm border-white/30 hover:bg-white/30 transition-all duration-300 tilt-effect gamify-hover animate-fade-in sparkle-effect`} style={{animationDelay: `${index * 0.2}s`}}>
              <CardContent className="p-0">
                <div className="flex items-center gap-4 mb-4">
                  <div className={`p-3 bg-white/20 rounded-lg breathing-animation border border-white/30`}>
                    <feature.icon className={`w-6 h-6 text-white`} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg text-white drop-shadow">{feature.title}</h3>
                    <p className={`text-sm text-white/90 font-medium bg-white/20 px-2 py-1 rounded-full backdrop-blur-sm`}>{feature.stat}</p>
                  </div>
                </div>
                <p className="text-white/80 leading-relaxed drop-shadow-sm">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};