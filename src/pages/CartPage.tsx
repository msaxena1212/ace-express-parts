import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Trash2, Minus, Plus, Tag, ShoppingBag, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { products, Product } from '@/data/mockData';
import { toast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface CartItem {
  productId: string;
  quantity: number;
}

interface CartPageProps {
  cart: CartItem[];
  setCart: React.Dispatch<React.SetStateAction<CartItem[]>>;
}

export default function CartPage({ cart, setCart }: CartPageProps) {
  const navigate = useNavigate();
  const [promoCode, setPromoCode] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<{ code: string; discount: number } | null>(null);

  const cartProducts = cart.map(item => {
    const product = products.find(p => p.id === item.productId);
    return { ...item, product };
  }).filter(item => item.product);

  const subtotal = cartProducts.reduce((sum, item) => 
    sum + (item.product?.price || 0) * item.quantity, 0
  );
  
  const promoDiscount = appliedPromo ? (subtotal * appliedPromo.discount / 100) : 0;
  const gst = (subtotal - promoDiscount) * 0.18;
  const deliveryFee = subtotal >= 5000 ? 0 : 99;
  const total = subtotal - promoDiscount + gst + deliveryFee;
  const savings = cartProducts.reduce((sum, item) => {
    const original = item.product?.originalPrice || item.product?.price || 0;
    const current = item.product?.price || 0;
    return sum + (original - current) * item.quantity;
  }, 0) + promoDiscount;

  const hasFastTrack = cartProducts.some(item => item.product?.isFastTrack);

  const updateQuantity = (productId: string, delta: number) => {
    setCart(prev => {
      return prev.map(item => {
        if (item.productId === productId) {
          const newQty = item.quantity + delta;
          if (newQty <= 0) return null;
          return { ...item, quantity: newQty };
        }
        return item;
      }).filter(Boolean) as CartItem[];
    });
  };

  const removeItem = (productId: string) => {
    setCart(prev => prev.filter(item => item.productId !== productId));
    toast({ title: "Item removed", description: "Item removed from cart" });
  };

  const clearCart = () => {
    setCart([]);
    setAppliedPromo(null);
    toast({ title: "Cart cleared", description: "All items removed from cart" });
  };

  const applyPromo = () => {
    if (promoCode.toUpperCase() === 'BULK20') {
      setAppliedPromo({ code: 'BULK20', discount: 20 });
      toast({ title: "Promo applied!", description: "20% discount applied to your order" });
    } else if (promoCode.toUpperCase() === 'FIRST10') {
      setAppliedPromo({ code: 'FIRST10', discount: 10 });
      toast({ title: "Promo applied!", description: "10% discount applied to your order" });
    } else {
      toast({ title: "Invalid code", description: "This promo code is not valid", variant: "destructive" });
    }
    setPromoCode('');
  };

  const removePromo = () => {
    setAppliedPromo(null);
    toast({ title: "Promo removed" });
  };

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <header className="sticky top-0 z-40 bg-background border-b px-4 py-3">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-lg font-semibold">Shopping Cart</h1>
          </div>
        </header>
        
        <div className="flex flex-col items-center justify-center p-8 pt-24">
          <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-6">
            <ShoppingBag className="w-12 h-12 text-muted-foreground" />
          </div>
          <h2 className="text-xl font-semibold mb-2">Your cart is empty</h2>
          <p className="text-muted-foreground text-center mb-6">Start shopping to add items to your cart!</p>
          <Button onClick={() => navigate('/')} className="bg-primary">
            Start Shopping
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-48">
      <header className="sticky top-0 z-40 bg-background border-b px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-lg font-semibold">Cart ({cart.length} items)</h1>
          </div>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="icon" className="text-destructive">
                <Trash2 className="w-5 h-5" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Clear cart?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will remove all items from your cart.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={clearCart} className="bg-destructive">
                  Clear Cart
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </header>

      <div className="p-4 space-y-3">
        {cartProducts.map(({ productId, quantity, product }) => (
          <Card key={productId} className="p-4">
            <div className="flex gap-3">
              <img 
                src={product?.image} 
                alt={product?.name}
                className="w-20 h-20 rounded-lg object-cover bg-muted"
              />
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-sm line-clamp-2">{product?.name}</h3>
                <p className="text-xs text-muted-foreground mt-1">{product?.partNumber}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="font-bold text-primary">₹{product?.price.toLocaleString()}</span>
                  {product?.originalPrice && (
                    <span className="text-xs text-muted-foreground line-through">
                      ₹{product.originalPrice.toLocaleString()}
                    </span>
                  )}
                </div>
                {product?.isFastTrack && (
                  <div className="flex items-center gap-1 mt-1 text-xs text-primary">
                    <Zap className="w-3 h-3" />
                    Fast Track Available
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex items-center justify-between mt-4 pt-3 border-t">
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="icon-sm"
                  onClick={() => updateQuantity(productId, -1)}
                >
                  <Minus className="w-4 h-4" />
                </Button>
                <span className="w-8 text-center font-medium">{quantity}</span>
                <Button 
                  variant="outline" 
                  size="icon-sm"
                  onClick={() => updateQuantity(productId, 1)}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-bold">₹{((product?.price || 0) * quantity).toLocaleString()}</span>
                <Button 
                  variant="ghost" 
                  size="icon-sm"
                  className="text-destructive"
                  onClick={() => removeItem(productId)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Promo Code */}
      <div className="px-4 py-3">
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <Tag className="w-4 h-4 text-primary" />
            <span className="font-medium text-sm">Promo Code</span>
          </div>
          {appliedPromo ? (
            <div className="flex items-center justify-between bg-primary/10 rounded-lg p-3">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-primary">[{appliedPromo.code}]</span>
                <span className="text-sm">{appliedPromo.discount}% off</span>
              </div>
              <Button variant="ghost" size="sm" onClick={removePromo} className="text-destructive">
                Remove
              </Button>
            </div>
          ) : (
            <div className="flex gap-2">
              <Input 
                placeholder="Enter promo code"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value)}
                className="flex-1"
              />
              <Button onClick={applyPromo} disabled={!promoCode}>Apply</Button>
            </div>
          )}
        </Card>
      </div>

      {/* Smart Nudges */}
      <div className="px-4 space-y-2">
        {subtotal < 5000 && (
          <div className="bg-accent/50 rounded-lg p-3 text-sm">
            🚚 Add ₹{(5000 - subtotal).toLocaleString()} more for <strong>free delivery</strong>
          </div>
        )}
        {hasFastTrack && (
          <div className="bg-primary/10 rounded-lg p-3 text-sm flex items-center gap-2">
            <Zap className="w-4 h-4 text-primary" />
            <span>Fast Track delivery available for some items!</span>
          </div>
        )}
      </div>

      {/* Order Summary - Fixed Bottom */}
      <div className="fixed bottom-0 left-0 right-0 bg-background border-t shadow-lg z-50">
        <div className="p-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Subtotal</span>
            <span>₹{subtotal.toLocaleString()}</span>
          </div>
          {promoDiscount > 0 && (
            <div className="flex justify-between text-sm text-green-600">
              <span>Promo Discount</span>
              <span>-₹{promoDiscount.toLocaleString()}</span>
            </div>
          )}
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">GST (18%)</span>
            <span>₹{gst.toFixed(0)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Delivery</span>
            <span className={deliveryFee === 0 ? 'text-green-600' : ''}>
              {deliveryFee === 0 ? 'FREE' : `₹${deliveryFee}`}
            </span>
          </div>
          <Separator />
          <div className="flex justify-between items-center">
            <div>
              <span className="text-lg font-bold">₹{total.toFixed(0)}</span>
              {savings > 0 && (
                <p className="text-xs text-green-600">You save ₹{savings.toFixed(0)}!</p>
              )}
            </div>
            <Button 
              size="lg" 
              className="bg-primary px-8"
              onClick={() => navigate('/checkout')}
            >
              Proceed to Checkout
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
