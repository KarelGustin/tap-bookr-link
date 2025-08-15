import { Link } from "react-router-dom";

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

  return (
    <footer className="pt-24 pb-12 bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Main footer content */}
        <div className="bg-white border border-gray-200 rounded-2xl p-12 mb-12">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {footerSections.map((section, index) => (
              <div key={index}>
                <h3 className="text-lg font-bold text-gray-900 mb-4">
                  {section.title}
                </h3>
                <ul className="space-y-3">
                  {section.links.map((link, linkIndex) => (
                    <li key={linkIndex}>
                      <Link
                        to={link.href}
                        className="text-gray-600 hover:text-gray-900 transition-colors duration-200 text-sm"
                      >
                        {link.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
        
        {/* CTA Section */}
        <div className="bg-white border border-gray-200 rounded-2xl p-8 mb-12 text-center">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            Klaar om je boekingen te stimuleren?
          </h3>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            Sluit je aan bij duizenden bedrijven die hun boekingservaring al hebben getransformeerd met TapBookr.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/onboarding"
              className="bg-primary text-gray-900 font-semibold px-8 py-3 rounded-xl text-lg"
            >
              Begin nu met bouwen
            </Link>
            <Link
              to="https://tapbookr.com/check1"
              target="_blank"
              rel="noreferrer"
              className="border-2 border-gray-300 text-gray-700 font-semibold px-8 py-3 rounded-xl text-lg"
            >
              Bekijk live demo
            </Link>
          </div>
        </div>
        
        {/* Bottom section */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 text-gray-600">
          <div className="flex items-center gap-3">
            {/* <div 
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: 'hsl(var(--primary))' }}
            >
              <span className="font-bold text-lg text-black">T</span>
            </div> */}
            <span className="font-bold text-xl text-gray-900">TapBookr</span>
          </div>
          
          <div className="flex items-center gap-6 text-sm">
            <Link to="/terms" className="hover:text-gray-900">Voorwaarden</Link>
            <Link to="/privacy" className="hover:text-gray-900">Privacy</Link>
            <Link to="/cookies" className="hover:text-gray-900">Cookies</Link>
          </div>
          
          <p className="text-gray-500 text-sm">
            © 2024 TapBookr. Alle rechten voorbehouden.
          </p>
        </div>
      </div>
    </footer>
  );
};