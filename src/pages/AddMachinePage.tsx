import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Camera, QrCode, Upload, ChevronRight } from 'lucide-react';
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
import { DEMO_USER } from '@/hooks/useDemoUser';

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
    if (!formData.equipment_type || !formData.model || !formData.name) {
      toast({ 
        title: "Missing fields", 
        description: "Please fill in all required fields",
        variant: "destructive" 
      });
      return;
    }

    setIsLoading(true);

    // Demo mode - simulate adding machine
    setTimeout(() => {
      toast({ title: "Machine added successfully!" });
      navigate('/machines');
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-background pb-8">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background border-b px-4 py-3">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="rounded-full">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-lg font-semibold">Add Machine</h1>
        </div>
      </header>

      <div className="p-4 space-y-4">
        {/* Quick Add Options - Blinkit style cards */}
        <div className="grid grid-cols-2 gap-3">
          <Card className="p-4 flex flex-col items-center gap-2 cursor-pointer hover:shadow-md transition-all active:scale-95 bg-muted/30">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <QrCode className="w-6 h-6 text-primary" />
            </div>
            <span className="text-sm font-medium">Scan QR</span>
            <span className="text-[10px] text-muted-foreground">Quick add via code</span>
          </Card>
          <Card className="p-4 flex flex-col items-center gap-2 cursor-pointer hover:shadow-md transition-all active:scale-95 bg-muted/30">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Camera className="w-6 h-6 text-primary" />
            </div>
            <span className="text-sm font-medium">Take Photo</span>
            <span className="text-[10px] text-muted-foreground">Capture nameplate</span>
          </Card>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-3 py-2">
          <div className="flex-1 h-px bg-border" />
          <span className="text-xs text-muted-foreground">or enter manually</span>
          <div className="flex-1 h-px bg-border" />
        </div>

        {/* Manual Entry Form - Cleaner Blinkit style */}
        <div className="space-y-4">
          {/* Equipment Type */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Equipment Type *</Label>
            <Select 
              value={formData.equipment_type}
              onValueChange={(v) => setFormData({...formData, equipment_type: v})}
            >
              <SelectTrigger className="h-12 rounded-xl bg-muted/30 border-0">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                {equipmentTypes.map(type => (
                  <SelectItem key={type.id} value={type.id}>
                    <span className="flex items-center gap-2">
                      <span>{type.icon}</span>
                      <span>{type.name}</span>
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Model */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Model *</Label>
            <Input 
              placeholder="e.g., ACE FX 150"
              value={formData.model}
              onChange={(e) => setFormData({...formData, model: e.target.value})}
              className="h-12 rounded-xl bg-muted/30 border-0"
            />
          </div>

          {/* Machine Name */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Machine Name *</Label>
            <Input 
              placeholder="e.g., Crane #1, Main Loader"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="h-12 rounded-xl bg-muted/30 border-0"
            />
          </div>

          {/* Serial Number */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Serial Number</Label>
            <Input 
              placeholder="Equipment serial number"
              value={formData.serial_number}
              onChange={(e) => setFormData({...formData, serial_number: e.target.value})}
              className="h-12 rounded-xl bg-muted/30 border-0 font-mono"
            />
          </div>

          {/* Year & Hours */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Mfg. Year</Label>
              <Input 
                type="number"
                placeholder="2023"
                value={formData.manufacturing_year}
                onChange={(e) => setFormData({...formData, manufacturing_year: e.target.value})}
                className="h-12 rounded-xl bg-muted/30 border-0"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium">Hours</Label>
              <Input 
                type="number"
                placeholder="Operating hours"
                value={formData.operating_hours}
                onChange={(e) => setFormData({...formData, operating_hours: e.target.value})}
                className="h-12 rounded-xl bg-muted/30 border-0"
              />
            </div>
          </div>

          {/* Location */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Location / Site</Label>
            <Input 
              placeholder="e.g., Delhi Site, Sector 5"
              value={formData.location}
              onChange={(e) => setFormData({...formData, location: e.target.value})}
              className="h-12 rounded-xl bg-muted/30 border-0"
            />
          </div>

          {/* Warranty Status */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Warranty Status</Label>
            <Select 
              value={formData.warranty_status}
              onValueChange={(v) => setFormData({...formData, warranty_status: v})}
            >
              <SelectTrigger className="h-12 rounded-xl bg-muted/30 border-0">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">✅ Active</SelectItem>
                <SelectItem value="expired">❌ Expired</SelectItem>
                <SelectItem value="unknown">❓ Unknown</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Photo Upload */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Machine Photo</Label>
            <div className="border-2 border-dashed border-muted-foreground/20 rounded-2xl p-8 text-center bg-muted/20 hover:bg-muted/30 transition-colors cursor-pointer">
              <Upload className="w-10 h-10 mx-auto text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">Tap to upload photo</p>
              <p className="text-xs text-muted-foreground/70 mt-1">JPG, PNG up to 5MB</p>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Notes</Label>
            <Textarea 
              placeholder="Additional notes about this machine..."
              value={formData.notes}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
              className="rounded-xl bg-muted/30 border-0 min-h-[100px]"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4">
          <Button 
            variant="outline" 
            className="flex-1 h-12 rounded-xl" 
            onClick={() => navigate(-1)}
          >
            Cancel
          </Button>
          <Button 
            className="flex-1 h-12 rounded-xl" 
            onClick={handleSubmit} 
            disabled={isLoading}
          >
            {isLoading ? 'Adding...' : 'Add Machine'}
          </Button>
        </div>
      </div>
    </div>
  );
}
