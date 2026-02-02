import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, TrendingUp, TrendingDown, Package, Users, Star, Clock, Download, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { DealerBottomNav } from '@/components/dealer/DealerBottomNav';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function DealerAnalytics() {
  const navigate = useNavigate();
  const [period, setPeriod] = useState('this_month');

  const metrics = {
    totalSales: 750000,
    salesChange: 12,
    totalOrders: 125,
    ordersChange: 8,
    avgOrderValue: 6000,
    aovChange: 3,
    newCustomers: 12,
    repeatCustomers: 85,
    customerRating: 4.7,
    totalReviews: 324,
    onTimeRate: 98.5,
    deliveredOnTime: 123,
    totalDelivered: 125,
    avgDeliveryTime: 1.8,
  };

  const topProducts = [
    { name: 'HM 1 Engine Oil Filter', sold: 45, revenue: 56250 },
    { name: 'Hydraulic Pump Assembly', sold: 12, revenue: 222000 },
    { name: 'Brake Pad Set', sold: 38, revenue: 121600 },
    { name: 'Alternator 24V 80A', sold: 15, revenue: 131250 },
    { name: 'Engine Air Filter', sold: 52, revenue: 44200 },
  ];

  const ratingDistribution = [
    { stars: 5, count: 245, percentage: 76 },
    { stars: 4, count: 52, percentage: 16 },
    { stars: 3, count: 18, percentage: 5 },
    { stars: 2, count: 6, percentage: 2 },
    { stars: 1, count: 3, percentage: 1 },
  ];

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="sticky top-0 z-40 bg-background border-b px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate('/dealer')}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-lg font-semibold">Analytics</h1>
          </div>
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-auto">
              <Calendar className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="this_week">This Week</SelectItem>
              <SelectItem value="this_month">This Month</SelectItem>
              <SelectItem value="last_3_months">Last 3 Months</SelectItem>
              <SelectItem value="this_year">This Year</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </header>

      <div className="p-4 space-y-4">
        {/* Revenue & Orders */}
        <div className="grid grid-cols-2 gap-3">
          <Card className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <TrendingUp className="w-4 h-4" />
              <span className="text-xs">Total Sales</span>
            </div>
            <p className="text-2xl font-bold">₹{(metrics.totalSales / 100000).toFixed(1)}L</p>
            <div className="flex items-center gap-1 mt-1">
              <TrendingUp className="w-3 h-3 text-green-500" />
              <span className="text-xs text-green-600">+{metrics.salesChange}%</span>
              <span className="text-xs text-muted-foreground">vs last month</span>
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Package className="w-4 h-4" />
              <span className="text-xs">Total Orders</span>
            </div>
            <p className="text-2xl font-bold">{metrics.totalOrders}</p>
            <div className="flex items-center gap-1 mt-1">
              <TrendingUp className="w-3 h-3 text-green-500" />
              <span className="text-xs text-green-600">+{metrics.ordersChange}%</span>
            </div>
          </Card>
        </div>

        {/* AOV & Customers */}
        <div className="grid grid-cols-2 gap-3">
          <Card className="p-4">
            <p className="text-xs text-muted-foreground mb-1">Avg Order Value</p>
            <p className="text-xl font-bold">₹{metrics.avgOrderValue.toLocaleString()}</p>
            <span className="text-xs text-green-600">+{metrics.aovChange}%</span>
          </Card>
          
          <Card className="p-4">
            <p className="text-xs text-muted-foreground mb-1">New Customers</p>
            <p className="text-xl font-bold">{metrics.newCustomers}</p>
            <span className="text-xs text-muted-foreground">This month</span>
          </Card>
        </div>

        {/* Customer Satisfaction */}
        <Card className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Customer Satisfaction</h3>
            <div className="flex items-center gap-1">
              <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
              <span className="text-xl font-bold">{metrics.customerRating}</span>
              <span className="text-sm text-muted-foreground">/ 5</span>
            </div>
          </div>
          
          <p className="text-sm text-muted-foreground mb-3">{metrics.totalReviews} reviews</p>
          
          <div className="space-y-2">
            {ratingDistribution.map(item => (
              <div key={item.stars} className="flex items-center gap-2">
                <span className="w-8 text-sm">{item.stars}★</span>
                <Progress value={item.percentage} className="flex-1 h-2" />
                <span className="w-10 text-xs text-muted-foreground text-right">{item.count}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Delivery Performance */}
        <Card className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Delivery Performance</h3>
            <span className="text-xl font-bold text-green-600">{metrics.onTimeRate}%</span>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">On-time deliveries</p>
              <p className="text-lg font-bold">{metrics.deliveredOnTime} / {metrics.totalDelivered}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Avg delivery time</p>
              <p className="text-lg font-bold">{metrics.avgDeliveryTime} days</p>
            </div>
          </div>
        </Card>

        {/* Top Products */}
        <Card className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Top Selling Products</h3>
            <Button variant="link" size="sm">View All</Button>
          </div>
          
          <div className="space-y-3">
            {topProducts.map((product, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 bg-muted rounded-full flex items-center justify-center text-xs font-medium">
                    {i + 1}
                  </span>
                  <div>
                    <p className="text-sm font-medium line-clamp-1">{product.name}</p>
                    <p className="text-xs text-muted-foreground">{product.sold} sold</p>
                  </div>
                </div>
                <span className="font-medium">₹{(product.revenue / 1000).toFixed(1)}K</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Customer Retention */}
        <Card className="p-4">
          <h3 className="font-semibold mb-4">Customer Retention</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-3xl font-bold text-primary">{metrics.repeatCustomers}%</p>
              <p className="text-sm text-muted-foreground">Repeat customers</p>
            </div>
            <div>
              <p className="text-3xl font-bold">₹25K</p>
              <p className="text-sm text-muted-foreground">Avg lifetime value</p>
            </div>
          </div>
        </Card>

        {/* Export */}
        <div className="flex gap-3">
          <Button variant="outline" className="flex-1">
            <Download className="w-4 h-4 mr-2" />
            Export PDF
          </Button>
          <Button variant="outline" className="flex-1">
            <Download className="w-4 h-4 mr-2" />
            Export Excel
          </Button>
        </div>
      </div>

      <DealerBottomNav activeTab="/dealer/analytics" onTabChange={(tab) => navigate(tab)} />
    </div>
  );
}
