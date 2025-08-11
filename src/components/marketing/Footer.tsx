import { Link } from "react-router-dom";

export const Footer = () => {
  const links = [
    { name: "Pricing", href: "#pricing" },
    { name: "FAQ", href: "#faq" },
    { name: "Login", href: "/login" },
    { name: "Privacy", href: "/privacy" },
    { name: "Terms", href: "/terms" }
  ];

  return (
    <footer className="py-12 bg-gradient-to-r from-primary via-secondary to-accent">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
              <span className="text-primary font-bold text-lg">B</span>
            </div>
            <span className="text-white font-semibold text-xl">Bookr</span>
          </div>
          
          <nav className="flex flex-wrap items-center gap-6 md:gap-8">
            {links.map((link, index) => (
              <Link
                key={index}
                to={link.href}
                className="text-white/80 hover:text-white transition-colors duration-200 text-sm"
              >
                {link.name}
              </Link>
            ))}
          </nav>
        </div>
        
        <div className="mt-8 pt-8 border-t border-white/20 text-center">
          <p className="text-white/60 text-sm">
            © 2024 Bookr. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};