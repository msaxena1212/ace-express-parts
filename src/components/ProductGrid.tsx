import { Product } from '@/data/mockData';
import { ProductCard } from './ProductCard';

interface CartItem {
  productId: string;
  quantity: number;
}

interface ProductGridProps {
  products: Product[];
  title: string;
  subtitle?: string;
  cart: CartItem[];
  onAddToCart: (productId: string) => void;
  onRemoveFromCart: (productId: string) => void;
}

export function ProductGrid({ 
  products, 
  title, 
  subtitle,
  cart, 
  onAddToCart, 
  onRemoveFromCart 
}: ProductGridProps) {
  const getCartQuantity = (productId: string) => {
    const item = cart.find(i => i.productId === productId);
    return item?.quantity || 0;
  };

  return (
    <section className="px-4 py-4">
      <div className="flex items-baseline justify-between mb-3">
        <div>
          <h2 className="text-h4 font-semibold">{title}</h2>
          {subtitle && <p className="text-body-sm text-muted-foreground">{subtitle}</p>}
        </div>
        <button className="text-body-sm text-primary font-medium">View All</button>
      </div>
      
      <div className="grid grid-cols-2 gap-3">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            cartQuantity={getCartQuantity(product.id)}
            onAddToCart={onAddToCart}
            onRemoveFromCart={onRemoveFromCart}
          />
        ))}
      </div>
    </section>
  );
}
