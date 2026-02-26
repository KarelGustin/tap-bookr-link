import { Palette, Zap, TrendingUp, Smartphone, Globe, BarChart3 } from "lucide-react";

export const WhyBookr = () => {
  const features = [
    {
      title: "Professionele uitstraling",
      description: "Je pagina ziet eruit alsof een designer het heeft gemaakt. Klanten vertrouwen je sneller.",
      icon: Palette,
      stat: "+40% vertrouwen",
      gradient: "from-purple-500 to-pink-500",
      size: "large",
    },
    {
      title: "Plug & play boekingen",
      description: "Salonized, Treatwell, Calendly — plak je link en het werkt.",
      icon: Zap,
      stat: "0 min setup",
      gradient: "from-pink-500 to-amber-500",
      size: "small",
    },
    {
      title: "Mobiel-first design",
      description: "95% van je klanten zit op hun telefoon. Je pagina is perfect geoptimaliseerd.",
      icon: Smartphone,
      stat: "100% responsive",
      gradient: "from-amber-500 to-orange-500",
      size: "small",
    },
    {
      title: "Jouw eigen domein",
      description: "tapbookr.com/jouw-naam — een professioneel adres dat je overal kunt delen.",
      icon: Globe,
      stat: "Unieke URL",
      gradient: "from-blue-500 to-purple-500",
      size: "small",
    },
    {
      title: "Meer boekingen",
      description: "Eén-klik boeken, WhatsApp integratie, en duidelijke diensten. Minder DM's, meer klanten.",
      icon: TrendingUp,
      stat: "+21% conversie",
      gradient: "from-emerald-500 to-teal-500",
      size: "small",
    },
    {
      title: "Inzicht in je bezoekers",
      description: "Zie hoeveel mensen je pagina bezoeken en op je boekingsknop klikken.",
      icon: BarChart3,
      stat: "Live analytics",
      gradient: "from-violet-500 to-indigo-500",
      size: "small",
    },
  ];

  return (
    <section id="why-bookr" className="py-24 md:py-32 relative">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 dot-pattern opacity-40 pointer-events-none" />
      
      <div className="relative max-w-[1200px] mx-auto px-6">
        {/* Section header */}
        <div className="max-w-2xl mx-auto text-center mb-16 md:mb-20">
          <p className="text-[13px] font-semibold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 tracking-wide uppercase mb-4">
            Features
          </p>
          <h2 className="text-[34px] md:text-[44px] font-extrabold text-gray-950 leading-[1.1] tracking-[-0.03em] mb-5">
            Alles wat je nodig hebt
            <br />
            <span className="text-gray-400">om te stralen online.</span>
          </h2>
          <p className="text-[16px] md:text-[17px] text-gray-500 leading-relaxed">
            Van link-in-bio tot professionele website — in 5 minuten.
          </p>
        </div>

        {/* Bento Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((feature, index) => (
            <div
              key={index}
              className={`group relative bg-white rounded-2xl border border-gray-100 p-7 transition-colors hover:border-gray-200 ${
                index === 0 ? "lg:col-span-2 lg:row-span-1" : ""
              }`}
            >
              {/* Icon with gradient */}
              <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-5`}>
                <feature.icon className="w-5 h-5 text-white" />
              </div>

              {/* Content */}
              <h3 className="text-[17px] font-bold text-gray-950 mb-2 tracking-[-0.01em]">
                {feature.title}
              </h3>
              <p className="text-[14px] text-gray-500 leading-relaxed mb-4">
                {feature.description}
              </p>

              {/* Stat pill */}
              <div className={`inline-flex items-center gap-2 text-[12px] font-semibold px-3 py-1.5 rounded-full bg-gradient-to-r ${feature.gradient} bg-clip-text text-transparent border border-gray-100`}>
                <span className={`w-1.5 h-1.5 rounded-full bg-gradient-to-r ${feature.gradient}`} style={{ WebkitTextFillColor: 'initial' }} />
                <span>{feature.stat}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
