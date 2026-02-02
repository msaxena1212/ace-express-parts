import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Heart, Share2, ShoppingCart, Zap, Star, Truck, Shield, RotateCcw, ChevronRight, Minus, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { products, categories, equipmentTypes } from '@/data/mockData';
import { toast } from '@/hooks/use-toast';

interface ProductDetailsPageProps {
  onAddToCart: (productId: string, quantity?: number) => void;
}

export default function ProductDetailsPage({ onAddToCart }: ProductDetailsPageProps) {
  const { productId } = useParams();
  const navigate = useNavigate();
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const product = products.find(p => p.id === productId);
  const category = categories.find(c => c.id === product?.categoryId);

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Product not found</p>
      </div>
    );
  }

  const discount = product.originalPrice 
    ? Math.round((1 - product.price / product.originalPrice) * 100) 
    : 0;

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      onAddToCart(product.id);
    }
    toast({
      title: "Added to cart",
      description: `${quantity}x ${product.name} added`,
    });
  };

  const handleBuyNow = () => {
    handleAddToCart();
    navigate('/cart');
  };

  const toggleWishlist = () => {
    setIsWishlisted(!isWishlisted);
    toast({
      title: isWishlisted ? "Removed from wishlist" : "Added to wishlist",
    });
  };

  // Mock reviews
  const reviews = [
    { id: 1, name: 'Raj Kumar', rating: 5, text: 'Excellent quality, genuine ACE part.', helpful: 12, date: '2 weeks ago' },
    { id: 2, name: 'Priya S.', rating: 4, text: 'Good product, fast delivery.', helpful: 8, date: '1 month ago' },
  ];

  return (
    <div className="min-h-screen bg-background pb-32">
      <header className="sticky top-0 z-40 bg-background border-b px-4 py-3">
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => navigator.share?.({ title: product.name, url: window.location.href })}>
              <Share2 className="w-5 h-5" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={toggleWishlist}
              className={isWishlisted ? 'text-red-500' : ''}
            >
              <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-current' : ''}`} />
            </Button>
          </div>
        </div>
      </header>

      <div>
        {/* Image Gallery */}
        <div className="relative">
          <img 
            src={product.image} 
            alt={product.name}
            className="w-full h-72 object-cover bg-muted"
          />
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1">
            {[0, 1, 2].map((i) => (
              <div 
                key={i} 
                className={`w-2 h-2 rounded-full ${i === selectedImageIndex ? 'bg-primary' : 'bg-white/50'}`}
              />
            ))}
          </div>
        </div>

        <div className="p-4 space-y-4">
          {/* Product Info */}
          <div>
            <div className="flex flex-wrap gap-2 mb-2">
              <Badge variant="secondary">Genuine</Badge>
              {product.isFastTrack && (
                <Badge className="bg-primary">
                  <Zap className="w-3 h-3 mr-1" />
                  Fast Track
                </Badge>
              )}
              {product.isPopular && <Badge variant="outline">Best Seller</Badge>}
            </div>
            
            <h1 className="text-xl font-bold">{product.name}</h1>
            <p className="text-sm text-muted-foreground font-mono mt-1">{product.partNumber}</p>
            
            <div className="flex items-center gap-2 mt-2">
              <div className="flex items-center">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span className="ml-1 font-medium">4.5</span>
              </div>
              <span className="text-muted-foreground text-sm">(128 reviews)</span>
            </div>
          </div>

          {/* Pricing */}
          <Card className="p-4">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-primary">₹{product.price.toLocaleString()}</span>
              {product.originalPrice && (
                <>
                  <span className="text-lg text-muted-foreground line-through">₹{product.originalPrice.toLocaleString()}</span>
                  <Badge variant="destructive">{discount}% off</Badge>
                </>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Inclusive of GST</p>
            {product.originalPrice && (
              <p className="text-sm text-green-600 mt-1">You save ₹{(product.originalPrice - product.price).toLocaleString()}!</p>
            )}
          </Card>

          {/* Stock & Delivery */}
          <Card className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">Availability</span>
              <span className={`font-medium ${product.inStock ? 'text-green-600' : 'text-red-500'}`}>
                {product.inStock ? `✓ In Stock (${product.stockQuantity} left)` : '✗ Out of Stock'}
              </span>
            </div>
            
            <Separator />
            
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <Truck className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Standard Delivery</p>
                  <p className="text-xs text-muted-foreground">24-48 hours</p>
                </div>
              </div>
              
              {product.isFastTrack && (
                <div className="flex items-center gap-3">
                  <Zap className="w-5 h-5 text-primary" />
                  <div>
                    <p className="text-sm font-medium text-primary">Fast Track Available</p>
                    <p className="text-xs text-muted-foreground">{product.deliveryTime}</p>
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* Specifications */}
          <Tabs defaultValue="specs" className="w-full">
            <TabsList className="w-full">
              <TabsTrigger value="specs" className="flex-1">Specifications</TabsTrigger>
              <TabsTrigger value="compatibility" className="flex-1">Compatibility</TabsTrigger>
              <TabsTrigger value="reviews" className="flex-1">Reviews</TabsTrigger>
            </TabsList>
            
            <TabsContent value="specs" className="mt-4">
              <Card className="p-4">
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Part Number</span>
                    <span className="font-mono">{product.partNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Category</span>
                    <span>{category?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Warranty</span>
                    <span>1 Year</span>
                  </div>
                </div>
              </Card>
            </TabsContent>
            
            <TabsContent value="compatibility" className="mt-4">
              <Card className="p-4">
                <p className="text-sm mb-3">Compatible with:</p>
                <div className="flex flex-wrap gap-2">
                  {equipmentTypes.slice(0, 4).map(eq => (
                    <Badge key={eq.id} variant="outline">{eq.icon} {eq.name}</Badge>
                  ))}
                </div>
              </Card>
            </TabsContent>
            
            <TabsContent value="reviews" className="mt-4 space-y-3">
              {reviews.map(review => (
                <Card key={review.id} className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">{review.name}</span>
                    <span className="text-xs text-muted-foreground">{review.date}</span>
                  </div>
                  <div className="flex items-center gap-1 mb-2">
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i} 
                        className={`w-3 h-3 ${i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-muted'}`} 
                      />
                    ))}
                  </div>
                  <p className="text-sm">{review.text}</p>
                  <p className="text-xs text-muted-foreground mt-2">{review.helpful} found helpful</p>
                </Card>
              ))}
              <Button variant="outline" className="w-full">See All Reviews</Button>
            </TabsContent>
          </Tabs>

          {/* Additional Info */}
          <div className="grid grid-cols-3 gap-3 text-center">
            <Card className="p-3">
              <Shield className="w-6 h-6 mx-auto mb-1 text-primary" />
              <p className="text-xs">Genuine ACE</p>
            </Card>
            <Card className="p-3">
              <RotateCcw className="w-6 h-6 mx-auto mb-1 text-primary" />
              <p className="text-xs">7-Day Returns</p>
            </Card>
            <Card className="p-3">
              <Truck className="w-6 h-6 mx-auto mb-1 text-primary" />
              <p className="text-xs">Free Shipping</p>
            </Card>
          </div>
        </div>
      </div>

      {/* Sticky Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-background border-t shadow-lg z-50 p-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center border rounded-lg">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
            >
              <Minus className="w-4 h-4" />
            </Button>
            <span className="w-10 text-center font-medium">{quantity}</span>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setQuantity(Math.min(10, quantity + 1))}
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
          
          <Button 
            variant="outline" 
            className="flex-1"
            onClick={handleAddToCart}
            disabled={!product.inStock}
          >
            <ShoppingCart className="w-4 h-4 mr-2" />
            Add to Cart
          </Button>
          
          <Button 
            className="flex-1"
            onClick={handleBuyNow}
            disabled={!product.inStock}
          >
            Buy Now
          </Button>
        </div>
      </div>
    </div>
  );
}
