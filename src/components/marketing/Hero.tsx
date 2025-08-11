import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
export const Hero = () => {
  return (
    <section 
      className="relative min-h-screen overflow-hidden px-4 py-12 sm:px-6" 
      style={{ backgroundColor: 'hsl(var(--secondary))' }}
    >
      <div className="container mx-auto max-w-7xl h-full min-h-screen flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-12">
        {/* Left Content */}
        <div className="flex-1 space-y-6 sm:space-y-8 text-left w-full max-w-2xl">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black text-white leading-tight tracking-tight">
            Turn Your Booking Link into a{' '}
            <span style={{ color: 'hsl(var(--accent))' }}>
              Real Website
            </span>
            .
          </h1>
          
          <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-white leading-relaxed font-semibold opacity-95">
            Bookr wraps your existing booking link in a beautiful page — so you look like a pro, not just a link.
          </p>
          
          <p className="text-sm sm:text-base md:text-lg text-white/80 font-medium">
            Used by hundreds of salons, consultants, trainers and beauty pros.
          </p>
          
          <div className="space-y-4 w-full max-w-md pt-4 sm:pt-6">
            <div className="relative">
              <div className="flex items-center w-full px-4 sm:px-6 lg:px-8 py-4 sm:py-5 lg:py-6 rounded-2xl sm:rounded-3xl bg-white text-base sm:text-lg lg:text-xl font-semibold shadow-lg">
                <span className="text-gray-700 select-none text-sm sm:text-base lg:text-lg">TapBookr.com/</span>
                <input 
                  type="text" 
                  placeholder="Yourname" 
                  className="flex-1 bg-transparent text-gray-900 placeholder-gray-500 focus:outline-none ml-0 text-sm sm:text-base lg:text-lg"
                />
              </div>
            </div>
            <Button 
              asChild 
              size="lg" 
              className="w-full text-base sm:text-lg lg:text-xl font-black px-4 sm:px-6 lg:px-8 py-4 sm:py-5 lg:py-6 rounded-2xl sm:rounded-3xl text-white border-0 transition-all hover:scale-105 hover:shadow-2xl"
              style={{ backgroundColor: 'hsl(var(--accent))' }}
            >
              <Link to="/login">
                Claim your Bookr page
              </Link>
            </Button>
          </div>
        </div>
        
      </div>
      
      {/* Horizontal Slider - Full Width */}
      <div className="w-full mt-4 sm:mt-8 lg:mt-12 -mx-4 sm:mx-0">
        <Carousel 
          opts={{
            align: "start",
            loop: true,
          }}
          className="w-full"
        >
          <CarouselContent className="-ml-2 md:-ml-4">
            {/* Mockup 1 - Salon */}
            <CarouselItem className="pl-2 md:pl-4 basis-[280px] sm:basis-[320px]">
              <div className="relative w-full h-[520px] sm:h-[580px] rounded-2xl sm:rounded-3xl p-2 shadow-2xl" style={{ backgroundColor: 'hsl(var(--pink))' }}>
                <div className="w-full h-full bg-white rounded-xl sm:rounded-2xl flex flex-col p-4 sm:p-6">
                  {/* Header */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center" style={{ backgroundColor: 'hsl(var(--pink))' }}>
                      <span className="text-white font-black text-lg">💅</span>
                    </div>
                    <div>
                      <h3 className="text-gray-900 font-black text-base">Bloomm Salon</h3>
                      <p className="text-gray-600 font-medium text-sm">Nail & Beauty</p>
                    </div>
                  </div>
                  
                  {/* Services */}
                  <div className="space-y-3 mb-6 flex-1">
                    <div className="h-12 rounded-xl flex items-center justify-between px-4" style={{ backgroundColor: 'hsl(var(--pink) / 0.1)' }}>
                      <span className="text-sm font-semibold text-gray-700">Perfect pedi</span>
                      <span className="text-sm font-bold text-gray-900">€ 50,00</span>
                    </div>
                    <div className="h-12 rounded-xl flex items-center justify-between px-4" style={{ backgroundColor: 'hsl(var(--accent) / 0.1)' }}>
                      <span className="text-sm font-semibold text-gray-700">Pedicure + french</span>
                      <span className="text-sm font-bold text-gray-900">€ 55,00</span>
                    </div>
                    <div className="text-xs text-gray-500 px-2">
                      60 minuten — LET OP: voor deze behandeling moeten de nagels gezond zijn
                    </div>
                  </div>
                  
                  {/* CTA */}
                  <div className="mt-auto">
                    <div className="h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'hsl(var(--pink))' }}>
                      <span className="text-white font-black text-base">Bekijk afspraken</span>
                    </div>
                  </div>
                </div>
              </div>
            </CarouselItem>

            {/* Mockup 2 - Brow Studio */}
            <CarouselItem className="pl-2 md:pl-4 basis-[280px] sm:basis-[320px]">
              <div className="relative w-full h-[520px] sm:h-[580px] rounded-2xl sm:rounded-3xl p-2 shadow-2xl" style={{ backgroundColor: 'hsl(var(--orange))' }}>
                <div className="w-full h-full bg-white rounded-xl sm:rounded-2xl flex flex-col p-4 sm:p-6">
                  {/* Header */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center" style={{ backgroundColor: 'hsl(var(--orange))' }}>
                      <span className="text-white font-black text-lg">✨</span>
                    </div>
                    <div>
                      <h3 className="text-gray-900 font-black text-base">Brows at Demi</h3>
                      <p className="text-gray-600 font-medium text-sm">Brow Studio</p>
                    </div>
                  </div>
                  
                  {/* Services */}
                  <div className="space-y-3 mb-6 flex-1">
                    <div className="h-12 rounded-xl flex items-center justify-between px-4" style={{ backgroundColor: 'hsl(var(--orange) / 0.1)' }}>
                      <span className="text-sm font-semibold text-gray-700">Powderbrows nieuwe set</span>
                      <span className="text-sm font-bold text-gray-900">€ 100,00</span>
                    </div>
                    <div className="h-12 rounded-xl flex items-center justify-between px-4" style={{ backgroundColor: 'hsl(var(--accent) / 0.1)' }}>
                      <span className="text-sm font-semibold text-gray-700">Touch up (1 jaar)</span>
                      <span className="text-sm font-bold text-gray-900">€ 25,00</span>
                    </div>
                    <div className="text-xs text-gray-500 px-2">
                      135 minuten — Incl. nabehandeling - Lees de voorzorg goed door
                    </div>
                  </div>
                  
                  {/* CTA */}
                  <div className="mt-auto">
                    <div className="h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'hsl(var(--orange))' }}>
                      <span className="text-white font-black text-base">Bekijk afspraken</span>
                    </div>
                  </div>
                </div>
              </div>
            </CarouselItem>

            {/* Mockup 3 - Fitness Trainer */}
            <CarouselItem className="pl-2 md:pl-4 basis-[280px] sm:basis-[320px]">
              <div className="relative w-full h-[520px] sm:h-[580px] rounded-2xl sm:rounded-3xl p-2 shadow-2xl" style={{ backgroundColor: 'hsl(var(--primary))' }}>
                <div className="w-full h-full bg-white rounded-xl sm:rounded-2xl flex flex-col p-4 sm:p-6">
                  {/* Header */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center" style={{ backgroundColor: 'hsl(var(--primary))' }}>
                      <span className="text-white font-black text-lg">💪</span>
                    </div>
                    <div>
                      <h3 className="text-gray-900 font-black text-base">FitCoach Max</h3>
                      <p className="text-gray-600 font-medium text-sm">Personal Training</p>
                    </div>
                  </div>
                  
                  {/* Services */}
                  <div className="space-y-3 mb-6 flex-1">
                    <div className="h-12 rounded-xl flex items-center justify-between px-4" style={{ backgroundColor: 'hsl(var(--primary) / 0.1)' }}>
                      <span className="text-sm font-semibold text-gray-700">1-on-1 Training</span>
                      <span className="text-sm font-bold text-gray-900">€ 65,00</span>
                    </div>
                    <div className="h-12 rounded-xl flex items-center justify-between px-4" style={{ backgroundColor: 'hsl(var(--accent) / 0.1)' }}>
                      <span className="text-sm font-semibold text-gray-700">Group Sessions</span>
                      <span className="text-sm font-bold text-gray-900">€ 25,00</span>
                    </div>
                    <div className="text-xs text-gray-500 px-2">
                      60 minuten — Incl. voeding advies en workout plan
                    </div>
                  </div>
                  
                  {/* CTA */}
                  <div className="mt-auto">
                    <div className="h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'hsl(var(--primary))' }}>
                      <span className="text-white font-black text-base">Start Training</span>
                    </div>
                  </div>
                </div>
              </div>
            </CarouselItem>

            {/* Mockup 4 - Life Coach */}
            <CarouselItem className="pl-2 md:pl-4 basis-[280px] sm:basis-[320px]">
              <div className="relative w-full h-[520px] sm:h-[580px] rounded-2xl sm:rounded-3xl p-2 shadow-2xl" style={{ backgroundColor: 'hsl(var(--accent))' }}>
                <div className="w-full h-full bg-white rounded-xl sm:rounded-2xl flex flex-col p-4 sm:p-6">
                  {/* Header */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center" style={{ backgroundColor: 'hsl(var(--accent))' }}>
                      <span className="text-white font-black text-lg">🧠</span>
                    </div>
                    <div>
                      <h3 className="text-gray-900 font-black text-base">Sarah Wellness</h3>
                      <p className="text-gray-600 font-medium text-sm">Life Coach</p>
                    </div>
                  </div>
                  
                  {/* Services */}
                  <div className="space-y-3 mb-6 flex-1">
                    <div className="h-12 rounded-xl flex items-center justify-between px-4" style={{ backgroundColor: 'hsl(var(--accent) / 0.1)' }}>
                      <span className="text-sm font-semibold text-gray-700">1:1 Coaching</span>
                      <span className="text-sm font-bold text-gray-900">€ 85,00</span>
                    </div>
                    <div className="h-12 rounded-xl flex items-center justify-between px-4" style={{ backgroundColor: 'hsl(var(--primary) / 0.1)' }}>
                      <span className="text-sm font-semibold text-gray-700">Career Guidance</span>
                      <span className="text-sm font-bold text-gray-900">€ 95,00</span>
                    </div>
                    <div className="text-xs text-gray-500 px-2">
                      90 minuten — Inclusief wellness plan en follow-up sessie
                    </div>
                  </div>
                  
                  {/* CTA */}
                  <div className="mt-auto">
                    <div className="h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'hsl(var(--accent))' }}>
                      <span className="text-white font-black text-base">Book Session</span>
                    </div>
                  </div>
                </div>
              </div>
            </CarouselItem>
          </CarouselContent>
          <CarouselPrevious className="hidden sm:flex" />
          <CarouselNext className="hidden sm:flex" />
        </Carousel>
      </div>
    </section>
  );
};