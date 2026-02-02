import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Package, Heart, MapPin, CreditCard, Gift, HelpCircle, MessageCircle, FileText, Bell, Globe, Moon, Shield, Trash2, LogOut, ChevronRight, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { BottomNav } from '@/components/BottomNav';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface Profile {
  full_name: string | null;
  email: string | null;
  phone: string | null;
  avatar_url: string | null;
  location: string | null;
}

export default function AccountPage() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate('/auth');
      return;
    }

    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (data) setProfile(data);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast({ title: "Logged out successfully" });
    navigate('/auth');
  };

  const menuItems = [
    { icon: Package, label: 'My Machines', path: '/machines', badge: null },
    { icon: Package, label: 'My Orders', path: '/orders', badge: null },
    { icon: Heart, label: 'Wishlist', path: '/wishlist', badge: null },
    { icon: MapPin, label: 'Saved Addresses', path: '/addresses', badge: null },
    { icon: CreditCard, label: 'Payment Methods', path: '/payment-methods', badge: null },
    { icon: Gift, label: 'Referral Program', path: '/referrals', badge: 'NEW' },
  ];

  const supportItems = [
    { icon: HelpCircle, label: 'FAQs', path: '/faqs' },
    { icon: MessageCircle, label: 'Contact Us', path: '/contact' },
    { icon: FileText, label: 'Raise a Ticket', path: '/support-ticket' },
    { icon: FileText, label: 'Return Policy', path: '/return-policy' },
  ];

  const settingsItems: Array<{
    icon: typeof Bell;
    label: string;
    toggle?: boolean;
    value?: boolean | string;
    onChange?: (v: boolean) => void;
    path?: string;
  }> = [
    { icon: Bell, label: 'Notifications', toggle: true, value: notifications, onChange: setNotifications },
    { icon: Globe, label: 'Language', value: 'English' },
    { icon: Moon, label: 'Dark Mode', toggle: true, value: darkMode, onChange: setDarkMode },
    { icon: Shield, label: 'Privacy & Security', path: '/privacy' },
    { icon: FileText, label: 'Terms & Conditions', path: '/terms' },
    { icon: FileText, label: 'Privacy Policy', path: '/privacy-policy' },
  ];

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="sticky top-0 z-40 bg-background border-b px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-lg font-semibold">Account</h1>
          </div>
          <Button variant="ghost" size="icon">
            <Settings className="w-5 h-5" />
          </Button>
        </div>
      </header>

      <div className="p-4 space-y-4">
        {/* Profile Section */}
        <Card className="p-4">
          <div className="flex items-center gap-4">
            <Avatar className="w-16 h-16">
              <AvatarImage src={profile?.avatar_url || ''} />
              <AvatarFallback className="bg-primary text-primary-foreground text-xl">
                {profile?.full_name?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h2 className="font-semibold text-lg">{profile?.full_name || 'User'}</h2>
              <p className="text-sm text-muted-foreground">{profile?.phone || 'No phone'}</p>
              {profile?.email && (
                <p className="text-sm text-muted-foreground">{profile.email}</p>
              )}
            </div>
            <Button variant="outline" size="sm" onClick={() => navigate('/profile/edit')}>
              Edit
            </Button>
          </div>
        </Card>

        {/* Account Menu */}
        <Card className="divide-y">
          {menuItems.map((item, i) => (
            <div 
              key={i}
              className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/50 transition-colors"
              onClick={() => navigate(item.path)}
            >
              <div className="flex items-center gap-3">
                <item.icon className="w-5 h-5 text-muted-foreground" />
                <span>{item.label}</span>
              </div>
              <div className="flex items-center gap-2">
                {item.badge && (
                  <span className="text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded">{item.badge}</span>
                )}
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </div>
            </div>
          ))}
        </Card>

        {/* Support & Help */}
        <div>
          <h3 className="text-sm font-medium text-muted-foreground mb-2 px-1">Support & Help</h3>
          <Card className="divide-y">
            {supportItems.map((item, i) => (
              <div 
                key={i}
                className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => navigate(item.path)}
              >
                <div className="flex items-center gap-3">
                  <item.icon className="w-5 h-5 text-muted-foreground" />
                  <span>{item.label}</span>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </div>
            ))}
          </Card>
        </div>

        {/* Settings */}
        <div>
          <h3 className="text-sm font-medium text-muted-foreground mb-2 px-1">Settings</h3>
          <Card className="divide-y">
            {settingsItems.map((item, i) => (
              <div 
                key={i}
                className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => !item.toggle && item.path && navigate(item.path)}
              >
                <div className="flex items-center gap-3">
                  <item.icon className="w-5 h-5 text-muted-foreground" />
                  <span>{item.label}</span>
                </div>
                {item.toggle && typeof item.value === 'boolean' ? (
                  <Switch 
                    checked={item.value} 
                    onCheckedChange={item.onChange}
                    onClick={(e) => e.stopPropagation()}
                  />
                ) : typeof item.value === 'string' ? (
                  <span className="text-sm text-muted-foreground">{item.value}</span>
                ) : (
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                )}
              </div>
            ))}
          </Card>
        </div>

        {/* Danger Zone */}
        <Card className="divide-y">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <div className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/50 transition-colors text-destructive">
                <div className="flex items-center gap-3">
                  <Trash2 className="w-5 h-5" />
                  <span>Delete Account</span>
                </div>
                <ChevronRight className="w-4 h-4" />
              </div>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Account?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. All your data will be permanently deleted.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction className="bg-destructive">Delete</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </Card>

        {/* Logout */}
        <Button 
          variant="outline" 
          className="w-full text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground"
          onClick={handleLogout}
        >
          <LogOut className="w-4 h-4 mr-2" />
          Logout
        </Button>

        <p className="text-center text-xs text-muted-foreground pt-4">
          ACE Parts v1.0.0
        </p>
      </div>

      <BottomNav activeTab="/account" onTabChange={(tab) => navigate(tab)} />
    </div>
  );
}
