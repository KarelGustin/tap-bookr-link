import { Link } from "react-router-dom";

export const Footer = () => {
  const footerSections = [
    {
      title: "Product",
      links: [
        { name: "Features", href: "#features" },
        { name: "Pricing", href: "#pricing" },
        { name: "How it Works", href: "#how-it-works" },
        { name: "Examples", href: "#examples" },
        { name: "Integrations", href: "#integrations" },
        { name: "Mobile App", href: "#mobile" }
      ]
    },
    {
      title: "Business", 
      links: [
        { name: "Beauty & Wellness", href: "#beauty" },
        { name: "Fitness & Health", href: "#fitness" },
        { name: "Professional Services", href: "#services" },
        { name: "Restaurants & Food", href: "#food" },
        { name: "Retail & Shopping", href: "#retail" },
        { name: "Events & Entertainment", href: "#events" }
      ]
    },
    {
      title: "Support",
      links: [
        { name: "Help Center", href: "#help" },
        { name: "Getting Started", href: "/onboarding" },
        { name: "FAQs", href: "#faq" },
        { name: "Contact Support", href: "#contact" },
        { name: "Video Tutorials", href: "#tutorials" },
        { name: "API Documentation", href: "#api" }
      ]
    },
    {
      title: "Company",
      links: [
        { name: "About TapBookr", href: "#about" },
        { name: "Blog", href: "#blog" },
        { name: "Press", href: "#press" },
        { name: "Careers", href: "#careers" },
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
            Ready to boost your bookings?
          </h3>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            Join thousands of businesses who've already transformed their booking experience with TapBookr.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/onboarding"
              className="bg-primary text-gray-900 font-semibold px-8 py-3 rounded-xl text-lg"
            >
              Start building now
            </Link>
            <Link
              to="https://tapbookr.com/check1"
              target="_blank"
              rel="noreferrer"
              className="border-2 border-gray-300 text-gray-700 font-semibold px-8 py-3 rounded-xl text-lg"
            >
              See live demo
            </Link>
          </div>
        </div>
        
        {/* Bottom section */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 text-gray-600">
          <div className="flex items-center gap-3">
            <div 
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: 'hsl(var(--primary))' }}
            >
              <span className="font-bold text-lg text-white">T</span>
            </div>
            <span className="font-bold text-xl text-gray-900">TapBookr</span>
          </div>
          
          <div className="flex items-center gap-6 text-sm">
            <Link to="/terms" className="hover:text-gray-900">Terms</Link>
            <Link to="/privacy" className="hover:text-gray-900">Privacy</Link>
            <Link to="/cookies" className="hover:text-gray-900">Cookies</Link>
          </div>
          
          <p className="text-gray-500 text-sm">
            © 2024 TapBookr. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};