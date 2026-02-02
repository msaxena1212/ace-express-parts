import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, TrendingUp, Users, Clock, Star, AlertTriangle, Plus, BarChart3, Settings, ShoppingCart, Boxes, Tag, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { DealerBottomNav } from '@/components/dealer/DealerBottomNav';

interface DealerInfo {
  id: string;
  firm_name: string;
  dealer_code: string | null;
  status: string | null;
}

interface Metrics {
  totalOrders: number;
  totalRevenue: number;
  pendingOrders: number;
  onTimeRate: number;
  customerRating: number;
  lowStockItems: number;
}

export default function DealerDashboard() {
  const navigate = useNavigate();
  const [dealer, setDealer] = useState<DealerInfo | null>(null);
  const [metrics, setMetrics] = useState<Metrics>({
    totalOrders: 125,
    totalRevenue: 750000,
    pendingOrders: 5,
    onTimeRate: 98.5,
    customerRating: 4.7,
    lowStockItems: 3
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDealerInfo();
  }, []);

  const fetchDealerInfo = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate('/auth');
      return;
    }

    const { data } = await supabase
      .from('dealers')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (data) {
      setDealer(data);
    } else {
      navigate('/auth/dealer');
      return;
    }
    setIsLoading(false);
  };

  const quickActions = [
    { icon: Plus, label: 'New Order', path: '/dealer/orders/create', color: 'bg-primary' },
    { icon: Boxes, label: 'Inventory', path: '/dealer/inventory', color: 'bg-blue-500' },
    { icon: Tag, label: 'Create Offer', path: '/dealer/offers/create', color: 'bg-green-500' },
    { icon: MessageSquare, label: 'Support', path: '/dealer/support', color: 'bg-purple-500' },
  ];

  const recentOrders = [
    { id: 'ORD-001', customer: 'Rajesh Kumar', amount: 9436, status: 'pending', time: '2 hours ago' },
    { id: 'ORD-002', customer: 'Priya Sharma', amount: 5200, status: 'confirmed', time: '4 hours ago' },
    { id: 'ORD-003', customer: 'Amit Singh', amount: 12500, status: 'shipped', time: '1 day ago' },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="sticky top-0 z-40 bg-primary text-primary-foreground px-4 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold">{dealer?.firm_name || 'Dealer Portal'}</h1>
            <p className="text-xs opacity-80">{dealer?.dealer_code || 'Loading...'}</p>
          </div>
          <Button variant="ghost" size="icon" className="text-primary-foreground" onClick={() => navigate('/dealer/settings')}>
            <Settings className="w-5 h-5" />
          </Button>
        </div>
      </header>

      <div className="p-4 space-y-4">
        {/* Key Metrics */}
        <div className="grid grid-cols-2 gap-3">
          <Card className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <TrendingUp className="w-4 h-4" />
              <span className="text-xs">Monthly Sales</span>
            </div>
            <p className="text-xl font-bold">₹{(metrics.totalRevenue / 1000).toFixed(0)}K</p>
            <p className="text-xs text-green-600">↑ 12% vs last month</p>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Package className="w-4 h-4" />
              <span className="text-xs">Total Orders</span>
            </div>
            <p className="text-xl font-bold">{metrics.totalOrders}</p>
            <p className="text-xs text-muted-foreground">{metrics.pendingOrders} pending</p>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Star className="w-4 h-4" />
              <span className="text-xs">Customer Rating</span>
            </div>
            <p className="text-xl font-bold">{metrics.customerRating}/5</p>
            <p className="text-xs text-muted-foreground">324 reviews</p>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Clock className="w-4 h-4" />
              <span className="text-xs">On-Time Delivery</span>
            </div>
            <p className="text-xl font-bold">{metrics.onTimeRate}%</p>
            <p className="text-xs text-green-600">Excellent</p>
          </Card>
        </div>

        {/* Pending Orders Alert */}
        {metrics.pendingOrders > 0 && (
          <Card className="p-4 bg-yellow-50 dark:bg-yellow-950/30 border-yellow-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                  <Package className="w-5 h-5 text-yellow-600" />
                </div>
                <div>
                  <p className="font-medium">{metrics.pendingOrders} orders pending</p>
                  <p className="text-xs text-muted-foreground">Oldest: 2 hours ago</p>
                </div>
              </div>
              <Button size="sm" onClick={() => navigate('/dealer/orders?status=pending')}>
                View All
              </Button>
            </div>
          </Card>
        )}

        {/* Low Stock Alert */}
        {metrics.lowStockItems > 0 && (
          <Card className="p-4 bg-red-50 dark:bg-red-950/30 border-red-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <p className="font-medium">{metrics.lowStockItems} items low stock</p>
                  <p className="text-xs text-muted-foreground">Reorder needed</p>
                </div>
              </div>
              <Button size="sm" variant="outline" onClick={() => navigate('/dealer/inventory?filter=low_stock')}>
                View
              </Button>
            </div>
          </Card>
        )}

        {/* Quick Actions */}
        <div>
          <h2 className="font-semibold mb-3">Quick Actions</h2>
          <div className="grid grid-cols-4 gap-3">
            {quickActions.map((action, i) => (
              <Card 
                key={i} 
                className="p-3 text-center cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => navigate(action.path)}
              >
                <div className={`w-10 h-10 ${action.color} rounded-lg flex items-center justify-center mx-auto mb-2`}>
                  <action.icon className="w-5 h-5 text-white" />
                </div>
                <p className="text-xs font-medium">{action.label}</p>
              </Card>
            ))}
          </div>
        </div>

        {/* Recent Orders */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold">Recent Orders</h2>
            <Button variant="link" size="sm" onClick={() => navigate('/dealer/orders')}>
              View All
            </Button>
          </div>
          <Card className="divide-y">
            {recentOrders.map(order => (
              <div 
                key={order.id} 
                className="p-4 flex items-center justify-between cursor-pointer hover:bg-muted/50"
                onClick={() => navigate(`/dealer/orders/${order.id}`)}
              >
                <div>
                  <p className="font-medium">{order.id}</p>
                  <p className="text-sm text-muted-foreground">{order.customer}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium">₹{order.amount.toLocaleString()}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    order.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                    order.status === 'confirmed' ? 'bg-blue-100 text-blue-700' :
                    'bg-green-100 text-green-700'
                  }`}>
                    {order.status}
                  </span>
                </div>
              </div>
            ))}
          </Card>
        </div>

        {/* Top Products */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold">Top Selling Products</h2>
            <Button variant="link" size="sm" onClick={() => navigate('/dealer/analytics')}>
              See Report
            </Button>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2">
            {[1, 2, 3].map(i => (
              <Card key={i} className="p-3 min-w-[140px]">
                <div className="w-full h-16 bg-muted rounded mb-2" />
                <p className="text-sm font-medium line-clamp-1">HM 1 Oil Filter</p>
                <p className="text-xs text-muted-foreground">45 sold this week</p>
              </Card>
            ))}
          </div>
        </div>
      </div>

      <DealerBottomNav activeTab="/dealer" onTabChange={(tab) => navigate(tab)} />
    </div>
  );
}
