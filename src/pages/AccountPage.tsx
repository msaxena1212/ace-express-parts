import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Package, Heart, MapPin, CreditCard, Gift, HelpCircle, 
  MessageCircle, FileText, Bell, Globe, Moon, Shield, ChevronRight, 
  Settings, Wrench, Wallet, Award, Share2, Info, Lock, LogOut
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { BottomNav } from '@/components/BottomNav';
import { DEMO_USER } from '@/hooks/useDemoUser';

export default function AccountPage() {
  const navigate = useNavigate();
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);

  // Quick action cards like Blinkit
  const quickActions = [
    { icon: Wallet, label: 'ACE Wallet', path: '/wallet' },
    { icon: MessageCircle, label: 'Support', path: '/support' },
    { icon: CreditCard, label: 'Payments', path: '/payment-methods' },
  ];

  // Grouped menu items like Blinkit profile
  const menuGroups = [
    {
      title: 'YOUR INFORMATION',
      items: [
        { icon: Package, label: 'Your orders', path: '/orders', badge: null },
        { icon: Heart, label: 'Your wishlist', path: '/wishlist', badge: null },
        { icon: Wrench, label: 'Your machines', path: '/machines', badge: null },
        { icon: MapPin, label: 'Address book', path: '/addresses', badge: null },
      ]
    },
    {
      title: 'REWARDS & REFERRALS',
      items: [
        { icon: Award, label: 'Your collected rewards', path: '/loyalty', badge: 'NEW', hasDot: true },
        { icon: Gift, label: 'Claim Gift Card', path: '/gift-card', badge: null, hasDot: true },
      ]
    },
    {
      title: 'OTHER INFORMATION',
      items: [
        { icon: Share2, label: 'Share the app', path: '/share', badge: null },
        { icon: Info, label: 'About us', path: '/about', badge: null },
        { icon: Lock, label: 'Account privacy', path: '/privacy', badge: null },
        { icon: Bell, label: 'Notification preferences', path: '/notifications', badge: null },
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background border-b px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="rounded-full">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-lg font-semibold">Profile</h1>
          </div>
        </div>
      </header>

      <div className="p-4 space-y-4">
        {/* Profile Header - Blinkit Style */}
        <div className="space-y-1">
          <h2 className="text-2xl font-bold text-foreground">Your account</h2>
          <p className="text-sm text-muted-foreground flex items-center gap-2">
            📞 {DEMO_USER.phone}
          </p>
        </div>

        {/* Birthday Banner - Like Blinkit */}
        <Card className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200 flex items-center justify-between">
          <div>
            <p className="font-medium text-foreground">Add your birthday</p>
            <p className="text-sm text-primary font-medium flex items-center gap-1">
              Enter details <ChevronRight className="w-3 h-3" />
            </p>
          </div>
          <div className="text-4xl">🎂</div>
        </Card>

        {/* Quick Actions - Like Blinkit */}
        <div className="grid grid-cols-3 gap-3">
          {quickActions.map((action, i) => (
            <Card 
              key={i}
              onClick={() => navigate(action.path)}
              className="p-4 flex flex-col items-center gap-2 cursor-pointer hover:shadow-md transition-all active:scale-95"
            >
              <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
                <action.icon className="w-5 h-5 text-foreground" />
              </div>
              <span className="text-xs font-medium text-center">{action.label}</span>
            </Card>
          ))}
        </div>

        {/* Appearance Toggle - Like Blinkit */}
        <Card className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Moon className="w-5 h-5 text-muted-foreground" />
            <span className="font-medium">Appearance</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted px-3 py-1.5 rounded-full">
            Automatic
            <ChevronRight className="w-4 h-4" />
          </div>
        </Card>

        {/* Menu Groups - Blinkit Style */}
        {menuGroups.map((group, groupIndex) => (
          <div key={groupIndex} className="animate-fade-in" style={{ animationDelay: `${groupIndex * 100}ms` }}>
            <h3 className="text-xs font-semibold text-muted-foreground mb-2 px-1 tracking-wide">
              {group.title}
            </h3>
            <Card className="divide-y divide-border/50">
              {group.items.map((item, i) => (
                <div 
                  key={i}
                  className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/50 transition-colors active:bg-muted"
                  onClick={() => navigate(item.path)}
                >
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="w-9 h-9 rounded-full bg-muted/80 flex items-center justify-center">
                        <item.icon className="w-4 h-4 text-muted-foreground" />
                      </div>
                      {item.hasDot && (
                        <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-red-500 rounded-full" />
                      )}
                    </div>
                    <span className="text-sm font-medium">{item.label}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {item.badge && (
                      <span className="text-[10px] bg-primary text-primary-foreground px-2 py-0.5 rounded-full font-semibold">
                        {item.badge}
                      </span>
                    )}
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  </div>
                </div>
              ))}
            </Card>
          </div>
        ))}

        {/* Logout Button */}
        <Card 
          className="p-4 flex items-center gap-3 cursor-pointer hover:bg-muted/50 transition-colors"
          onClick={() => {/* Demo mode - no logout */}}
        >
          <div className="w-9 h-9 rounded-full bg-muted/80 flex items-center justify-center">
            <LogOut className="w-4 h-4 text-muted-foreground" />
          </div>
          <span className="text-sm font-medium">Log out</span>
        </Card>

        {/* App Version */}
        <p className="text-center text-xs text-muted-foreground pt-4 pb-2">
          <span className="text-lg font-bold text-primary">ACE</span>
          <br />
          v1.0.0
        </p>
      </div>

      <BottomNav activeTab="/account" onTabChange={(tab) => navigate(tab)} />
    </div>
  );
}
