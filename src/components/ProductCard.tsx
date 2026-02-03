import { Product } from '@/data/mockData';
import { Button } from './ui/button';
import { Plus, Minus, Zap, Clock, Star, Heart } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface ProductCardProps {
  product: Product;
  cartQuantity: number;
  onAddToCart: (productId: string) => void;
  onRemoveFromCart: (productId: string) => void;
}

export function ProductCard({ product, cartQuantity, onAddToCart, onRemoveFromCart }: ProductCardProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const navigate = useNavigate();
  
  const handleAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsAdding(true);
    onAddToCart(product.id);
    setTimeout(() => setIsAdding(false), 300);
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    onRemoveFromCart(product.id);
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsWishlisted(!isWishlisted);
  };

  const discountPercent = product.originalPrice 
    ? Math.round((1 - product.price / product.originalPrice) * 100)
    : null;

  // Mock rating for display
  const rating = 4.2;
  const reviews = Math.floor(Math.random() * 5000) + 100;

  return (
    <div 
      className={`bg-card border border-border rounded-2xl overflow-hidden flex flex-col transition-all duration-200 hover:shadow-lg active:scale-[0.98] ${isAdding ? 'animate-pop' : ''}`}
      onClick={() => navigate(`/products/${product.id}`)}
    >
      {/* Product Image */}
      <div className="relative aspect-square bg-muted/50 p-3">
        {/* Wishlist Button */}
        <button 
          onClick={handleWishlist}
          className="absolute top-2 right-2 z-10 w-8 h-8 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center shadow-sm transition-transform hover:scale-110"
        >
          <Heart className={`w-4 h-4 transition-colors ${isWishlisted ? 'fill-red-500 text-red-500' : 'text-muted-foreground'}`} />
        </button>

        <img 
          src={product.image} 
          alt={product.name}
          className="w-full h-full object-contain"
        />
        
        {/* ADD Button Overlay - Blinkit Style */}
        {product.inStock && (
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2">
            {cartQuantity > 0 ? (
              <div className="flex items-center bg-primary rounded-lg overflow-hidden shadow-lg animate-scale-in">
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="text-primary-foreground hover:bg-primary-foreground/20 rounded-none h-8 px-3"
                  onClick={handleRemove}
                >
                  <Minus className="w-4 h-4" />
                </Button>
                <span className="text-primary-foreground font-bold text-sm min-w-[28px] text-center">
                  {cartQuantity}
                </span>
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="text-primary-foreground hover:bg-primary-foreground/20 rounded-none h-8 px-3"
                  onClick={handleAdd}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <Button 
                variant="outline"
                size="sm"
                onClick={handleAdd}
                className="h-8 px-6 bg-background border-primary text-primary font-semibold hover:bg-primary hover:text-primary-foreground shadow-lg rounded-lg transition-all"
              >
                ADD
              </Button>
            )}
          </div>
        )}
        
        {!product.inStock && (
          <div className="absolute inset-0 bg-background/70 flex items-center justify-center">
            <span className="bg-card border border-border px-3 py-1.5 rounded-lg text-xs font-medium text-muted-foreground">
              Out of Stock
            </span>
          </div>
        )}
      </div>
      
      {/* Product Info */}
      <div className="flex-1 p-3 flex flex-col gap-1">
        {/* Tags/Badges */}
        <div className="flex flex-wrap gap-1 mb-1">
          {product.isFastTrack && (
            <span className="inline-flex items-center gap-0.5 bg-primary/10 text-primary text-[10px] font-semibold px-1.5 py-0.5 rounded">
              <Zap className="w-2.5 h-2.5" />
              FAST
            </span>
          )}
          {product.partNumber && (
            <span className="text-[10px] text-muted-foreground font-mono bg-muted px-1.5 py-0.5 rounded">
              {product.partNumber}
            </span>
          )}
        </div>

        <h3 className="text-sm font-medium line-clamp-2 text-foreground leading-tight">{product.name}</h3>
        
        {/* Rating */}
        <div className="flex items-center gap-1 mt-1">
          <div className="flex items-center gap-0.5 bg-green-100 text-green-700 px-1.5 py-0.5 rounded text-[10px] font-semibold">
            <Star className="w-2.5 h-2.5 fill-current" />
            {rating.toFixed(1)}
          </div>
          <span className="text-[10px] text-muted-foreground">({reviews.toLocaleString()})</span>
        </div>

        {/* Delivery Time */}
        <div className="flex items-center gap-1 text-[10px] text-muted-foreground mt-1">
          <Clock className="w-3 h-3" />
          <span>{product.deliveryTime}</span>
        </div>
        
        {/* Price */}
        <div className="mt-auto pt-2">
          {discountPercent && (
            <span className="text-[10px] font-semibold text-green-600 block">
              {discountPercent}% OFF
            </span>
          )}
          <div className="flex items-baseline gap-1.5">
            <span className="text-base font-bold text-foreground">₹{product.price.toLocaleString()}</span>
            {product.originalPrice && (
              <span className="text-xs text-muted-foreground line-through">
                MRP ₹{product.originalPrice.toLocaleString()}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
