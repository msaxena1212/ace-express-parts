import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, User, Phone, Mail, Wrench, Calendar, MoreVertical, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { DealerBottomNav } from '@/components/dealer/DealerBottomNav';

interface Technician {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  specializations: string[];
  is_active: boolean;
  daily_capacity: number;
  current_workload: number;
}

export default function DealerTechnicians() {
  const navigate = useNavigate();
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [loading, setLoading] = useState(true);
  const [dealerId, setDealerId] = useState<string | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newTech, setNewTech] = useState({ name: '', phone: '', email: '', specializations: '' });

  useEffect(() => {
    fetchTechnicians();
  }, []);

  const fetchTechnicians = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: dealer } = await supabase
        .from('dealers')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!dealer) return;
      setDealerId(dealer.id);

      const { data, error } = await supabase
        .from('dealer_technicians')
        .select('*')
        .eq('dealer_id', dealer.id)
        .order('name');

      if (error) throw error;
      setTechnicians(data || []);
    } catch (error) {
      console.error('Error fetching technicians:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddTechnician = async () => {
    if (!dealerId || !newTech.name.trim()) return;

    try {
      const { error } = await supabase
        .from('dealer_technicians')
        .insert({
          dealer_id: dealerId,
          name: newTech.name.trim(),
          phone: newTech.phone.trim() || null,
          email: newTech.email.trim() || null,
          specializations: newTech.specializations.split(',').map(s => s.trim()).filter(Boolean),
        });

      if (error) throw error;

      toast({ title: 'Success', description: 'Technician added successfully' });
      setShowAddDialog(false);
      setNewTech({ name: '', phone: '', email: '', specializations: '' });
      fetchTechnicians();
    } catch (error) {
      console.error('Error adding technician:', error);
      toast({ title: 'Error', description: 'Failed to add technician', variant: 'destructive' });
    }
  };

  const toggleTechnicianStatus = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('dealer_technicians')
        .update({ is_active: !currentStatus })
        .eq('id', id);

      if (error) throw error;
      
      setTechnicians(prev => 
        prev.map(t => t.id === id ? { ...t, is_active: !currentStatus } : t)
      );
      toast({ title: 'Updated', description: `Technician ${!currentStatus ? 'activated' : 'deactivated'}` });
    } catch (error) {
      console.error('Error updating technician:', error);
    }
  };

  const activeTechnicians = technicians.filter(t => t.is_active);
  const inactiveTechnicians = technicians.filter(t => !t.is_active);

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="bg-primary text-primary-foreground p-4 pt-8">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold">Technicians</h1>
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button size="sm" variant="secondary">
                <Plus className="w-4 h-4 mr-1" />
                Add
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Technician</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label>Name *</Label>
                  <Input 
                    value={newTech.name}
                    onChange={(e) => setNewTech({ ...newTech, name: e.target.value })}
                    placeholder="Full name"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Phone</Label>
                  <Input 
                    value={newTech.phone}
                    onChange={(e) => setNewTech({ ...newTech, phone: e.target.value })}
                    placeholder="Phone number"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input 
                    type="email"
                    value={newTech.email}
                    onChange={(e) => setNewTech({ ...newTech, email: e.target.value })}
                    placeholder="Email address"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Specializations</Label>
                  <Input 
                    value={newTech.specializations}
                    onChange={(e) => setNewTech({ ...newTech, specializations: e.target.value })}
                    placeholder="Hydraulics, Electrical, Mechanical (comma-separated)"
                  />
                </div>
                <Button className="w-full" onClick={handleAddTechnician}>
                  Add Technician
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
        
        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          <Card className="bg-primary-foreground/10 border-0 p-3">
            <p className="text-2xl font-bold">{activeTechnicians.length}</p>
            <p className="text-xs opacity-70">Active Technicians</p>
          </Card>
          <Card className="bg-primary-foreground/10 border-0 p-3">
            <p className="text-2xl font-bold">
              {activeTechnicians.reduce((sum, t) => sum + t.current_workload, 0)}
            </p>
            <p className="text-xs opacity-70">Tasks Assigned Today</p>
          </Card>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : technicians.length === 0 ? (
          <Card className="p-8 text-center">
            <User className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
            <p className="text-muted-foreground mb-4">No technicians added yet</p>
            <Button onClick={() => setShowAddDialog(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Technician
            </Button>
          </Card>
        ) : (
          <>
            {/* Active Technicians */}
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-3">Active ({activeTechnicians.length})</h3>
              <div className="space-y-3">
                {activeTechnicians.map((tech) => (
                  <Card key={tech.id} className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                          <User className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">{tech.name}</p>
                          <div className="flex items-center gap-3 text-xs text-muted-foreground">
                            {tech.phone && (
                              <span className="flex items-center gap-1">
                                <Phone className="w-3 h-3" />
                                {tech.phone}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Edit className="w-4 h-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Calendar className="w-4 h-4 mr-2" />
                            View Schedule
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => toggleTechnicianStatus(tech.id, tech.is_active)}>
                            <Trash2 className="w-4 h-4 mr-2" />
                            Deactivate
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    {/* Specializations */}
                    {tech.specializations?.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {tech.specializations.map((spec, i) => (
                          <Badge key={i} variant="secondary" className="text-xs">
                            {spec}
                          </Badge>
                        ))}
                      </div>
                    )}

                    {/* Workload */}
                    <div>
                      <div className="flex justify-between text-xs text-muted-foreground mb-1">
                        <span>Today's Workload</span>
                        <span>{tech.current_workload}/{tech.daily_capacity} tasks</span>
                      </div>
                      <Progress 
                        value={(tech.current_workload / tech.daily_capacity) * 100} 
                        className="h-2"
                      />
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            {/* Inactive Technicians */}
            {inactiveTechnicians.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-3">Inactive ({inactiveTechnicians.length})</h3>
                <div className="space-y-3">
                  {inactiveTechnicians.map((tech) => (
                    <Card key={tech.id} className="p-4 opacity-60">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                            <User className="w-5 h-5 text-muted-foreground" />
                          </div>
                          <div>
                            <p className="font-medium">{tech.name}</p>
                            <Badge variant="secondary" className="text-xs">Inactive</Badge>
                          </div>
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => toggleTechnicianStatus(tech.id, tech.is_active)}
                        >
                          Activate
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <DealerBottomNav activeTab="/dealer/technicians" onTabChange={(path) => navigate(path)} />
    </div>
  );
}
