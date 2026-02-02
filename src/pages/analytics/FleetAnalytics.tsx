import { useState, useEffect } from 'react';
import { ArrowLeft, TrendingUp, TrendingDown, DollarSign, Clock, Wrench, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { BottomNav } from '@/components/BottomNav';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RePieChart, Pie, Cell } from 'recharts';

interface MachineWithCosts {
  id: string;
  name: string;
  model: string;
  totalCost: number;
  partsCost: number;
  laborCost: number;
  downtime: number;
}

export default function FleetAnalytics() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('12m');
  const [machines, setMachines] = useState<MachineWithCosts[]>([]);
  const [totals, setTotals] = useState({
    totalCost: 0,
    partsCost: 0,
    laborCost: 0,
    avgDowntime: 0,
    mtbf: 0,
    mttr: 0,
    compliance: 78,
  });

  const costTrendData = [
    { month: 'Jul', parts: 45000, labor: 12000, total: 57000 },
    { month: 'Aug', parts: 38000, labor: 15000, total: 53000 },
    { month: 'Sep', parts: 52000, labor: 18000, total: 70000 },
    { month: 'Oct', parts: 41000, labor: 11000, total: 52000 },
    { month: 'Nov', parts: 48000, labor: 14000, total: 62000 },
    { month: 'Dec', parts: 55000, labor: 16000, total: 71000 },
    { month: 'Jan', parts: 43000, labor: 13000, total: 56000 },
  ];

  const costBreakdown = [
    { name: 'Parts', value: 65, color: '#f97316' },
    { name: 'Labor', value: 25, color: '#3b82f6' },
    { name: 'Travel', value: 7, color: '#22c55e' },
    { name: 'Other', value: 3, color: '#94a3b8' },
  ];

  useEffect(() => {
    fetchAnalyticsData();
  }, [period]);

  const fetchAnalyticsData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch user's machines
      const { data: equipmentData } = await supabase
        .from('user_equipment')
        .select('id, name, model')
        .eq('user_id', user.id);

      // Fetch costs for each machine
      const machinesWithCosts: MachineWithCosts[] = [];
      let totalPartsCost = 0;
      let totalLaborCost = 0;
      let totalDowntime = 0;

      for (const eq of equipmentData || []) {
        const { data: costs } = await supabase
          .from('machine_costs')
          .select('*')
          .eq('machine_id', eq.id);

        const { data: downtime } = await supabase
          .from('machine_downtime')
          .select('*')
          .eq('machine_id', eq.id);

        const partsCost = costs?.filter(c => c.cost_type === 'parts').reduce((sum, c) => sum + Number(c.amount), 0) || 0;
        const laborCost = costs?.filter(c => c.cost_type === 'labor').reduce((sum, c) => sum + Number(c.amount), 0) || 0;
        const totalMachineCost = costs?.reduce((sum, c) => sum + Number(c.amount), 0) || 0;
        const machineDowntime = downtime?.reduce((sum, d) => sum + (Number(d.duration_hours) || 0), 0) || 0;

        totalPartsCost += partsCost;
        totalLaborCost += laborCost;
        totalDowntime += machineDowntime;

        machinesWithCosts.push({
          id: eq.id,
          name: eq.name,
          model: eq.model,
          totalCost: totalMachineCost,
          partsCost,
          laborCost,
          downtime: machineDowntime,
        });
      }

      setMachines(machinesWithCosts.sort((a, b) => b.totalCost - a.totalCost));
      setTotals({
        totalCost: totalPartsCost + totalLaborCost,
        partsCost: totalPartsCost,
        laborCost: totalLaborCost,
        avgDowntime: machinesWithCosts.length > 0 ? totalDowntime / machinesWithCosts.length : 0,
        mtbf: 720, // Mock: Mean Time Between Failures in hours
        mttr: 4.2, // Mock: Mean Time To Repair in hours
        compliance: 78,
      });
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background border-b">
        <div className="flex items-center gap-3 p-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <h1 className="font-semibold">Fleet Analytics</h1>
            <p className="text-xs text-muted-foreground">Cost & Performance Overview</p>
          </div>
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-24">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="3m">3 months</SelectItem>
              <SelectItem value="6m">6 months</SelectItem>
              <SelectItem value="12m">12 months</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="p-4 space-y-4">
          {/* Key Metrics */}
          <div className="grid grid-cols-2 gap-3">
            <Card className="p-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <DollarSign className="w-4 h-4" />
                <span className="text-xs">Total Cost</span>
              </div>
              <p className="text-xl font-bold">₹{totals.totalCost.toLocaleString()}</p>
              <div className="flex items-center gap-1 text-xs text-red-500 mt-1">
                <TrendingUp className="w-3 h-3" />
                <span>+12% vs last period</span>
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <Clock className="w-4 h-4" />
                <span className="text-xs">Avg Downtime</span>
              </div>
              <p className="text-xl font-bold">{totals.avgDowntime.toFixed(1)}h</p>
              <div className="flex items-center gap-1 text-xs text-green-500 mt-1">
                <TrendingDown className="w-3 h-3" />
                <span>-8% vs last period</span>
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <BarChart3 className="w-4 h-4" />
                <span className="text-xs">MTBF</span>
              </div>
              <p className="text-xl font-bold">{totals.mtbf}h</p>
              <p className="text-xs text-muted-foreground">Mean Time Between Failures</p>
            </Card>
            <Card className="p-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <Wrench className="w-4 h-4" />
                <span className="text-xs">MTTR</span>
              </div>
              <p className="text-xl font-bold">{totals.mttr}h</p>
              <p className="text-xs text-muted-foreground">Mean Time To Repair</p>
            </Card>
          </div>

          {/* Maintenance Compliance */}
          <Card className="p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold">Maintenance Compliance</h3>
              <span className="text-lg font-bold text-primary">{totals.compliance}%</span>
            </div>
            <Progress value={totals.compliance} className="h-3" />
            <p className="text-xs text-muted-foreground mt-2">
              {totals.compliance}% of scheduled maintenance completed on time
            </p>
          </Card>

          {/* Cost Trend Chart */}
          <Card className="p-4">
            <h3 className="font-semibold mb-4">Cost Trend</h3>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={costTrendData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="month" className="text-xs" />
                  <YAxis className="text-xs" tickFormatter={(value) => `₹${value/1000}k`} />
                  <Tooltip 
                    formatter={(value: number) => [`₹${value.toLocaleString()}`, '']}
                    labelStyle={{ color: 'var(--foreground)' }}
                    contentStyle={{ 
                      backgroundColor: 'var(--background)', 
                      border: '1px solid var(--border)',
                      borderRadius: '8px'
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="parts" 
                    stackId="1"
                    stroke="#f97316" 
                    fill="#f97316" 
                    fillOpacity={0.6}
                    name="Parts"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="labor" 
                    stackId="1"
                    stroke="#3b82f6" 
                    fill="#3b82f6" 
                    fillOpacity={0.6}
                    name="Labor"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-4 mt-2">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-[#f97316]" />
                <span className="text-xs">Parts</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-[#3b82f6]" />
                <span className="text-xs">Labor</span>
              </div>
            </div>
          </Card>

          {/* Cost Breakdown */}
          <Card className="p-4">
            <h3 className="font-semibold mb-4">Cost Breakdown</h3>
            <div className="flex items-center gap-4">
              <div className="w-32 h-32">
                <ResponsiveContainer width="100%" height="100%">
                  <RePieChart>
                    <Pie
                      data={costBreakdown}
                      cx="50%"
                      cy="50%"
                      innerRadius={30}
                      outerRadius={50}
                      dataKey="value"
                    >
                      {costBreakdown.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </RePieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex-1 space-y-2">
                {costBreakdown.map((item) => (
                  <div key={item.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded" style={{ backgroundColor: item.color }} />
                      <span className="text-sm">{item.name}</span>
                    </div>
                    <span className="font-medium">{item.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          {/* Cost by Machine */}
          <Card className="p-4">
            <h3 className="font-semibold mb-4">Cost by Machine</h3>
            <div className="space-y-4">
              {machines.slice(0, 5).map((machine, index) => (
                <div key={machine.id}>
                  <div className="flex items-center justify-between mb-1">
                    <div>
                      <p className="font-medium text-sm">{machine.name}</p>
                      <p className="text-xs text-muted-foreground">{machine.model}</p>
                    </div>
                    <span className="font-bold">₹{machine.totalCost.toLocaleString()}</span>
                  </div>
                  <div className="flex gap-1 h-2">
                    <div 
                      className="bg-[#f97316] rounded-l"
                      style={{ width: `${(machine.partsCost / (machine.totalCost || 1)) * 100}%` }}
                    />
                    <div 
                      className="bg-[#3b82f6] rounded-r"
                      style={{ width: `${(machine.laborCost / (machine.totalCost || 1)) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Downtime Heatmap Placeholder */}
          <Card className="p-4">
            <h3 className="font-semibold mb-4">Downtime by Month</h3>
            <div className="grid grid-cols-6 gap-1">
              {['Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((month, i) => (
                <div key={month} className="text-center">
                  <div 
                    className="h-8 rounded mb-1"
                    style={{ 
                      backgroundColor: `rgba(239, 68, 68, ${0.2 + (Math.random() * 0.6)})` 
                    }}
                  />
                  <span className="text-xs text-muted-foreground">{month}</span>
                </div>
              ))}
            </div>
            <div className="flex justify-between mt-3 text-xs text-muted-foreground">
              <span>Low</span>
              <span>High</span>
            </div>
          </Card>
        </div>
      )}

      <BottomNav activeTab="/analytics" onTabChange={(path) => navigate(path)} />
    </div>
  );
}
