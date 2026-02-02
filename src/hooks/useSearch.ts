import { useState, useCallback, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { products as mockProducts, Product, categories } from '@/data/mockData';

interface SearchSuggestion {
  type: 'product' | 'category' | 'search_query';
  name?: string;
  text?: string;
  category?: string;
  in_stock?: boolean;
  price?: number;
  product_id?: string;
  category_id?: string;
}

interface SearchResult {
  id: string;
  name: string;
  part_number: string;
  price: number;
  mrp: number;
  discount_percentage: number;
  in_stock: boolean;
  image_url: string | null;
  badges: string[];
}

export function useSearch() {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const debounceRef = useRef<NodeJS.Timeout>();

  // Load recent searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('recentSearches');
    if (saved) {
      try {
        setRecentSearches(JSON.parse(saved));
      } catch {
        // Invalid JSON, ignore
      }
    }
  }, []);

  const saveRecentSearch = useCallback((term: string) => {
    setRecentSearches(prev => {
      const filtered = prev.filter(s => s.toLowerCase() !== term.toLowerCase());
      const updated = [term, ...filtered].slice(0, 5);
      localStorage.setItem('recentSearches', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const clearRecentSearches = useCallback(() => {
    setRecentSearches([]);
    localStorage.removeItem('recentSearches');
  }, []);

  const getCategoryName = (categoryId: string): string => {
    const category = categories.find(c => c.id === categoryId);
    return category?.name || categoryId;
  };

  const fetchSuggestions = useCallback(async (searchQuery: string) => {
    if (searchQuery.length < 2) {
      setSuggestions([]);
      return;
    }

    setLoading(true);
    try {
      // Use mock data search
      const filtered = mockProducts.filter(p => 
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.partNumber.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 8);

      const productSuggestions: SearchSuggestion[] = filtered.map(p => ({
        type: 'product',
        name: p.name,
        category: getCategoryName(p.categoryId),
        in_stock: p.inStock,
        price: p.price,
        product_id: p.id
      }));

      // Add category suggestions
      const categoryMatches = categories
        .filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()))
        .slice(0, 3)
        .map(c => ({
          type: 'category' as const,
          name: c.name,
          category_id: c.id
        }));

      setSuggestions([...categoryMatches, ...productSuggestions]);
    } catch (error) {
      console.error('Search error:', error);
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const search = useCallback((searchQuery: string) => {
    setQuery(searchQuery);
    
    // Debounce API calls
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    
    debounceRef.current = setTimeout(() => {
      fetchSuggestions(searchQuery);
    }, 300);
  }, [fetchSuggestions]);

  const executeSearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) return;

    setLoading(true);
    saveRecentSearch(searchQuery);

    try {
      // Full search using mock data
      const filtered = mockProducts.filter(p => 
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.partNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        getCategoryName(p.categoryId).toLowerCase().includes(searchQuery.toLowerCase())
      );

      setResults(filtered.map(p => ({
        id: p.id,
        name: p.name,
        part_number: p.partNumber,
        price: p.price,
        mrp: p.originalPrice || p.price,
        discount_percentage: p.originalPrice ? Math.round((1 - p.price / p.originalPrice) * 100) : 0,
        in_stock: p.inStock,
        image_url: p.image,
        badges: p.isFastTrack ? ['fast_track'] : []
      })));
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  }, [saveRecentSearch]);

  const clearSearch = useCallback(() => {
    setQuery('');
    setSuggestions([]);
    setResults([]);
  }, []);

  return {
    query,
    suggestions,
    results,
    loading,
    recentSearches,
    search,
    executeSearch,
    clearSearch,
    clearRecentSearches,
    saveRecentSearch
  };
}
