import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Delhivery API integration for order tracking
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
    const path = url.pathname.replace('/tracking', '');

    // GET /tracking/:orderId - Get tracking details for an order
    const orderMatch = path.match(/^\/([a-f0-9-]+)$/i);
    if (orderMatch && req.method === 'GET') {
      const orderId = orderMatch[1];

      // Get order details
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .eq('user_id', userId)
        .single();

      if (orderError || !order) {
        return new Response(JSON.stringify({ error: 'Order not found' }), {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // Generate tracking events based on order status
      const trackingEvents = generateTrackingEvents(order);
      
      // Calculate progress percentage
      const statusProgress: Record<string, number> = {
        'confirmed': 10,
        'preparing': 25,
        'packed': 40,
        'shipped': 60,
        'in_transit': 75,
        'out_for_delivery': 90,
        'delivered': 100,
        'cancelled': 0
      };

      const progress = statusProgress[order.status] || 0;

      // Generate realistic tracking response
      const trackingResponse = {
        success: true,
        data: {
          order_id: order.id,
          order_number: order.order_number,
          tracking_number: order.tracking_number || `DL${Date.now()}`,
          carrier: order.carrier || 'Delhivery',
          carrier_logo: 'https://www.delhivery.com/images/delhivery-logo.svg',
          current_status: formatStatus(order.status),
          status_code: order.status,
          progress_percentage: progress,
          estimated_delivery: order.estimated_delivery,
          shipped_date: order.shipped_date,
          delivered_date: order.delivered_date,
          origin: {
            city: 'Delhi',
            state: 'Delhi',
            pincode: '110001'
          },
          destination: order.delivery_address_id ? await getAddressDetails(supabase, order.delivery_address_id) : null,
          timeline: trackingEvents,
          live_tracking: order.status === 'out_for_delivery' ? {
            available: true,
            driver_name: 'Rajesh Kumar',
            driver_phone: '+91 98765 43210',
            eta_minutes: 25,
            last_updated: new Date().toISOString()
          } : null
        }
      };

      return new Response(JSON.stringify(trackingResponse), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // GET /tracking/live/:trackingNumber - Realtime tracking updates
    const liveMatch = path.match(/^\/live\/([A-Z0-9]+)$/i);
    if (liveMatch && req.method === 'GET') {
      const trackingNumber = liveMatch[1];

      // Simulate live tracking data
      const liveData = {
        success: true,
        data: {
          tracking_number: trackingNumber,
          current_location: {
            latitude: 28.6139 + (Math.random() * 0.1),
            longitude: 77.2090 + (Math.random() * 0.1),
            address: 'Near Connaught Place, New Delhi',
            updated_at: new Date().toISOString()
          },
          driver: {
            name: 'Rajesh Kumar',
            phone: '+91 98765 43210',
            vehicle_number: 'DL 01 AB 1234'
          },
          eta_minutes: Math.floor(15 + Math.random() * 30),
          stops_remaining: Math.floor(1 + Math.random() * 3)
        }
      };

      return new Response(JSON.stringify(liveData), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({ error: 'Not found' }), {
      status: 404,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error: unknown) {
    console.error('Tracking API error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

function formatStatus(status: string): string {
  const statusMap: Record<string, string> = {
    'confirmed': 'Order Confirmed',
    'preparing': 'Preparing Order',
    'packed': 'Order Packed',
    'shipped': 'Shipped',
    'in_transit': 'In Transit',
    'out_for_delivery': 'Out for Delivery',
    'delivered': 'Delivered',
    'cancelled': 'Cancelled'
  };
  return statusMap[status] || status;
}

function generateTrackingEvents(order: any): any[] {
  const events = [];
  const baseTime = new Date(order.created_at);
  
  const statusFlow = ['confirmed', 'preparing', 'packed', 'shipped', 'in_transit', 'out_for_delivery', 'delivered'];
  const currentIndex = statusFlow.indexOf(order.status);
  
  const descriptions: Record<string, { title: string; description: string; location?: string }> = {
    'confirmed': {
      title: 'Order Confirmed',
      description: 'Your order has been confirmed and is being processed',
      location: 'ACE Central Warehouse, Delhi'
    },
    'preparing': {
      title: 'Preparing Order',
      description: 'Your items are being picked and packed',
      location: 'ACE Central Warehouse, Delhi'
    },
    'packed': {
      title: 'Order Packed',
      description: 'Your order has been packed and is ready for dispatch',
      location: 'ACE Central Warehouse, Delhi'
    },
    'shipped': {
      title: 'Shipped',
      description: 'Your order has been handed over to Delhivery',
      location: 'Delhivery Hub, Delhi'
    },
    'in_transit': {
      title: 'In Transit',
      description: 'Your package is on its way',
      location: 'Delhivery Transit Hub'
    },
    'out_for_delivery': {
      title: 'Out for Delivery',
      description: 'Your package is out for delivery',
      location: 'Local Delivery Center'
    },
    'delivered': {
      title: 'Delivered',
      description: 'Your package has been delivered',
      location: 'Delivery Address'
    }
  };

  for (let i = 0; i <= currentIndex && i < statusFlow.length; i++) {
    const status = statusFlow[i];
    const desc = descriptions[status];
    const eventTime = new Date(baseTime.getTime() + i * 4 * 60 * 60 * 1000);
    
    events.push({
      status: status,
      title: desc.title,
      description: desc.description,
      location: desc.location,
      timestamp: eventTime.toISOString(),
      is_current: i === currentIndex
    });
  }

  return events.reverse();
}

async function getAddressDetails(supabase: any, addressId: string) {
  const { data } = await supabase
    .from('addresses')
    .select('city, state, pincode')
    .eq('id', addressId)
    .single();
  
  return data || { city: 'Unknown', state: 'Unknown', pincode: '000000' };
}
