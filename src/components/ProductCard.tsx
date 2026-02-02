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
    <div className={`bg-card rounded-lg shadow-ace-sm overflow-hidden flex flex-col transition-all hover:shadow-ace-md ${isAdding ? 'animate-pop' : ''}`}>
      {/* Product Image */}
      <div className="relative aspect-square bg-muted p-2">
        <img 
          src={product.image} 
          alt={product.name}
          className="w-full h-full object-contain"
        />
        
        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {product.isFastTrack && (
            <span className="flex items-center gap-1 bg-primary text-primary-foreground text-[10px] font-bold px-1.5 py-0.5 rounded">
              <Zap className="w-3 h-3" />
              FAST
            </span>
          )}
          {discountPercent && (
            <span className="bg-success text-success-foreground text-[10px] font-bold px-1.5 py-0.5 rounded">
              {discountPercent}% OFF
            </span>
          )}
        </div>
        
        {!product.inStock && (
          <div className="absolute inset-0 bg-background/60 flex items-center justify-center">
            <span className="bg-muted px-2 py-1 rounded text-body-sm font-medium text-muted-foreground">
              Out of Stock
            </span>
          </div>
        )}
      </div>
      
      {/* Product Info */}
      <div className="flex-1 p-3 flex flex-col">
        <p className="text-body-sm text-muted-foreground font-mono mb-1">{product.partNumber}</p>
        <h3 className="text-body font-medium line-clamp-2 mb-2">{product.name}</h3>
        
        {/* Delivery Time */}
        <div className="flex items-center gap-1 text-body-sm text-muted-foreground mb-2">
          <Clock className="w-3 h-3" />
          <span>{product.deliveryTime}</span>
        </div>
        
        {/* Price & Add Button */}
        <div className="mt-auto flex items-end justify-between">
          <div>
            <p className="text-h4 font-bold text-foreground">₹{product.price.toLocaleString()}</p>
            {product.originalPrice && (
              <p className="text-body-sm text-muted-foreground line-through">
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
                  className="text-primary-foreground hover:bg-primary-foreground/20"
                  onClick={() => onRemoveFromCart(product.id)}
                >
                  <Minus className="w-4 h-4" />
                </Button>
                <span className="text-primary-foreground font-bold text-body min-w-[20px] text-center">
                  {cartQuantity}
                </span>
                <Button 
                  variant="ghost" 
                  size="cart-mini"
                  className="text-primary-foreground hover:bg-primary-foreground/20"
                  onClick={handleAdd}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <Button 
                variant="cart-add" 
                size="sm"
                onClick={handleAdd}
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
