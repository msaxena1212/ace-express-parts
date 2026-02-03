import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

export const CTASection = () => {
  const navigate = useNavigate();

  return (
    <section className="mx-4 my-8 rounded-2xl bg-gradient-ace overflow-hidden">
      <div className="px-6 py-10 text-center">
        <h2 className="text-2xl font-bold text-white mb-3">
          Ready to Get Started?
        </h2>
        <p className="text-white/90 text-sm mb-6 max-w-xs mx-auto">
          Browse our extensive catalog of genuine ACE parts and experience fast, reliable delivery.
        </p>
        <div className="flex gap-3 justify-center">
          <Button 
            onClick={() => navigate('/categories')}
            className="bg-foreground text-background hover:bg-foreground/90 rounded-full px-6"
          >
            Shop Now
          </Button>
          <Button 
            variant="outline"
            onClick={() => navigate('/account')}
            className="bg-white text-foreground hover:bg-white/90 border-white rounded-full px-6"
          >
            Create Account
          </Button>
        </div>
      </div>
    </section>
  );
};
