import { Product } from '@/data/mockData';
import { Button } from './ui/button';
import { Plus, Minus, Zap, Clock } from 'lucide-react';
import { useState } from 'react';

interface ProductCardProps {
  product: Product;
  cartQuantity: number;
  onAddToCart: (productId: string) => void;
  onRemoveFromCart: (productId: string) => void;
}

export function ProductCard({ product, cartQuantity, onAddToCart, onRemoveFromCart }: ProductCardProps) {
  const [isAdding, setIsAdding] = useState(false);
  
  const handleAdd = () => {
    setIsAdding(true);
    onAddToCart(product.id);
    setTimeout(() => setIsAdding(false), 300);
  };

  const discountPercent = product.originalPrice 
    ? Math.round((1 - product.price / product.originalPrice) * 100)
    : null;

  return (
    <div className={`bg-card border border-border rounded-xl overflow-hidden flex flex-col transition-all hover:border-primary/50 ${isAdding ? 'animate-pop' : ''}`}>
      {/* Product Image */}
      <div className="relative aspect-square bg-muted p-3">
        <img 
          src={product.image} 
          alt={product.name}
          className="w-full h-full object-contain"
        />
        
        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {product.isFastTrack && (
            <span className="flex items-center gap-1 bg-primary text-primary-foreground text-[10px] font-bold px-2 py-0.5 rounded-md">
              <Zap className="w-3 h-3" />
              FAST
            </span>
          )}
          {discountPercent && (
            <span className="bg-success text-success-foreground text-[10px] font-bold px-2 py-0.5 rounded-md">
              {discountPercent}% OFF
            </span>
          )}
        </div>
        
        {!product.inStock && (
          <div className="absolute inset-0 bg-background/70 flex items-center justify-center">
            <span className="bg-card border border-border px-3 py-1.5 rounded-lg text-xs font-medium text-muted-foreground">
              Out of Stock
            </span>
          </div>
        )}
      </div>
      
      {/* Product Info */}
      <div className="flex-1 p-3 flex flex-col">
        <p className="text-[10px] text-primary font-mono mb-1">{product.partNumber}</p>
        <h3 className="text-sm font-medium line-clamp-2 mb-2 text-foreground">{product.name}</h3>
        
        {/* Delivery Time */}
        <div className="flex items-center gap-1 text-xs text-muted-foreground mb-3">
          <Clock className="w-3 h-3" />
          <span>{product.deliveryTime}</span>
        </div>
        
        {/* Price & Add Button */}
        <div className="mt-auto flex items-end justify-between">
          <div>
            <p className="text-base font-bold text-foreground">₹{product.price.toLocaleString()}</p>
            {product.originalPrice && (
              <p className="text-xs text-muted-foreground line-through">
                ₹{product.originalPrice.toLocaleString()}
              </p>
            )}
          </div>
          
          {product.inStock && (
            cartQuantity > 0 ? (
              <div className="flex items-center gap-1 bg-primary rounded-lg overflow-hidden">
                <Button 
                  variant="ghost" 
                  size="cart-mini"
                  className="text-primary-foreground hover:bg-primary-foreground/20 rounded-none"
                  onClick={() => onRemoveFromCart(product.id)}
                >
                  <Minus className="w-4 h-4" />
                </Button>
                <span className="text-primary-foreground font-bold text-sm min-w-[20px] text-center">
                  {cartQuantity}
                </span>
                <Button 
                  variant="ghost" 
                  size="cart-mini"
                  className="text-primary-foreground hover:bg-primary-foreground/20 rounded-none"
                  onClick={handleAdd}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <Button 
                variant="ace" 
                size="sm"
                onClick={handleAdd}
                className="h-8"
              >
                <Plus className="w-4 h-4" />
                Add
              </Button>
            )
          )}
        </div>
      </div>
    </div>
  );
}
