import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Clock, CheckCircle, AlertTriangle, Wrench, ChevronRight, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { BottomNav } from '@/components/BottomNav';

interface ServiceRequest {
  id: string;
  code: string;
  service_type: string;
  status: string;
  priority: string;
  description: string;
  created_at: string;
  preferred_date: string | null;
  equipment?: {
    name: string;
    model: string;
  };
}

const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
  open: { label: 'Open', color: 'bg-blue-500', icon: Clock },
  triaged: { label: 'Triaged', color: 'bg-purple-500', icon: Filter },
  assigned: { label: 'Assigned', color: 'bg-indigo-500', icon: Wrench },
  scheduled: { label: 'Scheduled', color: 'bg-cyan-500', icon: Clock },
  en_route: { label: 'On the Way', color: 'bg-orange-500', icon: Wrench },
  in_progress: { label: 'In Progress', color: 'bg-yellow-500', icon: Wrench },
  waiting_parts: { label: 'Waiting for Parts', color: 'bg-amber-500', icon: Clock },
  completed: { label: 'Completed', color: 'bg-green-500', icon: CheckCircle },
  cancelled: { label: 'Cancelled', color: 'bg-gray-500', icon: AlertTriangle },
};

export default function ServiceRequestsList() {
  const navigate = useNavigate();
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('active');

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('service_requests')
        .select(`
          id, code, service_type, status, priority, description, created_at, preferred_date,
          equipment:user_equipment(name, model)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRequests(data || []);
    } catch (error) {
      console.error('Error fetching requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const activeRequests = requests.filter(r => 
    !['completed', 'cancelled'].includes(r.status)
  );
  const completedRequests = requests.filter(r => 
    ['completed', 'cancelled'].includes(r.status)
  );

  const getServiceTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      breakdown: 'Breakdown',
      scheduled_maintenance: 'Scheduled Maintenance',
      inspection: 'Inspection',
      warranty: 'Warranty',
      hydraulic: 'Hydraulic Issues',
      electrical: 'Electrical Issues',
      mechanical: 'Mechanical Issues',
      other: 'General Service',
    };
    return types[type] || type;
  };

  const RequestCard = ({ request }: { request: ServiceRequest }) => {
    const status = statusConfig[request.status] || statusConfig.open;
    const StatusIcon = status.icon;

    return (
      <Card 
        className="p-4 cursor-pointer hover:shadow-md transition-shadow"
        onClick={() => navigate(`/service/requests/${request.id}`)}
      >
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <code className="text-xs bg-muted px-2 py-0.5 rounded">{request.code}</code>
              <Badge variant="outline" className="text-xs">
                {request.priority}
              </Badge>
            </div>
            <p className="font-medium mt-1">{getServiceTypeLabel(request.service_type)}</p>
            {request.equipment && (
              <p className="text-sm text-muted-foreground">
                {request.equipment.name} • {request.equipment.model}
              </p>
            )}
            <div className="flex items-center gap-2 mt-2">
              <div className={`w-2 h-2 rounded-full ${status.color}`} />
              <span className="text-xs text-muted-foreground">{status.label}</span>
              <span className="text-xs text-muted-foreground">•</span>
              <span className="text-xs text-muted-foreground">
                {new Date(request.created_at).toLocaleDateString()}
              </span>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-muted-foreground" />
        </div>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="bg-primary text-primary-foreground p-4 pt-8">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold">Service Requests</h1>
          <Button 
            size="sm" 
            variant="secondary"
            onClick={() => navigate('/service/new')}
          >
            <Plus className="w-4 h-4 mr-1" />
            New
          </Button>
        </div>
        
        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-3">
          <Card className="bg-primary-foreground/10 border-0 p-3 text-center">
            <p className="text-2xl font-bold">{activeRequests.length}</p>
            <p className="text-xs text-primary-foreground/70">Active</p>
          </Card>
          <Card className="bg-primary-foreground/10 border-0 p-3 text-center">
            <p className="text-2xl font-bold">
              {requests.filter(r => r.status === 'in_progress').length}
            </p>
            <p className="text-xs text-primary-foreground/70">In Progress</p>
          </Card>
          <Card className="bg-primary-foreground/10 border-0 p-3 text-center">
            <p className="text-2xl font-bold">{completedRequests.length}</p>
            <p className="text-xs text-primary-foreground/70">Completed</p>
          </Card>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="p-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="active">Active ({activeRequests.length})</TabsTrigger>
          <TabsTrigger value="completed">History ({completedRequests.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="mt-4 space-y-3">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : activeRequests.length === 0 ? (
            <Card className="p-8 text-center">
              <Wrench className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
              <p className="text-muted-foreground mb-4">No active service requests</p>
              <Button onClick={() => navigate('/service/new')}>
                <Plus className="w-4 h-4 mr-2" />
                Create Request
              </Button>
            </Card>
          ) : (
            activeRequests.map((request) => (
              <RequestCard key={request.id} request={request} />
            ))
          )}
        </TabsContent>

        <TabsContent value="completed" className="mt-4 space-y-3">
          {completedRequests.length === 0 ? (
            <Card className="p-8 text-center">
              <CheckCircle className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
              <p className="text-muted-foreground">No completed requests yet</p>
            </Card>
          ) : (
            completedRequests.map((request) => (
              <RequestCard key={request.id} request={request} />
            ))
          )}
        </TabsContent>
      </Tabs>

      <BottomNav activeTab="/service" onTabChange={(path) => navigate(path)} />
    </div>
  );
}
