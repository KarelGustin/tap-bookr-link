import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export const Footer = () => {
  const footerSections = [
    {
      title: "Product",
      links: [
        { name: "Functies", href: "#features" },
        { name: "Prijzen", href: "#pricing" },
        { name: "Hoe het werkt", href: "#how-it-works" },
        { name: "Voorbeelden", href: "#examples" },
        { name: "Integraties", href: "#integrations" },
        { name: "Mobiele App", href: "#mobile" }
      ]
    },
    {
      title: "Bedrijven", 
      links: [
        { name: "Beauty & Wellness", href: "#beauty" },
        { name: "Fitness & Gezondheid", href: "#fitness" },
        { name: "Professionele Diensten", href: "#services" },
        { name: "Restaurants & Voeding", href: "#food" },
        { name: "Retail & Winkelen", href: "#retail" },
        { name: "Evenementen & Entertainment", href: "#events" }
      ]
    },
    {
      title: "Ondersteuning",
      links: [
        { name: "Helpcentrum", href: "#help" },
        { name: "Aan de slag", href: "/onboarding" },
        { name: "Veelgestelde vragen", href: "#faq" },
        { name: "Contact ondersteuning", href: "#contact" },
        { name: "Video tutorials", href: "#tutorials" },
        { name: "API documentatie", href: "#api" }
      ]
    },
    {
      title: "Bedrijf",
      links: [
        { name: "Over TapBookr", href: "#about" },
        { name: "Blog", href: "#blog" },
        { name: "Pers", href: "#press" },
        { name: "Vacatures", href: "#careers" },
        { name: "Partners", href: "#partners" },
        { name: "Contact", href: "#contact" }
      ]
    }
  ];

  const handleSmoothScroll = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    if (href.startsWith('#')) {
      const element = document.getElementById(href.substring(1));
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <footer className="pt-24 pb-12 bg-gradient-to-br from-gray-900 to-gray-800 text-white">
      <div className="container mx-auto px-4 md:px-8 max-w-6xl">
        {/* Main footer content */}
        <div className="bg-gray-800/50 border border-gray-700 rounded-2xl p-12 mb-12 backdrop-blur-sm">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {footerSections.map((section, index) => (
              <div key={index}>
                <h3 className="text-lg font-bold text-white mb-6">
                  {section.title}
                </h3>
                <ul className="space-y-4">
                  {section.links.map((link, linkIndex) => (
                    <li key={linkIndex}>
                      {link.href.startsWith('#') ? (
                        <a
                          href={link.href}
                          onClick={(e) => handleSmoothScroll(e, link.href)}
                          className="text-gray-300 hover:text-white transition-colors duration-200 text-base cursor-pointer hover:underline"
                        >
                          {link.name}
                        </a>
                      ) : (
                        <Link
                          to={link.href}
                          className="text-gray-300 hover:text-white transition-colors duration-200 text-base hover:underline"
                        >
                          {link.name}
                        </Link>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
        
        {/* CTA Section */}
        <div className="bg-gradient-to-r from-tapbookr-green to-teal-500 border border-gray-700 rounded-2xl p-12 mb-12 text-center shadow-2xl">
          <h3 className="text-3xl md:text-4xl font-bold text-white mb-6 leading-tight">
            Klaar om je boekingen te stimuleren?
          </h3>
          <p className="text-white/90 mb-8 max-w-2xl mx-auto text-xl leading-relaxed">
            Sluit je aan bij duizenden bedrijven die hun boekingservaring al hebben getransformeerd met TapBookr.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="outline" size="lg" className="bg-white text-tapbookr-green border-white hover:bg-gray-50 hover:scale-105 transition-all duration-200 font-semibold" asChild>
              <Link to="/onboarding">
                Begin nu met bouwen
              </Link>
            </Button>
            <Button variant="outline" size="lg" className="bg-white/10 border-white/30 text-white hover:bg-white/20 hover:scale-105 transition-all duration-200 font-semibold" asChild>
              <Link
                to="https://tapbookr.com/tapbookr"
                target="_blank"
                rel="noreferrer"
              >
                Bekijk live demo
              </Link>
            </Button>
          </div>
        </div>
        
        {/* Bottom section */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 text-gray-300">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-tapbookr-green flex items-center justify-center">
              <span className="font-bold text-xl text-white">T</span>
            </div>
            <span className="font-bold text-2xl text-white">TapBookr</span>
          </div>
          
          <div className="flex items-center gap-8 text-base">
            <Link to="/terms" className="hover:text-white transition-colors duration-200">Voorwaarden</Link>
            <Link to="/privacy" className="hover:text-white transition-colors duration-200">Privacy</Link>
            <Link to="/cookies" className="hover:text-white transition-colors duration-200">Cookies</Link>
          </div>
          
          <p className="text-gray-400 text-base">
            © 2024 TapBookr. Alle rechten voorbehouden.
          </p>
        </div>
      </div>
    </footer>
  );
};