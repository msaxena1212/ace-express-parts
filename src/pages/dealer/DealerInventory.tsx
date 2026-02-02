import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Search, Filter, Plus, AlertTriangle, Package, RefreshCw, MoreVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { DealerBottomNav } from '@/components/dealer/DealerBottomNav';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';

interface InventoryItem {
  id: string;
  product_name: string;
  part_number: string;
  stock_quantity: number;
  min_threshold: number;
  reorder_quantity: number;
  last_restocked: string | null;
  category: string;
  price: number;
}

export default function DealerInventory() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState(searchParams.get('filter') || 'all');
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [updateQuantity, setUpdateQuantity] = useState('');

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    // Mock data
    setInventory([
      { id: '1', product_name: 'HM 1 Engine Oil Filter', part_number: 'ACE-HOF-2024', stock_quantity: 145, min_threshold: 10, reorder_quantity: 50, last_restocked: '2026-01-28', category: 'Filters & Lubes', price: 1250 },
      { id: '2', product_name: 'Hydraulic Pump Assembly', part_number: 'ACE-HPA-1089', stock_quantity: 8, min_threshold: 5, reorder_quantity: 20, last_restocked: '2026-01-15', category: 'Hydraulics', price: 18500 },
      { id: '3', product_name: 'Alternator 24V 80A', part_number: 'ACE-ALT-2480', stock_quantity: 3, min_threshold: 5, reorder_quantity: 15, last_restocked: '2026-01-20', category: 'Electricals', price: 8750 },
      { id: '4', product_name: 'Brake Pad Set', part_number: 'ACE-BPS-1200', stock_quantity: 0, min_threshold: 10, reorder_quantity: 30, last_restocked: '2025-12-28', category: 'Brakes', price: 3200 },
      { id: '5', product_name: 'Engine Air Filter', part_number: 'ACE-EAF-3300', stock_quantity: 78, min_threshold: 15, reorder_quantity: 50, last_restocked: '2026-01-30', category: 'Filters & Lubes', price: 850 },
    ]);
    setIsLoading(false);
  };

  const getStockStatus = (item: InventoryItem) => {
    if (item.stock_quantity === 0) return { label: 'Out of Stock', color: 'bg-red-100 text-red-700' };
    if (item.stock_quantity <= item.min_threshold) return { label: 'Low Stock', color: 'bg-yellow-100 text-yellow-700' };
    return { label: 'In Stock', color: 'bg-green-100 text-green-700' };
  };

  const getStockPercentage = (item: InventoryItem) => {
    const max = item.min_threshold * 5; // Assume max is 5x threshold
    return Math.min((item.stock_quantity / max) * 100, 100);
  };

  const handleUpdateStock = () => {
    if (!selectedItem || !updateQuantity) return;
    
    const newQty = parseInt(updateQuantity);
    setInventory(prev => prev.map(item => 
      item.id === selectedItem.id 
        ? { ...item, stock_quantity: newQty, last_restocked: new Date().toISOString().split('T')[0] }
        : item
    ));
    
    toast({ title: "Stock updated", description: `${selectedItem.product_name} now has ${newQty} units` });
    setSelectedItem(null);
    setUpdateQuantity('');
  };

  const handleReorder = (item: InventoryItem) => {
    toast({ 
      title: "Reorder submitted", 
      description: `Ordered ${item.reorder_quantity} units of ${item.product_name}` 
    });
  };

  const filteredInventory = inventory.filter(item => {
    const matchesSearch = item.product_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.part_number.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (filter === 'low_stock') {
      return matchesSearch && item.stock_quantity <= item.min_threshold && item.stock_quantity > 0;
    }
    if (filter === 'out_of_stock') {
      return matchesSearch && item.stock_quantity === 0;
    }
    return matchesSearch;
  });

  const summary = {
    totalSKUs: inventory.length,
    inStock: inventory.filter(i => i.stock_quantity > i.min_threshold).length,
    lowStock: inventory.filter(i => i.stock_quantity <= i.min_threshold && i.stock_quantity > 0).length,
    outOfStock: inventory.filter(i => i.stock_quantity === 0).length,
    totalValue: inventory.reduce((sum, i) => sum + i.stock_quantity * i.price, 0),
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
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate('/dealer')}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-lg font-semibold">Inventory</h1>
          </div>
          <Button size="sm">
            <Plus className="w-4 h-4 mr-1" />
            Add Product
          </Button>
        </div>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Search products..." 
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <Filter className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setFilter('all')}>All Products</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilter('low_stock')}>Low Stock</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilter('out_of_stock')}>Out of Stock</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <div className="p-4 space-y-4">
        {/* Summary Cards */}
        <div className="grid grid-cols-2 gap-3">
          <Card className="p-3">
            <p className="text-xs text-muted-foreground">Total SKUs</p>
            <p className="text-xl font-bold">{summary.totalSKUs}</p>
          </Card>
          <Card className="p-3">
            <p className="text-xs text-muted-foreground">Stock Value</p>
            <p className="text-xl font-bold">₹{(summary.totalValue / 100000).toFixed(1)}L</p>
          </Card>
        </div>

        {/* Quick Stats */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          <Badge 
            variant={filter === 'all' ? 'default' : 'outline'}
            className="cursor-pointer"
            onClick={() => setFilter('all')}
          >
            <Package className="w-3 h-3 mr-1" />
            In Stock ({summary.inStock})
          </Badge>
          <Badge 
            variant={filter === 'low_stock' ? 'default' : 'outline'}
            className="cursor-pointer bg-yellow-100 text-yellow-700 border-yellow-300"
            onClick={() => setFilter('low_stock')}
          >
            <AlertTriangle className="w-3 h-3 mr-1" />
            Low ({summary.lowStock})
          </Badge>
          <Badge 
            variant={filter === 'out_of_stock' ? 'default' : 'outline'}
            className="cursor-pointer bg-red-100 text-red-700 border-red-300"
            onClick={() => setFilter('out_of_stock')}
          >
            Out of Stock ({summary.outOfStock})
          </Badge>
        </div>

        {/* Inventory List */}
        <div className="space-y-3">
          {filteredInventory.map(item => {
            const status = getStockStatus(item);
            return (
              <Card key={item.id} className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h3 className="font-medium line-clamp-1">{item.product_name}</h3>
                    <p className="text-xs text-muted-foreground font-mono">{item.part_number}</p>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon-sm">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem onClick={() => setSelectedItem(item)}>
                        Update Stock
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleReorder(item)}>
                        Reorder ({item.reorder_quantity} units)
                      </DropdownMenuItem>
                      <DropdownMenuItem>View Details</DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive">Archive</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="flex items-center justify-between mb-2">
                  <div>
                    <span className="text-2xl font-bold">{item.stock_quantity}</span>
                    <span className="text-sm text-muted-foreground ml-1">units</span>
                  </div>
                  <Badge className={status.color}>{status.label}</Badge>
                </div>

                <Progress value={getStockPercentage(item)} className="h-2 mb-2" />

                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Min: {item.min_threshold} | Reorder: {item.reorder_quantity}</span>
                  <span>Last restocked: {item.last_restocked || 'Never'}</span>
                </div>

                {item.stock_quantity <= item.min_threshold && (
                  <Button 
                    size="sm" 
                    className="w-full mt-3"
                    onClick={() => handleReorder(item)}
                  >
                    <RefreshCw className="w-4 h-4 mr-1" />
                    Reorder Stock
                  </Button>
                )}
              </Card>
            );
          })}
        </div>
      </div>

      {/* Update Stock Dialog */}
      <Dialog open={!!selectedItem} onOpenChange={() => setSelectedItem(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Stock</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div>
              <p className="font-medium">{selectedItem?.product_name}</p>
              <p className="text-sm text-muted-foreground">{selectedItem?.part_number}</p>
            </div>
            <div>
              <Label>Current Stock: {selectedItem?.stock_quantity} units</Label>
            </div>
            <div>
              <Label>New Quantity</Label>
              <Input 
                type="number"
                value={updateQuantity}
                onChange={(e) => setUpdateQuantity(e.target.value)}
                placeholder="Enter new quantity"
              />
            </div>
            <Button onClick={handleUpdateStock} className="w-full">
              Update Stock
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <DealerBottomNav activeTab="/dealer/inventory" onTabChange={(tab) => navigate(tab)} />
    </div>
  );
}
