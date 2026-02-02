import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Package, Truck, CheckCircle2, Clock, MapPin, Phone, Copy, Share2, Download, XCircle, RefreshCw, Star, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { products } from '@/data/mockData';

interface Order {
  id: string;
  order_number: string;
  status: string;
  subtotal: number;
  discount_amount: number;
  gst_amount: number;
  delivery_fee: number;
  total_amount: number;
  delivery_type: string;
  payment_method: string;
  payment_status: string;
  tracking_number: string | null;
  carrier: string | null;
  estimated_delivery: string;
  created_at: string;
  shipped_date: string | null;
  delivered_date: string | null;
}

interface OrderItem {
  id: string;
  product_id: string;
  product_name: string;
  part_number: string;
  quantity: number;
  unit_price: number;
  item_total: number;
}

interface Address {
  id: string;
  label: string;
  full_address: string;
  city: string;
  state: string;
  pincode: string;
  phone: string;
}

export default function OrderDetailsPage() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [items, setItems] = useState<OrderItem[]>([]);
  const [address, setAddress] = useState<Address | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchOrderDetails();
  }, [orderId]);

  const fetchOrderDetails = async () => {
    if (!orderId) return;

    const { data: orderData } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single();

    if (orderData) {
      setOrder(orderData);

      // Fetch items
      const { data: itemsData } = await supabase
        .from('order_items')
        .select('*')
        .eq('order_id', orderId);

      if (itemsData) setItems(itemsData);

      // Fetch address if exists
      if (orderData.delivery_address_id) {
        const { data: addressData } = await supabase
          .from('addresses')
          .select('*')
          .eq('id', orderData.delivery_address_id)
          .single();

        if (addressData) setAddress(addressData);
      }
    }

    setIsLoading(false);
  };

  const copyTrackingNumber = () => {
    if (order?.tracking_number) {
      navigator.clipboard.writeText(order.tracking_number);
      toast({ title: "Copied!", description: "Tracking number copied" });
    }
  };

  const getStatusStep = (status: string) => {
    const steps = ['confirmed', 'preparing', 'shipped', 'delivered'];
    return steps.indexOf(status);
  };

  const handleCancelOrder = async () => {
    if (!order) return;
    
    const { error } = await supabase
      .from('orders')
      .update({ status: 'cancelled' })
      .eq('id', order.id);

    if (error) {
      toast({ title: "Error", description: "Failed to cancel order", variant: "destructive" });
    } else {
      toast({ title: "Order cancelled" });
      fetchOrderDetails();
    }
  };

  if (isLoading || !order) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const statusStep = getStatusStep(order.status);

  return (
    <div className="min-h-screen bg-background pb-8">
      <header className="sticky top-0 z-40 bg-background border-b px-4 py-3">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-lg font-semibold">Order Details</h1>
            <p className="text-xs text-muted-foreground">{order.order_number}</p>
          </div>
        </div>
      </header>

      <div className="p-4 space-y-4">
        {/* Status Badge */}
        <Card className="p-4">
          <div className="flex items-center justify-between mb-4">
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${
              order.status === 'delivered' ? 'bg-green-100 text-green-700' :
              order.status === 'cancelled' ? 'bg-red-100 text-red-700' :
              'bg-blue-100 text-blue-700'
            }`}>
              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
            </div>
            <p className="text-sm text-muted-foreground">
              Expected {new Date(order.estimated_delivery).toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'short',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </p>
          </div>

          {/* Timeline */}
          {order.status !== 'cancelled' && (
            <div className="flex items-center justify-between">
              {['Confirmed', 'Preparing', 'Shipped', 'Delivered'].map((step, i) => (
                <div key={step} className="flex flex-col items-center flex-1">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    i <= statusStep ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                  }`}>
                    {i === 0 && <CheckCircle2 className="w-4 h-4" />}
                    {i === 1 && <Package className="w-4 h-4" />}
                    {i === 2 && <Truck className="w-4 h-4" />}
                    {i === 3 && <CheckCircle2 className="w-4 h-4" />}
                  </div>
                  <span className={`text-xs mt-1 ${i <= statusStep ? 'text-primary' : 'text-muted-foreground'}`}>
                    {step}
                  </span>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Tracking Info */}
        {order.tracking_number && (
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Tracking Number</p>
                <p className="font-mono font-medium">{order.tracking_number}</p>
                {order.carrier && <p className="text-xs text-muted-foreground">{order.carrier}</p>}
              </div>
              <Button variant="outline" size="sm" onClick={copyTrackingNumber}>
                <Copy className="w-4 h-4" />
              </Button>
            </div>
          </Card>
        )}

        {/* Delivery Address */}
        {address && (
          <Card className="p-4">
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="font-medium">{address.label}</p>
                <p className="text-sm text-muted-foreground">{address.full_address}</p>
                <p className="text-sm text-muted-foreground">{address.city}, {address.state} - {address.pincode}</p>
                <p className="text-sm mt-1">{address.phone}</p>
              </div>
            </div>
          </Card>
        )}

        {/* Order Items */}
        <Card className="p-4">
          <h3 className="font-medium mb-3">Items ({items.length})</h3>
          <div className="space-y-4">
            {items.map(item => {
              const product = products.find(p => p.id === item.product_id);
              return (
                <div key={item.id} className="flex gap-3">
                  <img 
                    src={product?.image || '/placeholder.svg'} 
                    alt={item.product_name}
                    className="w-16 h-16 rounded bg-muted object-cover"
                  />
                  <div className="flex-1">
                    <p className="font-medium text-sm line-clamp-1">{item.product_name}</p>
                    <p className="text-xs text-muted-foreground">{item.part_number}</p>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-sm">Qty: {item.quantity}</span>
                      <span className="font-medium">₹{item.item_total.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Order Summary */}
        <Card className="p-4">
          <h3 className="font-medium mb-3">Order Summary</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span>₹{Number(order.subtotal).toLocaleString()}</span>
            </div>
            {Number(order.discount_amount) > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Discount</span>
                <span>-₹{Number(order.discount_amount).toLocaleString()}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-muted-foreground">GST</span>
              <span>₹{Number(order.gst_amount).toFixed(0)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Delivery</span>
              <span className={Number(order.delivery_fee) === 0 ? 'text-green-600' : ''}>
                {Number(order.delivery_fee) === 0 ? 'FREE' : `₹${Number(order.delivery_fee)}`}
              </span>
            </div>
            <Separator />
            <div className="flex justify-between font-bold text-base">
              <span>Total</span>
              <span>₹{Number(order.total_amount).toLocaleString()}</span>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Payment Method</span>
              <span className="capitalize">{order.payment_method?.replace('_', ' ')}</span>
            </div>
            <div className="flex items-center justify-between text-sm mt-1">
              <span className="text-muted-foreground">Payment Status</span>
              <span className={`capitalize ${order.payment_status === 'paid' ? 'text-green-600' : 'text-yellow-600'}`}>
                {order.payment_status}
              </span>
            </div>
          </div>
        </Card>

        {/* Actions */}
        <div className="space-y-3">
          {order.status === 'delivered' && (
            <>
              <Button className="w-full" variant="outline">
                <Star className="w-4 h-4 mr-2" />
                Rate & Review
              </Button>
              <Button className="w-full" variant="outline">
                <RefreshCw className="w-4 h-4 mr-2" />
                Reorder This
              </Button>
            </>
          )}

          {['confirmed', 'preparing'].includes(order.status) && (
            <Button 
              className="w-full" 
              variant="destructive"
              onClick={handleCancelOrder}
            >
              <XCircle className="w-4 h-4 mr-2" />
              Cancel Order
            </Button>
          )}

          <div className="flex gap-3">
            <Button variant="outline" className="flex-1">
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>
            <Button variant="outline" className="flex-1">
              <Download className="w-4 h-4 mr-2" />
              Invoice
            </Button>
          </div>

          <Button variant="outline" className="w-full">
            <MessageCircle className="w-4 h-4 mr-2" />
            Contact Support
          </Button>
        </div>
      </div>
    </div>
  );
}
