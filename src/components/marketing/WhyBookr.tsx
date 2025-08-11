import { Card, CardContent } from "@/components/ui/card";

export const WhyBookr = () => {
  const features = [
    {
      title: "Instantly look professional",
      description: "Drop your name, logo and a few photos. Bookr turns your plain booking link into a clean, mobile page clients trust—no web skills needed.",
      bgColor: "hsl(var(--primary))",
      textColor: "text-gray-900"
    },
    {
      title: "Works with what you already use",
      description: "Paste your Salonized, Treatwell or Calendly link. We embed it beautifully inside your page—no code, no setup, just paste and publish.",
      bgColor: "hsl(var(--primary))",
      textColor: "text-gray-900"
    },
    {
      title: "More bookings, less back-and-forth",
      description: "Clear services, social links and a one-tap “Book now.” Fewer DMs, fewer no-shows, more clients on your calendar.",
      bgColor: "hsl(var(--primary))",
      textColor: "text-gray-900"
    }
  ];

  return (
    <section id="why-bookr" className="py-24 bg-white">
      <div className="container mx-auto px-2 md:px-3">
        {/* Section header */}
        <div className="text-center mb-20">
          <h2 className="text-5xl md:text-6xl lg:text-7xl font-black text-gray-900 mb-6 leading-tight">
            Why Bookr?
          </h2>
          <p className="text-xl md:text-2xl text-gray-600 font-semibold max-w-3xl mx-auto">
            A simple, beautiful page that makes your booking link work harder.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {features.map((feature, index) => (
            <Card 
              key={index} 
              className="border-0 shadow-xl rounded-3xl overflow-hidden h-[400px] group cursor-pointer hover:scale-105 transition-all duration-300 hover:shadow-2xl"
              style={{ backgroundColor: feature.bgColor }}
            >
              <CardContent className="p-10 h-full flex flex-col justify-between">
                <div className="space-y-8">
                  {/* Minimal graphic placeholder */}
                  <div className="h-24 w-24 bg-white/30 rounded-3xl"></div>
                </div>
                <div className="space-y-4">
                  <h3 className={`text-2xl font-black leading-tight ${feature.textColor}`}>
                    {feature.title}
                  </h3>
                  <p className={`text-lg leading-relaxed ${feature.textColor} opacity-90 font-medium`}>
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