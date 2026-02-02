import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, MoreVertical, QrCode, Wrench, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { BottomNav } from '@/components/BottomNav';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { equipmentTypes } from '@/data/mockData';

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
}

export default function MyMachinesPage() {
  const navigate = useNavigate();
  const [machines, setMachines] = useState<Equipment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchMachines();
  }, []);

  const fetchMachines = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate('/auth');
      return;
    }

    const { data } = await supabase
      .from('user_equipment')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (data) setMachines(data);
    setIsLoading(false);
  };

  const getStatusColor = (status: string | null) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-700';
      case 'maintenance': return 'bg-yellow-100 text-yellow-700';
      case 'inactive': return 'bg-gray-100 text-gray-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getEquipmentIcon = (type: string | null) => {
    const found = equipmentTypes.find(e => e.id === type);
    return found?.icon || '🔧';
  };

  const isMaintenanceDue = (date: string | null) => {
    if (!date) return false;
    return new Date(date) < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
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
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-lg font-semibold">My Machines</h1>
              <p className="text-xs text-muted-foreground">({machines.length} machines)</p>
            </div>
          </div>
          <Button onClick={() => navigate('/machines/add')}>
            <Plus className="w-4 h-4 mr-1" />
            Add
          </Button>
        </div>
      </header>

      <div className="p-4">
        {machines.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-6">
              <span className="text-4xl">🏗️</span>
            </div>
            <h2 className="text-xl font-semibold mb-2">No machines added yet</h2>
            <p className="text-muted-foreground text-center mb-6">
              Start by adding your first machine!
            </p>
            <Button onClick={() => navigate('/machines/add')}>
              <Plus className="w-4 h-4 mr-2" />
              Add Machine
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {machines.map(machine => (
              <Card 
                key={machine.id} 
                className="p-4 cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => navigate(`/machines/${machine.id}`)}
              >
                <div className="flex gap-3">
                  <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center text-2xl">
                    {machine.image_url ? (
                      <img src={machine.image_url} alt={machine.name} className="w-full h-full object-cover rounded-lg" />
                    ) : (
                      getEquipmentIcon(machine.equipment_type)
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-medium">{machine.name}</h3>
                        <p className="text-sm text-muted-foreground">{machine.model}</p>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                          <Button variant="ghost" size="icon-sm">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem onClick={() => navigate(`/machines/${machine.id}/edit`)}>
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem>Print QR</DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    
                    {machine.serial_number && (
                      <p className="text-xs text-muted-foreground font-mono mt-1">{machine.serial_number}</p>
                    )}
                    
                    <div className="flex items-center gap-2 mt-2">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusColor(machine.status)}`}>
                        {machine.status || 'Unknown'}
                      </span>
                      
                      {isMaintenanceDue(machine.next_service_due) && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-orange-100 text-orange-700 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          Service Due
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      <BottomNav activeTab="/machines" onTabChange={(tab) => navigate(tab)} />
    </div>
  );
}
