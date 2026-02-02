import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, Filter, Phone, MessageCircle, Package, MoreVertical, Plus, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Customer {
  id: string;
  name: string;
  phone: string;
  total_orders: number;
  lifetime_value: number;
  last_order_date: string;
  status: string;
}

export default function DealerCustomers() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [customers] = useState<Customer[]>([
    { id: '1', name: 'Rajesh Kumar', phone: '9876543210', total_orders: 12, lifetime_value: 78000, last_order_date: '2026-01-28', status: 'active' },
    { id: '2', name: 'Priya Sharma', phone: '9876543211', total_orders: 8, lifetime_value: 45000, last_order_date: '2026-02-01', status: 'active' },
    { id: '3', name: 'Amit Singh', phone: '9876543212', total_orders: 25, lifetime_value: 156000, last_order_date: '2026-01-30', status: 'active' },
    { id: '4', name: 'Suresh Patel', phone: '9876543213', total_orders: 5, lifetime_value: 22000, last_order_date: '2025-12-15', status: 'inactive' },
    { id: '5', name: 'Vikram Reddy', phone: '9876543214', total_orders: 18, lifetime_value: 95000, last_order_date: '2026-01-25', status: 'active' },
  ]);

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.phone.includes(searchQuery)
  );

  const summary = {
    total: customers.length,
    active: customers.filter(c => c.status === 'active').length,
    inactive: customers.filter(c => c.status === 'inactive').length,
  };

  const getTimeAgo = (date: string) => {
    const diff = Date.now() - new Date(date).getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
    return `${Math.floor(days / 30)} months ago`;
  };

  return (
    <div className="min-h-screen bg-background pb-8">
      <header className="sticky top-0 z-40 bg-background border-b px-4 py-3">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate('/dealer')}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-lg font-semibold">Customers</h1>
              <p className="text-xs text-muted-foreground">{summary.total} total</p>
            </div>
          </div>
          <Button size="sm">
            <Plus className="w-4 h-4 mr-1" />
            Add
          </Button>
        </div>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Search by name or phone..." 
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

      <div className="p-4 space-y-4">
        {/* Quick Stats */}
        <div className="flex gap-2">
          <Badge variant="outline" className="cursor-pointer">
            <Users className="w-3 h-3 mr-1" />
            Active ({summary.active})
          </Badge>
          <Badge variant="outline" className="cursor-pointer text-muted-foreground">
            Inactive ({summary.inactive})
          </Badge>
        </div>

        {/* Customer List */}
        <div className="space-y-3">
          {filteredCustomers.map(customer => (
            <Card key={customer.id} className="p-4">
              <div className="flex items-start gap-3">
                <Avatar className="w-12 h-12">
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {customer.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-medium">{customer.name}</h3>
                      <p className="text-sm text-muted-foreground">{customer.phone}</p>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon-sm">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem>View Profile</DropdownMenuItem>
                        <DropdownMenuItem>View Orders</DropdownMenuItem>
                        <DropdownMenuItem>Send Message</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <div className="flex items-center gap-4 mt-2">
                    <div>
                      <p className="text-xs text-muted-foreground">Orders</p>
                      <p className="font-medium">{customer.total_orders}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Lifetime Value</p>
                      <p className="font-medium">₹{(customer.lifetime_value / 1000).toFixed(0)}K</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Last Order</p>
                      <p className="text-sm">{getTimeAgo(customer.last_order_date)}</p>
                    </div>
                  </div>

                  <div className="flex gap-2 mt-3">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => window.open(`tel:${customer.phone}`)}
                    >
                      <Phone className="w-3 h-3 mr-1" />
                      Call
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => window.open(`https://wa.me/91${customer.phone}`)}
                    >
                      <MessageCircle className="w-3 h-3 mr-1" />
                      WhatsApp
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                    >
                      <Package className="w-3 h-3 mr-1" />
                      Orders
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
