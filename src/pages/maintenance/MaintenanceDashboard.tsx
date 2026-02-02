import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, AlertTriangle, CheckCircle, ChevronRight, Filter, Wrench, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { BottomNav } from '@/components/BottomNav';

interface MaintenanceTask {
  id: string;
  machine_id: string;
  plan_id: string | null;
  due_date: string | null;
  status: string;
  priority: string;
  scheduled_date: string | null;
  notes: string | null;
  machine?: {
    name: string;
    model: string;
  };
  plan?: {
    name: string;
    criticality: string;
  };
}

export default function MaintenanceDashboard() {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState<MaintenanceTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('upcoming');
  const [stats, setStats] = useState({
    upcoming: 0,
    overdue: 0,
    completed: 0,
    compliance: 78
  });

  useEffect(() => {
    fetchMaintenanceTasks();
  }, []);

  const fetchMaintenanceTasks = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('maintenance_tasks')
        .select(`
          *,
          machine:user_equipment(name, model),
          plan:maintenance_plans(name, criticality)
        `)
        .eq('user_id', user.id)
        .order('due_date', { ascending: true });

      if (error) throw error;

      setTasks(data || []);
      
      // Calculate stats
      const upcoming = data?.filter(t => ['planned', 'due', 'scheduled'].includes(t.status)).length || 0;
      const overdue = data?.filter(t => t.status === 'overdue').length || 0;
      const completed = data?.filter(t => t.status === 'completed').length || 0;
      const total = upcoming + overdue + completed;
      const compliance = total > 0 ? Math.round((completed / total) * 100) : 0;
      
      setStats({ upcoming, overdue, completed, compliance });
    } catch (error) {
      console.error('Error fetching maintenance tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'overdue': return 'bg-red-500';
      case 'due': return 'bg-orange-500';
      case 'scheduled': return 'bg-blue-500';
      case 'in_progress': return 'bg-yellow-500';
      case 'completed': return 'bg-green-500';
      default: return 'bg-muted';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'destructive';
      case 'high': return 'default';
      case 'normal': return 'secondary';
      default: return 'outline';
    }
  };

  const filteredTasks = tasks.filter(task => {
    switch (activeTab) {
      case 'upcoming': return ['planned', 'due', 'scheduled'].includes(task.status);
      case 'overdue': return task.status === 'overdue';
      case 'completed': return task.status === 'completed';
      default: return true;
    }
  });

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="bg-primary text-primary-foreground p-4 pt-8">
        <h1 className="text-xl font-bold mb-4">Maintenance Dashboard</h1>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-3">
          <Card className="bg-primary-foreground/10 border-0 p-3">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary-foreground/70" />
              <div>
                <p className="text-2xl font-bold">{stats.upcoming}</p>
                <p className="text-xs text-primary-foreground/70">Upcoming</p>
              </div>
            </div>
          </Card>
          <Card className="bg-red-500/20 border-0 p-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-300" />
              <div>
                <p className="text-2xl font-bold">{stats.overdue}</p>
                <p className="text-xs text-primary-foreground/70">Overdue</p>
              </div>
            </div>
          </Card>
        </div>
        
        {/* Compliance Bar */}
        <Card className="bg-primary-foreground/10 border-0 p-3 mt-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm">Compliance Rate</span>
            <span className="font-bold">{stats.compliance}%</span>
          </div>
          <Progress value={stats.compliance} className="h-2" />
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="p-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="overdue">Overdue</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-4 space-y-3">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : filteredTasks.length === 0 ? (
            <Card className="p-8 text-center">
              <CheckCircle className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
              <p className="text-muted-foreground">No {activeTab} maintenance tasks</p>
            </Card>
          ) : (
            filteredTasks.map((task) => (
              <Card 
                key={task.id} 
                className="p-4 cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => navigate(`/maintenance/${task.id}`)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <div className={`w-2 h-2 rounded-full ${getStatusColor(task.status)}`} />
                      <span className="font-medium">
                        {task.plan?.name || 'Ad-hoc Maintenance'}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      {task.machine?.name} • {task.machine?.model}
                    </p>
                    <div className="flex items-center gap-2">
                      <Badge variant={getPriorityColor(task.priority) as any}>
                        {task.priority}
                      </Badge>
                      {task.due_date && (
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(task.due_date).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground" />
                </div>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>

      {/* Quick Actions */}
      <div className="fixed bottom-20 left-0 right-0 p-4 bg-gradient-to-t from-background to-transparent">
        <Button 
          className="w-full" 
          size="lg"
          onClick={() => navigate('/maintenance/schedule')}
        >
          <Wrench className="w-4 h-4 mr-2" />
          Schedule Maintenance
        </Button>
      </div>

      <BottomNav activeTab="/maintenance" onTabChange={(path) => navigate(path)} />
    </div>
  );
}
