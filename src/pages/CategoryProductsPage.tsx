import { useState, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, SlidersHorizontal, Heart, Zap, Star, Plus, Minus, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { categories, products, Product } from '@/data/mockData';
import { toast } from '@/hooks/use-toast';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

interface CartItem {
  productId: string;
  quantity: number;
}

interface CategoryProductsPageProps {
  onAddToCart: (productId: string) => void;
  cart?: CartItem[];
  onRemoveFromCart?: (productId: string) => void;
}

export default function CategoryProductsPage({ onAddToCart, cart = [], onRemoveFromCart }: CategoryProductsPageProps) {
  const { categoryId } = useParams();
  const navigate = useNavigate();
  const [sortBy, setSortBy] = useState('relevant');
  const [priceRange, setPriceRange] = useState([0, 50000]);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [fastTrackOnly, setFastTrackOnly] = useState(false);
  const [wishlist, setWishlist] = useState<Set<string>>(new Set());

  const category = categories.find(c => c.id === categoryId);
  
  const filteredProducts = useMemo(() => {
    let filtered = categoryId 
      ? products.filter(p => p.categoryId === categoryId)
      : products;

    if (inStockOnly) {
      filtered = filtered.filter(p => p.inStock);
    }
    if (fastTrackOnly) {
      filtered = filtered.filter(p => p.isFastTrack);
    }
    filtered = filtered.filter(p => p.price >= priceRange[0] && p.price <= priceRange[1]);

    // Sort
    const sortedFiltered = [...filtered];
    switch (sortBy) {
      case 'price-low':
        sortedFiltered.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        sortedFiltered.sort((a, b) => b.price - a.price);
        break;
      case 'popular':
        sortedFiltered.sort((a, b) => (b.isPopular ? 1 : 0) - (a.isPopular ? 1 : 0));
        break;
    }

    return sortedFiltered;
  }, [categoryId, sortBy, priceRange, inStockOnly, fastTrackOnly]);

  const subcategories = ['All', 'Engine Oil', 'Hydraulic Oil', 'Transmission Fluid', 'Brake Fluid'];

  const getCartQuantity = (productId: string) => {
    return cart.find(item => item.productId === productId)?.quantity || 0;
  };

  const toggleWishlist = (productId: string) => {
    setWishlist(prev => {
      const next = new Set(prev);
      if (next.has(productId)) {
        next.delete(productId);
      } else {
        next.add(productId);
      }
      return next;
    });
  };

  const handleAddToCart = (e: React.MouseEvent, product: Product) => {
    e.stopPropagation();
    onAddToCart(product.id);
    toast({
      title: "Added to cart",
      description: `${product.name} added successfully`,
    });
  };

  const handleRemoveFromCart = (e: React.MouseEvent, productId: string) => {
    e.stopPropagation();
    onRemoveFromCart?.(productId);
  };

  return (
    <div className="min-h-screen bg-background pb-8">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background border-b px-4 py-3">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="rounded-full">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-lg font-semibold">{category?.name || 'All Products'}</h1>
              <p className="text-xs text-muted-foreground">{filteredProducts.length} products</p>
            </div>
          </div>
          
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm" className="rounded-full">
                <SlidersHorizontal className="w-4 h-4 mr-1" />
                Filter
              </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="h-[80vh] rounded-t-3xl">
              <SheetHeader>
                <SheetTitle>Filters</SheetTitle>
              </SheetHeader>
              <div className="space-y-6 pt-6">
                <div>
                  <Label className="mb-3 block font-medium">Price Range</Label>
                  <Slider
                    value={priceRange}
                    onValueChange={setPriceRange}
                    max={50000}
                    step={100}
                    className="mb-2"
                  />
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>₹{priceRange[0].toLocaleString()}</span>
                    <span>₹{priceRange[1].toLocaleString()}</span>
                  </div>
                </div>

                <div className="flex items-center space-x-3 p-3 bg-muted/50 rounded-xl">
                  <Checkbox 
                    id="inStock" 
                    checked={inStockOnly}
                    onCheckedChange={(c) => setInStockOnly(c as boolean)}
                  />
                  <Label htmlFor="inStock" className="flex-1 cursor-pointer">In Stock Only</Label>
                </div>

                <div className="flex items-center space-x-3 p-3 bg-muted/50 rounded-xl">
                  <Checkbox 
                    id="fastTrack" 
                    checked={fastTrackOnly}
                    onCheckedChange={(c) => setFastTrackOnly(c as boolean)}
                  />
                  <Label htmlFor="fastTrack" className="flex-1 cursor-pointer">Fast Track Eligible</Label>
                </div>

                <Button className="w-full rounded-xl h-12">Apply Filters</Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {/* Sort & Subcategories */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-auto min-w-[140px] rounded-full bg-muted/50 border-0">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="relevant">Most Relevant</SelectItem>
              <SelectItem value="price-low">Price: Low to High</SelectItem>
              <SelectItem value="price-high">Price: High to Low</SelectItem>
              <SelectItem value="popular">Best Selling</SelectItem>
            </SelectContent>
          </Select>

          {subcategories.map(sub => (
            <Badge 
              key={sub} 
              variant={sub === 'All' ? 'default' : 'outline'}
              className="cursor-pointer whitespace-nowrap rounded-full px-4 py-1.5"
            >
              {sub}
            </Badge>
          ))}
        </div>
      </header>

      {/* Products Grid - Blinkit Style */}
      <div className="p-4 grid grid-cols-2 gap-3">
        {filteredProducts.map((product, index) => {
          const cartQty = getCartQuantity(product.id);
          const discountPercent = product.originalPrice 
            ? Math.round((1 - product.price / product.originalPrice) * 100)
            : null;
          const rating = 4.2;
          const reviews = Math.floor(Math.random() * 5000) + 100;

          return (
            <div 
              key={product.id} 
              className="bg-card border border-border rounded-2xl overflow-hidden flex flex-col animate-scale-in hover:shadow-lg transition-shadow active:scale-[0.98]"
              style={{ animationDelay: `${index * 50}ms` }}
              onClick={() => navigate(`/products/${product.id}`)}
            >
              {/* Image Container */}
              <div className="relative aspect-square bg-muted/30 p-2">
                {/* Wishlist */}
                <button 
                  onClick={(e) => { e.stopPropagation(); toggleWishlist(product.id); }}
                  className="absolute top-2 right-2 z-10 w-7 h-7 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center shadow-sm"
                >
                  <Heart className={`w-3.5 h-3.5 ${wishlist.has(product.id) ? 'fill-red-500 text-red-500' : 'text-muted-foreground'}`} />
                </button>

                {/* Fast Track Badge */}
                {product.isFastTrack && (
                  <Badge className="absolute top-2 left-2 bg-primary text-primary-foreground text-[10px] px-1.5 py-0.5">
                    <Zap className="w-2.5 h-2.5 mr-0.5" />
                    Fast
                  </Badge>
                )}

                <img 
                  src={product.image} 
                  alt={product.name}
                  className="w-full h-full object-contain"
                />

                {/* ADD Button - Blinkit Style */}
                {product.inStock && (
                  <div className="absolute bottom-2 left-1/2 -translate-x-1/2">
                    {cartQty > 0 ? (
                      <div className="flex items-center bg-primary rounded-lg overflow-hidden shadow-lg">
                        <button 
                          className="text-primary-foreground hover:bg-primary-foreground/20 h-7 px-2.5"
                          onClick={(e) => handleRemoveFromCart(e, product.id)}
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="text-primary-foreground font-bold text-xs min-w-[20px] text-center">
                          {cartQty}
                        </span>
                        <button 
                          className="text-primary-foreground hover:bg-primary-foreground/20 h-7 px-2.5"
                          onClick={(e) => handleAddToCart(e, product)}
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <button 
                        onClick={(e) => handleAddToCart(e, product)}
                        className="h-7 px-5 bg-background border border-primary text-primary font-semibold text-xs rounded-lg shadow-lg hover:bg-primary hover:text-primary-foreground transition-colors"
                      >
                        ADD
                      </button>
                    )}
                  </div>
                )}

                {!product.inStock && (
                  <div className="absolute inset-0 bg-background/60 flex items-center justify-center">
                    <span className="text-xs font-medium text-muted-foreground bg-muted px-2 py-1 rounded">Out of Stock</span>
                  </div>
                )}
              </div>
              
              {/* Product Info */}
              <div className="p-2.5 flex flex-col gap-1">
                <p className="text-[10px] text-muted-foreground font-mono">{product.partNumber}</p>
                <h3 className="font-medium text-xs line-clamp-2 leading-tight">{product.name}</h3>
                
                {/* Rating */}
                <div className="flex items-center gap-1">
                  <div className="flex items-center gap-0.5 bg-green-100 text-green-700 px-1 py-0.5 rounded text-[9px] font-semibold">
                    <Star className="w-2 h-2 fill-current" />
                    {rating.toFixed(1)}
                  </div>
                  <span className="text-[9px] text-muted-foreground">({reviews.toLocaleString()})</span>
                </div>

                {/* Delivery */}
                <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                  <Clock className="w-2.5 h-2.5" />
                  {product.deliveryTime}
                </div>

                {/* Price */}
                <div className="mt-1">
                  {discountPercent && (
                    <span className="text-[10px] font-semibold text-green-600">{discountPercent}% OFF</span>
                  )}
                  <div className="flex items-baseline gap-1">
                    <span className="font-bold text-sm">₹{product.price.toLocaleString()}</span>
                    {product.originalPrice && (
                      <span className="text-[10px] text-muted-foreground line-through">
                        MRP ₹{product.originalPrice.toLocaleString()}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredProducts.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12">
          <p className="text-muted-foreground">No products found</p>
          <Button variant="outline" className="mt-4 rounded-full" onClick={() => {
            setPriceRange([0, 50000]);
            setInStockOnly(false);
            setFastTrackOnly(false);
          }}>
            Clear Filters
          </Button>
        </div>
      )}
    </div>
  );
}
