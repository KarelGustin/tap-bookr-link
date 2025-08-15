import { Card, CardContent } from "@/components/ui/card";

export const WhyBookr = () => {
  const features = [
    {
      title: "Direct professioneel eruitzien",
      description: "Voeg je naam, logo en een paar foto's toe. TapBookr verandert je simpele boekingslink in een strakke website waar klanten op vertrouwen—geen webkennis nodig.",
      icon: "🎨",
      stat: "+40% vertrouwen"
    },
    {
      title: "Werkt met wat je al gebruikt",
      description: "Plak je Salonized, Treatwell of Calendly link. We integreren het mooi in je pagina—geen code, geen setup, gewoon plakken en publiceren.",
      icon: "🔗",
      stat: "0 setup tijd"
    },
    {
      title: "Meer boekingen, minder heen en weer",
      description: "Duidelijke diensten, sociale links en een één-klik \"Boek nu.\" Minder DM's, minder no-shows, meer klanten in je agenda.",
      icon: "📈",
      stat: "+21% boekingen"
    }
  ];

  return (
    <section id="why-bookr" className="py-24 bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Section header */}
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Je "€1.000" website—klaar in minuten
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Stop met het verliezen van boekingen door trage sites en kleine links. Eén pagina die converteert.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card 
              key={index} 
              className="border border-gray-200 bg-white rounded-2xl overflow-hidden h-[380px]"
            >
              <CardContent className="p-8 h-full flex flex-col justify-between">
                <div className="space-y-6">
                  {/* Icon and stat */}
                  <div className="flex items-center justify-between">
                    <div className="text-4xl">
                      {feature.icon}
                    </div>
                    <div 
                      className="px-3 py-1 rounded-full text-sm font-bold text-black"
                      style={{ backgroundColor: "hsl(var(--accent))" }}
                    >
                      {feature.stat}
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <h3 className="text-xl font-bold leading-tight text-gray-900">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};