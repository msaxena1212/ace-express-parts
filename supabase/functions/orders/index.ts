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
    const path = url.pathname.replace('/orders', '');

    // GET /orders - List user's orders
    if ((path === '' || path === '/') && req.method === 'GET') {
      const status = url.searchParams.get('status');
      const page = parseInt(url.searchParams.get('page') || '1');
      const limit = parseInt(url.searchParams.get('limit') || '20');

      let query = supabase
        .from('orders')
        .select('*, order_items(*)', { count: 'exact' })
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (status && status !== 'all') {
        query = query.eq('status', status);
      }

      const offset = (page - 1) * limit;
      query = query.range(offset, offset + limit - 1);

      const { data, count, error } = await query;

      if (error) throw error;

      return new Response(JSON.stringify({
        success: true,
        data: {
          total: count,
          page,
          limit,
          orders: data?.map(o => ({
            id: o.id,
            order_number: o.order_number,
            status: o.status,
            total_amount: o.total_amount,
            items_count: o.order_items?.length || 0,
            created_at: o.created_at,
            estimated_delivery: o.estimated_delivery
          }))
        }
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // GET /orders/:id
    const idMatch = path.match(/^\/([a-f0-9-]+)$/i);
    if (idMatch && req.method === 'GET') {
      const orderId = idMatch[1];

      const { data: order, error } = await supabase
        .from('orders')
        .select('*, order_items(*)')
        .eq('id', orderId)
        .eq('user_id', userId)
        .single();

      if (error) throw error;

      // Get delivery address if exists
      let address = null;
      if (order.delivery_address_id) {
        const { data: addressData } = await supabase
          .from('addresses')
          .select('*')
          .eq('id', order.delivery_address_id)
          .single();
        address = addressData;
      }

      return new Response(JSON.stringify({
        success: true,
        data: {
          ...order,
          delivery_address: address,
          tracking: {
            carrier: order.carrier,
            tracking_number: order.tracking_number,
            current_status: order.status,
            estimated_delivery: order.estimated_delivery
          }
        }
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // POST /orders/create
    if (path === '/create' && req.method === 'POST') {
      const body = await req.json();
      const { cart_items, delivery_address_id, delivery_option, payment_method } = body;

      if (!cart_items || cart_items.length === 0) {
        return new Response(JSON.stringify({ error: 'Cart is empty' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // Calculate totals
      let subtotal = 0;
      const orderItems = cart_items.map((item: any) => {
        const itemTotal = item.price * item.quantity;
        subtotal += itemTotal;
        return {
          product_id: item.product_id,
          product_name: item.name,
          part_number: item.part_number,
          quantity: item.quantity,
          unit_price: item.price,
          item_total: itemTotal
        };
      });

      const gstAmount = subtotal * 0.18;
      const deliveryFee = delivery_option === 'fast_track' ? 499 : (subtotal >= 5000 ? 0 : 99);
      const totalAmount = subtotal + gstAmount + deliveryFee;

      const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
      const estimatedDelivery = new Date(
        Date.now() + (delivery_option === 'fast_track' ? 8 * 60 * 60 * 1000 : 48 * 60 * 60 * 1000)
      ).toISOString();

      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: userId,
          order_number: orderNumber,
          subtotal,
          gst_amount: gstAmount,
          delivery_fee: deliveryFee,
          total_amount: totalAmount,
          delivery_address_id,
          delivery_type: delivery_option,
          payment_method,
          payment_status: payment_method === 'cod' ? 'pending' : 'paid',
          status: 'confirmed',
          estimated_delivery: estimatedDelivery
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Insert order items
      const itemsWithOrderId = orderItems.map((item: any) => ({
        ...item,
        order_id: order.id
      }));

      await supabase.from('order_items').insert(itemsWithOrderId);

      // Clear cart
      await supabase
        .from('cart_items')
        .delete()
        .eq('user_id', userId);

      return new Response(JSON.stringify({
        success: true,
        order: {
          id: order.id,
          order_number: order.order_number,
          status: order.status,
          total_amount: order.total_amount,
          estimated_delivery: order.estimated_delivery
        }
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // PUT /orders/:id/cancel
    const cancelMatch = path.match(/^\/([a-f0-9-]+)\/cancel$/i);
    if (cancelMatch && req.method === 'PUT') {
      const orderId = cancelMatch[1];
      const body = await req.json();

      const { data: order, error: fetchError } = await supabase
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .eq('user_id', userId)
        .single();

      if (fetchError || !order) {
        return new Response(JSON.stringify({ error: 'Order not found' }), {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      if (!['confirmed', 'preparing'].includes(order.status)) {
        return new Response(JSON.stringify({ error: 'Order cannot be cancelled' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      const { error: updateError } = await supabase
        .from('orders')
        .update({ 
          status: 'cancelled',
          notes: body.reason || 'Cancelled by user'
        })
        .eq('id', orderId);

      if (updateError) throw updateError;

      return new Response(JSON.stringify({
        success: true,
        message: 'Order cancelled successfully',
        refund_amount: order.total_amount,
        refund_status: 'initiated'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({ error: 'Not found' }), {
      status: 404,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Orders API error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
