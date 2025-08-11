import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export const FeaturedIn = () => {
  const logos = [
    { name: "TechCrunch", abbr: "TC" },
    { name: "Business Insider", abbr: "INSIDER" },
    { name: "Mashable", abbr: "Mashable" },
    { name: "Fortune", abbr: "FORTUNE" },
    { name: "Forbes", abbr: "Forbes" }
  ];

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-5xl font-bold mb-4 text-gray-900">
            The fast, friendly and powerful booking tool.
          </h2>
          
          <Button asChild size="lg" variant="secondary" className="mb-16 rounded-full bg-purple-300 text-gray-900 hover:bg-purple-400">
            <Link to="/login">
              Explore all plans
            </Link>
          </Button>
          
          <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-12">
            As featured in...
          </h3>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8 items-center">
            {logos.map((logo, index) => (
              <div key={index} className="flex items-center justify-center">
                <div className="w-24 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                  <span className="text-sm font-semibold text-gray-600">{logo.abbr}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};