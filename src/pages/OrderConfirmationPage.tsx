import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Check, Package, Share2, Download, Home, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import Confetti from '@/components/Confetti';

interface Order {
  id: string;
  order_number: string;
  total_amount: number;
  estimated_delivery: string;
  delivery_type: string;
  status: string;
}

export default function OrderConfirmationPage() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [showConfetti, setShowConfetti] = useState(true);

  useEffect(() => {
    fetchOrder();
    setTimeout(() => setShowConfetti(false), 5000);
  }, [orderId]);

  const fetchOrder = async () => {
    if (!orderId) return;
    
    const { data } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single();

    if (data) setOrder(data);
  };

  const copyOrderId = () => {
    if (order) {
      navigator.clipboard.writeText(order.order_number);
      toast({ title: "Copied!", description: "Order ID copied to clipboard" });
    }
  };

  const shareOrder = () => {
    if (navigator.share && order) {
      navigator.share({
        title: 'ACE Parts Order',
        text: `I just ordered from ACE Parts! Order #${order.order_number}`,
        url: window.location.href
      });
    }
  };

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {showConfetti && <Confetti />}
      
      <div className="flex flex-col items-center p-6 pt-12">
        <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mb-6 animate-bounce-in">
          <Check className="w-10 h-10 text-white" />
        </div>
        
        <h1 className="text-2xl font-bold mb-2">Order Placed Successfully! 🎉</h1>
        <p className="text-muted-foreground text-center mb-6">
          Thank you for your order. You'll receive updates via SMS & app.
        </p>

        <Card className="w-full p-4 mb-4">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-muted-foreground">Order ID</span>
            <div className="flex items-center gap-2">
              <code className="bg-muted px-2 py-1 rounded text-sm font-mono">{order.order_number}</code>
              <Button variant="ghost" size="icon-sm" onClick={copyOrderId}>
                <Copy className="w-4 h-4" />
              </Button>
            </div>
          </div>
          
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-muted-foreground">Total Amount</span>
            <span className="font-bold text-primary">₹{Number(order.total_amount).toLocaleString()}</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Estimated Delivery</span>
            <span className="font-medium">
              {new Date(order.estimated_delivery).toLocaleDateString('en-IN', {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </span>
          </div>
        </Card>

        <Card className="w-full p-4 mb-6 bg-primary/5">
          <div className="flex items-center gap-3">
            <Package className="w-6 h-6 text-primary" />
            <div>
              <p className="font-medium">Preparing your order...</p>
              <p className="text-sm text-muted-foreground">Estimated 10-15 minutes for processing</p>
            </div>
          </div>
        </Card>

        <div className="w-full space-y-3">
          <Button 
            className="w-full" 
            size="lg"
            onClick={() => navigate(`/orders/${order.id}`)}
          >
            <Package className="w-4 h-4 mr-2" />
            View Order Details
          </Button>
          
          <Button 
            variant="outline" 
            className="w-full" 
            size="lg"
            onClick={() => navigate('/')}
          >
            <Home className="w-4 h-4 mr-2" />
            Continue Shopping
          </Button>

          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" onClick={shareOrder}>
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>
            <Button variant="outline" className="flex-1">
              <Download className="w-4 h-4 mr-2" />
              Invoice
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
