import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace('Bearer ', '');
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);
    
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const userId = claimsData.claims.sub;
    const url = new URL(req.url);
    const path = url.pathname.replace('/wishlist', '');

    // GET /wishlist - Get user's wishlist
    if ((path === '' || path === '/') && req.method === 'GET') {
      const { data: wishlistItems, error } = await supabase
        .from('wishlists')
        .select('*, products(*)')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const items = (wishlistItems || []).map((item: any) => ({
        id: item.id,
        product_id: item.product_id,
        added_at: item.created_at,
        product: item.products ? {
          id: item.products.id,
          name: item.products.name,
          part_number: item.products.part_number,
          price: item.products.selling_price,
          mrp: item.products.mrp,
          discount_percentage: item.products.discount_percentage,
          image_url: item.products.images?.[0]?.url || null,
          in_stock: item.products.stock_quantity > 0,
          rating: item.products.average_rating
        } : null
      }));

      return new Response(JSON.stringify({
        success: true,
        data: {
          total: items.length,
          items
        }
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // POST /wishlist/add
    if (path === '/add' && req.method === 'POST') {
      const body = await req.json();
      const { product_id } = body;

      if (!product_id) {
        return new Response(JSON.stringify({ error: 'Product ID required' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // Check if already in wishlist
      const { data: existing } = await supabase
        .from('wishlists')
        .select('id')
        .eq('user_id', userId)
        .eq('product_id', product_id)
        .single();

      if (existing) {
        return new Response(JSON.stringify({
          success: true,
          message: 'Item already in wishlist',
          already_exists: true
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      const { error } = await supabase
        .from('wishlists')
        .insert({
          user_id: userId,
          product_id
        });

      if (error) throw error;

      // Get updated count
      const { count } = await supabase
        .from('wishlists')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);

      return new Response(JSON.stringify({
        success: true,
        message: 'Added to wishlist',
        wishlist_count: count || 0
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // DELETE /wishlist/remove/:productId
    const removeMatch = path.match(/^\/remove\/([a-f0-9-]+)$/i);
    if (removeMatch && req.method === 'DELETE') {
      const productId = removeMatch[1];

      const { error } = await supabase
        .from('wishlists')
        .delete()
        .eq('user_id', userId)
        .eq('product_id', productId);

      if (error) throw error;

      // Get updated count
      const { count } = await supabase
        .from('wishlists')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);

      return new Response(JSON.stringify({
        success: true,
        message: 'Removed from wishlist',
        wishlist_count: count || 0
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // POST /wishlist/toggle
    if (path === '/toggle' && req.method === 'POST') {
      const body = await req.json();
      const { product_id } = body;

      if (!product_id) {
        return new Response(JSON.stringify({ error: 'Product ID required' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // Check if exists
      const { data: existing } = await supabase
        .from('wishlists')
        .select('id')
        .eq('user_id', userId)
        .eq('product_id', product_id)
        .single();

      if (existing) {
        // Remove
        await supabase
          .from('wishlists')
          .delete()
          .eq('id', existing.id);

        const { count } = await supabase
          .from('wishlists')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', userId);

        return new Response(JSON.stringify({
          success: true,
          action: 'removed',
          in_wishlist: false,
          wishlist_count: count || 0
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      } else {
        // Add
        await supabase
          .from('wishlists')
          .insert({
            user_id: userId,
            product_id
          });

        const { count } = await supabase
          .from('wishlists')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', userId);

        return new Response(JSON.stringify({
          success: true,
          action: 'added',
          in_wishlist: true,
          wishlist_count: count || 0
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
    }

    // GET /wishlist/check/:productId
    const checkMatch = path.match(/^\/check\/([a-f0-9-]+)$/i);
    if (checkMatch && req.method === 'GET') {
      const productId = checkMatch[1];

      const { data: existing } = await supabase
        .from('wishlists')
        .select('id')
        .eq('user_id', userId)
        .eq('product_id', productId)
        .single();

      return new Response(JSON.stringify({
        success: true,
        in_wishlist: !!existing
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // POST /wishlist/move-to-cart
    if (path === '/move-to-cart' && req.method === 'POST') {
      const body = await req.json();
      const { product_id } = body;

      if (!product_id) {
        return new Response(JSON.stringify({ error: 'Product ID required' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // Add to cart
      const { data: existingCart } = await supabase
        .from('cart_items')
        .select('*')
        .eq('user_id', userId)
        .eq('product_id', product_id)
        .single();

      if (existingCart) {
        await supabase
          .from('cart_items')
          .update({ quantity: existingCart.quantity + 1 })
          .eq('id', existingCart.id);
      } else {
        await supabase
          .from('cart_items')
          .insert({
            user_id: userId,
            product_id,
            quantity: 1
          });
      }

      // Remove from wishlist
      await supabase
        .from('wishlists')
        .delete()
        .eq('user_id', userId)
        .eq('product_id', product_id);

      return new Response(JSON.stringify({
        success: true,
        message: 'Moved to cart'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({ error: 'Not found' }), {
      status: 404,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error: unknown) {
    console.error('Wishlist API error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
