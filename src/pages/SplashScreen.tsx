import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import aceLogo from '@/assets/ace-logo.png';

export default function SplashScreen() {
  const navigate = useNavigate();
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 400),
      setTimeout(() => setPhase(2), 800),
      setTimeout(() => setPhase(3), 1200),
      setTimeout(() => {
        navigate('/', { replace: true });
      }, 2500),
    ];

    return () => timers.forEach(clearTimeout);
  }, [navigate]);

  return (
    <div className="fixed inset-0 bg-background flex flex-col items-center justify-center overflow-hidden">
      {/* Animated Background Gradient */}
      <div 
        className="absolute inset-0 transition-all duration-1000"
        style={{
          background: phase >= 1 
            ? 'linear-gradient(135deg, hsl(32 100% 50% / 0.08) 0%, transparent 50%, hsl(32 100% 50% / 0.05) 100%)'
            : 'transparent'
        }}
      />

      {/* Decorative Circles */}
      <div className="absolute inset-0 overflow-hidden">
        <div 
          className={`absolute -top-20 -left-20 w-60 h-60 rounded-full bg-primary/5 transition-all duration-1000 ${
            phase >= 1 ? 'scale-100 opacity-100' : 'scale-0 opacity-0'
          }`} 
        />
        <div 
          className={`absolute -bottom-32 -right-32 w-80 h-80 rounded-full bg-primary/5 transition-all duration-1000 delay-200 ${
            phase >= 1 ? 'scale-100 opacity-100' : 'scale-0 opacity-0'
          }`} 
        />
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center">
        {/* Logo Container with Glow */}
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
          
          {/* Logo */}
          <div className="relative bg-background rounded-2xl p-4 shadow-xl">
            <img 
              src={aceLogo} 
              alt="ACE" 
              className="h-16 w-auto"
            />
          </div>
        </div>

        {/* Brand Name */}
        <div 
          className={`mt-6 flex flex-col items-center transition-all duration-700 delay-100 ${
            phase >= 1 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
        >
          <span className="text-primary font-extrabold text-2xl tracking-tight">GENUINE PARTS</span>
          <span className="text-muted-foreground text-sm mt-1">OEM Quality • Guaranteed</span>
        </div>

        {/* Feature Pills - Blinkit style animated entrance */}
        <div 
          className={`mt-8 flex flex-wrap justify-center gap-2 max-w-xs transition-all duration-700 delay-300 ${
            phase >= 2 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
        >
          {[
            { icon: '⚡', label: 'Fast Track Delivery', delay: 0 },
            { icon: '✓', label: 'OEM Certified', delay: 100 },
            { icon: '🛡️', label: '100% Warranty', delay: 200 },
          ].map((feature, i) => (
            <span 
              key={i}
              className={`px-4 py-2 bg-primary/10 text-primary text-xs font-semibold rounded-full transition-all duration-500`}
              style={{ 
                transitionDelay: `${feature.delay + 300}ms`,
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
      <div className="absolute bottom-28 left-1/2 -translate-x-1/2 w-40">
        <div className="h-1 bg-muted rounded-full overflow-hidden">
          <div 
            className="h-full bg-primary rounded-full transition-all duration-2000 ease-out"
            style={{ width: phase >= 3 ? '100%' : phase >= 2 ? '70%' : phase >= 1 ? '30%' : '0%' }}
          />
        </div>
      </div>

      {/* Footer */}
      <p 
        className={`absolute bottom-8 text-xs text-muted-foreground transition-all duration-700 delay-500 ${
          phase >= 2 ? 'opacity-100' : 'opacity-0'
        }`}
      >
        Powered by <span className="text-primary font-bold">ACE</span>
      </p>
    </div>
  );
}
