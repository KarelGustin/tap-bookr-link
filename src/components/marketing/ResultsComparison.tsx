import { Button } from "@/components/ui/button";
import { Check, Minus, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

export const ResultsComparison = () => {
  const features = [
    "Professionele uitstraling",
    "Snelle setup (< 5 min)",
    "Mobiel geoptimaliseerd",
    "Boekingsintegratie",
    "Eigen URL / domein",
    "Analytics & inzichten",
    "Geen technische kennis nodig",
  ];

  const columns = [
    {
      name: "DIY Website",
      subtitle: "Wix, Squarespace, etc.",
      price: "€200-500",
      checks: [true, false, false, false, true, true, false],
      featured: false,
    },
    {
      name: "Link in bio",
      subtitle: "Linktree, Beacons, etc.",
      price: "Gratis",
      checks: [false, true, true, false, false, false, true],
      featured: false,
    },
    {
      name: "TapBookr",
      subtitle: "Het beste van beide",
      price: "€7/mnd",
      checks: [true, true, true, true, true, true, true],
      featured: true,
    },
  ];

  return (
    <section className="py-24 md:py-32 relative">
      <div className="absolute inset-0 dot-pattern opacity-30 pointer-events-none" />
      
      <div className="relative max-w-[1200px] mx-auto px-6">
        {/* Section header */}
        <div className="max-w-2xl mx-auto text-center mb-16 md:mb-20">
          <p className="text-[13px] font-semibold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 tracking-wide uppercase mb-4">
            Vergelijk
          </p>
          <h2 className="text-[34px] md:text-[44px] font-extrabold text-gray-950 leading-[1.1] tracking-[-0.03em] mb-5">
            Waarom professionals
            <br />
            <span className="text-gradient-purple">kiezen voor TapBookr.</span>
          </h2>
        </div>

        {/* Comparison table — mobile cards, desktop table */}
        <div className="max-w-4xl mx-auto">
          {/* Desktop table */}
          <div className="hidden md:block rounded-2xl border border-gray-100 overflow-hidden bg-white">
            {/* Header row */}
            <div className="grid grid-cols-4">
              <div className="p-6" />
              {columns.map((col, i) => (
                <div
                  key={i}
                  className={`p-6 text-center ${
                    col.featured ? "bg-gray-950 text-white rounded-t-none" : ""
                  }`}
                >
                  {col.featured && (
                    <span className="inline-block text-[10px] font-bold tracking-widest uppercase text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 mb-2">
                      Aanbevolen
                    </span>
                  )}
                  <h3 className={`text-[17px] font-bold ${col.featured ? "text-white" : "text-gray-950"}`}>
                    {col.name}
                  </h3>
                  <p className={`text-[12px] mt-1 ${col.featured ? "text-gray-400" : "text-gray-500"}`}>
                    {col.subtitle}
                  </p>
                  <p className={`text-[18px] font-bold mt-3 ${col.featured ? "text-white" : "text-gray-950"}`}>
                    {col.price}
                  </p>
                </div>
              ))}
            </div>

            {/* Feature rows */}
            {features.map((feature, fi) => (
              <div key={fi} className="grid grid-cols-4 border-t border-gray-50">
                <div className="p-4 px-6 flex items-center">
                  <span className="text-[14px] text-gray-700">{feature}</span>
                </div>
                {columns.map((col, ci) => (
                  <div
                    key={ci}
                    className={`p-4 flex items-center justify-center ${
                      col.featured ? "bg-gray-950" : ""
                    }`}
                  >
                    {col.checks[fi] ? (
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                        col.featured 
                          ? "bg-gradient-to-r from-purple-500 to-pink-500" 
                          : "bg-gray-100"
                      }`}>
                        <Check className={`w-3.5 h-3.5 ${col.featured ? "text-white" : "text-gray-700"}`} />
                      </div>
                    ) : (
                      <Minus className={`w-4 h-4 ${col.featured ? "text-gray-700" : "text-gray-300"}`} />
                    )}
                  </div>
                ))}
              </div>
            ))}

            {/* CTA row */}
            <div className="grid grid-cols-4 border-t border-gray-50">
              <div className="p-6" />
              {columns.map((col, i) => (
                <div
                  key={i}
                  className={`p-6 flex items-center justify-center ${
                    col.featured ? "bg-gray-950 rounded-b-none" : ""
                  }`}
                >
                  {col.featured && (
                    <Button
                      asChild
                      className="bg-white text-gray-950 h-10 px-6 rounded-full text-[13px] font-semibold hover:bg-gray-100 transition-colors"
                    >
                      <Link to="/onboarding">
                        Begin nu
                        <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                      </Link>
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden space-y-4">
            {columns.map((col, i) => (
              <div
                key={i}
                className={`rounded-2xl border p-6 ${
                  col.featured
                    ? "border-gray-950 bg-gray-950 text-white"
                    : "border-gray-100 bg-white"
                }`}
              >
                {col.featured && (
                  <span className="inline-block text-[10px] font-bold tracking-widest uppercase text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 mb-2">
                    Aanbevolen
                  </span>
                )}
                <div className="flex items-baseline justify-between mb-4">
                  <div>
                    <h3 className={`text-[17px] font-bold ${col.featured ? "text-white" : "text-gray-950"}`}>{col.name}</h3>
                    <p className={`text-[12px] ${col.featured ? "text-gray-400" : "text-gray-500"}`}>{col.subtitle}</p>
                  </div>
                  <span className={`text-[17px] font-bold ${col.featured ? "text-white" : "text-gray-950"}`}>{col.price}</span>
                </div>
                <div className="space-y-2.5">
                  {features.map((f, fi) => (
                    <div key={fi} className="flex items-center gap-3">
                      {col.checks[fi] ? (
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${
                          col.featured ? "bg-gradient-to-r from-purple-500 to-pink-500" : "bg-gray-100"
                        }`}>
                          <Check className={`w-3 h-3 ${col.featured ? "text-white" : "text-gray-700"}`} />
                        </div>
                      ) : (
                        <div className="w-5 h-5 flex items-center justify-center flex-shrink-0">
                          <Minus className={`w-3.5 h-3.5 ${col.featured ? "text-gray-600" : "text-gray-300"}`} />
                        </div>
                      )}
                      <span className={`text-[13px] ${
                        col.checks[fi]
                          ? col.featured ? "text-gray-200" : "text-gray-700"
                          : col.featured ? "text-gray-600" : "text-gray-400"
                      }`}>{f}</span>
                    </div>
                  ))}
                </div>
                {col.featured && (
                  <Button
                    asChild
                    className="w-full mt-6 bg-white text-gray-950 h-11 rounded-xl text-[14px] font-semibold hover:bg-gray-100 transition-colors"
                  >
                    <Link to="/onboarding">
                      Begin nu
                      <ArrowRight className="w-4 h-4 ml-1.5" />
                    </Link>
                  </Button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
