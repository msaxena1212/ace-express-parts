import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import aceLogoBlack from '@/assets/ace-logo-black.png';

const heroImages = [
  '/images/hero-cranes.png',
  '/images/equipment/crawler-cranes.png',
  '/images/equipment/tower-cranes.png',
];

export default function SplashScreen() {
  const navigate = useNavigate();
  const [phase, setPhase] = useState(0);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 400),
      setTimeout(() => setPhase(2), 800),
      setTimeout(() => setPhase(3), 1200),
      setTimeout(() => {
        navigate('/', { replace: true });
      }, 2800),
    ];

    // Image carousel
    const imageInterval = setInterval(() => {
      setCurrentImageIndex(prev => (prev + 1) % heroImages.length);
    }, 900);

    return () => {
      timers.forEach(clearTimeout);
      clearInterval(imageInterval);
    };
  }, [navigate]);

  return (
    <div className="fixed inset-0 bg-foreground flex flex-col items-center justify-center overflow-hidden">
      {/* Hero Background Images - Carousel */}
      <div className="absolute inset-0">
        {heroImages.map((img, index) => (
          <div
            key={img}
            className="absolute inset-0 transition-opacity duration-700"
            style={{ opacity: currentImageIndex === index ? 0.3 : 0 }}
          >
            <img 
              src={img} 
              alt="" 
              className="w-full h-full object-cover"
            />
          </div>
        ))}
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-foreground/60 via-foreground/80 to-foreground" />
      </div>

      {/* Animated particles */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className={`absolute w-2 h-2 rounded-full bg-primary/30 transition-all duration-1000 ${
              phase >= 1 ? 'opacity-100' : 'opacity-0'
            }`}
            style={{
              left: `${15 + i * 15}%`,
              top: `${20 + (i % 3) * 25}%`,
              animationDelay: `${i * 200}ms`,
              animation: phase >= 1 ? 'pulse 2s infinite' : 'none',
            }}
          />
        ))}
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center px-8">
        {/* Logo with glow */}
        <div 
          className={`relative transition-all duration-700 ${
            phase >= 0 ? 'scale-100 opacity-100' : 'scale-75 opacity-0'
          }`}
        >
          {/* Glow Effect */}
          <div 
            className={`absolute -inset-8 bg-primary/30 rounded-full blur-3xl transition-opacity duration-1000 ${
              phase >= 1 ? 'opacity-100' : 'opacity-0'
            }`}
          />
          
          {/* Logo */}
          <img 
            src={aceLogoBlack} 
            alt="ACE Genuine Parts" 
            className="relative h-14 md:h-20 w-auto drop-shadow-2xl"
            style={{ filter: 'brightness(0) invert(1)' }}
          />
        </div>

        {/* Tagline */}
        <div 
          className={`mt-6 text-center transition-all duration-700 delay-100 ${
            phase >= 1 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
        >
          <p className="text-background/80 text-sm tracking-widest">OEM QUALITY • GUARANTEED</p>
        </div>

        {/* Feature Pills */}
        <div 
          className={`mt-8 flex flex-wrap justify-center gap-2 max-w-sm transition-all duration-700 delay-300 ${
            phase >= 2 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
        >
          {[
            { icon: '⚡', label: 'Fast Track' },
            { icon: '✓', label: 'OEM Certified' },
            { icon: '🛡️', label: '100% Warranty' },
          ].map((feature, i) => (
            <span 
              key={i}
              className="px-4 py-2 bg-primary text-primary-foreground text-xs font-bold rounded-full transition-all duration-500"
              style={{ 
                transitionDelay: `${i * 100 + 300}ms`,
                opacity: phase >= 2 ? 1 : 0,
                transform: phase >= 2 ? 'scale(1)' : 'scale(0.8)',
              }}
            >
              {feature.icon} {feature.label}
            </span>
          ))}
        </div>
      </div>

      {/* Loading Progress Bar */}
      <div className="absolute bottom-24 left-1/2 -translate-x-1/2 w-48">
        <div className="h-1.5 bg-background/20 rounded-full overflow-hidden">
          <div 
            className="h-full bg-primary rounded-full transition-all duration-[2500ms] ease-out"
            style={{ width: phase >= 3 ? '100%' : phase >= 2 ? '65%' : phase >= 1 ? '30%' : '0%' }}
          />
        </div>
        <p className="text-center text-background/50 text-xs mt-3">Loading your experience...</p>
      </div>

      {/* Footer */}
      <p 
        className={`absolute bottom-8 text-xs text-background/40 transition-all duration-700 delay-500 ${
          phase >= 2 ? 'opacity-100' : 'opacity-0'
        }`}
      >
        Powered by <span className="text-primary font-bold">ACE</span>
      </p>
    </div>
  );
}
