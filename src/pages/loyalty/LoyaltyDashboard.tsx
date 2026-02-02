import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Gift, Star, TrendingUp, Share2, Copy, ChevronRight, Award, Clock, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { BottomNav } from '@/components/BottomNav';

interface LoyaltyAccount {
  id: string;
  available_points: number;
  total_points_earned: number;
  total_points_redeemed: number;
  referral_code: string;
  current_tier?: {
    name: string;
    badge_color: string;
    min_points: number;
    max_points: number | null;
    multiplier: number;
    benefits: any;
  };
}

interface LoyaltyTransaction {
  id: string;
  type: string;
  points: number;
  description: string;
  created_at: string;
  expires_at: string | null;
}

interface LoyaltyTier {
  id: string;
  name: string;
  min_points: number;
  max_points: number | null;
  multiplier: number;
  benefits: any;
  badge_color: string;
}

export default function LoyaltyDashboard() {
  const navigate = useNavigate();
  const [account, setAccount] = useState<LoyaltyAccount | null>(null);
  const [transactions, setTransactions] = useState<LoyaltyTransaction[]>([]);
  const [tiers, setTiers] = useState<LoyaltyTier[]>([]);
  const [referrals, setReferrals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLoyaltyData();
  }, []);

  const fetchLoyaltyData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch loyalty account
      const { data: accountData } = await supabase
        .from('loyalty_accounts')
        .select(`
          *,
          current_tier:loyalty_tiers(name, badge_color, min_points, max_points, multiplier, benefits)
        `)
        .eq('user_id', user.id)
        .single();

      if (accountData) {
        setAccount(accountData);
      }

      // Fetch transactions
      const { data: transData } = await supabase
        .from('loyalty_transactions')
        .select('*')
        .eq('loyalty_account_id', accountData?.id)
        .order('created_at', { ascending: false })
        .limit(20);

      setTransactions(transData || []);

      // Fetch all tiers
      const { data: tiersData } = await supabase
        .from('loyalty_tiers')
        .select('*')
        .eq('is_active', true)
        .order('min_points', { ascending: true });

      setTiers(tiersData || []);

      // Fetch referrals
      const { data: referralsData } = await supabase
        .from('referrals')
        .select('*')
        .eq('referrer_user_id', user.id)
        .order('created_at', { ascending: false });

      setReferrals(referralsData || []);
    } catch (error) {
      console.error('Error fetching loyalty data:', error);
    } finally {
      setLoading(false);
    }
  };

  const copyReferralCode = () => {
    if (account?.referral_code) {
      navigator.clipboard.writeText(account.referral_code);
      toast({ title: 'Copied!', description: 'Referral code copied to clipboard' });
    }
  };

  const shareReferral = () => {
    if (navigator.share && account?.referral_code) {
      navigator.share({
        title: 'Join ACE Parts',
        text: `Use my referral code ${account.referral_code} to get ₹500 off your first order!`,
        url: `${window.location.origin}/auth?ref=${account.referral_code}`,
      });
    } else {
      copyReferralCode();
    }
  };

  const getProgressToNextTier = () => {
    if (!account?.current_tier || !tiers.length) return 0;
    
    const currentTierIndex = tiers.findIndex(t => t.name === account.current_tier?.name);
    const nextTier = tiers[currentTierIndex + 1];
    
    if (!nextTier) return 100; // Already at max tier
    
    const currentPoints = account.total_points_earned;
    const currentMin = account.current_tier.min_points;
    const nextMin = nextTier.min_points;
    
    return Math.min(100, ((currentPoints - currentMin) / (nextMin - currentMin)) * 100);
  };

  const getNextTier = () => {
    if (!account?.current_tier || !tiers.length) return null;
    const currentTierIndex = tiers.findIndex(t => t.name === account.current_tier?.name);
    return tiers[currentTierIndex + 1] || null;
  };

  const nextTier = getNextTier();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header with Tier Card */}
      <div 
        className="p-4 pt-8 text-white"
        style={{ 
          background: `linear-gradient(135deg, ${account?.current_tier?.badge_color || '#CD7F32'} 0%, ${account?.current_tier?.badge_color || '#CD7F32'}88 100%)` 
        }}
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm opacity-80">Loyalty Program</p>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              {account?.current_tier?.name || 'Bronze'}
              <Award className="w-6 h-6" />
            </h1>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold">{account?.available_points || 0}</p>
            <p className="text-sm opacity-80">Available Points</p>
          </div>
        </div>

        {/* Progress to Next Tier */}
        {nextTier && (
          <Card className="bg-white/10 border-0 p-3 backdrop-blur">
            <div className="flex justify-between text-sm mb-2">
              <span>{account?.current_tier?.name}</span>
              <span>{nextTier.name}</span>
            </div>
            <Progress value={getProgressToNextTier()} className="h-2 bg-white/20" />
            <p className="text-xs mt-2 opacity-80">
              {nextTier.min_points - (account?.total_points_earned || 0)} points to {nextTier.name}
            </p>
          </Card>
        )}

        {/* Point Multiplier Badge */}
        <div className="flex items-center gap-2 mt-3">
          <Sparkles className="w-4 h-4" />
          <span className="text-sm">
            Earn {account?.current_tier?.multiplier || 1}x points on every purchase
          </span>
        </div>
      </div>

      <Tabs defaultValue="overview" className="p-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
          <TabsTrigger value="referrals">Refer</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="mt-4 space-y-4">
          {/* Stats */}
          <div className="grid grid-cols-2 gap-3">
            <Card className="p-4 text-center">
              <TrendingUp className="w-6 h-6 mx-auto text-primary mb-2" />
              <p className="text-xl font-bold">{account?.total_points_earned || 0}</p>
              <p className="text-xs text-muted-foreground">Total Earned</p>
            </Card>
            <Card className="p-4 text-center">
              <Gift className="w-6 h-6 mx-auto text-green-500 mb-2" />
              <p className="text-xl font-bold">{account?.total_points_redeemed || 0}</p>
              <p className="text-xs text-muted-foreground">Points Redeemed</p>
            </Card>
          </div>

          {/* Current Tier Benefits */}
          <Card className="p-4">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Star className="w-4 h-4 text-primary" />
              Your {account?.current_tier?.name} Benefits
            </h3>
            <ul className="space-y-2">
              {(account?.current_tier?.benefits as string[] || []).map((benefit, index) => (
                <li key={index} className="flex items-center gap-2 text-sm">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                  {benefit}
                </li>
              ))}
            </ul>
          </Card>

          {/* All Tiers */}
          <Card className="p-4">
            <h3 className="font-semibold mb-3">Tier Ladder</h3>
            <div className="space-y-3">
              {tiers.map((tier, index) => {
                const isCurrentTier = tier.name === account?.current_tier?.name;
                return (
                  <div 
                    key={tier.id} 
                    className={`flex items-center gap-3 p-3 rounded-lg ${isCurrentTier ? 'bg-primary/10 border border-primary' : 'bg-muted'}`}
                  >
                    <div 
                      className="w-8 h-8 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: tier.badge_color }}
                    >
                      <Award className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{tier.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {tier.min_points.toLocaleString()}+ points • {tier.multiplier}x earnings
                      </p>
                    </div>
                    {isCurrentTier && (
                      <Badge>Current</Badge>
                    )}
                  </div>
                );
              })}
            </div>
          </Card>
        </TabsContent>

        {/* Activity Tab */}
        <TabsContent value="activity" className="mt-4 space-y-3">
          {transactions.length === 0 ? (
            <Card className="p-8 text-center">
              <Clock className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
              <p className="text-muted-foreground">No transactions yet</p>
              <p className="text-sm text-muted-foreground">Start earning points with your first purchase!</p>
            </Card>
          ) : (
            transactions.map((transaction) => (
              <Card key={transaction.id} className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{transaction.description}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(transaction.created_at).toLocaleDateString()}
                    </p>
                    {transaction.expires_at && (
                      <p className="text-xs text-orange-500">
                        Expires: {new Date(transaction.expires_at).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                  <span className={`font-bold ${transaction.type === 'earn' || transaction.type === 'bonus' ? 'text-green-500' : 'text-red-500'}`}>
                    {transaction.type === 'earn' || transaction.type === 'bonus' ? '+' : '-'}{transaction.points}
                  </span>
                </div>
              </Card>
            ))
          )}
        </TabsContent>

        {/* Referrals Tab */}
        <TabsContent value="referrals" className="mt-4 space-y-4">
          {/* Referral Card */}
          <Card className="p-4 bg-gradient-to-r from-primary/10 to-primary/5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                <Gift className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h3 className="font-semibold">Refer & Earn</h3>
                <p className="text-sm text-muted-foreground">Get 500 points for each referral</p>
              </div>
            </div>

            <div className="flex items-center gap-2 bg-background rounded-lg p-3">
              <code className="flex-1 font-mono text-lg">{account?.referral_code || 'ACE000'}</code>
              <Button variant="ghost" size="icon" onClick={copyReferralCode}>
                <Copy className="w-4 h-4" />
              </Button>
            </div>

            <div className="flex gap-3 mt-4">
              <Button className="flex-1" onClick={shareReferral}>
                <Share2 className="w-4 h-4 mr-2" />
                Share Code
              </Button>
            </div>
          </Card>

          {/* How it Works */}
          <Card className="p-4">
            <h3 className="font-semibold mb-3">How it Works</h3>
            <div className="space-y-4">
              {[
                { step: 1, title: 'Share your code', desc: 'Send your referral code to friends' },
                { step: 2, title: 'Friend signs up', desc: 'They register using your code' },
                { step: 3, title: 'First order', desc: 'They place an order of ₹1000+' },
                { step: 4, title: 'Both earn', desc: 'You get 500 points, they get ₹500 off' },
              ].map((item) => (
                <div key={item.step} className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
                    {item.step}
                  </div>
                  <div>
                    <p className="font-medium">{item.title}</p>
                    <p className="text-sm text-muted-foreground">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Referral History */}
          {referrals.length > 0 && (
            <Card className="p-4">
              <h3 className="font-semibold mb-3">Your Referrals</h3>
              <div className="space-y-3">
                {referrals.map((referral) => (
                  <div key={referral.id} className="flex items-center justify-between py-2 border-b last:border-0">
                    <div>
                      <p className="text-sm">Referral #{referral.id.slice(0, 8)}</p>
                      <p className="text-xs text-muted-foreground capitalize">{referral.status}</p>
                    </div>
                    {referral.status === 'rewarded' && (
                      <span className="text-green-500 font-medium">+{referral.referrer_reward_points}</span>
                    )}
                  </div>
                ))}
              </div>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      <BottomNav activeTab="/loyalty" onTabChange={(path) => navigate(path)} />
    </div>
  );
}
