import { Offer } from '@/data/mockData';
import { ChevronRight, Truck, Shield, Headphones, CreditCard } from 'lucide-react';
import { useState, useEffect } from 'react';

interface OfferBannerProps {
  offers: Offer[];
}

const features = [
  { icon: Truck, label: 'Fast Track Delivery', sublabel: 'Swift, Secure, Reliable' },
  { icon: Shield, label: '100% Secure Payment', sublabel: 'Guaranteed secure' },
  { icon: Headphones, label: 'Dedicated Support', sublabel: 'Anywhere & Anytime' },
  { icon: CreditCard, label: 'Pay As You Want', sublabel: 'Making payments simple' },
];

export function OfferBanner({ offers }: OfferBannerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % offers.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [offers.length]);

  return (
    <section className="px-4 py-3">
      {/* Promotional Banner */}
      <div className="relative overflow-hidden rounded-2xl mb-4">
        <div 
          className="flex transition-transform duration-500 ease-out"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {offers.map((offer) => (
            <div
              key={offer.id}
              className={`flex-shrink-0 w-full ${offer.bgColor} p-5 rounded-2xl cursor-pointer`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-lg font-bold text-primary-foreground">{offer.title}</p>
                  <p className="text-sm text-primary-foreground/80 mt-1">{offer.subtitle}</p>
                  <div className="mt-3">
                    <span className="inline-block bg-background/20 backdrop-blur px-3 py-1.5 rounded-lg text-sm font-bold text-primary-foreground">
                      {offer.discount}
                    </span>
                  </div>
                </div>
                <ChevronRight className="w-6 h-6 text-primary-foreground/60" />
              </div>
            </div>
          ))}
        </div>
        
        {/* Dots indicator */}
        <div className="flex justify-center gap-1.5 mt-3">
          {offers.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`h-1.5 rounded-full transition-all ${
                index === currentIndex 
                  ? 'bg-primary w-6' 
                  : 'bg-muted-foreground/30 w-1.5'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Feature Cards - ACE Style */}
      <div className="grid grid-cols-2 gap-2">
        {features.map((feature, index) => (
          <div
            key={index}
            className="bg-card border border-border rounded-xl p-3 flex items-start gap-3"
          >
            <div className="w-8 h-8 rounded-lg bg-orange-subtle flex items-center justify-center flex-shrink-0">
              <feature.icon className="w-4 h-4 text-primary" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-foreground leading-tight">{feature.label}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">{feature.sublabel}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
