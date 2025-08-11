import { Hero } from "@/components/marketing/Hero";
import { WhyBookr } from "@/components/marketing/WhyBookr";
import { HowItWorks } from "@/components/marketing/HowItWorks";
import { Testimonials } from "@/components/marketing/Testimonials";
import { FeaturedIn } from "@/components/marketing/FeaturedIn";
import { FAQ } from "@/components/marketing/FAQ";
import { Footer } from "@/components/marketing/Footer";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const Index = () => {
  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/95 backdrop-blur-sm border-b z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-r from-primary to-secondary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">B</span>
            </div>
            <span className="text-xl font-bold">Bookr</span>
          </Link>
          
          <div className="hidden md:flex items-center gap-8">
            <Link to="#" className="text-gray-700 hover:text-gray-900">Products</Link>
            <Link to="#" className="text-gray-700 hover:text-gray-900">Templates</Link>
            <Link to="#" className="text-gray-700 hover:text-gray-900">Marketplace</Link>
            <Link to="#" className="text-gray-700 hover:text-gray-900">Learn</Link>
            <Link to="#pricing" className="text-gray-700 hover:text-gray-900">Pricing</Link>
          </div>
          
          <div className="flex items-center gap-4">
            <Button asChild variant="ghost">
              <Link to="/login">Log in</Link>
            </Button>
            <Button asChild className="rounded-full bg-gray-900 text-white hover:bg-gray-800">
              <Link to="/login">Sign up free</Link>
            </Button>
          </div>
        </div>
      </nav>

      {/* Main content */}
      <main className="pt-16">
        <Hero />
        <WhyBookr />
        <HowItWorks />
        <Testimonials />
        <FeaturedIn />
        <div id="faq">
          <FAQ />
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Index;
