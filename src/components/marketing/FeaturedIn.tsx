import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export const FeaturedIn = () => {
  const logos = [
    { name: "TechCrunch", abbr: "TC" },
    { name: "Business Insider", abbr: "BI" },
    { name: "Mashable", abbr: "M" },
    { name: "Fortune", abbr: "F" },
    { name: "Forbes", abbr: "FB" }
  ];

  return (
    <section className="py-24 bg-white">
      <div className="container mx-auto px-6">
        <div className="text-center max-w-4xl mx-auto">
          <Button 
            asChild 
            size="lg" 
            className="mb-16 rounded-full px-8 py-4 text-lg font-black text-white hover:scale-105 transition-all duration-200" 
            style={{ backgroundColor: 'hsl(var(--primary))' }}
          >
            <Link to="/login">
              Explore all plans
            </Link>
          </Button>
          
          <h3 className="text-3xl md:text-4xl font-black text-gray-900 mb-16">
            Built for service providers
          </h3>
          
          {/* Trust indicators */}
          <div className="mb-12">
            <p className="text-lg text-gray-600 font-semibold mb-4">
              Securely hosted • GDPR-compliant • No-tech setup
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 items-center">
            {logos.map((logo, index) => (
              <div key={index} className="flex items-center justify-center">
                <div 
                  className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg"
                  style={{ backgroundColor: 'hsl(var(--muted))' }}
                >
                  <span className="text-lg font-black text-gray-700">{logo.abbr}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};