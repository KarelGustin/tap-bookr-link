import { Hero } from "@/components/marketing/Hero";
import { WhyBookr } from "@/components/marketing/WhyBookr";
import { HowItWorks } from "@/components/marketing/HowItWorks";
import { Testimonials } from "@/components/marketing/Testimonials";
import { FeaturedIn } from "@/components/marketing/FeaturedIn";
import { FAQ } from "@/components/marketing/FAQ";
import { Footer } from "@/components/marketing/Footer";

const Index = () => {
  return (
    <div className="min-h-screen overflow-x-hidden">

      {/* Main content */}
      <main>
        <Hero />
        <WhyBookr />
        <HowItWorks />
        <Testimonials />
        <FeaturedIn />
          <FAQ />
      </main>
      
      <Footer />
    </div>
  );
};

export default Index;
