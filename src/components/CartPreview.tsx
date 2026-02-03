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

  // Get first product image for preview
  const firstProduct = products.find(p => p.id === cart[0]?.productId);

  return (
    <div className="fixed bottom-16 left-0 right-0 z-40 px-4 pb-2 safe-bottom animate-slide-up">
      <button 
        onClick={onViewCart}
        className="w-full bg-primary text-primary-foreground rounded-2xl px-4 py-3 shadow-xl flex items-center justify-between active:scale-[0.99] transition-all duration-200 hover:shadow-2xl"
      >
        <div className="flex items-center gap-3">
          {/* Cart Icon with Item Preview */}
          <div className="relative flex items-center">
            <div className="w-10 h-10 rounded-xl bg-primary-foreground/20 flex items-center justify-center overflow-hidden">
              {firstProduct?.image ? (
                <img src={firstProduct.image} alt="" className="w-8 h-8 object-contain" />
              ) : (
                <ShoppingCart className="w-5 h-5" />
              )}
            </div>
            {/* Item count badge */}
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-background text-primary text-[10px] font-bold rounded-full flex items-center justify-center shadow-sm">
              {totalItems}
            </span>
          </div>
          
          <div className="text-left">
            <p className="text-sm font-bold">View cart</p>
            <p className="text-xs opacity-90 flex items-center gap-1">
              {totalItems} item{totalItems > 1 ? 's' : ''}
              {hasFastTrack && (
                <>
                  <span className="mx-1">•</span>
                  <Zap className="w-3 h-3" />
                  Fast Track
                </>
              )}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="text-right">
            <span className="text-lg font-bold">₹{totalPrice.toLocaleString()}</span>
            <p className="text-[10px] opacity-75">TOTAL</p>
          </div>
          <div className="w-8 h-8 rounded-full bg-primary-foreground/20 flex items-center justify-center">
            <ChevronRight className="w-5 h-5" />
          </div>
        </div>
      </button>
    </div>
  );
}
