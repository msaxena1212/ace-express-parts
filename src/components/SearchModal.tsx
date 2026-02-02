import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Search, Clock, TrendingUp, ArrowRight, Package, Loader2 } from 'lucide-react';
import { useSearch } from '@/hooks/useSearch';
import { categories } from '@/data/mockData';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const trendingSearches = ['Crane Parts', 'Engine Filter', 'Hydraulic Pump', 'Brake Pads'];

export function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const {
    query,
    suggestions,
    loading,
    recentSearches,
    search,
    executeSearch,
    clearSearch,
    clearRecentSearches
  } = useSearch();

  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const handleClose = () => {
    clearSearch();
    onClose();
  };

  const handleSelectProduct = (productId: string) => {
    handleClose();
    navigate(`/products/${productId}`);
  };

  const handleSelectCategory = (categoryId: string) => {
    handleClose();
    navigate(`/categories/${categoryId}`);
  };

  const handleSearchSubmit = () => {
    if (query.trim()) {
      executeSearch(query);
      handleClose();
      navigate(`/categories/all?q=${encodeURIComponent(query)}`);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearchSubmit();
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
              ref={inputRef}
              type="text"
              placeholder="Search genuine ACE parts..."
              value={query}
              onChange={(e) => search(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground text-foreground"
            />
            {loading && <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />}
            {query && !loading && (
              <button onClick={() => search('')}>
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            )}
          </div>
          <button onClick={handleClose} className="text-sm font-medium text-primary">
            Cancel
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 overflow-y-auto" style={{ height: 'calc(100vh - 80px)' }}>
        {/* Autocomplete suggestions */}
        {query.length >= 2 && suggestions.length > 0 ? (
          <div className="space-y-2">
            {suggestions.map((suggestion, index) => (
              <button
                key={`${suggestion.type}-${index}`}
                onClick={() => {
                  if (suggestion.type === 'product' && suggestion.product_id) {
                    handleSelectProduct(suggestion.product_id);
                  } else if (suggestion.type === 'category' && suggestion.category_id) {
                    handleSelectCategory(suggestion.category_id);
                  }
                }}
                className="w-full flex items-center gap-3 p-3 bg-card border border-border rounded-xl hover:border-primary/50 transition-colors text-left"
              >
                {suggestion.type === 'product' ? (
                  <>
                    <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center">
                      <Package className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate text-foreground">{suggestion.name}</p>
                      <p className="text-xs text-muted-foreground">{suggestion.category}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-primary">₹{suggestion.price?.toLocaleString()}</p>
                      {suggestion.in_stock ? (
                        <span className="text-xs text-green-500">In Stock</span>
                      ) : (
                        <span className="text-xs text-red-500">Out of Stock</span>
                      )}
                    </div>
                  </>
                ) : (
                  <>
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                      <Search className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground">{suggestion.name}</p>
                      <p className="text-xs text-muted-foreground">Category</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-muted-foreground" />
                  </>
                )}
              </button>
            ))}
            
            {/* Search for query button */}
            <button
              onClick={handleSearchSubmit}
              className="w-full flex items-center gap-3 p-3 bg-primary/10 border border-primary/30 rounded-xl hover:bg-primary/20 transition-colors text-left"
            >
              <Search className="w-5 h-5 text-primary" />
              <span className="text-sm font-medium text-foreground">Search for "{query}"</span>
              <ArrowRight className="w-4 h-4 text-primary ml-auto" />
            </button>
          </div>
        ) : query.length >= 2 && !loading ? (
          <div className="text-center py-8">
            <Package className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
            <p className="text-muted-foreground">No results found for "{query}"</p>
            <p className="text-sm text-muted-foreground mt-1">Try different keywords</p>
          </div>
        ) : (
          <>
            {/* Recent Searches */}
            {recentSearches.length > 0 && (
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-semibold text-muted-foreground flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Recent Searches
                  </h3>
                  <button 
                    onClick={clearRecentSearches}
                    className="text-xs text-primary"
                  >
                    Clear
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {recentSearches.map((term) => (
                    <button
                      key={term}
                      onClick={() => {
                        search(term);
                        executeSearch(term);
                      }}
                      className="px-3 py-1.5 bg-card border border-border rounded-full text-xs hover:border-primary/50 transition-colors text-foreground"
                    >
                      {term}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Trending Searches */}
            <div className="mb-6">
              <h3 className="text-xs font-semibold text-muted-foreground mb-3 flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Trending Searches
              </h3>
              <div className="flex flex-wrap gap-2">
                {trendingSearches.map((term) => (
                  <button
                    key={term}
                    onClick={() => search(term)}
                    className="px-3 py-1.5 bg-orange-subtle text-primary rounded-full text-xs font-medium hover:bg-primary hover:text-primary-foreground transition-colors"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>

            {/* Browse Categories */}
            <div>
              <h3 className="text-xs font-semibold text-muted-foreground mb-3">
                Browse Categories
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {categories.slice(0, 6).map((category) => (
                  <button
                    key={category.id}
                    onClick={() => handleSelectCategory(category.id)}
                    className="flex items-center gap-3 p-3 bg-card border border-border rounded-xl hover:border-primary/50 transition-colors text-left"
                  >
                    <span className="text-lg">{category.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate text-foreground">{category.name}</p>
                      <p className="text-xs text-muted-foreground">{category.productCount} items</p>
                    </div>
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
