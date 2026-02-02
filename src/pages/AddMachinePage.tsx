import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Camera, QrCode, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { equipmentTypes } from '@/data/mockData';

export default function AddMachinePage() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    equipment_type: '',
    model: '',
    serial_number: '',
    name: '',
    manufacturing_year: '',
    operating_hours: '',
    location: '',
    warranty_status: 'unknown',
    notes: ''
  });

  const handleSubmit = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate('/auth');
      return;
    }

    if (!formData.equipment_type || !formData.model || !formData.name) {
      toast({ 
        title: "Missing fields", 
        description: "Please fill in all required fields",
        variant: "destructive" 
      });
      return;
    }

    setIsLoading(true);

    const { error } = await supabase.from('user_equipment').insert({
      user_id: user.id,
      equipment_type: formData.equipment_type,
      model: formData.model,
      serial_number: formData.serial_number || null,
      name: formData.name,
      status: 'active'
    });

    if (error) {
      toast({ 
        title: "Error", 
        description: "Failed to add machine",
        variant: "destructive" 
      });
    } else {
      toast({ title: "Machine added successfully!" });
      navigate('/machines');
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-background pb-8">
      <header className="sticky top-0 z-40 bg-background border-b px-4 py-3">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-lg font-semibold">Add Machine</h1>
        </div>
      </header>

      <div className="p-4 space-y-4">
        {/* Quick Add Options */}
        <Card className="p-4">
          <p className="text-sm text-muted-foreground mb-3">Quick add options</p>
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" disabled>
              <QrCode className="w-4 h-4 mr-2" />
              Scan QR
            </Button>
            <Button variant="outline" className="flex-1" disabled>
              <Camera className="w-4 h-4 mr-2" />
              Take Photo
            </Button>
          </div>
        </Card>

        {/* Manual Entry Form */}
        <Card className="p-4 space-y-4">
          <div>
            <Label>Equipment Type *</Label>
            <Select 
              value={formData.equipment_type}
              onValueChange={(v) => setFormData({...formData, equipment_type: v})}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                {equipmentTypes.map(type => (
                  <SelectItem key={type.id} value={type.id}>
                    {type.icon} {type.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Model *</Label>
            <Input 
              placeholder="e.g., CAT 140M Grader"
              value={formData.model}
              onChange={(e) => setFormData({...formData, model: e.target.value})}
            />
          </div>

          <div>
            <Label>Machine Name *</Label>
            <Input 
              placeholder="e.g., Main Grader, Crane #1"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
            />
          </div>

          <div>
            <Label>Serial Number</Label>
            <Input 
              placeholder="Equipment serial number"
              value={formData.serial_number}
              onChange={(e) => setFormData({...formData, serial_number: e.target.value})}
              className="font-mono"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Manufacturing Year</Label>
              <Input 
                type="number"
                placeholder="2023"
                value={formData.manufacturing_year}
                onChange={(e) => setFormData({...formData, manufacturing_year: e.target.value})}
              />
            </div>
            <div>
              <Label>Operating Hours</Label>
              <Input 
                type="number"
                placeholder="Hours"
                value={formData.operating_hours}
                onChange={(e) => setFormData({...formData, operating_hours: e.target.value})}
              />
            </div>
          </div>

          <div>
            <Label>Location / Site</Label>
            <Input 
              placeholder="e.g., Delhi Site, Sector 5"
              value={formData.location}
              onChange={(e) => setFormData({...formData, location: e.target.value})}
            />
          </div>

          <div>
            <Label>Warranty Status</Label>
            <Select 
              value={formData.warranty_status}
              onValueChange={(v) => setFormData({...formData, warranty_status: v})}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
                <SelectItem value="unknown">Unknown</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Machine Photo (optional)</Label>
            <div className="mt-2 border-2 border-dashed rounded-lg p-6 text-center">
              <Upload className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">Tap to upload photo</p>
            </div>
          </div>

          <div>
            <Label>Notes</Label>
            <Textarea 
              placeholder="Additional notes about this machine..."
              value={formData.notes}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
            />
          </div>
        </Card>

        <div className="flex gap-3">
          <Button variant="outline" className="flex-1" onClick={() => navigate(-1)}>
            Cancel
          </Button>
          <Button className="flex-1" onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? 'Adding...' : 'Add Machine'}
          </Button>
        </div>
      </div>
    </div>
  );
}
