import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

export const Hero = () => {
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden" style={{background: 'var(--gradient-hero)'}}>
      {/* Large silhouette shapes like Linktree */}
      <div className="absolute left-0 top-0 w-96 h-full">
        <div className="w-full h-full bg-secondary/80 rounded-r-full transform -translate-x-1/2"></div>
      </div>
      <div className="absolute right-0 bottom-0 w-80 h-80">
        <div className="w-full h-full bg-accent/30 rounded-full transform translate-x-1/4 translate-y-1/4"></div>
      </div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-8 text-white leading-tight">
            Jumpstart your corner of the internet today
          </h1>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center max-w-md mx-auto">
            <div className="flex-1 min-w-0">
              <input 
                type="text" 
                placeholder="bookr.com/" 
                className="w-full px-4 py-3 rounded-full border-0 text-lg"
              />
            </div>
            <Button asChild size="lg" variant="linktree" className="text-lg px-8 py-3 min-w-fit">
              <Link to="/login">
                Claim your Bookr
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};