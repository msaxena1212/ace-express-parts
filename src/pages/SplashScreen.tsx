import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import aceLogo from '@/assets/ace-logo.png';

export default function SplashScreen() {
  const navigate = useNavigate();
  const [showTagline, setShowTagline] = useState(false);
  const [showFeatures, setShowFeatures] = useState(false);

  useEffect(() => {
    // Show tagline after logo animation
    const taglineTimer = setTimeout(() => setShowTagline(true), 600);
    const featuresTimer = setTimeout(() => setShowFeatures(true), 1000);

    // Navigate to home after splash
    const navTimer = setTimeout(() => {
      navigate('/', { replace: true });
    }, 3000);

    return () => {
      clearTimeout(taglineTimer);
      clearTimeout(featuresTimer);
      clearTimeout(navTimer);
    };
  }, [navigate]);

  return (
    <div className="fixed inset-0 bg-gradient-to-b from-background via-background to-primary/5 flex flex-col items-center justify-center overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-[0.03]">
        <div className="absolute top-20 left-10 w-32 h-32 border-2 border-primary rounded-full" />
        <div className="absolute bottom-32 right-10 w-24 h-24 border-2 border-primary rounded-full" />
        <div className="absolute top-1/3 right-20 w-16 h-16 border-2 border-primary rotate-45" />
      </div>

      {/* Hero Equipment Image - Background */}
      <div className="absolute bottom-0 left-0 right-0 h-1/3 opacity-10">
        <img 
          src="/images/hero-crane.png" 
          alt="" 
          className="w-full h-full object-contain object-bottom"
        />
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center">
        {/* Animated Logo */}
        <div className="animate-fade-in flex flex-col items-center">
          <div className="relative">
            <div className="absolute -inset-4 bg-primary/10 rounded-full blur-xl animate-pulse" />
            <img 
              src={aceLogo} 
              alt="ACE" 
              className="h-20 w-auto relative z-10"
            />
          </div>
          <span className="text-primary font-bold text-xl tracking-wider mt-3">GENUINE PARTS</span>
        </div>

        {/* Tagline */}
        <p 
          className={`mt-6 text-muted-foreground text-center text-sm transition-all duration-700 ${
            showTagline ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
        >
          Genuine Parts. Fast. Reliable. Secure.
        </p>

        {/* Feature Pills */}
        <div 
          className={`mt-8 flex gap-2 transition-all duration-700 delay-200 ${
            showFeatures ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
        >
          <span className="px-3 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full">
            ⚡ Fast Track
          </span>
          <span className="px-3 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full">
            ✓ OEM Certified
          </span>
          <span className="px-3 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full">
            🛡️ Warranty
          </span>
        </div>
      </div>

      {/* Loading Spinner */}
      <div className="absolute bottom-32">
        <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
      </div>

      {/* Footer */}
      <p className="absolute bottom-8 text-xs text-muted-foreground">
        Powered by <span className="text-primary font-semibold">ACE</span>
      </p>
    </div>
  );
}
