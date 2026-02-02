import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Building2, FileText, User, Phone, Mail, MapPin, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import aceLogo from '@/assets/ace-logo.png';

export default function DealerRegistrationPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<'code' | 'details' | 'submitted'>('code');
  const [dealerCode, setDealerCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    firmName: '',
    gstNumber: '',
    contactPerson: '',
    phone: '',
    email: '',
    location: '',
  });

  const handleVerifyCode = async () => {
    if (!dealerCode.trim()) return;
    
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Demo: Accept codes starting with "DEALER-"
    if (dealerCode.toUpperCase().startsWith('DEALER-')) {
      setStep('details');
    } else {
      toast({
        title: "Invalid Code",
        description: "Please enter a valid dealer code or contact ACE support",
        variant: "destructive",
      });
    }
    setIsLoading(false);
  };

  const handleSubmit = async () => {
    if (!formData.firmName || !formData.contactPerson || !formData.phone) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      // Create demo account
      const email = `${formData.phone}@dealer.ace-parts.demo`;
      const password = 'dealer123456';
      
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
        }
      });

      if (signUpError && !signUpError.message.includes('already registered')) {
        throw signUpError;
      }

      // Try sign in if signup failed due to existing user
      if (signUpError) {
        await supabase.auth.signInWithPassword({ email, password });
      }

      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        // Update profile
        await supabase.from('profiles').upsert({
          user_id: user.id,
          full_name: formData.contactPerson,
          email: formData.email,
          phone: formData.phone,
          role: 'dealer',
          location: formData.location,
          is_profile_complete: true,
        });

        // Create dealer record
        await supabase.from('dealers').upsert({
          user_id: user.id,
          dealer_code: dealerCode,
          firm_name: formData.firmName,
          gst_number: formData.gstNumber,
          contact_person: formData.contactPerson,
          phone: formData.phone,
          email: formData.email,
          location: formData.location,
          status: 'pending',
        });
      }

      setStep('submitted');
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to submit application",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (step === 'submitted') {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
        <div className="w-20 h-20 rounded-full bg-success/20 flex items-center justify-center mb-6">
          <CheckCircle className="w-10 h-10 text-success" />
        </div>
        <h1 className="text-2xl font-bold text-foreground mb-2 text-center">Application Submitted</h1>
        <p className="text-muted-foreground text-center mb-8">
          Your dealer registration is under review. We'll notify you within 24 hours.
        </p>
        <Button onClick={() => navigate('/')} variant="ace" className="w-full max-w-xs h-12">
          Go to Home
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="flex-shrink-0 p-4">
        <button 
          onClick={() => step === 'code' ? navigate('/auth') : setStep('code')}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
          <span className="text-sm">Back</span>
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 px-6 py-4 overflow-y-auto">
        <div className="flex flex-col items-center mb-6">
          <img src={aceLogo} alt="ACE" className="h-12 w-auto mb-2" />
          <span className="text-primary font-bold text-sm">DEALER PORTAL</span>
        </div>

        {step === 'code' ? (
          <>
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-foreground mb-2">Dealer Verification</h1>
              <p className="text-muted-foreground">Enter your unique dealer code to continue</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Dealer Code</label>
                <div className="relative">
                  <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    value={dealerCode}
                    onChange={(e) => setDealerCode(e.target.value.toUpperCase())}
                    placeholder="e.g., DEALER-ACE-001"
                    className="h-12 pl-12 bg-card border-border rounded-xl font-mono uppercase"
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Contact ACE support if you don't have a dealer code
                </p>
              </div>

              <Button
                onClick={handleVerifyCode}
                disabled={!dealerCode.trim() || isLoading}
                className="w-full h-12"
                variant="ace"
              >
                {isLoading ? 'Verifying...' : 'Verify Code'}
              </Button>
            </div>
          </>
        ) : (
          <>
            <div className="mb-6">
              <h1 className="text-xl font-bold text-foreground mb-1">Dealer Details</h1>
              <p className="text-sm text-muted-foreground">Complete your dealer registration</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Firm Name *</label>
                <div className="relative">
                  <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    value={formData.firmName}
                    onChange={(e) => setFormData(prev => ({ ...prev, firmName: e.target.value }))}
                    placeholder="Enter firm name"
                    className="h-12 pl-12 bg-card border-border rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">GST Number</label>
                <div className="relative">
                  <FileText className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    value={formData.gstNumber}
                    onChange={(e) => setFormData(prev => ({ ...prev, gstNumber: e.target.value.toUpperCase() }))}
                    placeholder="Enter GST number"
                    className="h-12 pl-12 bg-card border-border rounded-xl font-mono uppercase"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Contact Person *</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    value={formData.contactPerson}
                    onChange={(e) => setFormData(prev => ({ ...prev, contactPerson: e.target.value }))}
                    placeholder="Enter contact person name"
                    className="h-12 pl-12 bg-card border-border rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Phone *</label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value.replace(/\D/g, '').slice(0, 10) }))}
                    placeholder="Enter phone number"
                    className="h-12 pl-12 bg-card border-border rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Email</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="Enter email address"
                    className="h-12 pl-12 bg-card border-border rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Location</label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    value={formData.location}
                    onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                    placeholder="Enter city or area"
                    className="h-12 pl-12 bg-card border-border rounded-xl"
                  />
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Footer */}
      {step === 'details' && (
        <div className="flex-shrink-0 p-6">
          <p className="text-xs text-muted-foreground text-center mb-4">
            Your account will be reviewed within 24 hours
          </p>
          <Button
            onClick={handleSubmit}
            disabled={isLoading}
            className="w-full h-12"
            variant="ace"
          >
            {isLoading ? 'Submitting...' : 'Submit for Approval'}
          </Button>
        </div>
      )}
    </div>
  );
}
