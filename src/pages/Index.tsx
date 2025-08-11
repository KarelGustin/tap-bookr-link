import { Hero } from "@/components/marketing/Hero";
import { WhyBookr } from "@/components/marketing/WhyBookr";
import { HowItWorks } from "@/components/marketing/HowItWorks";
import { BookrFeatures } from "@/components/marketing/BookrFeatures";
import { Pricing } from "@/components/marketing/Pricing";
import { FAQ } from "@/components/marketing/FAQ";
import { Footer } from "@/components/marketing/Footer";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const Index = () => {
  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/90 backdrop-blur-sm border-b z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-r from-primary to-secondary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">B</span>
            </div>
            <span className="text-xl font-bold">Bookr</span>
          </Link>
          
          <div className="flex items-center gap-4">
            <Button asChild variant="ghost">
              <Link to="/login">Log in</Link>
            </Button>
            <Button asChild variant="gradient">
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
        <BookrFeatures />
        <div id="pricing">
          <Pricing />
        </div>
        <div id="faq">
          <FAQ />
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Index;
