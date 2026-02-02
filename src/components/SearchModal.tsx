import { useState } from 'react';
import { X, Search, Clock, TrendingUp } from 'lucide-react';
import { Product, products } from '@/data/mockData';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectProduct: (product: Product) => void;
}

const recentSearches = ['Hydraulic Filter', 'Boom Cylinder', 'Brake Pads', 'Alternator'];
const trendingSearches = ['Crane Parts', 'Engine Filter', 'Transmission Kit', 'Fork Lift Parts'];

export function SearchModal({ isOpen, onClose, onSelectProduct }: SearchModalProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Product[]>([]);

  const handleSearch = (searchQuery: string) => {
    setQuery(searchQuery);
    if (searchQuery.length > 1) {
      const filtered = products.filter(
        p => p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
             p.partNumber.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setResults(filtered);
    } else {
      setResults([]);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-background z-50 animate-fade-in">
      {/* Search Header */}
      <div className="sticky top-0 bg-card border-b border-border p-4 safe-top">
        <div className="flex items-center gap-3">
          <div className="flex-1 flex items-center gap-3 bg-background border border-border rounded-xl px-4 py-3">
            <Search className="w-5 h-5 text-primary" />
            <input
              type="text"
              placeholder="Search genuine ACE parts..."
              value={query}
              onChange={(e) => handleSearch(e.target.value)}
              autoFocus
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground text-foreground"
            />
            {query && (
              <button onClick={() => handleSearch('')}>
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            )}
          </div>
          <button onClick={onClose} className="text-sm font-medium text-primary">
            Cancel
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 overflow-y-auto" style={{ height: 'calc(100vh - 80px)' }}>
        {results.length > 0 ? (
          <div className="space-y-2">
            {results.map((product) => (
              <button
                key={product.id}
                onClick={() => {
                  onSelectProduct(product);
                  onClose();
                }}
                className="w-full flex items-center gap-3 p-3 bg-card border border-border rounded-xl hover:border-primary/50 transition-colors text-left"
              >
                <div className="w-12 h-12 bg-muted rounded-lg flex-shrink-0 border border-border">
                  <img src={product.image} alt="" className="w-full h-full object-contain" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate text-foreground">{product.name}</p>
                  <p className="text-xs text-primary font-mono">{product.partNumber}</p>
                </div>
                <p className="text-sm font-semibold text-foreground">₹{product.price.toLocaleString()}</p>
              </button>
            ))}
          </div>
        ) : (
          <>
            {/* Recent Searches */}
            <div className="mb-6">
              <h3 className="text-xs font-semibold text-muted-foreground mb-3 flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Recent Searches
              </h3>
              <div className="flex flex-wrap gap-2">
                {recentSearches.map((term) => (
                  <button
                    key={term}
                    onClick={() => handleSearch(term)}
                    className="px-3 py-1.5 bg-card border border-border rounded-full text-xs hover:border-primary/50 transition-colors text-foreground"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>

            {/* Trending Searches */}
            <div>
              <h3 className="text-xs font-semibold text-muted-foreground mb-3 flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Trending Searches
              </h3>
              <div className="flex flex-wrap gap-2">
                {trendingSearches.map((term) => (
                  <button
                    key={term}
                    onClick={() => handleSearch(term)}
                    className="px-3 py-1.5 bg-orange-subtle text-primary rounded-full text-xs font-medium hover:bg-primary hover:text-primary-foreground transition-colors"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
