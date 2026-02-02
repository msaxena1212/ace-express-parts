import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Camera, Upload, AlertCircle, Wrench, Settings, Shield, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface Equipment {
  id: string;
  name: string;
  model: string;
}

const symptomCategories = [
  { id: 'hydraulic', name: 'Hydraulic Issues', icon: '💧', questions: ['Do you see leakage?', 'Is pressure low?', 'Unusual noise?'] },
  { id: 'electrical', name: 'Electrical Problems', icon: '⚡', questions: ['Is machine starting?', 'Warning lights on?', 'Battery issues?'] },
  { id: 'mechanical', name: 'Mechanical Issues', icon: '⚙️', questions: ['Unusual vibration?', 'Strange sounds?', 'Parts loose/broken?'] },
  { id: 'other', name: 'Other Issues', icon: '🔧', questions: ['Can you describe the issue?'] },
];

export default function ServiceRequestPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [dealers, setDealers] = useState<any[]>([]);
  
  const [formData, setFormData] = useState({
    machineId: '',
    symptomCategory: '',
    symptoms: [] as string[],
    description: '',
    priority: 'normal',
    dealerId: '',
    preferredDate: '',
    preferredTimeSlot: '',
    attachments: [] as string[],
  });

  useEffect(() => {
    fetchEquipment();
    fetchDealers();
  }, []);

  const fetchEquipment = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from('user_equipment')
      .select('id, name, model')
      .eq('user_id', user.id);
    
    setEquipment(data || []);
  };

  const fetchDealers = async () => {
    const { data } = await supabase
      .from('dealers')
      .select('id, firm_name, location')
      .eq('status', 'active');
    
    setDealers(data || []);
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const code = `SR${Date.now().toString().slice(-8)}`;
      
      const { error } = await supabase
        .from('service_requests')
        .insert({
          user_id: user.id,
          code,
          equipment_id: formData.machineId || null,
          dealer_id: formData.dealerId || null,
          service_type: formData.symptomCategory || 'other',
          priority: formData.priority,
          description: formData.description,
          symptoms: formData.symptoms,
          preferred_date: formData.preferredDate || null,
          preferred_time_slot: formData.preferredTimeSlot || null,
          attachments: formData.attachments,
          status: 'open',
          source: 'app',
          channel: 'app',
        });

      if (error) throw error;

      toast({
        title: 'Service Request Created',
        description: `Your request ${code} has been submitted successfully.`,
      });
      
      navigate('/service/requests');
    } catch (error) {
      console.error('Error creating service request:', error);
      toast({
        title: 'Error',
        description: 'Failed to create service request',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const selectedCategory = symptomCategories.find(c => c.id === formData.symptomCategory);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background border-b">
        <div className="flex items-center gap-3 p-4">
          <Button variant="ghost" size="icon" onClick={() => step > 1 ? setStep(step - 1) : navigate(-1)}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <h1 className="font-semibold">Create Service Request</h1>
            <p className="text-xs text-muted-foreground">Step {step} of 5</p>
          </div>
        </div>
        {/* Progress Bar */}
        <div className="h-1 bg-muted">
          <div 
            className="h-full bg-primary transition-all duration-300" 
            style={{ width: `${(step / 5) * 100}%` }} 
          />
        </div>
      </div>

      <div className="p-4">
        {/* Step 1: Select Machine */}
        {step === 1 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Select Equipment</h2>
            <p className="text-sm text-muted-foreground">Which machine is having issues?</p>
            
            <div className="space-y-3">
              <Card 
                className={`p-4 cursor-pointer border-2 transition-colors ${!formData.machineId ? 'border-primary bg-primary/5' : 'border-transparent'}`}
                onClick={() => setFormData({ ...formData, machineId: '' })}
              >
                <p className="font-medium">Issue not linked to a machine</p>
                <p className="text-sm text-muted-foreground">General inquiry or support</p>
              </Card>
              
              {equipment.map((eq) => (
                <Card 
                  key={eq.id}
                  className={`p-4 cursor-pointer border-2 transition-colors ${formData.machineId === eq.id ? 'border-primary bg-primary/5' : 'border-transparent'}`}
                  onClick={() => setFormData({ ...formData, machineId: eq.id })}
                >
                  <p className="font-medium">{eq.name}</p>
                  <p className="text-sm text-muted-foreground">{eq.model}</p>
                </Card>
              ))}
            </div>

            <Button className="w-full mt-6" onClick={() => setStep(2)}>
              Continue
            </Button>
          </div>
        )}

        {/* Step 2: Symptom Category */}
        {step === 2 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">What's the issue?</h2>
            <p className="text-sm text-muted-foreground">Select the category that best describes your problem</p>
            
            <div className="grid grid-cols-2 gap-3">
              {symptomCategories.map((category) => (
                <Card 
                  key={category.id}
                  className={`p-4 cursor-pointer border-2 transition-colors text-center ${formData.symptomCategory === category.id ? 'border-primary bg-primary/5' : 'border-transparent'}`}
                  onClick={() => setFormData({ ...formData, symptomCategory: category.id })}
                >
                  <span className="text-3xl">{category.icon}</span>
                  <p className="font-medium mt-2">{category.name}</p>
                </Card>
              ))}
            </div>

            <Button 
              className="w-full mt-6" 
              onClick={() => setStep(3)}
              disabled={!formData.symptomCategory}
            >
              Continue
            </Button>
          </div>
        )}

        {/* Step 3: Symptom Details */}
        {step === 3 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Tell us more</h2>
            <p className="text-sm text-muted-foreground">Answer these questions to help us understand better</p>
            
            {selectedCategory?.questions.map((question, index) => (
              <Card key={index} className="p-4">
                <Label className="text-sm font-medium">{question}</Label>
                <RadioGroup 
                  className="flex gap-4 mt-2"
                  value={formData.symptoms.includes(question) ? 'yes' : 'no'}
                  onValueChange={(value) => {
                    if (value === 'yes') {
                      setFormData({ ...formData, symptoms: [...formData.symptoms, question] });
                    } else {
                      setFormData({ ...formData, symptoms: formData.symptoms.filter(s => s !== question) });
                    }
                  }}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="yes" id={`q${index}-yes`} />
                    <Label htmlFor={`q${index}-yes`}>Yes</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="no" id={`q${index}-no`} />
                    <Label htmlFor={`q${index}-no`}>No</Label>
                  </div>
                </RadioGroup>
              </Card>
            ))}

            <div className="space-y-2">
              <Label>Additional Details</Label>
              <Textarea 
                placeholder="Describe the issue in detail..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label>Attach Images/Videos</Label>
              <div className="flex gap-3">
                <Button variant="outline" className="flex-1">
                  <Camera className="w-4 h-4 mr-2" />
                  Take Photo
                </Button>
                <Button variant="outline" className="flex-1">
                  <Upload className="w-4 h-4 mr-2" />
                  Upload
                </Button>
              </div>
            </div>

            <Button className="w-full mt-6" onClick={() => setStep(4)}>
              Continue
            </Button>
          </div>
        )}

        {/* Step 4: Priority & Dealer */}
        {step === 4 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Schedule Service</h2>
            
            <div className="space-y-2">
              <Label>Priority Level</Label>
              <Select 
                value={formData.priority} 
                onValueChange={(value) => setFormData({ ...formData, priority: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low - Can wait a few days</SelectItem>
                  <SelectItem value="normal">Normal - Within 2-3 days</SelectItem>
                  <SelectItem value="high">High - Urgent, within 24 hours</SelectItem>
                  <SelectItem value="critical">Critical - Machine down, immediate</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Select Dealer</Label>
              <Select 
                value={formData.dealerId} 
                onValueChange={(value) => setFormData({ ...formData, dealerId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose a dealer..." />
                </SelectTrigger>
                <SelectContent>
                  {dealers.map((dealer) => (
                    <SelectItem key={dealer.id} value={dealer.id}>
                      {dealer.firm_name} - {dealer.location}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Preferred Date</Label>
              <Input 
                type="date"
                value={formData.preferredDate}
                onChange={(e) => setFormData({ ...formData, preferredDate: e.target.value })}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>

            <div className="space-y-2">
              <Label>Preferred Time Slot</Label>
              <Select 
                value={formData.preferredTimeSlot} 
                onValueChange={(value) => setFormData({ ...formData, preferredTimeSlot: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select time slot..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="morning">Morning (8 AM - 12 PM)</SelectItem>
                  <SelectItem value="afternoon">Afternoon (12 PM - 4 PM)</SelectItem>
                  <SelectItem value="evening">Evening (4 PM - 7 PM)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button className="w-full mt-6" onClick={() => setStep(5)}>
              Review & Submit
            </Button>
          </div>
        )}

        {/* Step 5: Review */}
        {step === 5 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Review Your Request</h2>
            
            <Card className="p-4 space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Equipment</span>
                <span className="font-medium">
                  {formData.machineId 
                    ? equipment.find(e => e.id === formData.machineId)?.name 
                    : 'Not linked'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Issue Type</span>
                <span className="font-medium">{selectedCategory?.name || 'General'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Priority</span>
                <span className="font-medium capitalize">{formData.priority}</span>
              </div>
              {formData.dealerId && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Dealer</span>
                  <span className="font-medium">
                    {dealers.find(d => d.id === formData.dealerId)?.firm_name}
                  </span>
                </div>
              )}
              {formData.preferredDate && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Preferred Date</span>
                  <span className="font-medium">
                    {new Date(formData.preferredDate).toLocaleDateString()}
                  </span>
                </div>
              )}
            </Card>

            {formData.description && (
              <Card className="p-4">
                <Label className="text-muted-foreground">Description</Label>
                <p className="mt-1">{formData.description}</p>
              </Card>
            )}

            <div className="flex gap-3 mt-6">
              <Button variant="outline" className="flex-1" onClick={() => setStep(1)}>
                Edit
              </Button>
              <Button className="flex-1" onClick={handleSubmit} disabled={loading}>
                {loading ? 'Submitting...' : 'Submit Request'}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
