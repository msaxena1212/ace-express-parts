import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Plus, User, Clock, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { DealerBottomNav } from '@/components/dealer/DealerBottomNav';

interface CalendarEvent {
  id: string;
  type: 'service_request' | 'maintenance';
  title: string;
  time_slot: string;
  customer_name?: string;
  technician_name?: string;
  priority?: string;
  status: string;
}

interface Technician {
  id: string;
  name: string;
  daily_capacity: number;
  current_workload: number;
  todayTasks: number;
}

export default function DealerCalendar() {
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'day' | 'week'>('day');

  const timeSlots = [
    '08:00 AM', '09:00 AM', '10:00 AM', '11:00 AM', 
    '12:00 PM', '01:00 PM', '02:00 PM', '03:00 PM', 
    '04:00 PM', '05:00 PM', '06:00 PM'
  ];

  useEffect(() => {
    fetchCalendarData();
  }, [currentDate]);

  const fetchCalendarData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: dealer } = await supabase
        .from('dealers')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!dealer) return;

      // Fetch technicians
      const { data: techData } = await supabase
        .from('dealer_technicians')
        .select('*')
        .eq('dealer_id', dealer.id)
        .eq('is_active', true);

      // Fetch calendar slots for the current date
      const dateStr = currentDate.toISOString().split('T')[0];
      const { data: slots } = await supabase
        .from('dealer_calendar_slots')
        .select('*')
        .eq('dealer_id', dealer.id)
        .eq('slot_date', dateStr);

      // Mock events for display
      const mockEvents: CalendarEvent[] = [
        {
          id: '1',
          type: 'service_request',
          title: 'Hydraulic Repair - Tower Crane TC-5013',
          time_slot: '09:00 AM',
          customer_name: 'ABC Construction',
          technician_name: techData?.[0]?.name || 'Unassigned',
          priority: 'high',
          status: 'scheduled'
        },
        {
          id: '2',
          type: 'maintenance',
          title: '500-hr Service - Pick & Carry Crane',
          time_slot: '11:00 AM',
          customer_name: 'XYZ Builders',
          technician_name: techData?.[1]?.name || 'Unassigned',
          priority: 'normal',
          status: 'scheduled'
        },
        {
          id: '3',
          type: 'service_request',
          title: 'Electrical Diagnostics - Fork Lift',
          time_slot: '02:00 PM',
          customer_name: 'Metro Warehouse',
          priority: 'critical',
          status: 'overdue'
        },
      ];

      setEvents(mockEvents);
      setTechnicians(techData?.map(t => ({
        ...t,
        todayTasks: Math.floor(Math.random() * 4) + 1
      })) || []);
    } catch (error) {
      console.error('Error fetching calendar data:', error);
    } finally {
      setLoading(false);
    }
  };

  const navigateDate = (direction: number) => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + direction);
    setCurrentDate(newDate);
  };

  const getEventColor = (event: CalendarEvent) => {
    if (event.status === 'overdue') return 'border-l-red-500 bg-red-50 dark:bg-red-950/20';
    if (event.priority === 'critical') return 'border-l-red-500 bg-red-50 dark:bg-red-950/20';
    if (event.priority === 'high') return 'border-l-orange-500 bg-orange-50 dark:bg-orange-950/20';
    if (event.type === 'maintenance') return 'border-l-blue-500 bg-blue-50 dark:bg-blue-950/20';
    return 'border-l-green-500 bg-green-50 dark:bg-green-950/20';
  };

  const getEventsForSlot = (slot: string) => {
    return events.filter(e => e.time_slot === slot);
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background border-b">
        <div className="flex items-center justify-between p-4">
          <Button variant="ghost" size="icon" onClick={() => navigateDate(-1)}>
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <div className="text-center">
            <h1 className="font-semibold">
              {currentDate.toLocaleDateString('en-US', { 
                weekday: 'long', 
                month: 'short', 
                day: 'numeric' 
              })}
            </h1>
            <p className="text-xs text-muted-foreground">
              {events.length} scheduled events
            </p>
          </div>
          <Button variant="ghost" size="icon" onClick={() => navigateDate(1)}>
            <ChevronRight className="w-5 h-5" />
          </Button>
        </div>
        <div className="flex items-center justify-between px-4 pb-2">
          <Tabs value={view} onValueChange={(v) => setView(v as 'day' | 'week')}>
            <TabsList className="h-8">
              <TabsTrigger value="day" className="text-xs px-3">Day</TabsTrigger>
              <TabsTrigger value="week" className="text-xs px-3">Week</TabsTrigger>
            </TabsList>
          </Tabs>
          <Button size="sm">
            <Plus className="w-4 h-4 mr-1" />
            Add Slot
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <>
          {/* Technician Workload */}
          <div className="p-4 border-b">
            <h3 className="text-sm font-medium mb-3">Technician Workload</h3>
            <div className="flex gap-3 overflow-x-auto pb-2">
              {technicians.map((tech) => (
                <Card key={tech.id} className="p-3 min-w-32 flex-shrink-0">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{tech.name}</p>
                      <p className="text-xs text-muted-foreground">{tech.todayTasks} tasks</p>
                    </div>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary rounded-full transition-all"
                      style={{ width: `${(tech.todayTasks / tech.daily_capacity) * 100}%` }}
                    />
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Timeline View */}
          <div className="p-4 space-y-1">
            {timeSlots.map((slot) => {
              const slotEvents = getEventsForSlot(slot);
              return (
                <div key={slot} className="flex gap-3">
                  <div className="w-20 text-xs text-muted-foreground pt-2 flex-shrink-0">
                    {slot}
                  </div>
                  <div className="flex-1 min-h-16 border-l-2 border-muted pl-3 py-1">
                    {slotEvents.length === 0 ? (
                      <div className="h-full flex items-center">
                        <div className="w-full h-px bg-muted" />
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {slotEvents.map((event) => (
                          <Card 
                            key={event.id}
                            className={`p-3 border-l-4 cursor-pointer hover:shadow-md transition-shadow ${getEventColor(event)}`}
                            onClick={() => navigate(`/dealer/service/${event.id}`)}
                          >
                            <div className="flex items-start justify-between mb-1">
                              <p className="font-medium text-sm">{event.title}</p>
                              {event.status === 'overdue' && (
                                <AlertTriangle className="w-4 h-4 text-red-500" />
                              )}
                            </div>
                            <div className="flex items-center gap-3 text-xs text-muted-foreground">
                              {event.customer_name && (
                                <span>{event.customer_name}</span>
                              )}
                              {event.technician_name && (
                                <span className="flex items-center gap-1">
                                  <User className="w-3 h-3" />
                                  {event.technician_name}
                                </span>
                              )}
                            </div>
                          </Card>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Legend */}
          <div className="p-4 border-t">
            <div className="flex flex-wrap gap-4 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-green-500" />
                <span>Scheduled</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-orange-500" />
                <span>High Priority</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-red-500" />
                <span>Overdue/Critical</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-blue-500" />
                <span>Maintenance</span>
              </div>
            </div>
          </div>
        </>
      )}

      <DealerBottomNav activeTab="/dealer/calendar" onTabChange={(path) => navigate(path)} />
    </div>
  );
}
