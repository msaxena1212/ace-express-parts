import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Tag, Calendar, Users, MoreVertical, Percent, Pause, Play, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Offer {
  id: string;
  name: string;
  description: string;
  discount_type: string;
  discount_value: number;
  min_order_value: number | null;
  start_date: string;
  end_date: string;
  is_active: boolean;
  customers_reached: number;
  conversions: number;
}

export default function DealerOffers() {
  const navigate = useNavigate();
  const [isCreating, setIsCreating] = useState(false);
  const [offers, setOffers] = useState<Offer[]>([
    {
      id: '1',
      name: 'Bulk Order Discount',
      description: 'Get 15% off on orders above ₹10,000',
      discount_type: 'percentage',
      discount_value: 15,
      min_order_value: 10000,
      start_date: '2026-02-01',
      end_date: '2026-02-28',
      is_active: true,
      customers_reached: 245,
      conversions: 18
    },
    {
      id: '2',
      name: 'First Order Bonus',
      description: 'New customers get ₹500 off',
      discount_type: 'fixed',
      discount_value: 500,
      min_order_value: 2000,
      start_date: '2026-01-15',
      end_date: '2026-03-15',
      is_active: true,
      customers_reached: 89,
      conversions: 12
    },
    {
      id: '3',
      name: 'Filter Festival',
      description: '20% off on all filters',
      discount_type: 'percentage',
      discount_value: 20,
      min_order_value: null,
      start_date: '2026-01-01',
      end_date: '2026-01-31',
      is_active: false,
      customers_reached: 320,
      conversions: 45
    },
  ]);

  const [newOffer, setNewOffer] = useState({
    name: '',
    description: '',
    discount_type: 'percentage',
    discount_value: '',
    min_order_value: '',
    start_date: '',
    end_date: '',
  });

  const handleCreateOffer = () => {
    const offer: Offer = {
      id: Date.now().toString(),
      name: newOffer.name,
      description: newOffer.description,
      discount_type: newOffer.discount_type,
      discount_value: parseFloat(newOffer.discount_value),
      min_order_value: newOffer.min_order_value ? parseFloat(newOffer.min_order_value) : null,
      start_date: newOffer.start_date,
      end_date: newOffer.end_date,
      is_active: true,
      customers_reached: 0,
      conversions: 0,
    };
    
    setOffers(prev => [...prev, offer]);
    setIsCreating(false);
    setNewOffer({ name: '', description: '', discount_type: 'percentage', discount_value: '', min_order_value: '', start_date: '', end_date: '' });
    toast({ title: "Offer created", description: "Your offer is now active" });
  };

  const toggleOfferStatus = (id: string) => {
    setOffers(prev => prev.map(offer => 
      offer.id === id ? { ...offer, is_active: !offer.is_active } : offer
    ));
    toast({ title: "Offer updated" });
  };

  const deleteOffer = (id: string) => {
    setOffers(prev => prev.filter(offer => offer.id !== id));
    toast({ title: "Offer deleted" });
  };

  const activeOffers = offers.filter(o => o.is_active);
  const expiredOffers = offers.filter(o => !o.is_active);

  return (
    <div className="min-h-screen bg-background pb-8">
      <header className="sticky top-0 z-40 bg-background border-b px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate('/dealer')}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-lg font-semibold">Offers & Promotions</h1>
          </div>
          <Dialog open={isCreating} onOpenChange={setIsCreating}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="w-4 h-4 mr-1" />
                Create
              </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New Offer</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div>
                  <Label>Offer Name</Label>
                  <Input 
                    value={newOffer.name}
                    onChange={(e) => setNewOffer({...newOffer, name: e.target.value})}
                    placeholder="e.g., Bulk Order Discount"
                  />
                </div>
                
                <div>
                  <Label>Description</Label>
                  <Textarea 
                    value={newOffer.description}
                    onChange={(e) => setNewOffer({...newOffer, description: e.target.value})}
                    placeholder="Describe your offer..."
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Discount Type</Label>
                    <Select 
                      value={newOffer.discount_type}
                      onValueChange={(v) => setNewOffer({...newOffer, discount_type: v})}
                    >
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="percentage">Percentage (%)</SelectItem>
                        <SelectItem value="fixed">Fixed Amount (₹)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Discount Value</Label>
                    <Input 
                      type="number"
                      value={newOffer.discount_value}
                      onChange={(e) => setNewOffer({...newOffer, discount_value: e.target.value})}
                      placeholder={newOffer.discount_type === 'percentage' ? '15' : '500'}
                    />
                  </div>
                </div>
                
                <div>
                  <Label>Minimum Order Value (Optional)</Label>
                  <Input 
                    type="number"
                    value={newOffer.min_order_value}
                    onChange={(e) => setNewOffer({...newOffer, min_order_value: e.target.value})}
                    placeholder="e.g., 5000"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Start Date</Label>
                    <Input 
                      type="date"
                      value={newOffer.start_date}
                      onChange={(e) => setNewOffer({...newOffer, start_date: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label>End Date</Label>
                    <Input 
                      type="date"
                      value={newOffer.end_date}
                      onChange={(e) => setNewOffer({...newOffer, end_date: e.target.value})}
                    />
                  </div>
                </div>
                
                <Button onClick={handleCreateOffer} className="w-full">
                  Create Offer
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </header>

      <div className="p-4 space-y-4">
        {/* Active Offers */}
        <div>
          <h2 className="font-semibold mb-3 flex items-center gap-2">
            <Tag className="w-4 h-4 text-primary" />
            Active Offers ({activeOffers.length})
          </h2>
          
          {activeOffers.length === 0 ? (
            <Card className="p-6 text-center">
              <Tag className="w-10 h-10 mx-auto text-muted-foreground mb-2" />
              <p className="text-muted-foreground">No active offers</p>
              <Button className="mt-4" onClick={() => setIsCreating(true)}>
                Create Your First Offer
              </Button>
            </Card>
          ) : (
            <div className="space-y-3">
              {activeOffers.map(offer => (
                <Card key={offer.id} className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-medium">{offer.name}</h3>
                      <p className="text-sm text-muted-foreground">{offer.description}</p>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon-sm">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem>Edit</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => toggleOfferStatus(offer.id)}>
                          <Pause className="w-4 h-4 mr-2" />
                          Deactivate
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => deleteOffer(offer.id)} className="text-destructive">
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <div className="flex items-center gap-4 mb-3">
                    <Badge className="bg-primary/10 text-primary">
                      <Percent className="w-3 h-3 mr-1" />
                      {offer.discount_value}{offer.discount_type === 'percentage' ? '%' : '₹'} off
                    </Badge>
                    {offer.min_order_value && (
                      <span className="text-xs text-muted-foreground">
                        Min ₹{offer.min_order_value.toLocaleString()}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Calendar className="w-3 h-3" />
                      <span>{offer.start_date} - {offer.end_date}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="w-3 h-3 text-muted-foreground" />
                      <span>{offer.customers_reached} reached</span>
                      <span className="text-green-600">• {offer.conversions} conversions</span>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Expired/Inactive Offers */}
        {expiredOffers.length > 0 && (
          <div>
            <h2 className="font-semibold mb-3 text-muted-foreground">
              Inactive Offers ({expiredOffers.length})
            </h2>
            <div className="space-y-3">
              {expiredOffers.map(offer => (
                <Card key={offer.id} className="p-4 opacity-60">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-medium">{offer.name}</h3>
                      <p className="text-sm text-muted-foreground">{offer.description}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="outline">
                          {offer.discount_value}{offer.discount_type === 'percentage' ? '%' : '₹'} off
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {offer.conversions} conversions
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => toggleOfferStatus(offer.id)}
                      >
                        <Play className="w-4 h-4 mr-1" />
                        Reactivate
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
