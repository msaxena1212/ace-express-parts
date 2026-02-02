import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, Clock, AlertTriangle, Wrench, ShoppingCart, User, MapPin, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface MaintenanceTask {
  id: string;
  due_date: string | null;
  due_hours: number | null;
  status: string;
  priority: string;
  notes: string | null;
  scheduled_date: string | null;
  scheduled_time_slot: string | null;
  machine: {
    id: string;
    name: string;
    model: string;
    equipment_type: string | null;
  } | null;
  plan: {
    id: string;
    name: string;
    description: string | null;
    criticality: string | null;
    required_tasks: any;
    required_parts: any;
  } | null;
}

export default function MaintenanceTaskDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [task, setTask] = useState<MaintenanceTask | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) fetchTaskDetails();
  }, [id]);

  const fetchTaskDetails = async () => {
    try {
      const { data, error } = await supabase
        .from('maintenance_tasks')
        .select(`
          *,
          machine:user_equipment(id, name, model, equipment_type),
          plan:maintenance_plans(id, name, description, criticality, required_tasks, required_parts)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      setTask(data);
    } catch (error) {
      console.error('Error fetching task:', error);
      toast({ title: 'Error', description: 'Failed to load task details', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'overdue': return 'destructive';
      case 'due': return 'default';
      case 'scheduled': return 'secondary';
      case 'in_progress': return 'outline';
      case 'completed': return 'secondary';
      default: return 'outline';
    }
  };

  const getRiskLevel = () => {
    if (!task) return { level: 'low', color: 'text-green-500', label: 'Low Risk' };
    
    if (task.status === 'overdue') {
      const daysOverdue = task.due_date 
        ? Math.floor((Date.now() - new Date(task.due_date).getTime()) / (1000 * 60 * 60 * 24))
        : 0;
      
      if (daysOverdue > 7 || task.plan?.criticality === 'high') {
        return { level: 'critical', color: 'text-red-500', label: 'Critical Risk' };
      }
      return { level: 'high', color: 'text-orange-500', label: 'High Risk' };
    }
    
    if (task.plan?.criticality === 'high') {
      return { level: 'medium', color: 'text-yellow-500', label: 'Medium Risk' };
    }
    
    return { level: 'low', color: 'text-green-500', label: 'Low Risk' };
  };

  const handleScheduleNow = () => {
    navigate(`/maintenance/${id}/schedule`);
  };

  const handleAddPartsToCart = () => {
    // TODO: Add required parts to cart
    toast({ title: 'Parts Added', description: 'Required parts added to your cart' });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!task) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Task not found</p>
      </div>
    );
  }

  const risk = getRiskLevel();
  const requiredTasks = (task.plan?.required_tasks as any[]) || [];
  const requiredParts = (task.plan?.required_parts as any[]) || [];

  return (
    <div className="min-h-screen bg-background pb-32">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background border-b">
        <div className="flex items-center gap-3 p-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <h1 className="font-semibold">{task.plan?.name || 'Maintenance Task'}</h1>
            <p className="text-xs text-muted-foreground">{task.machine?.name}</p>
          </div>
          <Badge variant={getStatusColor(task.status) as any}>
            {task.status.replace('_', ' ')}
          </Badge>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Risk Indicator */}
        {task.status === 'overdue' && (
          <Card className="p-4 bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900">
            <div className="flex items-center gap-3">
              <AlertTriangle className={`w-6 h-6 ${risk.color}`} />
              <div>
                <p className={`font-semibold ${risk.color}`}>{risk.label}</p>
                <p className="text-sm text-muted-foreground">
                  This task is overdue. Schedule it now to prevent equipment damage.
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* Machine Info */}
        <Card className="p-4">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <Wrench className="w-4 h-4" />
            Equipment
          </h3>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center text-2xl">
              🏗️
            </div>
            <div>
              <p className="font-medium">{task.machine?.name}</p>
              <p className="text-sm text-muted-foreground">{task.machine?.model}</p>
              <p className="text-xs text-muted-foreground mt-1">{task.machine?.equipment_type}</p>
            </div>
          </div>
        </Card>

        {/* Schedule Info */}
        <Card className="p-4">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Schedule
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Due Date</span>
              <span className="font-medium">
                {task.due_date ? new Date(task.due_date).toLocaleDateString() : 'Not set'}
              </span>
            </div>
            {task.due_hours && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Due at Hours</span>
                <span className="font-medium">{task.due_hours}h</span>
              </div>
            )}
            {task.scheduled_date && (
              <>
                <Separator />
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Scheduled Date</span>
                  <span className="font-medium text-green-600">
                    {new Date(task.scheduled_date).toLocaleDateString()}
                  </span>
                </div>
                {task.scheduled_time_slot && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Time Slot</span>
                    <span className="font-medium">{task.scheduled_time_slot}</span>
                  </div>
                )}
              </>
            )}
          </div>
        </Card>

        {/* Required Tasks/Checklist */}
        {requiredTasks.length > 0 && (
          <Card className="p-4">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              Service Checklist
            </h3>
            <div className="space-y-2">
              {requiredTasks.map((item: any, index: number) => (
                <div key={index} className="flex items-center gap-3 py-2 border-b last:border-0">
                  <div className="w-5 h-5 rounded-full border-2 border-muted-foreground" />
                  <span className="text-sm">{item.name || item}</span>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Required Parts */}
        {requiredParts.length > 0 && (
          <Card className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold flex items-center gap-2">
                <ShoppingCart className="w-4 h-4" />
                Required Parts
              </h3>
              <Badge variant="secondary" className="text-green-600">
                All in stock
              </Badge>
            </div>
            <div className="space-y-3">
              {requiredParts.map((part: any, index: number) => (
                <div key={index} className="flex items-center justify-between py-2 border-b last:border-0">
                  <div>
                    <p className="text-sm font-medium">{part.name || `Part ${index + 1}`}</p>
                    <p className="text-xs text-muted-foreground">Qty: {part.quantity || 1}</p>
                  </div>
                  {part.price && (
                    <span className="font-medium">₹{part.price.toLocaleString()}</span>
                  )}
                </div>
              ))}
            </div>
            <Button 
              className="w-full mt-4" 
              variant="outline"
              onClick={handleAddPartsToCart}
            >
              <ShoppingCart className="w-4 h-4 mr-2" />
              Add All Parts to Cart
            </Button>
          </Card>
        )}

        {/* Description */}
        {task.plan?.description && (
          <Card className="p-4">
            <h3 className="font-semibold mb-2">Description</h3>
            <p className="text-sm text-muted-foreground">{task.plan.description}</p>
          </Card>
        )}

        {/* Notes */}
        {task.notes && (
          <Card className="p-4">
            <h3 className="font-semibold mb-2">Notes</h3>
            <p className="text-sm text-muted-foreground">{task.notes}</p>
          </Card>
        )}
      </div>

      {/* Fixed Bottom Actions */}
      {task.status !== 'completed' && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-background border-t safe-bottom">
          <Button className="w-full" size="lg" onClick={handleScheduleNow}>
            <Calendar className="w-4 h-4 mr-2" />
            {task.scheduled_date ? 'Reschedule Service' : 'Schedule Now'}
          </Button>
        </div>
      )}
    </div>
  );
}
