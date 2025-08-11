import { Link } from "react-router-dom";

export const Footer = () => {
  const footerSections = [
    {
      title: "Company",
      links: [
        { name: "The Bookr Blog", href: "#" },
        { name: "Engineering Blog", href: "#" },
        { name: "Marketplace", href: "#" },
        { name: "What's New", href: "#" },
        { name: "About", href: "#" },
        { name: "Press", href: "#" },
        { name: "Careers", href: "#" },
        { name: "Link in Bio", href: "#" },
        { name: "Social Good", href: "#" },
        { name: "Contact", href: "#" }
      ]
    },
    {
      title: "Community", 
      links: [
        { name: "Bookr for Enterprise", href: "#" },
        { name: "2023 Creator Report", href: "#" },
        { name: "2022 Creator Report", href: "#" },
        { name: "Charities", href: "#" },
        { name: "What's Trending", href: "#" },
        { name: "Creator Profile Directory", href: "#" },
        { name: "Explore Templates", href: "#" }
      ]
    },
    {
      title: "Support",
      links: [
        { name: "Help Topics", href: "#" },
        { name: "Getting Started", href: "#" },
        { name: "Bookr Pro", href: "#" },
        { name: "Features & How-Tos", href: "#" },
        { name: "FAQs", href: "#faq" },
        { name: "Report a Violation", href: "#" }
      ]
    },
    {
      title: "Trust & Legal",
      links: [
        { name: "Terms & Conditions", href: "/terms" },
        { name: "Privacy Notice", href: "/privacy" },
        { name: "Cookie Notice", href: "#" },
        { name: "Trust Center", href: "#" },
        { name: "Cookie Preferences", href: "#" },
        { name: "Transparency Report", href: "#" },
        { name: "Law Enforcement Access Policy", href: "#" }
      ]
    }
  ];

  return (
    <footer 
      className="pt-24 pb-12"
      style={{ backgroundColor: 'hsl(var(--primary))' }}
    >
      <div className="container mx-auto px-6">
        {/* Main footer content */}
        <div className="bg-white rounded-3xl p-16 mb-12 shadow-2xl">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12">
            {footerSections.map((section, index) => (
              <div key={index}>
                <h3 className="text-xl font-black text-gray-900 mb-6">
                  {section.title}
                </h3>
                <ul className="space-y-4">
                  {section.links.map((link, linkIndex) => (
                    <li key={linkIndex}>
                      <Link
                        to={link.href}
                        className="text-gray-600 hover:text-gray-900 transition-colors duration-200 font-medium hover:underline"
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
        
        {/* Bottom section */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-8 text-white">
          <div className="flex items-center gap-4">
            <div 
              className="w-12 h-12 rounded-2xl flex items-center justify-center"
              style={{ backgroundColor: 'hsl(var(--accent))' }}
            >
              <span className="font-black text-xl text-gray-900">B</span>
            </div>
            <span className="font-black text-2xl">Bookr</span>
          </div>
          
          <p className="text-white/80 font-medium">
            © 2024 Bookr. All rights reserved. Made with Bookr ✨
          </p>
        </div>
      </div>
    </footer>
  );
};