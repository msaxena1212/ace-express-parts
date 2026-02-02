import { Offer } from '@/data/mockData';
import { ChevronRight, Clock } from 'lucide-react';
import { useState, useEffect } from 'react';

interface OfferBannerProps {
  offers: Offer[];
}

export function OfferBanner({ offers }: OfferBannerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % offers.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [offers.length]);

  return (
    <section className="px-4 py-2">
      <div className="relative overflow-hidden rounded-lg">
        <div 
          className="flex transition-transform duration-500 ease-out"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {offers.map((offer) => (
            <div
              key={offer.id}
              className={`flex-shrink-0 w-full ${offer.bgColor} text-primary-foreground p-4 rounded-lg cursor-pointer`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-h4 font-bold">{offer.title}</p>
                  <p className="text-body-sm opacity-90">{offer.subtitle}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="bg-white/20 px-2 py-1 rounded text-body-sm font-bold">
                      {offer.discount}
                    </span>
                    <span className="flex items-center gap-1 text-body-sm opacity-80">
                      <Clock className="w-3 h-3" />
                      Valid till {new Date(offer.validUntil).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <ChevronRight className="w-6 h-6 opacity-60" />
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
              className={`w-2 h-2 rounded-full transition-all ${
                index === currentIndex 
                  ? 'bg-primary w-4' 
                  : 'bg-muted-foreground/30'
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
