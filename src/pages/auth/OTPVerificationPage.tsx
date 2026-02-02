import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ChevronLeft, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import aceLogo from '@/assets/ace-logo.png';

export default function OTPVerificationPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const phone = location.state?.phone || '';
  
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [timer, setTimer] = useState(120);
  const [canResend, setCanResend] = useState(false);
  const [error, setError] = useState(false);
  
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (!phone) {
      navigate('/auth/phone', { replace: true });
    }
  }, [phone, navigate]);

  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => setTimer(t => t - 1), 1000);
      return () => clearInterval(interval);
    } else {
      setCanResend(true);
    }
  }, [timer]);

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    setError(false);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    const newOtp = [...otp];
    pastedData.split('').forEach((char, i) => {
      if (i < 6) newOtp[i] = char;
    });
    setOtp(newOtp);
    if (pastedData.length === 6) {
      inputRefs.current[5]?.focus();
    }
  };

  const handleVerify = async () => {
    const otpValue = otp.join('');
    if (otpValue.length !== 6) return;

    setIsLoading(true);
    
    // Simulate verification (in production, verify with backend)
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Demo: accept any 6-digit OTP for testing
    if (otpValue === '123456' || otpValue.length === 6) {
      toast({
        title: "Verified!",
        description: "Phone number verified successfully",
      });
      navigate('/auth/profile-setup', { state: { phone } });
    } else {
      setError(true);
      setIsLoading(false);
      toast({
        title: "Invalid OTP",
        description: "Please enter the correct verification code",
        variant: "destructive",
      });
    }
  };

  const handleResend = async () => {
    setCanResend(false);
    setTimer(120);
    setOtp(['', '', '', '', '', '']);
    
    toast({
      title: "OTP Resent",
      description: `New verification code sent to +91 ${phone}`,
    });
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const isComplete = otp.every(d => d !== '');

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
      <div className="flex-1 px-6 py-4">
        <div className="flex flex-col items-center mb-8">
          <img src={aceLogo} alt="ACE" className="h-12 w-auto mb-2" />
          <span className="text-primary font-bold text-sm">GENUINE PARTS</span>
        </div>

        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-foreground mb-2">Verify OTP</h1>
          <p className="text-muted-foreground">
            Enter the 6-digit code sent to
            <br />
            <span className="text-foreground font-medium">+91 {phone}</span>
          </p>
        </div>

        {/* OTP Input */}
        <div className="flex justify-center gap-2 mb-6" onPaste={handlePaste}>
          {otp.map((digit, index) => (
            <input
              key={index}
              ref={el => inputRefs.current[index] = el}
              type="text"
              inputMode="numeric"
              value={digit}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              className={`w-12 h-14 text-center text-xl font-bold bg-card border-2 rounded-xl outline-none transition-all ${
                error
                  ? 'border-destructive animate-shake'
                  : digit
                  ? 'border-primary'
                  : 'border-border focus:border-primary'
              }`}
              autoFocus={index === 0}
            />
          ))}
        </div>

        {/* Timer */}
        <div className="text-center mb-6">
          {canResend ? (
            <button
              onClick={handleResend}
              className="flex items-center gap-2 mx-auto text-primary font-medium"
            >
              <RefreshCw className="w-4 h-4" />
              Resend OTP
            </button>
          ) : (
            <p className={`text-sm ${timer <= 30 ? 'text-destructive' : 'text-muted-foreground'}`}>
              Resend code in <span className="font-medium">{formatTime(timer)}</span>
            </p>
          )}
        </div>

        <Button
          onClick={handleVerify}
          disabled={!isComplete || isLoading}
          className="w-full h-12"
          variant="ace"
        >
          {isLoading ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
              Verifying...
            </div>
          ) : (
            'Verify'
          )}
        </Button>
      </div>
    </div>
  );
}
