import { Card, CardContent } from '@/components/ui/card';
import { Calendar, Palette, Share2, BarChart3, Shield, Zap } from 'lucide-react';

const features = [
  {
    icon: Calendar,
    title: 'Easy Booking',
    description: 'Seamless appointment scheduling with calendar integration and automated confirmations.'
  },
  {
    icon: Palette,
    title: 'Custom Design',
    description: 'Beautiful, responsive profiles that match your brand with customizable themes and colors.'
  },
  {
    icon: Share2,
    title: 'Share Anywhere',
    description: 'One link to share across all platforms - social media, email signatures, and business cards.'
  },
  {
    icon: BarChart3,
    title: 'Analytics',
    description: 'Track profile visits, booking rates, and engagement to optimize your professional presence.'
  },
  {
    icon: Shield,
    title: 'Secure & Reliable',
    description: 'Enterprise-grade security with 99.9% uptime guarantee for your professional reputation.'
  },
  {
    icon: Zap,
    title: 'Lightning Fast',
    description: 'Optimized performance ensures your profile loads instantly on any device, anywhere.'
  }
];

export const Features = () => {
  return (
    <section className="py-20 bg-muted/30">
      <div className="container px-4 md:px-6">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">
            Everything You Need to Succeed
          </h2>
          <p className="mx-auto max-w-[600px] text-muted-foreground md:text-lg">
            Powerful features designed to help professionals showcase their expertise 
            and grow their business.
          </p>
        </div>
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => (
            <Card key={index} className="border-0 shadow-sm bg-card/50 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="space-y-3">
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};