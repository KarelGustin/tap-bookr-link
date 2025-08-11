import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
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
          
          <div className="space-y-4 w-full max-w-md pt-4 sm:pt-8">
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
        
        {/* Right Content - iPhone Mockup Marquee */}
        <div className="flex-1 flex justify-center items-center mt-8 lg:mt-0 w-full overflow-hidden">
          <div className="relative w-full max-w-lg lg:max-w-2xl">
            {/* Marquee Container */}
            <div className="flex animate-marquee space-x-6">
              {/* iPhone Mockup 1 - Salon */}
              <div className="flex-shrink-0 relative w-64 h-[500px] sm:w-72 sm:h-[550px] rounded-2xl sm:rounded-3xl p-1.5 sm:p-2 shadow-2xl" style={{ backgroundColor: 'hsl(var(--accent))' }}>
                <div className="w-full h-full bg-white rounded-xl sm:rounded-2xl flex flex-col p-4 sm:p-6">
                  {/* Header */}
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center" style={{ backgroundColor: 'hsl(var(--pink))' }}>
                      <span className="text-white font-black text-lg sm:text-xl">✂️</span>
                    </div>
                    <div>
                      <h3 className="text-gray-900 font-black text-sm sm:text-base">Bella Salon</h3>
                      <p className="text-gray-600 font-medium text-xs sm:text-sm">Hair & Beauty</p>
                    </div>
                  </div>
                  
                  {/* Services */}
                  <div className="space-y-3 mb-6">
                    <div className="h-8 sm:h-10 rounded-xl flex items-center px-3" style={{ backgroundColor: 'hsl(var(--pink) / 0.1)' }}>
                      <span className="text-xs sm:text-sm font-semibold text-gray-700">Haircuts & Styling</span>
                    </div>
                    <div className="h-8 sm:h-10 rounded-xl flex items-center px-3" style={{ backgroundColor: 'hsl(var(--accent) / 0.1)' }}>
                      <span className="text-xs sm:text-sm font-semibold text-gray-700">Color & Highlights</span>
                    </div>
                    <div className="h-8 sm:h-10 rounded-xl flex items-center px-3" style={{ backgroundColor: 'hsl(var(--primary) / 0.1)' }}>
                      <span className="text-xs sm:text-sm font-semibold text-gray-700">Facial Treatments</span>
                    </div>
                  </div>
                  
                  {/* CTA */}
                  <div className="mt-auto">
                    <div className="h-10 sm:h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'hsl(var(--pink))' }}>
                      <span className="text-white font-black text-sm sm:text-base">Book Appointment</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* iPhone Mockup 2 - Fitness Trainer */}
              <div className="flex-shrink-0 relative w-64 h-[500px] sm:w-72 sm:h-[550px] rounded-2xl sm:rounded-3xl p-1.5 sm:p-2 shadow-2xl" style={{ backgroundColor: 'hsl(var(--orange))' }}>
                <div className="w-full h-full bg-white rounded-xl sm:rounded-2xl flex flex-col p-4 sm:p-6">
                  {/* Header */}
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center" style={{ backgroundColor: 'hsl(var(--orange))' }}>
                      <span className="text-white font-black text-lg sm:text-xl">💪</span>
                    </div>
                    <div>
                      <h3 className="text-gray-900 font-black text-sm sm:text-base">FitCoach Mike</h3>
                      <p className="text-gray-600 font-medium text-xs sm:text-sm">Personal Training</p>
                    </div>
                  </div>
                  
                  {/* Services */}
                  <div className="space-y-3 mb-6">
                    <div className="h-8 sm:h-10 rounded-xl flex items-center px-3" style={{ backgroundColor: 'hsl(var(--orange) / 0.1)' }}>
                      <span className="text-xs sm:text-sm font-semibold text-gray-700">1-on-1 Training</span>
                    </div>
                    <div className="h-8 sm:h-10 rounded-xl flex items-center px-3" style={{ backgroundColor: 'hsl(var(--secondary) / 0.1)' }}>
                      <span className="text-xs sm:text-sm font-semibold text-gray-700">Group Classes</span>
                    </div>
                    <div className="h-8 sm:h-10 rounded-xl flex items-center px-3" style={{ backgroundColor: 'hsl(var(--accent) / 0.1)' }}>
                      <span className="text-xs sm:text-sm font-semibold text-gray-700">Nutrition Coaching</span>
                    </div>
                  </div>
                  
                  {/* CTA */}
                  <div className="mt-auto">
                    <div className="h-10 sm:h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'hsl(var(--orange))' }}>
                      <span className="text-white font-black text-sm sm:text-base">Start Training</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* iPhone Mockup 3 - Life Coach */}
              <div className="flex-shrink-0 relative w-64 h-[500px] sm:w-72 sm:h-[550px] rounded-2xl sm:rounded-3xl p-1.5 sm:p-2 shadow-2xl" style={{ backgroundColor: 'hsl(var(--primary))' }}>
                <div className="w-full h-full bg-white rounded-xl sm:rounded-2xl flex flex-col p-4 sm:p-6">
                  {/* Header */}
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center" style={{ backgroundColor: 'hsl(var(--primary))' }}>
                      <span className="text-white font-black text-lg sm:text-xl">🧠</span>
                    </div>
                    <div>
                      <h3 className="text-gray-900 font-black text-sm sm:text-base">Sarah Wellness</h3>
                      <p className="text-gray-600 font-medium text-xs sm:text-sm">Life Coach</p>
                    </div>
                  </div>
                  
                  {/* Services */}
                  <div className="space-y-3 mb-6">
                    <div className="h-8 sm:h-10 rounded-xl flex items-center px-3" style={{ backgroundColor: 'hsl(var(--primary) / 0.1)' }}>
                      <span className="text-xs sm:text-sm font-semibold text-gray-700">1:1 Coaching</span>
                    </div>
                    <div className="h-8 sm:h-10 rounded-xl flex items-center px-3" style={{ backgroundColor: 'hsl(var(--accent) / 0.1)' }}>
                      <span className="text-xs sm:text-sm font-semibold text-gray-700">Career Guidance</span>
                    </div>
                    <div className="h-8 sm:h-10 rounded-xl flex items-center px-3" style={{ backgroundColor: 'hsl(var(--secondary) / 0.1)' }}>
                      <span className="text-xs sm:text-sm font-semibold text-gray-700">Wellness Plans</span>
                    </div>
                  </div>
                  
                  {/* CTA */}
                  <div className="mt-auto">
                    <div className="h-10 sm:h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'hsl(var(--primary))' }}>
                      <span className="text-white font-black text-sm sm:text-base">Book Session</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Duplicate for seamless loop */}
              <div className="flex-shrink-0 relative w-64 h-[500px] sm:w-72 sm:h-[550px] rounded-2xl sm:rounded-3xl p-1.5 sm:p-2 shadow-2xl" style={{ backgroundColor: 'hsl(var(--accent))' }}>
                <div className="w-full h-full bg-white rounded-xl sm:rounded-2xl flex flex-col p-4 sm:p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center" style={{ backgroundColor: 'hsl(var(--pink))' }}>
                      <span className="text-white font-black text-lg sm:text-xl">✂️</span>
                    </div>
                    <div>
                      <h3 className="text-gray-900 font-black text-sm sm:text-base">Bella Salon</h3>
                      <p className="text-gray-600 font-medium text-xs sm:text-sm">Hair & Beauty</p>
                    </div>
                  </div>
                  <div className="space-y-3 mb-6">
                    <div className="h-8 sm:h-10 rounded-xl flex items-center px-3" style={{ backgroundColor: 'hsl(var(--pink) / 0.1)' }}>
                      <span className="text-xs sm:text-sm font-semibold text-gray-700">Haircuts & Styling</span>
                    </div>
                    <div className="h-8 sm:h-10 rounded-xl flex items-center px-3" style={{ backgroundColor: 'hsl(var(--accent) / 0.1)' }}>
                      <span className="text-xs sm:text-sm font-semibold text-gray-700">Color & Highlights</span>
                    </div>
                    <div className="h-8 sm:h-10 rounded-xl flex items-center px-3" style={{ backgroundColor: 'hsl(var(--primary) / 0.1)' }}>
                      <span className="text-xs sm:text-sm font-semibold text-gray-700">Facial Treatments</span>
                    </div>
                  </div>
                  <div className="mt-auto">
                    <div className="h-10 sm:h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'hsl(var(--pink))' }}>
                      <span className="text-white font-black text-sm sm:text-base">Book Appointment</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};