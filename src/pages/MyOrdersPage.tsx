import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Package, Truck, CheckCircle2, XCircle, RefreshCw, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { BottomNav } from '@/components/BottomNav';

interface Order {
  id: string;
  order_number: string;
  total_amount: number;
  status: string;
  created_at: string;
  estimated_delivery: string;
  delivery_type: string;
}

export default function MyOrdersPage() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate('/auth');
      return;
    }

    const { data } = await supabase
      .from('orders')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (data) setOrders(data);
    setIsLoading(false);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed': return <Clock className="w-4 h-4" />;
      case 'preparing': return <Package className="w-4 h-4" />;
      case 'shipped': return <Truck className="w-4 h-4" />;
      case 'delivered': return <CheckCircle2 className="w-4 h-4" />;
      case 'cancelled': return <XCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-blue-100 text-blue-700';
      case 'preparing': return 'bg-yellow-100 text-yellow-700';
      case 'shipped': return 'bg-purple-100 text-purple-700';
      case 'delivered': return 'bg-green-100 text-green-700';
      case 'cancelled': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const activeOrders = orders.filter(o => ['confirmed', 'preparing', 'shipped'].includes(o.status));
  const deliveredOrders = orders.filter(o => o.status === 'delivered');
  const cancelledOrders = orders.filter(o => o.status === 'cancelled');

  const OrderCard = ({ order }: { order: Order }) => (
    <Card 
      className="p-4 cursor-pointer hover:shadow-md transition-shadow"
      onClick={() => navigate(`/orders/${order.id}`)}
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="text-sm font-medium">{order.order_number}</p>
          <p className="text-xs text-muted-foreground">
            {new Date(order.created_at).toLocaleDateString('en-IN', {
              day: 'numeric',
              month: 'short',
              year: 'numeric'
            })}
          </p>
        </div>
        <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
          {getStatusIcon(order.status)}
          <span className="capitalize">{order.status}</span>
        </div>
      </div>
      
      <div className="flex items-center justify-between">
        <span className="font-bold">₹{Number(order.total_amount).toLocaleString()}</span>
        {order.status !== 'delivered' && order.status !== 'cancelled' && (
          <span className="text-xs text-muted-foreground">
            Expected {new Date(order.estimated_delivery).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
          </span>
        )}
      </div>

      <div className="flex gap-2 mt-3">
        {order.status === 'shipped' && (
          <Button size="sm" variant="outline" className="flex-1">
            <Truck className="w-3 h-3 mr-1" />
            Track
          </Button>
        )}
        {order.status === 'delivered' && (
          <Button size="sm" variant="outline" className="flex-1">
            <RefreshCw className="w-3 h-3 mr-1" />
            Reorder
          </Button>
        )}
      </div>
    </Card>
  );

  const EmptyState = ({ message }: { message: string }) => (
    <div className="flex flex-col items-center justify-center py-12">
      <Package className="w-16 h-16 text-muted-foreground mb-4" />
      <p className="text-muted-foreground">{message}</p>
      <Button onClick={() => navigate('/')} className="mt-4">
        Start Shopping
      </Button>
    </div>
  );

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="sticky top-0 z-40 bg-background border-b px-4 py-3">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-lg font-semibold">My Orders</h1>
        </div>
      </header>

      <Tabs defaultValue="active" className="w-full">
        <TabsList className="w-full grid grid-cols-3 mx-4 mt-4" style={{ width: 'calc(100% - 2rem)' }}>
          <TabsTrigger value="active">Active ({activeOrders.length})</TabsTrigger>
          <TabsTrigger value="delivered">Delivered ({deliveredOrders.length})</TabsTrigger>
          <TabsTrigger value="cancelled">Cancelled ({cancelledOrders.length})</TabsTrigger>
        </TabsList>

        <div className="p-4">
          <TabsContent value="active" className="mt-0 space-y-3">
            {activeOrders.length === 0 ? (
              <EmptyState message="No active orders" />
            ) : (
              activeOrders.map(order => <OrderCard key={order.id} order={order} />)
            )}
          </TabsContent>

          <TabsContent value="delivered" className="mt-0 space-y-3">
            {deliveredOrders.length === 0 ? (
              <EmptyState message="No delivered orders yet" />
            ) : (
              deliveredOrders.map(order => <OrderCard key={order.id} order={order} />)
            )}
          </TabsContent>

          <TabsContent value="cancelled" className="mt-0 space-y-3">
            {cancelledOrders.length === 0 ? (
              <EmptyState message="No cancelled orders" />
            ) : (
              cancelledOrders.map(order => <OrderCard key={order.id} order={order} />)
            )}
          </TabsContent>
        </div>
      </Tabs>

      <BottomNav activeTab="/orders" onTabChange={(tab) => navigate(tab)} />
    </div>
  );
}
