import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Search, Filter, Phone, Check, X, MoreVertical, Package, Truck, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { DealerBottomNav } from '@/components/dealer/DealerBottomNav';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Order {
  id: string;
  order_number: string;
  customer_name: string;
  customer_phone: string;
  total_amount: number;
  status: string;
  created_at: string;
  items_count: number;
}

export default function DealerOrders() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState(searchParams.get('status') || 'all');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    // Mock data for now - would connect to actual orders
    setOrders([
      { id: '1', order_number: 'ORD-20260202-001', customer_name: 'Rajesh Kumar', customer_phone: '9876543210', total_amount: 9436, status: 'pending', created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), items_count: 3 },
      { id: '2', order_number: 'ORD-20260202-002', customer_name: 'Priya Sharma', customer_phone: '9876543211', total_amount: 5200, status: 'confirmed', created_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), items_count: 2 },
      { id: '3', order_number: 'ORD-20260202-003', customer_name: 'Amit Singh', customer_phone: '9876543212', total_amount: 12500, status: 'processing', created_at: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(), items_count: 5 },
      { id: '4', order_number: 'ORD-20260201-001', customer_name: 'Suresh Patel', customer_phone: '9876543213', total_amount: 8750, status: 'shipped', created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), items_count: 4 },
      { id: '5', order_number: 'ORD-20260131-001', customer_name: 'Vikram Reddy', customer_phone: '9876543214', total_amount: 15000, status: 'delivered', created_at: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(), items_count: 6 },
    ]);
    setIsLoading(false);
  };

  const handleApproveOrder = (orderId: string) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: 'confirmed' } : o));
    toast({ title: "Order approved", description: "Order has been confirmed" });
  };

  const handleRejectOrder = (orderId: string) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: 'cancelled' } : o));
    toast({ title: "Order rejected", description: "Order has been cancelled" });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'confirmed':
      case 'processing': return <Package className="w-4 h-4" />;
      case 'shipped': return <Truck className="w-4 h-4" />;
      case 'delivered': return <Check className="w-4 h-4" />;
      default: return <Package className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-700';
      case 'confirmed': return 'bg-blue-100 text-blue-700';
      case 'processing': return 'bg-purple-100 text-purple-700';
      case 'shipped': return 'bg-indigo-100 text-indigo-700';
      case 'delivered': return 'bg-green-100 text-green-700';
      case 'cancelled': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getTimeAgo = (date: string) => {
    const diff = Date.now() - new Date(date).getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours} hours ago`;
    const days = Math.floor(hours / 24);
    return `${days} day${days > 1 ? 's' : ''} ago`;
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.order_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          order.customer_name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTab = activeTab === 'all' || order.status === activeTab;
    return matchesSearch && matchesTab;
  });

  const orderCounts = {
    all: orders.length,
    pending: orders.filter(o => o.status === 'pending').length,
    processing: orders.filter(o => ['confirmed', 'processing'].includes(o.status)).length,
    shipped: orders.filter(o => o.status === 'shipped').length,
    delivered: orders.filter(o => o.status === 'delivered').length,
  };

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
        <div className="flex items-center gap-3 mb-3">
          <Button variant="ghost" size="icon" onClick={() => navigate('/dealer')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-lg font-semibold">Orders</h1>
        </div>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Search orders..." 
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button variant="outline" size="icon">
            <Filter className="w-4 h-4" />
          </Button>
        </div>
      </header>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full justify-start overflow-x-auto px-4 pt-2 pb-0 h-auto bg-transparent">
          <TabsTrigger value="all" className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none">
            All ({orderCounts.all})
          </TabsTrigger>
          <TabsTrigger value="pending" className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none">
            Pending ({orderCounts.pending})
          </TabsTrigger>
          <TabsTrigger value="processing" className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none">
            Processing ({orderCounts.processing})
          </TabsTrigger>
          <TabsTrigger value="shipped" className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none">
            Shipped ({orderCounts.shipped})
          </TabsTrigger>
          <TabsTrigger value="delivered" className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none">
            Delivered ({orderCounts.delivered})
          </TabsTrigger>
        </TabsList>

        <div className="p-4 space-y-3">
          {filteredOrders.length === 0 ? (
            <div className="text-center py-12">
              <Package className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No orders found</p>
            </div>
          ) : (
            filteredOrders.map(order => (
              <Card key={order.id} className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-medium">{order.order_number}</p>
                    <p className="text-sm text-muted-foreground">{order.customer_name}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full ${getStatusColor(order.status)}`}>
                      {getStatusIcon(order.status)}
                      <span className="capitalize">{order.status}</span>
                    </span>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon-sm">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem onClick={() => navigate(`/dealer/orders/${order.id}`)}>
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem>Edit Order</DropdownMenuItem>
                        <DropdownMenuItem>Print Invoice</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">Cancel</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm mb-3">
                  <span className="text-muted-foreground">{order.items_count} items</span>
                  <span className="font-bold">₹{order.total_amount.toLocaleString()}</span>
                </div>

                <div className="flex items-center justify-between pt-3 border-t">
                  <span className="text-xs text-muted-foreground">{getTimeAgo(order.created_at)}</span>
                  
                  {order.status === 'pending' ? (
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        className="text-destructive"
                        onClick={() => handleRejectOrder(order.id)}
                      >
                        <X className="w-4 h-4 mr-1" />
                        Reject
                      </Button>
                      <Button 
                        size="sm"
                        onClick={() => handleApproveOrder(order.id)}
                      >
                        <Check className="w-4 h-4 mr-1" />
                        Approve
                      </Button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => window.open(`tel:${order.customer_phone}`)}
                      >
                        <Phone className="w-4 h-4 mr-1" />
                        Call
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => navigate(`/dealer/orders/${order.id}`)}
                      >
                        View
                      </Button>
                    </div>
                  )}
                </div>
              </Card>
            ))
          )}
        </div>
      </Tabs>

      <DealerBottomNav activeTab="/dealer/orders" onTabChange={(tab) => navigate(tab)} />
    </div>
  );
}
