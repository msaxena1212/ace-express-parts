import { ChevronRight, Zap, Shield, Clock } from 'lucide-react';
import { Button } from './ui/button';

interface HeroSectionProps {
  onExploreClick: () => void;
}

export function HeroSection({ onExploreClick }: HeroSectionProps) {
  return (
    <section className="relative overflow-hidden">
      {/* Hero Background Image */}
      <div className="relative h-48 md:h-64">
        <img 
          src="/images/hero-cranes.png" 
          alt="ACE Heavy Equipment"
          className="w-full h-full object-cover"
        />
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-foreground/80 via-foreground/50 to-transparent" />
        
        {/* Hero Content */}
        <div className="absolute inset-0 flex flex-col justify-center px-5">
          <div className="max-w-[65%]">
            <span className="inline-block px-2 py-0.5 bg-primary/90 text-primary-foreground text-[10px] font-bold rounded-full mb-2">
              GENUINE PARTS
            </span>
            <h1 className="text-xl md:text-2xl font-bold leading-tight mb-2">
              <span className="text-primary">ACE</span>
              <span style={{ color: '#FFFFFF' }}> GENUINE PARTS</span>
            </h1>
            <p className="text-xs text-white/80 mb-3 leading-relaxed">
              Original equipment parts for peak performance
            </p>
            <Button 
              size="sm"
              className="bg-primary hover:bg-primary/90 text-primary-foreground h-8 px-4 text-xs font-semibold"
              onClick={onExploreClick}
            >
              Explore Parts
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      </div>

      {/* USP Strip */}
      <div className="bg-primary/10 border-y border-primary/20">
        <div className="flex justify-around py-3 px-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center">
              <Zap className="w-3.5 h-3.5 text-primary" />
            </div>
            <div>
              <p className="text-[10px] font-semibold text-foreground">Fast Track</p>
              <p className="text-[9px] text-muted-foreground">2-4 hrs delivery</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center">
              <Shield className="w-3.5 h-3.5 text-primary" />
            </div>
            <div>
              <p className="text-[10px] font-semibold text-foreground">100% Genuine</p>
              <p className="text-[9px] text-muted-foreground">OEM certified</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center">
              <Clock className="w-3.5 h-3.5 text-primary" />
            </div>
            <div>
              <p className="text-[10px] font-semibold text-foreground">24/7 Support</p>
              <p className="text-[9px] text-muted-foreground">Always ready</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
