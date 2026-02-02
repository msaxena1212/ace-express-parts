import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, MoreVertical, Wrench, Package, FileText, Share2, Calendar, Clock, MapPin, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { equipmentTypes, products } from '@/data/mockData';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Equipment {
  id: string;
  name: string;
  model: string;
  serial_number: string | null;
  equipment_type: string | null;
  status: string | null;
  last_service_date: string | null;
  next_service_due: string | null;
  image_url: string | null;
  created_at: string;
}

export default function MachineDetailsPage() {
  const { machineId } = useParams();
  const navigate = useNavigate();
  const [machine, setMachine] = useState<Equipment | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchMachine();
  }, [machineId]);

  const fetchMachine = async () => {
    if (!machineId) return;

    const { data } = await supabase
      .from('user_equipment')
      .select('*')
      .eq('id', machineId)
      .single();

    if (data) setMachine(data);
    setIsLoading(false);
  };

  const getEquipmentIcon = (type: string | null) => {
    const found = equipmentTypes.find(e => e.id === type);
    return found?.icon || '🔧';
  };

  const getStatusColor = (status: string | null) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-700';
      case 'maintenance': return 'bg-yellow-100 text-yellow-700';
      case 'inactive': return 'bg-gray-100 text-gray-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const isMaintenanceDue = (date: string | null) => {
    if (!date) return false;
    return new Date(date) < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  };

  const handleDelete = async () => {
    if (!machine) return;
    
    const { error } = await supabase
      .from('user_equipment')
      .delete()
      .eq('id', machine.id);

    if (error) {
      toast({ title: "Error", description: "Failed to delete machine", variant: "destructive" });
    } else {
      toast({ title: "Machine deleted" });
      navigate('/machines');
    }
  };

  // Get recommended products based on equipment type
  const recommendedProducts = products.filter(p => p.isFastTrack).slice(0, 4);

  if (isLoading || !machine) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-8">
      <header className="sticky top-0 z-40 bg-background border-b px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-lg font-semibold">{machine.name}</h1>
              <p className="text-xs text-muted-foreground">{machine.model}</p>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreVertical className="w-5 h-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => navigate(`/machines/${machine.id}/edit`)}>
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem>Print QR</DropdownMenuItem>
              <DropdownMenuItem>Share</DropdownMenuItem>
              <DropdownMenuItem className="text-destructive" onClick={handleDelete}>
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <div className="p-4 space-y-4">
        {/* Machine Image */}
        <div className="w-full h-48 bg-muted rounded-xl flex items-center justify-center text-6xl">
          {machine.image_url ? (
            <img src={machine.image_url} alt={machine.name} className="w-full h-full object-cover rounded-xl" />
          ) : (
            getEquipmentIcon(machine.equipment_type)
          )}
        </div>

        {/* Key Info */}
        <Card className="p-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-muted-foreground">Model</p>
              <p className="font-medium">{machine.model}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Serial Number</p>
              <p className="font-mono text-sm">{machine.serial_number || 'N/A'}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Status</p>
              <span className={`text-xs px-2 py-0.5 rounded-full inline-block mt-1 ${getStatusColor(machine.status)}`}>
                {machine.status || 'Unknown'}
              </span>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Type</p>
              <p className="font-medium capitalize">{machine.equipment_type?.replace('-', ' ') || 'N/A'}</p>
            </div>
          </div>
        </Card>

        {/* Maintenance Status */}
        <Card className={`p-4 ${isMaintenanceDue(machine.next_service_due) ? 'border-orange-300 bg-orange-50 dark:bg-orange-950/30' : ''}`}>
          <div className="flex items-center gap-2 mb-3">
            <Wrench className="w-5 h-5" />
            <h3 className="font-medium">Maintenance Status</h3>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">Next service due</span>
              </div>
              <span className={`text-sm font-medium ${isMaintenanceDue(machine.next_service_due) ? 'text-orange-600' : ''}`}>
                {machine.next_service_due 
                  ? new Date(machine.next_service_due).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
                  : 'Not set'}
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">Last serviced</span>
              </div>
              <span className="text-sm">
                {machine.last_service_date 
                  ? new Date(machine.last_service_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
                  : 'Never'}
              </span>
            </div>

            {isMaintenanceDue(machine.next_service_due) && (
              <div className="flex items-center gap-2 text-orange-600 bg-orange-100 dark:bg-orange-900/30 rounded-lg p-2">
                <AlertCircle className="w-4 h-4" />
                <span className="text-sm">Service due soon!</span>
              </div>
            )}
          </div>

          <Button className="w-full mt-4" variant="outline">
            <Wrench className="w-4 h-4 mr-2" />
            Request Service
          </Button>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3">
          <Card className="p-4 text-center cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate(`/categories`)}>
            <Package className="w-8 h-8 mx-auto mb-2 text-primary" />
            <p className="text-sm font-medium">Order Parts</p>
          </Card>
          <Card className="p-4 text-center cursor-pointer hover:shadow-md transition-shadow">
            <FileText className="w-8 h-8 mx-auto mb-2 text-primary" />
            <p className="text-sm font-medium">View History</p>
          </Card>
        </div>

        {/* Recommended Parts */}
        <div>
          <h3 className="font-medium mb-3">Recommended Parts</h3>
          <div className="grid grid-cols-2 gap-3">
            {recommendedProducts.map(product => (
              <Card key={product.id} className="p-3 cursor-pointer hover:shadow-md transition-shadow">
                <img src={product.image} alt={product.name} className="w-full h-20 object-cover rounded bg-muted mb-2" />
                <p className="text-sm font-medium line-clamp-1">{product.name}</p>
                <p className="text-sm text-primary font-bold">₹{product.price.toLocaleString()}</p>
              </Card>
            ))}
          </div>
        </div>

        {/* Share */}
        <Button variant="outline" className="w-full">
          <Share2 className="w-4 h-4 mr-2" />
          Share Machine Info
        </Button>
      </div>
    </div>
  );
}
