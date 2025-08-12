import { Card, CardContent } from "@/components/ui/card";

export const WhyBookr = () => {
  const features = [
    {
      title: "Instantly look professional",
      description: "Drop your name, logo and a few photos. TapBookr turns your plain booking link into a clean, website clients trust—no web skills needed.",
      icon: "🎨",
      stat: "+40% trust"
    },
    {
      title: "Works with what you already use",
      description: "Paste your Salonized, Treatwell or Calendly link. We embed it beautifully inside your page—no code, no setup, just paste and publish.",
      icon: "🔗",
      stat: "0 setup time"
    },
    {
      title: "More bookings, less back-and-forth",
      description: "Clear services, social links and a one-tap \"Book now.\" Fewer DMs, fewer no-shows, more clients on your calendar.",
      icon: "📈",
      stat: "+21% bookings"
    }
  ];

  return (
    <section id="why-bookr" className="py-24 bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Section header */}
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Your $1,000 website—done in minutes
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Stop losing bookings to slow sites and tiny links. One page that converts.
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
                      className="px-3 py-1 rounded-full text-sm font-bold text-white"
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