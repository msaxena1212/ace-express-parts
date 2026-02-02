import { ShoppingCart, ChevronRight, Zap } from 'lucide-react';
import { Product } from '@/data/mockData';

interface CartItem {
  productId: string;
  quantity: number;
}

interface CartPreviewProps {
  cart: CartItem[];
  products: Product[];
  onViewCart: () => void;
}

export function CartPreview({ cart, products, onViewCart }: CartPreviewProps) {
  if (cart.length === 0) return null;

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cart.reduce((sum, item) => {
    const product = products.find(p => p.id === item.productId);
    return sum + (product?.price || 0) * item.quantity;
  }, 0);

  const hasFastTrack = cart.some(item => {
    const product = products.find(p => p.id === item.productId);
    return product?.isFastTrack;
  });

  return (
    <div className="fixed bottom-16 left-0 right-0 z-40 px-4 pb-2 safe-bottom animate-slide-up">
      <button 
        onClick={onViewCart}
        className="w-full bg-gradient-ace text-primary-foreground rounded-2xl p-4 shadow-ace-lg glow-orange flex items-center justify-between active:scale-[0.99] transition-transform"
      >
        <div className="flex items-center gap-3">
          <div className="relative">
            <ShoppingCart className="w-6 h-6" />
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-background text-primary text-[10px] font-bold rounded-full flex items-center justify-center">
              {totalItems}
            </span>
          </div>
          <div className="text-left">
            <p className="text-sm font-semibold">{totalItems} item{totalItems > 1 ? 's' : ''}</p>
            {hasFastTrack && (
              <p className="text-xs opacity-90 flex items-center gap-1">
                <Zap className="w-3 h-3" />
                Fast Track Available
              </p>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold">₹{totalPrice.toLocaleString()}</span>
          <ChevronRight className="w-5 h-5" />
        </div>
      </button>
    </div>
  );
}
