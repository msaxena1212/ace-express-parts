import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, AlertTriangle, CheckCircle, User, MapPin, Phone, ChevronRight, Filter, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { DealerBottomNav } from '@/components/dealer/DealerBottomNav';

interface ServiceRequest {
  id: string;
  code: string | null;
  service_type: string;
  status: string | null;
  priority: string | null;
  description: string | null;
  created_at: string;
  preferred_date: string | null;
  sla_status: string | null;
  sla_target_time: string | null;
  equipment?: {
    name: string;
    model: string;
  } | null;
  technician_id: string | null;
}

export default function DealerServiceQueue() {
  const navigate = useNavigate();
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('breakdown');
  const [filterPriority, setFilterPriority] = useState('all');

  useEffect(() => {
    fetchServiceRequests();
  }, []);

  const fetchServiceRequests = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get dealer info
      const { data: dealer } = await supabase
        .from('dealers')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!dealer) return;

      const { data, error } = await supabase
        .from('service_requests')
        .select(`
          id, code, service_type, status, priority, description, created_at, 
          preferred_date, sla_status, sla_target_time, technician_id,
          equipment:user_equipment(name, model)
        `)
        .eq('dealer_id', dealer.id)
        .not('status', 'in', '("completed","cancelled")')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRequests(data || []);
    } catch (error) {
      console.error('Error fetching service requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'destructive';
      case 'high': return 'default';
      case 'normal': return 'secondary';
      default: return 'outline';
    }
  };

  const getSLAIndicator = (slaStatus: string, slaTarget: string | null) => {
    if (!slaTarget) return null;
    
    const targetTime = new Date(slaTarget);
    const now = new Date();
    const hoursRemaining = (targetTime.getTime() - now.getTime()) / (1000 * 60 * 60);
    
    if (slaStatus === 'breached' || hoursRemaining < 0) {
      return <Badge variant="destructive" className="text-xs">SLA Breached</Badge>;
    } else if (hoursRemaining < 2) {
      return <Badge className="bg-orange-500 text-xs">SLA at Risk</Badge>;
    }
    return null;
  };

  const breakdownRequests = requests.filter(r => 
    ['breakdown', 'hydraulic', 'electrical', 'mechanical'].includes(r.service_type || '')
  );
  const scheduledRequests = requests.filter(r => 
    ['scheduled_maintenance', 'inspection'].includes(r.service_type || '')
  );

  const filteredRequests = (activeTab === 'breakdown' ? breakdownRequests : scheduledRequests)
    .filter(r => filterPriority === 'all' || (r.priority || '') === filterPriority);

  const RequestCard = ({ request }: { request: ServiceRequest }) => (
    <Card 
      className="p-4 cursor-pointer hover:shadow-md transition-shadow"
      onClick={() => navigate(`/dealer/service/${request.id}`)}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <code className="text-xs bg-muted px-2 py-0.5 rounded">{request.code || 'N/A'}</code>
          <Badge variant={getPriorityColor(request.priority || 'normal') as any}>
            {request.priority || 'normal'}
          </Badge>
          {getSLAIndicator(request.sla_status, request.sla_target_time)}
        </div>
        <span className="text-xs text-muted-foreground whitespace-nowrap">
          {new Date(request.created_at).toLocaleDateString()}
        </span>
      </div>

      <p className="font-medium mb-1">{(request.service_type || '').replace('_', ' ')}</p>
      
      {request.equipment && (
        <p className="text-sm text-muted-foreground mb-2">
          {request.equipment.name} • {request.equipment.model}
        </p>
      )}

      {request.description && (
        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
          {request.description}
        </p>
      )}

      <div className="flex items-center justify-between pt-2 border-t">
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          {request.technician_id ? (
            <span className="flex items-center gap-1">
              <User className="w-3 h-3" />
              Assigned
            </span>
          ) : (
            <span className="text-orange-500">Unassigned</span>
          )}
          {request.preferred_date && (
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {new Date(request.preferred_date).toLocaleDateString()}
            </span>
          )}
        </div>
        <ChevronRight className="w-4 h-4 text-muted-foreground" />
      </div>
    </Card>
  );

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="bg-primary text-primary-foreground p-4 pt-8">
        <h1 className="text-xl font-bold mb-4">Service Queue</h1>
        
        {/* Quick Stats */}
        <div className="grid grid-cols-4 gap-2">
          <Card className="bg-primary-foreground/10 border-0 p-2 text-center">
            <p className="text-lg font-bold">{requests.filter(r => r.status === 'open').length}</p>
            <p className="text-xs opacity-70">Open</p>
          </Card>
          <Card className="bg-primary-foreground/10 border-0 p-2 text-center">
            <p className="text-lg font-bold">{requests.filter(r => r.status === 'assigned').length}</p>
            <p className="text-xs opacity-70">Assigned</p>
          </Card>
          <Card className="bg-primary-foreground/10 border-0 p-2 text-center">
            <p className="text-lg font-bold">{requests.filter(r => r.status === 'in_progress').length}</p>
            <p className="text-xs opacity-70">In Progress</p>
          </Card>
          <Card className="bg-red-500/20 border-0 p-2 text-center">
            <p className="text-lg font-bold">{requests.filter(r => r.sla_status === 'breached').length}</p>
            <p className="text-xs opacity-70">SLA Risk</p>
          </Card>
        </div>
      </div>

      {/* Filters */}
      <div className="p-4 border-b flex items-center gap-3">
        <Select value={filterPriority} onValueChange={setFilterPriority}>
          <SelectTrigger className="w-32">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priority</SelectItem>
            <SelectItem value="critical">Critical</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="normal">Normal</SelectItem>
            <SelectItem value="low">Low</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="p-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="breakdown">
            Breakdown ({breakdownRequests.length})
          </TabsTrigger>
          <TabsTrigger value="scheduled">
            Scheduled ({scheduledRequests.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-4 space-y-3">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : filteredRequests.length === 0 ? (
            <Card className="p-8 text-center">
              <CheckCircle className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
              <p className="text-muted-foreground">No {activeTab} requests</p>
            </Card>
          ) : (
            filteredRequests.map((request) => (
              <RequestCard key={request.id} request={request} />
            ))
          )}
        </TabsContent>
      </Tabs>

      <DealerBottomNav activeTab="/dealer/service" onTabChange={(path) => navigate(path)} />
    </div>
  );
}
