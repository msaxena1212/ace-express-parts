import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, FileText, Clock, CheckCircle, XCircle, ChevronRight, Send, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { DealerBottomNav } from '@/components/dealer/DealerBottomNav';

interface Quote {
  id: string;
  quote_number: string;
  status: string;
  total_amount: number;
  valid_until: string | null;
  created_at: string;
  customer_id: string;
  items: any;
}

export default function DealerQuotes() {
  const navigate = useNavigate();
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('active');

  useEffect(() => {
    fetchQuotes();
  }, []);

  const fetchQuotes = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: dealer } = await supabase
        .from('dealers')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!dealer) return;

      const { data, error } = await supabase
        .from('dealer_quotes')
        .select('*')
        .eq('dealer_id', dealer.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setQuotes(data || []);
    } catch (error) {
      console.error('Error fetching quotes:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'draft': return { label: 'Draft', color: 'secondary', icon: FileText };
      case 'sent': return { label: 'Sent', color: 'default', icon: Send };
      case 'viewed': return { label: 'Viewed', color: 'outline', icon: Eye };
      case 'accepted': return { label: 'Accepted', color: 'default', icon: CheckCircle };
      case 'rejected': return { label: 'Rejected', color: 'destructive', icon: XCircle };
      case 'expired': return { label: 'Expired', color: 'secondary', icon: Clock };
      default: return { label: status, color: 'secondary', icon: FileText };
    }
  };

  const activeQuotes = quotes.filter(q => ['draft', 'sent', 'viewed'].includes(q.status));
  const closedQuotes = quotes.filter(q => ['accepted', 'rejected', 'expired'].includes(q.status));

  const conversionRate = quotes.length > 0 
    ? Math.round((quotes.filter(q => q.status === 'accepted').length / quotes.length) * 100) 
    : 0;

  const QuoteCard = ({ quote }: { quote: Quote }) => {
    const statusConfig = getStatusConfig(quote.status);
    const StatusIcon = statusConfig.icon;
    const isExpiringSoon = quote.valid_until && new Date(quote.valid_until) < new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);

    return (
      <Card 
        className="p-4 cursor-pointer hover:shadow-md transition-shadow"
        onClick={() => navigate(`/dealer/quotes/${quote.id}`)}
      >
        <div className="flex items-start justify-between mb-2">
          <div>
            <code className="text-xs bg-muted px-2 py-0.5 rounded">{quote.quote_number}</code>
            {isExpiringSoon && quote.status === 'sent' && (
              <Badge variant="destructive" className="ml-2 text-xs">Expiring Soon</Badge>
            )}
          </div>
          <Badge variant={statusConfig.color as any}>
            <StatusIcon className="w-3 h-3 mr-1" />
            {statusConfig.label}
          </Badge>
        </div>

        <p className="text-lg font-bold mb-1">₹{Number(quote.total_amount).toLocaleString()}</p>
        <p className="text-sm text-muted-foreground mb-2">
          {(quote.items as any[])?.length || 0} items
        </p>

        <div className="flex items-center justify-between pt-2 border-t text-xs text-muted-foreground">
          <span>Created {new Date(quote.created_at).toLocaleDateString()}</span>
          {quote.valid_until && (
            <span>Valid until {new Date(quote.valid_until).toLocaleDateString()}</span>
          )}
        </div>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="bg-primary text-primary-foreground p-4 pt-8">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold">Quotes & Proposals</h1>
          <Button size="sm" variant="secondary" onClick={() => navigate('/dealer/quotes/new')}>
            <Plus className="w-4 h-4 mr-1" />
            New Quote
          </Button>
        </div>
        
        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <Card className="bg-primary-foreground/10 border-0 p-3 text-center">
            <p className="text-2xl font-bold">{quotes.length}</p>
            <p className="text-xs opacity-70">Total</p>
          </Card>
          <Card className="bg-primary-foreground/10 border-0 p-3 text-center">
            <p className="text-2xl font-bold">{activeQuotes.length}</p>
            <p className="text-xs opacity-70">Active</p>
          </Card>
          <Card className="bg-green-500/20 border-0 p-3 text-center">
            <p className="text-2xl font-bold">{conversionRate}%</p>
            <p className="text-xs opacity-70">Conversion</p>
          </Card>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="p-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="active">Active ({activeQuotes.length})</TabsTrigger>
          <TabsTrigger value="closed">Closed ({closedQuotes.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="mt-4 space-y-3">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : activeQuotes.length === 0 ? (
            <Card className="p-8 text-center">
              <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
              <p className="text-muted-foreground mb-4">No active quotes</p>
              <Button onClick={() => navigate('/dealer/quotes/new')}>
                <Plus className="w-4 h-4 mr-2" />
                Create Quote
              </Button>
            </Card>
          ) : (
            activeQuotes.map((quote) => (
              <QuoteCard key={quote.id} quote={quote} />
            ))
          )}
        </TabsContent>

        <TabsContent value="closed" className="mt-4 space-y-3">
          {closedQuotes.length === 0 ? (
            <Card className="p-8 text-center">
              <CheckCircle className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
              <p className="text-muted-foreground">No closed quotes yet</p>
            </Card>
          ) : (
            closedQuotes.map((quote) => (
              <QuoteCard key={quote.id} quote={quote} />
            ))
          )}
        </TabsContent>
      </Tabs>

      <DealerBottomNav activeTab="/dealer/quotes" onTabChange={(path) => navigate(path)} />
    </div>
  );
}
