import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
export const Hero = () => {
  return <section className="relative min-h-screen flex items-center justify-center overflow-hidden px-4 py-8 bg-gray-900">
      <div className="w-full max-w-2xl mx-auto text-center space-y-6">
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-white leading-tight tracking-tight text-left">
          Turn Your Booking Link into a{' '}
          <span className="text-orange-500" style={{
          color: 'hsl(var(--orange-accent))'
        }}>
            Real Website
          </span>
          .
        </h1>
        
        <h2 className="text-lg sm:text-xl md:text-2xl text-gray-300 leading-relaxed max-w-xl mx-auto font-medium text-left">
          Bookr wraps your existing booking link in a professional, customizable template — giving you an online presence that builds trust and gets more bookings.
        </h2>
        
        <p className="text-sm sm:text-base text-gray-400 max-w-lg mx-auto text-left">
          Perfect for salons, trainers, coaches, and service providers who want to look like a brand, not just a link.
        </p>
        
        <div className="space-y-4 max-w-sm mx-auto pt-6">
          <input type="text" placeholder="bookr.io/yourname" className="w-full px-5 py-4 rounded-xl border-2 border-gray-700 bg-gray-800 text-white placeholder-gray-400 text-base font-medium focus:outline-none transition-colors" style={{
          borderColor: 'rgb(55 65 81)'
        }} />
          <Button asChild size="lg" className="w-full text-base font-bold px-6 py-4 rounded-xl text-white border-0 transition-all hover:scale-105" style={{
          backgroundColor: 'hsl(var(--orange-accent))'
        }}>
            <Link to="/login">
              Claim Your Bookr Page
            </Link>
          </Button>
        </div>
      </div>
    </section>;
};