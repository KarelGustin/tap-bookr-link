import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export const Footer = () => {
  return (
    <footer>
      {/* ─── FINAL CTA — dramatic gradient section ─── */}
      <div className="relative overflow-hidden bg-gray-950 py-24 md:py-32">
        {/* Ambient gradients */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-b from-purple-500/15 via-pink-500/10 to-transparent rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[300px] bg-gradient-to-tr from-purple-500/10 to-transparent rounded-full blur-[80px] pointer-events-none" />
        
        <div className="relative max-w-[1200px] mx-auto px-6 text-center">
          <h2 className="text-[36px] md:text-[48px] font-extrabold text-white leading-[1.1] tracking-[-0.035em] mb-5">
            Jouw beauty business
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-amber-400">
              verdient dit.
            </span>
          </h2>
          <p className="text-[16px] md:text-[17px] text-gray-400 leading-relaxed max-w-lg mx-auto mb-10">
            Bouw vandaag nog je professionele boekingspagina. Je eerste maand is slechts €1.
          </p>
          
          <div className="inline-flex flex-col sm:flex-row items-center gap-4">
            <Button
              asChild
              className="bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500 text-white h-13 px-8 rounded-full text-[15px] font-semibold hover:opacity-90 transition-opacity"
            >
              <Link to="/onboarding">
                Begin nu gratis
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
            <a
              href="https://tapbookr.com/tapbookr"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[14px] text-gray-500 hover:text-white transition-colors underline underline-offset-4 decoration-gray-700"
            >
              Bekijk live voorbeeld
            </a>
          </div>
        </div>
      </div>

      {/* ─── BOTTOM BAR ─── */}
      <div className="bg-gray-950 border-t border-white/[0.06]">
        <div className="max-w-[1200px] mx-auto px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="text-[14px] font-bold text-white tracking-tight">
            TapBookr
          </span>

          <div className="flex items-center gap-6 text-[13px] text-gray-500">
            <Link to="/terms" className="hover:text-gray-300 transition-colors">Voorwaarden</Link>
            <Link to="/privacy" className="hover:text-gray-300 transition-colors">Privacy</Link>
          </div>

          <p className="text-[12px] text-gray-600">
            © {new Date().getFullYear()} TapBookr
          </p>
        </div>
      </div>
    </footer>
  );
};
