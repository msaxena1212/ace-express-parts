import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Check, MapPin, Calendar as CalendarIcon, Clock, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface Dealer {
  id: string;
  firm_name: string;
  location: string | null;
  phone: string | null;
}

interface TimeSlot {
  id: string;
  time_slot: string;
  is_available: boolean;
}

export default function ScheduleMaintenance() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [dealers, setDealers] = useState<Dealer[]>([]);
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  
  const [formData, setFormData] = useState({
    dealerId: '',
    serviceType: 'on-site' as 'on-site' | 'workshop',
    selectedDate: undefined as Date | undefined,
    selectedSlot: '',
  });

  useEffect(() => {
    fetchDealers();
  }, []);

  useEffect(() => {
    if (formData.dealerId && formData.selectedDate) {
      fetchAvailableSlots();
    }
  }, [formData.dealerId, formData.selectedDate]);

  const fetchDealers = async () => {
    const { data } = await supabase
      .from('dealers')
      .select('id, firm_name, location, phone')
      .eq('status', 'active');
    
    setDealers(data || []);
  };

  const fetchAvailableSlots = async () => {
    if (!formData.dealerId || !formData.selectedDate) return;
    
    const dateStr = formData.selectedDate.toISOString().split('T')[0];
    
    const { data } = await supabase
      .from('dealer_calendar_slots')
      .select('id, time_slot, is_available')
      .eq('dealer_id', formData.dealerId)
      .eq('slot_date', dateStr)
      .eq('is_available', true);
    
    // If no slots exist, generate default slots
    if (!data || data.length === 0) {
      setAvailableSlots([
        { id: 'morning', time_slot: 'Morning (8 AM - 12 PM)', is_available: true },
        { id: 'afternoon', time_slot: 'Afternoon (12 PM - 4 PM)', is_available: true },
        { id: 'evening', time_slot: 'Evening (4 PM - 7 PM)', is_available: true },
      ]);
    } else {
      setAvailableSlots(data);
    }
  };

  const handleSubmit = async () => {
    if (!formData.dealerId || !formData.selectedDate || !formData.selectedSlot) {
      toast({ title: 'Missing Information', description: 'Please complete all steps', variant: 'destructive' });
      return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Update maintenance task
      const dateStr = formData.selectedDate.toISOString().split('T')[0];
      
      await supabase
        .from('maintenance_tasks')
        .update({
          status: 'scheduled',
          scheduled_date: dateStr,
          scheduled_time_slot: formData.selectedSlot,
          assignee_type: 'dealer',
          assignee_id: formData.dealerId,
        })
        .eq('id', id);

      // Create linked service request
      const code = `SR${Date.now().toString().slice(-8)}`;
      await supabase
        .from('service_requests')
        .insert({
          user_id: user.id,
          code,
          service_type: 'scheduled_maintenance',
          dealer_id: formData.dealerId,
          linked_maintenance_task_id: id,
          preferred_date: dateStr,
          preferred_time_slot: formData.selectedSlot,
          status: 'scheduled',
          priority: 'normal',
          description: `Scheduled maintenance - ${formData.serviceType} service`,
        });

      toast({ title: 'Scheduled!', description: 'Your maintenance has been scheduled successfully' });
      navigate('/maintenance');
    } catch (error) {
      console.error('Error scheduling:', error);
      toast({ title: 'Error', description: 'Failed to schedule maintenance', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const selectedDealer = dealers.find(d => d.id === formData.dealerId);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background border-b">
        <div className="flex items-center gap-3 p-4">
          <Button variant="ghost" size="icon" onClick={() => step > 1 ? setStep(step - 1) : navigate(-1)}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <h1 className="font-semibold">Schedule Service</h1>
            <p className="text-xs text-muted-foreground">Step {step} of 4</p>
          </div>
        </div>
        <div className="h-1 bg-muted">
          <div 
            className="h-full bg-primary transition-all duration-300" 
            style={{ width: `${(step / 4) * 100}%` }} 
          />
        </div>
      </div>

      <div className="p-4">
        {/* Step 1: Select Dealer */}
        {step === 1 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Select Service Provider</h2>
            <p className="text-sm text-muted-foreground">Choose a dealer for your maintenance service</p>
            
            <div className="space-y-3">
              {dealers.map((dealer) => (
                <Card 
                  key={dealer.id}
                  className={`p-4 cursor-pointer border-2 transition-colors ${
                    formData.dealerId === dealer.id ? 'border-primary bg-primary/5' : 'border-transparent'
                  }`}
                  onClick={() => setFormData({ ...formData, dealerId: dealer.id })}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{dealer.firm_name}</p>
                      {dealer.location && (
                        <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                          <MapPin className="w-3 h-3" />
                          {dealer.location}
                        </p>
                      )}
                    </div>
                    {formData.dealerId === dealer.id && (
                      <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                        <Check className="w-4 h-4 text-primary-foreground" />
                      </div>
                    )}
                  </div>
                </Card>
              ))}
            </div>

            <Button 
              className="w-full mt-6" 
              onClick={() => setStep(2)}
              disabled={!formData.dealerId}
            >
              Continue
            </Button>
          </div>
        )}

        {/* Step 2: Service Type */}
        {step === 2 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Service Type</h2>
            <p className="text-sm text-muted-foreground">How would you like the service to be performed?</p>
            
            <RadioGroup 
              value={formData.serviceType} 
              onValueChange={(value) => setFormData({ ...formData, serviceType: value as 'on-site' | 'workshop' })}
              className="space-y-3"
            >
              <Card className={`p-4 cursor-pointer border-2 ${formData.serviceType === 'on-site' ? 'border-primary' : 'border-transparent'}`}>
                <div className="flex items-center space-x-3">
                  <RadioGroupItem value="on-site" id="on-site" />
                  <Label htmlFor="on-site" className="flex-1 cursor-pointer">
                    <p className="font-medium">On-Site Service</p>
                    <p className="text-sm text-muted-foreground">Technician visits your location</p>
                  </Label>
                </div>
              </Card>
              
              <Card className={`p-4 cursor-pointer border-2 ${formData.serviceType === 'workshop' ? 'border-primary' : 'border-transparent'}`}>
                <div className="flex items-center space-x-3">
                  <RadioGroupItem value="workshop" id="workshop" />
                  <Label htmlFor="workshop" className="flex-1 cursor-pointer">
                    <p className="font-medium">Workshop Service</p>
                    <p className="text-sm text-muted-foreground">Bring equipment to dealer workshop</p>
                  </Label>
                </div>
              </Card>
            </RadioGroup>

            <Button className="w-full mt-6" onClick={() => setStep(3)}>
              Continue
            </Button>
          </div>
        )}

        {/* Step 3: Select Date & Time */}
        {step === 3 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Select Date & Time</h2>
            <p className="text-sm text-muted-foreground">Choose a convenient slot for your service</p>
            
            <Card className="p-4">
              <Calendar
                mode="single"
                selected={formData.selectedDate}
                onSelect={(date) => setFormData({ ...formData, selectedDate: date, selectedSlot: '' })}
                disabled={(date) => date < new Date()}
                className="rounded-md border-0"
              />
            </Card>

            {formData.selectedDate && (
              <Card className="p-4">
                <h3 className="font-medium mb-3 flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Available Slots
                </h3>
                <div className="grid grid-cols-1 gap-2">
                  {availableSlots.map((slot) => (
                    <Button
                      key={slot.id}
                      variant={formData.selectedSlot === slot.time_slot ? "default" : "outline"}
                      className="justify-start"
                      onClick={() => setFormData({ ...formData, selectedSlot: slot.time_slot })}
                    >
                      {slot.time_slot}
                    </Button>
                  ))}
                </div>
              </Card>
            )}

            <Button 
              className="w-full mt-6" 
              onClick={() => setStep(4)}
              disabled={!formData.selectedDate || !formData.selectedSlot}
            >
              Continue
            </Button>
          </div>
        )}

        {/* Step 4: Confirm */}
        {step === 4 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Confirm Booking</h2>
            <p className="text-sm text-muted-foreground">Review your service details</p>
            
            <Card className="p-4 space-y-4">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Dealer</span>
                <span className="font-medium">{selectedDealer?.firm_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Service Type</span>
                <Badge variant="secondary">{formData.serviceType}</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Date</span>
                <span className="font-medium">
                  {formData.selectedDate?.toLocaleDateString('en-US', { 
                    weekday: 'short', 
                    month: 'short', 
                    day: 'numeric' 
                  })}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Time Slot</span>
                <span className="font-medium">{formData.selectedSlot}</span>
              </div>
            </Card>

            <Card className="p-4 bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-900">
              <p className="text-sm text-green-700 dark:text-green-300">
                ✓ No payment required now. Pay after service completion.
              </p>
            </Card>

            <div className="flex gap-3 mt-6">
              <Button variant="outline" className="flex-1" onClick={() => setStep(1)}>
                Edit
              </Button>
              <Button className="flex-1" onClick={handleSubmit} disabled={loading}>
                {loading ? 'Scheduling...' : 'Confirm Booking'}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
