import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/hooks/use-toast';
import aceLogo from '@/assets/ace-logo.png';

export default function PhoneAuthPage() {
  const navigate = useNavigate();
  const [phone, setPhone] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const isValidPhone = phone.length === 10 && /^\d+$/.test(phone);

  const handleSendOTP = async () => {
    if (!isValidPhone) return;
    
    setIsLoading(true);
    
    // Simulate OTP sending (in production, integrate with SMS service)
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    toast({
      title: "OTP Sent",
      description: `Verification code sent to +91 ${phone}`,
    });
    
    navigate('/auth/otp', { state: { phone } });
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="flex-shrink-0 p-4">
        <button 
          onClick={() => navigate('/auth')}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
          <span className="text-sm">Back</span>
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 px-6 py-4">
        <div className="flex flex-col items-center mb-8">
          <img src={aceLogo} alt="ACE" className="h-12 w-auto mb-2" />
          <span className="text-primary font-bold text-sm">GENUINE PARTS</span>
        </div>

        <div className="mb-8">
          <h1 className="text-2xl font-bold text-foreground mb-2">Enter your phone</h1>
          <p className="text-muted-foreground">We'll send you a verification code</p>
        </div>

        {/* Phone Input */}
        <div className="space-y-4">
          <div className="flex gap-3">
            <div className="flex items-center gap-2 px-4 py-3 bg-card border border-border rounded-xl">
              <span className="text-lg">🇮🇳</span>
              <span className="text-foreground font-medium">+91</span>
            </div>
            <Input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
              placeholder="Enter 10 digit number"
              className="flex-1 h-12 bg-card border-border rounded-xl text-lg"
              autoFocus
            />
          </div>

          <Button
            onClick={handleSendOTP}
            disabled={!isValidPhone || isLoading}
            className="w-full h-12"
            variant="ace"
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                Sending OTP...
              </div>
            ) : (
              <>
                <Phone className="w-5 h-5 mr-2" />
                Send OTP
              </>
            )}
          </Button>
        </div>

        {/* Info */}
        <div className="mt-6 p-4 bg-orange-subtle rounded-xl">
          <p className="text-sm text-primary font-medium">Fast Track Delivery in your area!</p>
          <p className="text-xs text-muted-foreground mt-1">Get genuine parts delivered in 2-4 hours</p>
        </div>
      </div>

      {/* Footer */}
      <div className="flex-shrink-0 p-6 text-center">
        <p className="text-xs text-muted-foreground">
          Standard messaging rates may apply
        </p>
      </div>
    </div>
  );
}
