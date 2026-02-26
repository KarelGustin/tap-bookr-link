import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

export const HowItWorks = () => {
  const steps = [
    {
      step: "01",
      title: "Claim je naam",
      description: "Kies jouw unieke URL. In seconden is tapbookr.com/jouw-naam van jou.",
      visual: "tapbookr.com/sarah",
    },
    {
      step: "02",
      title: "Maak het van jou",
      description: "Upload je foto's, kies je kleuren, voeg je diensten toe. Je brand, jouw stijl.",
      visual: "Drag & Drop",
    },
    {
      step: "03",
      title: "Deel & groei",
      description: "Zet je link in je Instagram bio en kijk hoe de boekingen binnenkomen.",
      visual: "instagram.com/...",
    }
  ];

  return (
    <section id="how-it-works" className="py-24 md:py-32 bg-gray-950 relative overflow-hidden">
      {/* Ambient glow on dark bg */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-b from-purple-500/10 to-transparent rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-gradient-to-tl from-pink-500/5 to-transparent rounded-full blur-[80px] pointer-events-none" />
      
      <div className="relative max-w-[1200px] mx-auto px-6">
        {/* Section header */}
        <div className="max-w-2xl mx-auto text-center mb-16 md:mb-20">
          <p className="text-[13px] font-semibold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 tracking-wide uppercase mb-4">
            Hoe het werkt
          </p>
          <h2 className="text-[34px] md:text-[44px] font-extrabold text-white leading-[1.1] tracking-[-0.03em] mb-5">
            Live in drie stappen.
          </h2>
          <p className="text-[16px] md:text-[17px] text-gray-400 leading-relaxed">
            Sneller klaar dan je koffie koud wordt.
          </p>
        </div>

        {/* Steps grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-16">
          {steps.map((item, index) => (
            <div key={item.step} className="group relative">
              {/* Card */}
              <div className="bg-white/[0.04] backdrop-blur-sm border border-white/[0.06] rounded-2xl p-8 h-full transition-colors hover:bg-white/[0.06] hover:border-white/[0.1]">
                {/* Step number with gradient */}
                <span className="text-[64px] font-black leading-none tracking-[-0.05em] block mb-6 text-transparent bg-clip-text bg-gradient-to-b from-white/20 to-white/5">
                  {item.step}
                </span>

                <h3 className="text-[20px] font-bold text-white mb-3 tracking-[-0.01em]">
                  {item.title}
                </h3>

                <p className="text-[14px] text-gray-400 leading-relaxed mb-6">
                  {item.description}
                </p>

                {/* Visual indicator */}
                <div className="inline-flex items-center gap-2 bg-white/[0.06] border border-white/[0.08] rounded-lg px-3 py-2">
                  <span className="w-2 h-2 rounded-full bg-gradient-to-r from-purple-400 to-pink-400" />
                  <span className="text-[12px] font-mono text-gray-400">{item.visual}</span>
                </div>
              </div>

              {/* Connecting arrow — between cards on desktop */}
              {index < steps.length - 1 && (
                <div className="hidden md:flex absolute top-1/2 -right-3 transform -translate-y-1/2 z-10">
                  <ArrowRight className="w-4 h-4 text-white/20" />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center">
          <div className="inline-flex flex-col sm:flex-row items-center gap-4">
            <Button
              className="bg-white text-gray-950 h-12 px-8 rounded-full text-[15px] font-semibold hover:bg-gray-100 transition-colors"
              asChild
            >
              <Link to="/onboarding">
                Begin nu — eerste maand €1
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
            <a
              href="https://tapbookr.com/tapbookr"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[14px] text-gray-500 hover:text-white transition-colors underline underline-offset-4 decoration-gray-700"
            >
              Bekijk live demo
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};
