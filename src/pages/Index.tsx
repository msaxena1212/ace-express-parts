import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { CategoryChips } from '@/components/CategoryChips';
import { OfferBanner } from '@/components/OfferBanner';
import { QuickActions } from '@/components/QuickActions';
import { ProductGrid } from '@/components/ProductGrid';
import { EquipmentSection } from '@/components/EquipmentSection';
import { CartPreview } from '@/components/CartPreview';
import { BottomNav } from '@/components/BottomNav';
import { SearchModal } from '@/components/SearchModal';
import { categories, products, equipment, offers, Product } from '@/data/mockData';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { User, Session } from '@supabase/supabase-js';

interface CartItem {
  productId: string;
  quantity: number;
}

const Index = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [activeTab, setActiveTab] = useState('/');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleAddToCart = (productId: string) => {
    setCart(prev => {
      const existing = prev.find(item => item.productId === productId);
      if (existing) {
        return prev.map(item => 
          item.productId === productId 
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { productId, quantity: 1 }];
    });
    
    const product = products.find(p => p.id === productId);
    toast({
      title: "Added to cart",
      description: `${product?.name} added successfully`,
    });
  };

  const handleRemoveFromCart = (productId: string) => {
    setCart(prev => {
      const existing = prev.find(item => item.productId === productId);
      if (existing && existing.quantity > 1) {
        return prev.map(item =>
          item.productId === productId
            ? { ...item, quantity: item.quantity - 1 }
            : item
        );
      }
      return prev.filter(item => item.productId !== productId);
    });
  };

  const handleViewCart = () => {
    toast({
      title: "Cart",
      description: `You have ${cart.reduce((sum, item) => sum + item.quantity, 0)} items in your cart`,
    });
  };

  const handleActionClick = (action: string) => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to access this feature",
      });
      navigate('/auth');
      return;
    }
    
    toast({
      title: action.replace('\n', ' '),
      description: "This feature is coming soon!",
    });
  };

  const handleEquipmentClick = (id: string) => {
    const item = equipment.find(e => e.id === id);
    toast({
      title: item?.name || "Equipment",
      description: `Model: ${item?.model}`,
    });
  };

  const handleAddEquipment = () => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to add equipment",
      });
      navigate('/auth');
      return;
    }
    
    toast({
      title: "Add Equipment",
      description: "Register new equipment feature coming soon!",
    });
  };

  const handleSelectProduct = (product: Product) => {
    handleAddToCart(product.id);
  };

  const filteredProducts = selectedCategory 
    ? products.filter(p => p.categoryId === selectedCategory)
    : products;

  const popularProducts = products.filter(p => p.isPopular);
  const fastTrackProducts = products.filter(p => p.isFastTrack);

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-32">
      <Header 
        cartCount={cartCount}
        onCartClick={handleViewCart}
        onSearchClick={() => setIsSearchOpen(true)}
      />
      
      <main>
        <OfferBanner offers={offers} />
        
        <CategoryChips 
          categories={categories}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
        />
        
        <QuickActions onActionClick={handleActionClick} />
        
        <ProductGrid 
          products={fastTrackProducts}
          title="⚡ Fast Track Delivery"
          subtitle="Get these parts in 2-4 hours"
          cart={cart}
          onAddToCart={handleAddToCart}
          onRemoveFromCart={handleRemoveFromCart}
        />
        
        <EquipmentSection 
          equipment={equipment}
          onEquipmentClick={handleEquipmentClick}
          onAddEquipment={handleAddEquipment}
        />
        
        <ProductGrid 
          products={popularProducts}
          title="🔥 Popular Parts"
          subtitle="Most ordered this week"
          cart={cart}
          onAddToCart={handleAddToCart}
          onRemoveFromCart={handleRemoveFromCart}
        />
        
        {selectedCategory && (
          <ProductGrid 
            products={filteredProducts}
            title={categories.find(c => c.id === selectedCategory)?.name || 'Products'}
            cart={cart}
            onAddToCart={handleAddToCart}
            onRemoveFromCart={handleRemoveFromCart}
          />
        )}
      </main>
      
      <CartPreview 
        cart={cart}
        products={products}
        onViewCart={handleViewCart}
      />
      
      <BottomNav 
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />
      
      <SearchModal 
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelectProduct={handleSelectProduct}
      />
    </div>
  );
};

export default Index;
