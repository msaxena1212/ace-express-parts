import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import aceLogo from '@/assets/ace-logo.png';
import { supabase } from '@/integrations/supabase/client';

export default function SplashScreen() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [showTagline, setShowTagline] = useState(false);

  useEffect(() => {
    // Show tagline after logo animation
    const taglineTimer = setTimeout(() => setShowTagline(true), 500);

    // Check authentication status
    const checkAuth = async () => {
      await new Promise(resolve => setTimeout(resolve, 3000)); // Minimum 3 sec display
      
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        // Check if profile is complete
        const { data: profile } = await supabase
          .from('profiles')
          .select('is_profile_complete')
          .eq('user_id', session.user.id)
          .single();
        
        if (profile?.is_profile_complete) {
          navigate('/', { replace: true });
        } else {
          navigate('/auth/profile-setup', { replace: true });
        }
      } else {
        navigate('/auth', { replace: true });
      }
    };

    checkAuth();

    return () => clearTimeout(taglineTimer);
  }, [navigate]);

  return (
    <div className="fixed inset-0 bg-background flex flex-col items-center justify-center">
      {/* Animated Logo */}
      <div className="animate-fade-in flex flex-col items-center">
        <img 
          src={aceLogo} 
          alt="ACE" 
          className="h-20 w-auto mb-2"
        />
        <span className="text-primary font-bold text-xl tracking-wider">GENUINE PARTS</span>
      </div>

      {/* Tagline */}
      <p 
        className={`mt-6 text-muted-foreground text-center text-sm transition-opacity duration-500 ${
          showTagline ? 'opacity-100' : 'opacity-0'
        }`}
      >
        Genuine Parts. Fast. Reliable. Secure.
      </p>

      {/* Loading Spinner */}
      <div className="mt-12">
        <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
      </div>

      {/* Footer */}
      <p className="absolute bottom-8 text-xs text-muted-foreground">
        Powered by ACE
      </p>
    </div>
  );
}
