import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Phone, Mail, Building2, ArrowRight, ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import aceLogo from '@/assets/ace-logo.png';

type AuthMethod = 'phone' | 'email' | 'dealer' | null;

export default function AuthPage() {
  const navigate = useNavigate();
  const [selectedMethod, setSelectedMethod] = useState<AuthMethod>(null);

  const authMethods = [
    {
      id: 'phone' as const,
      icon: Phone,
      title: 'Phone + OTP',
      subtitle: 'Quick and secure login with OTP',
      primary: true,
    },
    {
      id: 'email' as const,
      icon: Mail,
      title: 'Email + Password',
      subtitle: 'Login with your email account',
      primary: false,
    },
    {
      id: 'dealer' as const,
      icon: Building2,
      title: 'Dealer Login',
      subtitle: 'For ACE authorized dealers',
      primary: false,
    },
  ];

  const handleMethodSelect = (method: AuthMethod) => {
    switch (method) {
      case 'phone':
        navigate('/auth/phone');
        break;
      case 'email':
        navigate('/auth/email');
        break;
      case 'dealer':
        navigate('/auth/dealer');
        break;
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="flex-shrink-0 p-6 pt-12">
        <div className="flex flex-col items-center mb-8">
          <img src={aceLogo} alt="ACE" className="h-16 w-auto mb-2" />
          <span className="text-primary font-bold text-lg">GENUINE PARTS</span>
        </div>
        
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-foreground mb-2">Welcome Back</h1>
          <p className="text-muted-foreground">Choose how you'd like to sign in</p>
        </div>
      </div>

      {/* Auth Methods */}
      <div className="flex-1 px-6">
        <div className="space-y-3">
          {authMethods.map((method) => (
            <button
              key={method.id}
              onClick={() => handleMethodSelect(method.id)}
              className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-all active:scale-[0.99] ${
                method.primary
                  ? 'bg-gradient-ace text-primary-foreground border-transparent'
                  : 'bg-card border-border hover:border-primary/50'
              }`}
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                method.primary ? 'bg-background/20' : 'bg-orange-subtle'
              }`}>
                <method.icon className={`w-6 h-6 ${method.primary ? 'text-primary-foreground' : 'text-primary'}`} />
              </div>
              <div className="flex-1 text-left">
                <p className={`font-semibold ${method.primary ? 'text-primary-foreground' : 'text-foreground'}`}>
                  {method.title}
                </p>
                <p className={`text-sm ${method.primary ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>
                  {method.subtitle}
                </p>
              </div>
              <ArrowRight className={`w-5 h-5 ${method.primary ? 'text-primary-foreground/60' : 'text-muted-foreground'}`} />
            </button>
          ))}
        </div>

        {/* Features */}
        <div className="mt-8 grid grid-cols-2 gap-3">
          <div className="bg-card border border-border rounded-xl p-3 text-center">
            <p className="text-xs text-muted-foreground">Fast Track</p>
            <p className="text-sm font-semibold text-foreground">2-4 Hour Delivery</p>
          </div>
          <div className="bg-card border border-border rounded-xl p-3 text-center">
            <p className="text-xs text-muted-foreground">Genuine Parts</p>
            <p className="text-sm font-semibold text-foreground">100% Authentic</p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex-shrink-0 p-6 text-center">
        <p className="text-xs text-muted-foreground">
          By continuing, you agree to our{' '}
          <span className="text-primary">Terms of Service</span> and{' '}
          <span className="text-primary">Privacy Policy</span>
        </p>
      </div>
    </div>
  );
}
