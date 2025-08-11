import { Card, CardContent } from "@/components/ui/card";

export const WhyBookr = () => {
  const features = [
    {
      title: "Show your business, your way.",
      description: "Your TapBookr page is your personal mini-site — share services, offers, and updates in one beautiful place.",
      bgColor: "hsl(var(--linktree-pink))",
      textColor: "text-gray-800"
    },
    {
      title: "Sell and get paid, effortlessly.",
      description: "Link your booking or payment platform and start taking appointments or payments instantly.",
      bgColor: "hsl(var(--linktree-lime))",
      textColor: "text-gray-800"
    },
    {
      title: "Turn visitors into loyal clients.",
      description: "Build trust, showcase your work, and make it easy for people to book with you — all in one page.",
      bgColor: "hsl(var(--linktree-blue))",
      textColor: "text-white"
    }
  ];

  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {features.map((feature, index) => (
            <Card 
              key={index} 
              className="border-0 shadow-none rounded-3xl overflow-hidden h-96 group cursor-pointer hover:scale-105 transition-transform duration-300"
              style={{ backgroundColor: feature.bgColor }}
            >
              <CardContent className="p-8 h-full flex flex-col justify-between">
                <div className="space-y-6">
                  {/* Placeholder for feature graphic/mockup */}
                  <div className="h-32 bg-white/20 rounded-2xl"></div>
                </div>
                <div>
                  <h3 className={`text-xl font-bold mb-2 ${feature.textColor}`}>
                    {feature.title}
                  </h3>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};