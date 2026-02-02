import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Heart, ShoppingCart, Trash2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useWishlist } from '@/hooks/useWishlist';
import { products } from '@/data/mockData';
import { toast } from '@/hooks/use-toast';

interface WishlistPageProps {
  onAddToCart: (productId: string) => void;
}

export default function WishlistPage({ onAddToCart }: WishlistPageProps) {
  const navigate = useNavigate();
  const { items, loading, toggleWishlist, refetch } = useWishlist();
  const [wishlistProducts, setWishlistProducts] = useState<typeof products>([]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  useEffect(() => {
    // Map wishlist items to products
    const productIds = items.map(item => item.product_id);
    const matchedProducts = products.filter(p => productIds.includes(p.id));
    setWishlistProducts(matchedProducts);
  }, [items]);

  const handleMoveToCart = async (productId: string) => {
    onAddToCart(productId);
    await toggleWishlist(productId);
    toast({ title: "Moved to cart!" });
  };

  const handleRemove = async (productId: string) => {
    await toggleWishlist(productId);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="sticky top-0 z-40 bg-background border-b px-4 py-3">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-lg font-semibold">My Wishlist</h1>
          <span className="text-sm text-muted-foreground">({wishlistProducts.length} items)</span>
        </div>
      </header>

      {wishlistProducts.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-8 pt-24">
          <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-6">
            <Heart className="w-12 h-12 text-muted-foreground" />
          </div>
          <h2 className="text-xl font-semibold mb-2">Your wishlist is empty</h2>
          <p className="text-muted-foreground text-center mb-6">Save items you love to buy them later!</p>
          <Button onClick={() => navigate('/')} className="bg-primary">
            Browse Products
          </Button>
        </div>
      ) : (
        <div className="p-4 space-y-3">
          {wishlistProducts.map((product) => (
            <Card key={product.id} className="p-4">
              <div className="flex gap-3">
                <img 
                  src={product.image} 
                  alt={product.name}
                  className="w-20 h-20 rounded-lg object-cover bg-muted cursor-pointer"
                  onClick={() => navigate(`/products/${product.id}`)}
                />
                <div className="flex-1 min-w-0">
                  <h3 
                    className="font-medium text-sm line-clamp-2 cursor-pointer hover:text-primary"
                    onClick={() => navigate(`/products/${product.id}`)}
                  >
                    {product.name}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1">{product.partNumber}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="font-bold text-primary">₹{product.price.toLocaleString()}</span>
                    {product.originalPrice && (
                      <span className="text-xs text-muted-foreground line-through">
                        ₹{product.originalPrice.toLocaleString()}
                      </span>
                    )}
                  </div>
                  {!product.inStock && (
                    <span className="text-xs text-red-500 mt-1 inline-block">Out of Stock</span>
                  )}
                </div>
              </div>
              
              <div className="flex items-center gap-2 mt-4 pt-3 border-t">
                <Button 
                  variant="outline" 
                  size="sm"
                  className="flex-1"
                  onClick={() => handleRemove(product.id)}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Remove
                </Button>
                <Button 
                  size="sm"
                  className="flex-1 bg-primary"
                  disabled={!product.inStock}
                  onClick={() => handleMoveToCart(product.id)}
                >
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  Move to Cart
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
