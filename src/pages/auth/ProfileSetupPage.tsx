import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ChevronLeft, User, MapPin, Building2, Wrench, Truck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import aceLogo from '@/assets/ace-logo.png';

const roles = [
  { id: 'equipment_owner', label: 'Equipment Owner', icon: Building2, description: 'Own or manage construction equipment' },
  { id: 'operator', label: 'Operator', icon: Wrench, description: 'Operate equipment on-site' },
  { id: 'dealer', label: 'Dealer', icon: Truck, description: 'ACE authorized dealer (requires approval)' },
];

const locations = [
  'Delhi NCR', 'Mumbai', 'Bangalore', 'Chennai', 'Hyderabad', 'Pune', 'Kolkata', 'Ahmedabad', 'Jaipur', 'Lucknow'
];

export default function ProfileSetupPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const phone = location.state?.phone || '';
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'equipment_owner',
    location: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);

  const isValid = formData.name.trim().length >= 2 && formData.location.trim().length > 0;

  const handleSubmit = async () => {
    if (!isValid) return;
    
    setIsLoading(true);
    
    try {
      // For demo, create a user with email based on phone
      const email = `${phone}@ace-parts.demo`;
      const password = 'demo123456'; // In production, use proper OTP verification
      
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            full_name: formData.name,
            phone: phone,
          }
        }
      });

      if (signUpError) {
        // Try signing in if user exists
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        
        if (signInError) throw signInError;
      }

      // Update profile
      if (authData?.user) {
        await supabase.from('profiles').upsert({
          user_id: authData.user.id,
          full_name: formData.name,
          email: formData.email || null,
          phone: phone,
          role: formData.role,
          location: formData.location,
          is_profile_complete: true,
        });
      }
      
      toast({
        title: "Profile Created!",
        description: "Welcome to ACE Central",
      });
      
      if (formData.role === 'dealer') {
        navigate('/auth/dealer-registration', { state: { ...formData, phone } });
      } else {
        navigate('/', { replace: true });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create profile",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="flex-shrink-0 p-4">
        <button 
          onClick={() => navigate('/auth/phone')}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
          <span className="text-sm">Back</span>
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 px-6 py-4 overflow-y-auto">
        <div className="flex flex-col items-center mb-6">
          <img src={aceLogo} alt="ACE" className="h-10 w-auto mb-1" />
          <span className="text-primary font-bold text-xs">GENUINE PARTS</span>
        </div>

        <div className="mb-6">
          <h1 className="text-xl font-bold text-foreground mb-1">Complete your profile</h1>
          <p className="text-sm text-muted-foreground">Help us personalize your experience</p>
        </div>

        <div className="space-y-4">
          {/* Name Input */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Full Name *</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter your full name"
                className="h-12 pl-12 bg-card border-border rounded-xl"
              />
            </div>
          </div>

          {/* Email Input (optional) */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Email (optional)</label>
            <Input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              placeholder="Enter your email"
              className="h-12 bg-card border-border rounded-xl"
            />
          </div>

          {/* Role Selection */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">I am a *</label>
            <div className="space-y-2">
              {roles.map((role) => (
                <button
                  key={role.id}
                  onClick={() => setFormData(prev => ({ ...prev, role: role.id }))}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all ${
                    formData.role === role.id
                      ? 'border-primary bg-orange-subtle'
                      : 'border-border bg-card hover:border-primary/50'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    formData.role === role.id ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                  }`}>
                    <role.icon className="w-5 h-5" />
                  </div>
                  <div className="text-left flex-1">
                    <p className={`font-medium text-sm ${formData.role === role.id ? 'text-primary' : 'text-foreground'}`}>
                      {role.label}
                    </p>
                    <p className="text-xs text-muted-foreground">{role.description}</p>
                  </div>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    formData.role === role.id ? 'border-primary' : 'border-muted-foreground'
                  }`}>
                    {formData.role === role.id && (
                      <div className="w-2.5 h-2.5 rounded-full bg-primary" />
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Location */}
          <div className="relative">
            <label className="block text-sm font-medium text-foreground mb-2">Location *</label>
            <div className="relative">
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                value={formData.location}
                onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                onFocus={() => setShowLocationDropdown(true)}
                onBlur={() => setTimeout(() => setShowLocationDropdown(false), 200)}
                placeholder="Search city or pincode"
                className="h-12 pl-12 bg-card border-border rounded-xl"
              />
            </div>
            
            {showLocationDropdown && (
              <div className="absolute z-50 w-full mt-2 bg-card border border-border rounded-xl shadow-lg max-h-48 overflow-y-auto">
                {locations
                  .filter(loc => loc.toLowerCase().includes(formData.location.toLowerCase()))
                  .map((loc) => (
                    <button
                      key={loc}
                      onMouseDown={() => setFormData(prev => ({ ...prev, location: loc }))}
                      className="w-full px-4 py-3 text-left text-sm hover:bg-muted transition-colors first:rounded-t-xl last:rounded-b-xl"
                    >
                      {loc}
                    </button>
                  ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex-shrink-0 p-6 space-y-3">
        <Button
          onClick={handleSubmit}
          disabled={!isValid || isLoading}
          className="w-full h-12"
          variant="ace"
        >
          {isLoading ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
              Setting up...
            </div>
          ) : (
            'Complete Setup'
          )}
        </Button>
        
        <button 
          onClick={() => navigate('/')}
          className="w-full text-center text-sm text-muted-foreground hover:text-foreground"
        >
          Add Machine Later
        </button>
      </div>
    </div>
  );
}
