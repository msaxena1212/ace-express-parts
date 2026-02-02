import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface WishlistItem {
  id: string;
  product_id: string;
  added_at: string;
  product: {
    id: string;
    name: string;
    part_number: string;
    price: number;
    mrp: number;
    discount_percentage: number;
    image_url: string | null;
    in_stock: boolean;
    rating: number;
  } | null;
}

export function useWishlist() {
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [wishlistIds, setWishlistIds] = useState<Set<string>>(new Set());

  const fetchWishlist = useCallback(async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      setLoading(true);
      const { data, error } = await supabase
        .from('wishlists')
        .select('id, product_id, created_at')
        .eq('user_id', session.user.id);

      if (error) throw error;

      const ids = new Set((data || []).map(item => item.product_id));
      setWishlistIds(ids);
      
      // For full items, we'd need to join with products
      // This is a simplified version using local data
      setItems(data?.map(item => ({
        id: item.id,
        product_id: item.product_id,
        added_at: item.created_at,
        product: null
      })) || []);
    } catch (error) {
      console.error('Error fetching wishlist:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  const isInWishlist = useCallback((productId: string) => {
    return wishlistIds.has(productId);
  }, [wishlistIds]);

  const toggleWishlist = useCallback(async (productId: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({
          title: "Please login",
          description: "You need to be logged in to add items to wishlist",
          variant: "destructive"
        });
        return false;
      }

      const inWishlist = wishlistIds.has(productId);

      if (inWishlist) {
        // Remove
        const { error } = await supabase
          .from('wishlists')
          .delete()
          .eq('user_id', session.user.id)
          .eq('product_id', productId);

        if (error) throw error;

        setWishlistIds(prev => {
          const next = new Set(prev);
          next.delete(productId);
          return next;
        });

        toast({ title: "Removed from wishlist" });
        return false;
      } else {
        // Add
        const { error } = await supabase
          .from('wishlists')
          .insert({
            user_id: session.user.id,
            product_id: productId
          });

        if (error) throw error;

        setWishlistIds(prev => new Set(prev).add(productId));
        toast({ title: "Added to wishlist" });
        return true;
      }
    } catch (error) {
      console.error('Error toggling wishlist:', error);
      toast({
        title: "Error",
        description: "Could not update wishlist",
        variant: "destructive"
      });
      return wishlistIds.has(productId);
    }
  }, [wishlistIds]);

  const addToWishlist = useCallback(async (productId: string) => {
    if (wishlistIds.has(productId)) return true;
    return toggleWishlist(productId);
  }, [wishlistIds, toggleWishlist]);

  const removeFromWishlist = useCallback(async (productId: string) => {
    if (!wishlistIds.has(productId)) return true;
    return toggleWishlist(productId);
  }, [wishlistIds, toggleWishlist]);

  return {
    items,
    loading,
    wishlistCount: wishlistIds.size,
    isInWishlist,
    toggleWishlist,
    addToWishlist,
    removeFromWishlist,
    refetch: fetchWishlist
  };
}
