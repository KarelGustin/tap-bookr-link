import { Card, CardContent } from "@/components/ui/card";

export const WhyBookr = () => {
  const features = [
    {
      title: "Share your content in limitless ways on your Bookr.",
      description: "Connect everything you create in one simple link.",
      bgColor: "hsl(var(--linktree-pink))",
      textColor: "text-gray-800"
    },
    {
      title: "Sell products and collect payments. It's monetization made simple.",
      description: "Turn your audience into customers with built-in commerce.",
      bgColor: "hsl(var(--linktree-lime))",
      textColor: "text-gray-800"
    },
    {
      title: "Grow, own and engage your audience by unifying them in one place.",
      description: "Build deeper relationships with your followers.",
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