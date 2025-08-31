import { HeroNew } from "@/components/marketing/HeroNew";
import { WhyBookr } from "@/components/marketing/WhyBookr";
import { HowItWorks } from "@/components/marketing/HowItWorks";
import { Testimonials } from "@/components/marketing/Testimonials";
import { ResultsComparison } from "@/components/marketing/ResultsComparison";
import { FeaturedIn } from "@/components/marketing/FeaturedIn";
import { FAQ } from "@/components/marketing/FAQ";
import { Footer } from "@/components/marketing/Footer";
import { Pricing } from "@/components/marketing/Pricing";
import { Analytics } from "@vercel/analytics/react";

const Index = () => {
  return (
    <div className="min-h-screen overflow-x-hidden">

      {/* Main content */}
      <main>
        <HeroNew />
        <WhyBookr />
        <HowItWorks />
        <Testimonials />
        <ResultsComparison />
        {/* <Pricing /> */}
        {/* <FeaturedIn /> */}
        <FAQ />
      </main>
      <Analytics />
      <Footer />
    </div>
  );
};

export default Index;
