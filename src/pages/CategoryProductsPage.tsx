import { useState, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, SlidersHorizontal, ChevronDown, Heart, ShoppingCart, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
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

interface CategoryProductsPageProps {
  onAddToCart: (productId: string) => void;
}

export default function CategoryProductsPage({ onAddToCart }: CategoryProductsPageProps) {
  const { categoryId } = useParams();
  const navigate = useNavigate();
  const [sortBy, setSortBy] = useState('relevant');
  const [priceRange, setPriceRange] = useState([0, 50000]);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [fastTrackOnly, setFastTrackOnly] = useState(false);

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
    switch (sortBy) {
      case 'price-low':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'popular':
        filtered.sort((a, b) => (b.isPopular ? 1 : 0) - (a.isPopular ? 1 : 0));
        break;
    }

    return filtered;
  }, [categoryId, sortBy, priceRange, inStockOnly, fastTrackOnly]);

  const subcategories = ['All', 'Engine Oil', 'Hydraulic Oil', 'Transmission Fluid', 'Brake Fluid'];

  const handleAddToCart = (product: Product) => {
    onAddToCart(product.id);
    toast({
      title: "Added to cart",
      description: `${product.name} added successfully`,
    });
  };

  return (
    <div className="min-h-screen bg-background pb-8">
      <header className="sticky top-0 z-40 bg-background border-b px-4 py-3">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-lg font-semibold">{category?.name || 'All Products'}</h1>
              <p className="text-xs text-muted-foreground">{filteredProducts.length} products</p>
            </div>
          </div>
          
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm">
                <SlidersHorizontal className="w-4 h-4 mr-1" />
                Filter
              </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="h-[80vh]">
              <SheetHeader>
                <SheetTitle>Filters</SheetTitle>
              </SheetHeader>
              <div className="space-y-6 pt-6">
                <div>
                  <Label className="mb-3 block">Price Range</Label>
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

                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="inStock" 
                    checked={inStockOnly}
                    onCheckedChange={(c) => setInStockOnly(c as boolean)}
                  />
                  <Label htmlFor="inStock">In Stock Only</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="fastTrack" 
                    checked={fastTrackOnly}
                    onCheckedChange={(c) => setFastTrackOnly(c as boolean)}
                  />
                  <Label htmlFor="fastTrack">Fast Track Eligible</Label>
                </div>

                <Button className="w-full">Apply Filters</Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {/* Sort & Subcategories */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-auto min-w-[140px]">
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
              className="cursor-pointer whitespace-nowrap"
            >
              {sub}
            </Badge>
          ))}
        </div>
      </header>

      <div className="p-4 grid grid-cols-2 gap-3">
        {filteredProducts.map(product => (
          <Card key={product.id} className="overflow-hidden">
            <div className="relative">
              <img 
                src={product.image} 
                alt={product.name}
                className="w-full h-32 object-cover bg-muted cursor-pointer"
                onClick={() => navigate(`/products/${product.id}`)}
              />
              <Button 
                variant="ghost" 
                size="icon-sm"
                className="absolute top-2 right-2 bg-background/80 backdrop-blur-sm"
              >
                <Heart className="w-4 h-4" />
              </Button>
              {product.isFastTrack && (
                <Badge className="absolute top-2 left-2 bg-primary text-primary-foreground text-xs">
                  <Zap className="w-3 h-3 mr-0.5" />
                  Fast
                </Badge>
              )}
            </div>
            
            <div className="p-3">
              <h3 
                className="font-medium text-sm line-clamp-2 cursor-pointer"
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

              {product.originalPrice && (
                <Badge variant="destructive" className="mt-1 text-xs">
                  {Math.round((1 - product.price / product.originalPrice) * 100)}% off
                </Badge>
              )}

              <p className={`text-xs mt-2 ${product.inStock ? 'text-green-600' : 'text-red-500'}`}>
                {product.inStock ? `✓ In Stock (${product.stockQuantity})` : '✗ Out of Stock'}
              </p>

              <Button 
                size="sm" 
                className="w-full mt-3"
                onClick={() => handleAddToCart(product)}
                disabled={!product.inStock}
              >
                <ShoppingCart className="w-4 h-4 mr-1" />
                Add to Cart
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12">
          <p className="text-muted-foreground">No products found</p>
          <Button variant="outline" className="mt-4" onClick={() => {
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
