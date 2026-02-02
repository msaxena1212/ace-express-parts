import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Package, Truck, CheckCircle, MapPin, Phone, RefreshCw, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';

interface TrackingEvent {
  status: string;
  title: string;
  description: string;
  location?: string;
  timestamp: string;
  is_current: boolean;
}

interface TrackingData {
  order_id: string;
  order_number: string;
  tracking_number: string;
  carrier: string;
  current_status: string;
  status_code: string;
  progress_percentage: number;
  estimated_delivery: string;
  timeline: TrackingEvent[];
  live_tracking?: {
    available: boolean;
    driver_name: string;
    driver_phone: string;
    eta_minutes: number;
  };
}

export default function OrderTrackingPage() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [tracking, setTracking] = useState<TrackingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchTracking = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/auth');
        return;
      }

      // Get order details directly from database
      const { data: order, error } = await supabase
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .single();

      if (error || !order) {
        console.error('Order not found');
        return;
      }

      // Generate tracking data from order
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

      const timeline = generateTimeline(order);

      setTracking({
        order_id: order.id,
        order_number: order.order_number,
        tracking_number: order.tracking_number || `DL${Date.now()}`,
        carrier: order.carrier || 'Delhivery',
        current_status: formatStatus(order.status),
        status_code: order.status,
        progress_percentage: statusProgress[order.status] || 0,
        estimated_delivery: order.estimated_delivery,
        timeline,
        live_tracking: order.status === 'out_for_delivery' ? {
          available: true,
          driver_name: 'Rajesh Kumar',
          driver_phone: '+91 98765 43210',
          eta_minutes: 25
        } : undefined
      });
    } catch (error) {
      console.error('Tracking error:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchTracking();
    
    // Set up realtime subscription for order updates
    const channel = supabase
      .channel(`order-${orderId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'orders',
          filter: `id=eq.${orderId}`
        },
        () => {
          fetchTracking();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [orderId]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchTracking();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-primary">Loading tracking...</div>
      </div>
    );
  }

  if (!tracking) {
    return (
      <div className="min-h-screen bg-background p-4">
        <header className="sticky top-0 z-40 bg-background py-3">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </header>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Tracking information not available</p>
        </div>
      </div>
    );
  }

  const estimatedDate = tracking.estimated_delivery 
    ? new Date(tracking.estimated_delivery).toLocaleDateString('en-IN', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    : 'Calculating...';

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="sticky top-0 z-40 bg-background border-b px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-lg font-semibold">Track Order</h1>
              <p className="text-xs text-muted-foreground">{tracking.order_number}</p>
            </div>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </header>

      <div className="p-4 space-y-4">
        {/* Status Card */}
        <Card className="p-4 bg-primary/10 border-primary/30">
          <div className="flex items-center gap-3 mb-3">
            {tracking.status_code === 'delivered' ? (
              <CheckCircle className="w-8 h-8 text-green-500" />
            ) : (
              <Truck className="w-8 h-8 text-primary" />
            )}
            <div>
              <h2 className="font-semibold text-lg">{tracking.current_status}</h2>
              <p className="text-sm text-muted-foreground">
                {tracking.status_code === 'delivered' 
                  ? 'Your order has been delivered'
                  : `Estimated delivery: ${estimatedDate}`
                }
              </p>
            </div>
          </div>
          <Progress value={tracking.progress_percentage} className="h-2" />
          <div className="flex justify-between text-xs text-muted-foreground mt-2">
            <span>Ordered</span>
            <span>Shipped</span>
            <span>Delivered</span>
          </div>
        </Card>

        {/* Tracking Details */}
        <Card className="p-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-muted-foreground">Tracking Number</p>
              <p className="font-mono font-medium">{tracking.tracking_number}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Carrier</p>
              <p className="font-medium">{tracking.carrier}</p>
            </div>
          </div>
        </Card>

        {/* Live Tracking */}
        {tracking.live_tracking?.available && (
          <Card className="p-4 border-green-500/30 bg-green-500/10">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-sm font-medium text-green-500">Live Tracking Available</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                  <Truck className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-medium">{tracking.live_tracking.driver_name}</p>
                  <p className="text-sm text-muted-foreground">Delivery Partner</p>
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-1 text-primary">
                  <Clock className="w-4 h-4" />
                  <span className="font-medium">{tracking.live_tracking.eta_minutes} min</span>
                </div>
                <p className="text-xs text-muted-foreground">ETA</p>
              </div>
            </div>
            <Button className="w-full mt-3" variant="outline">
              <Phone className="w-4 h-4 mr-2" />
              Call Driver
            </Button>
          </Card>
        )}

        {/* Timeline */}
        <Card className="p-4">
          <h3 className="font-semibold mb-4">Shipment Updates</h3>
          <div className="space-y-4">
            {tracking.timeline.map((event, index) => (
              <div key={index} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div className={`w-3 h-3 rounded-full ${
                    event.is_current 
                      ? 'bg-primary ring-4 ring-primary/20' 
                      : 'bg-muted-foreground'
                  }`} />
                  {index < tracking.timeline.length - 1 && (
                    <div className="w-0.5 h-full bg-border flex-1 mt-1" />
                  )}
                </div>
                <div className="flex-1 pb-4">
                  <p className={`font-medium text-sm ${event.is_current ? 'text-primary' : ''}`}>
                    {event.title}
                  </p>
                  <p className="text-sm text-muted-foreground">{event.description}</p>
                  {event.location && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                      <MapPin className="w-3 h-3" />
                      {event.location}
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(event.timestamp).toLocaleString('en-IN', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Help */}
        <Card className="p-4">
          <h3 className="font-semibold mb-2">Need Help?</h3>
          <p className="text-sm text-muted-foreground mb-3">
            Having issues with your delivery? Our support team is here to help.
          </p>
          <Button variant="outline" className="w-full">
            Contact Support
          </Button>
        </Card>
      </div>
    </div>
  );
}

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

function generateTimeline(order: any): TrackingEvent[] {
  const events: TrackingEvent[] = [];
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
