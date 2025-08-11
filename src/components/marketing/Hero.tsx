import { Button } from '@/components/ui/button';
import { ArrowRight, Sparkles } from 'lucide-react';

export const Hero = () => {
  return (
    <section className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted/50 to-accent/20">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center space-y-8 text-center">
          <div className="space-y-2">
            <div className="inline-block rounded-lg bg-primary/10 px-3 py-1 text-sm">
              <Sparkles className="inline-block w-4 h-4 mr-2" />
              Professional Profiles Made Simple
            </div>
            <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
              Create Your Perfect
              <span className="text-primary"> Booking Profile</span>
            </h1>
            <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
              Build beautiful, professional profiles that convert visitors into customers. 
              Share your expertise and make booking appointments effortless.
            </p>
          </div>
          <div className="space-x-4">
            <Button size="lg" className="h-12">
              Get Started Free
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button variant="outline" size="lg" className="h-12">
              View Examples
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};