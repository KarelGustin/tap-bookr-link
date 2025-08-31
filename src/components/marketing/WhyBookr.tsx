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

  const pastelColors = ['from-step-pink/20 to-step-lavender/20', 'from-step-mint/20 to-step-peach/20', 'from-step-teal/20 to-step-blue/20'];

  return (
    <section id="why-bookr" className="py-24 bg-gradient-to-br from-emerald-400 to-teal-500">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
            Waarom kiezen voor Bookr?
          </h2>
          <p className="text-xl text-white/90 max-w-3xl mx-auto">
            De eenvoudigste manier om professioneel gevonden te worden en boekingen binnen te halen.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="p-6 bg-white border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 hover:scale-105">
              <CardContent className="p-0">
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 bg-tapbookr-green-subtle rounded-lg border border-tapbookr-green-light">
                    <feature.icon className="w-6 h-6 text-tapbookr-green" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg text-gray-900">{feature.title}</h3>
                    <p className="text-sm text-tapbookr-green font-medium bg-tapbookr-green-subtle px-2 py-1 rounded-full">{feature.stat}</p>
                  </div>
                </div>
                <p className="text-gray-800 leading-relaxed">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};