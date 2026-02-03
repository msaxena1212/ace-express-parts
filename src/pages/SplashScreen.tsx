import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import aceIcon from '@/assets/ace-icon.png';
import splashBg from '@/assets/splash-bg.png';
import aceLogoBlack from '@/assets/ace-logo-black.png';

export default function SplashScreen() {
  const navigate = useNavigate();
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 400),
      setTimeout(() => setPhase(2), 900),
      setTimeout(() => setPhase(3), 1400),
      setTimeout(() => {
        navigate('/', { replace: true });
      }, 2800),
    ];

    return () => {
      timers.forEach(clearTimeout);
    };
  }, [navigate]);

  return (
    <div className="fixed inset-0 bg-background flex flex-col items-center justify-center overflow-hidden">
      {/* Background Image - Sky/Clouds */}
      <div className="absolute inset-0">
        <img 
          src={splashBg} 
          alt="" 
          className="w-full h-full object-cover object-top"
        />
        {/* Gradient overlay for smooth transition */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/30 to-background" />
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center px-8">
        {/* ACE Icon Logo with Animation */}
        <div 
          className={`relative transition-all duration-700 ${
            phase >= 0 ? 'scale-100 opacity-100' : 'scale-50 opacity-0'
          }`}
        >
          {/* Glow Effect */}
          <div 
            className={`absolute -inset-6 bg-primary/20 rounded-full blur-2xl transition-opacity duration-1000 ${
              phase >= 1 ? 'opacity-100' : 'opacity-0'
            }`}
          />
          
          {/* ACE Icon */}
          <img 
            src={aceIcon} 
            alt="ACE" 
            className="relative h-20 md:h-24 w-auto drop-shadow-xl"
          />
        </div>

        {/* Full Logo Text - Appears after icon */}
        <div 
          className={`mt-6 transition-all duration-700 ${
            phase >= 1 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
        >
          <h1 className="text-2xl md:text-3xl font-bold tracking-wide">
            <span className="text-primary">ACE</span>
            <span className="text-foreground ml-2">GENUINE</span>
            <span className="text-foreground ml-2">PARTS</span>
          </h1>
        </div>

        {/* Tagline */}
        <div 
          className={`mt-4 text-center transition-all duration-700 delay-100 ${
            phase >= 2 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
        >
          <p className="text-foreground/70 text-sm tracking-widest font-medium">OEM QUALITY • GUARANTEED</p>
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
              className="px-4 py-2 bg-primary text-primary-foreground text-xs font-bold rounded-full shadow-lg transition-all duration-500"
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
        <div className="h-1.5 bg-foreground/10 rounded-full overflow-hidden shadow-inner">
          <div 
            className="h-full bg-primary rounded-full transition-all duration-[2500ms] ease-out"
            style={{ width: phase >= 3 ? '100%' : phase >= 2 ? '65%' : phase >= 1 ? '30%' : '0%' }}
          />
        </div>
        <p className="text-center text-foreground/50 text-xs mt-3">Loading your experience...</p>
      </div>

      {/* Footer */}
      <p 
        className={`absolute bottom-8 text-xs text-foreground/40 transition-all duration-700 delay-500 ${
          phase >= 2 ? 'opacity-100' : 'opacity-0'
        }`}
      >
        Powered by <span className="text-primary font-bold">ACE</span>
      </p>
    </div>
  );
}
