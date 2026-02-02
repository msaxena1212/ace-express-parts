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
    const path = url.pathname.replace('/cart', '');

    // GET /cart - Get user's cart
    if ((path === '' || path === '/') && req.method === 'GET') {
      const { data, error } = await supabase
        .from('cart_items')
        .select('*')
        .eq('user_id', userId);

      if (error) throw error;

      // Calculate summary
      let subtotal = 0;
      // Note: In production, fetch actual product prices from products table
      const totalItems = data?.reduce((sum, item) => sum + item.quantity, 0) || 0;

      return new Response(JSON.stringify({
        success: true,
        data: {
          items: data || [],
          summary: {
            total_items: totalItems,
            subtotal,
            estimated_gst: subtotal * 0.18,
            estimated_delivery_fee: subtotal >= 5000 ? 0 : 99,
            estimated_total: subtotal + subtotal * 0.18 + (subtotal >= 5000 ? 0 : 99)
          }
        }
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // POST /cart/add
    if (path === '/add' && req.method === 'POST') {
      const body = await req.json();
      const { product_id, quantity = 1 } = body;

      if (!product_id) {
        return new Response(JSON.stringify({ error: 'Product ID required' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // Check if item already in cart
      const { data: existing } = await supabase
        .from('cart_items')
        .select('*')
        .eq('user_id', userId)
        .eq('product_id', product_id)
        .single();

      if (existing) {
        // Update quantity
        const { error } = await supabase
          .from('cart_items')
          .update({ quantity: existing.quantity + quantity })
          .eq('id', existing.id);

        if (error) throw error;
      } else {
        // Insert new item
        const { error } = await supabase
          .from('cart_items')
          .insert({
            user_id: userId,
            product_id,
            quantity
          });

        if (error) throw error;
      }

      // Get updated cart count
      const { data: cartItems } = await supabase
        .from('cart_items')
        .select('quantity')
        .eq('user_id', userId);

      const totalItems = cartItems?.reduce((sum, item) => sum + item.quantity, 0) || 0;

      return new Response(JSON.stringify({
        success: true,
        message: 'Item added to cart',
        cart: {
          total_items: totalItems,
          item_count_badge: totalItems
        }
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // PUT /cart/update/:id
    const updateMatch = path.match(/^\/update\/([a-f0-9-]+)$/i);
    if (updateMatch && req.method === 'PUT') {
      const itemId = updateMatch[1];
      const body = await req.json();
      const { quantity } = body;

      if (quantity <= 0) {
        // Remove item
        await supabase
          .from('cart_items')
          .delete()
          .eq('id', itemId)
          .eq('user_id', userId);
      } else {
        await supabase
          .from('cart_items')
          .update({ quantity })
          .eq('id', itemId)
          .eq('user_id', userId);
      }

      return new Response(JSON.stringify({
        success: true,
        message: 'Cart updated'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // DELETE /cart/remove/:id
    const removeMatch = path.match(/^\/remove\/([a-f0-9-]+)$/i);
    if (removeMatch && req.method === 'DELETE') {
      const itemId = removeMatch[1];

      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('id', itemId)
        .eq('user_id', userId);

      if (error) throw error;

      return new Response(JSON.stringify({
        success: true,
        message: 'Item removed from cart'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // POST /cart/apply-promo
    if (path === '/apply-promo' && req.method === 'POST') {
      const body = await req.json();
      const { promo_code } = body;

      // Mock promo validation
      const validPromos: Record<string, { discount: number; type: string }> = {
        'BULK20': { discount: 20, type: 'percentage' },
        'FIRST10': { discount: 10, type: 'percentage' },
        'FLAT500': { discount: 500, type: 'fixed' }
      };

      const promo = validPromos[promo_code?.toUpperCase()];

      if (!promo) {
        return new Response(JSON.stringify({
          success: false,
          error: 'Invalid promo code'
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      return new Response(JSON.stringify({
        success: true,
        discount: promo.discount,
        discount_type: promo.type,
        message: `Promo code applied: ${promo.discount}${promo.type === 'percentage' ? '%' : '₹'} off`
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // DELETE /cart/clear
    if (path === '/clear' && req.method === 'DELETE') {
      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('user_id', userId);

      if (error) throw error;

      return new Response(JSON.stringify({
        success: true,
        message: 'Cart cleared'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({ error: 'Not found' }), {
      status: 404,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Cart API error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
