import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Plus, Truck, Zap, Calendar, CreditCard, Smartphone, Building2, Wallet, Banknote, Check, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { products, Product } from '@/data/mockData';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface CartItem {
  productId: string;
  quantity: number;
}

interface Address {
  id: string;
  label: string;
  full_address: string;
  pincode: string;
  city: string;
  state: string;
  phone: string;
  recipient_name: string | null;
  is_default: boolean;
}

interface CheckoutPageProps {
  cart: CartItem[];
  setCart: React.Dispatch<React.SetStateAction<CartItem[]>>;
}

type CheckoutStep = 'address' | 'delivery' | 'payment' | 'review';

export default function CheckoutPage({ cart, setCart }: CheckoutPageProps) {
  const navigate = useNavigate();
  const [step, setStep] = useState<CheckoutStep>('address');
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>('');
  const [deliveryType, setDeliveryType] = useState('standard');
  const [paymentMethod, setPaymentMethod] = useState('upi');
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // New address form
  const [newAddress, setNewAddress] = useState({
    label: 'Home',
    full_address: '',
    pincode: '',
    city: '',
    state: '',
    phone: '',
    recipient_name: ''
  });

  const cartProducts = cart.map(item => {
    const product = products.find(p => p.id === item.productId);
    return { ...item, product };
  }).filter(item => item.product);

  const subtotal = cartProducts.reduce((sum, item) => 
    sum + (item.product?.price || 0) * item.quantity, 0
  );
  const gst = subtotal * 0.18;
  const deliveryFee = deliveryType === 'fast_track' ? 499 : (subtotal >= 5000 ? 0 : 99);
  const total = subtotal + gst + deliveryFee;

  useEffect(() => {
    fetchAddresses();
  }, []);

  const fetchAddresses = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from('addresses')
      .select('*')
      .eq('user_id', user.id)
      .order('is_default', { ascending: false });

    if (data) {
      setAddresses(data);
      const defaultAddr = data.find(a => a.is_default) || data[0];
      if (defaultAddr) setSelectedAddressId(defaultAddr.id);
    }
  };

  const handleAddAddress = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase.from('addresses').insert({
      user_id: user.id,
      ...newAddress,
      is_default: addresses.length === 0
    });

    if (error) {
      toast({ title: "Error", description: "Failed to add address", variant: "destructive" });
    } else {
      toast({ title: "Address added!" });
      setIsAddingAddress(false);
      setNewAddress({ label: 'Home', full_address: '', pincode: '', city: '', state: '', phone: '', recipient_name: '' });
      fetchAddresses();
    }
  };

  const handlePlaceOrder = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate('/auth');
      return;
    }

    setIsLoading(true);
    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
    
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id: user.id,
        order_number: orderNumber,
        subtotal,
        gst_amount: gst,
        delivery_fee: deliveryFee,
        total_amount: total,
        delivery_address_id: selectedAddressId || null,
        delivery_type: deliveryType,
        payment_method: paymentMethod,
        payment_status: paymentMethod === 'cod' ? 'pending' : 'paid',
        status: 'confirmed',
        estimated_delivery: new Date(Date.now() + (deliveryType === 'fast_track' ? 8 * 60 * 60 * 1000 : 48 * 60 * 60 * 1000)).toISOString()
      })
      .select()
      .single();

    if (orderError || !order) {
      toast({ title: "Error", description: "Failed to place order", variant: "destructive" });
      setIsLoading(false);
      return;
    }

    // Add order items
    const orderItems = cartProducts.map(item => ({
      order_id: order.id,
      product_id: item.productId,
      product_name: item.product?.name || '',
      part_number: item.product?.partNumber || '',
      quantity: item.quantity,
      unit_price: item.product?.price || 0,
      item_total: (item.product?.price || 0) * item.quantity
    }));

    await supabase.from('order_items').insert(orderItems);

    setCart([]);
    setIsLoading(false);
    navigate(`/order-confirmation/${order.id}`);
  };

  const selectedAddress = addresses.find(a => a.id === selectedAddressId);

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center gap-2 py-4 px-4">
      {(['address', 'delivery', 'payment', 'review'] as CheckoutStep[]).map((s, i) => (
        <div key={s} className="flex items-center">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
            step === s ? 'bg-primary text-primary-foreground' : 
            (['address', 'delivery', 'payment', 'review'].indexOf(step) > i) ? 'bg-green-500 text-white' : 
            'bg-muted text-muted-foreground'
          }`}>
            {(['address', 'delivery', 'payment', 'review'].indexOf(step) > i) ? <Check className="w-4 h-4" /> : i + 1}
          </div>
          {i < 3 && <div className={`w-8 h-0.5 ${(['address', 'delivery', 'payment', 'review'].indexOf(step) > i) ? 'bg-green-500' : 'bg-muted'}`} />}
        </div>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-background pb-32">
      <header className="sticky top-0 z-40 bg-background border-b px-4 py-3">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => {
            if (step === 'address') navigate('/cart');
            else if (step === 'delivery') setStep('address');
            else if (step === 'payment') setStep('delivery');
            else if (step === 'review') setStep('payment');
          }}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-lg font-semibold">
            {step === 'address' && 'Delivery Address'}
            {step === 'delivery' && 'Delivery Options'}
            {step === 'payment' && 'Payment Method'}
            {step === 'review' && 'Review Order'}
          </h1>
        </div>
      </header>

      {renderStepIndicator()}

      <div className="p-4">
        {/* Step 1: Address */}
        {step === 'address' && (
          <div className="space-y-4">
            {addresses.length === 0 ? (
              <Card className="p-6 text-center">
                <MapPin className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="font-semibold mb-2">No saved addresses</h3>
                <p className="text-sm text-muted-foreground mb-4">Add an address to continue</p>
              </Card>
            ) : (
              <RadioGroup value={selectedAddressId} onValueChange={setSelectedAddressId}>
                {addresses.map(addr => (
                  <Card key={addr.id} className={`p-4 cursor-pointer ${selectedAddressId === addr.id ? 'border-primary' : ''}`}>
                    <div className="flex items-start gap-3">
                      <RadioGroupItem value={addr.id} id={addr.id} />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{addr.label}</span>
                          {addr.is_default && (
                            <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">Default</span>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">{addr.full_address}</p>
                        <p className="text-sm text-muted-foreground">{addr.city}, {addr.state} - {addr.pincode}</p>
                        <p className="text-sm mt-1">{addr.phone}</p>
                      </div>
                    </div>
                  </Card>
                ))}
              </RadioGroup>
            )}

            <Dialog open={isAddingAddress} onOpenChange={setIsAddingAddress}>
              <DialogTrigger asChild>
                <Button variant="outline" className="w-full">
                  <Plus className="w-4 h-4 mr-2" />
                  Add New Address
                </Button>
              </DialogTrigger>
              <DialogContent className="max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Add New Address</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <div>
                    <Label>Address Type</Label>
                    <Select value={newAddress.label} onValueChange={(v) => setNewAddress({...newAddress, label: v})}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Home">Home</SelectItem>
                        <SelectItem value="Office">Office</SelectItem>
                        <SelectItem value="Site">Site</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Recipient Name</Label>
                    <Input 
                      placeholder="Full name"
                      value={newAddress.recipient_name}
                      onChange={(e) => setNewAddress({...newAddress, recipient_name: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label>Phone Number</Label>
                    <Input 
                      placeholder="10-digit phone number"
                      value={newAddress.phone}
                      onChange={(e) => setNewAddress({...newAddress, phone: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label>Full Address</Label>
                    <Input 
                      placeholder="House no, Street, Locality"
                      value={newAddress.full_address}
                      onChange={(e) => setNewAddress({...newAddress, full_address: e.target.value})}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label>Pincode</Label>
                      <Input 
                        placeholder="6-digit pincode"
                        value={newAddress.pincode}
                        onChange={(e) => setNewAddress({...newAddress, pincode: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label>City</Label>
                      <Input 
                        placeholder="City"
                        value={newAddress.city}
                        onChange={(e) => setNewAddress({...newAddress, city: e.target.value})}
                      />
                    </div>
                  </div>
                  <div>
                    <Label>State</Label>
                    <Input 
                      placeholder="State"
                      value={newAddress.state}
                      onChange={(e) => setNewAddress({...newAddress, state: e.target.value})}
                    />
                  </div>
                  <Button onClick={handleAddAddress} className="w-full">Save Address</Button>
                </div>
              </DialogContent>
            </Dialog>

            <Card className="p-4 bg-green-50 dark:bg-green-950/30">
              <div className="flex items-center gap-2 text-green-700 dark:text-green-400">
                <Truck className="w-4 h-4" />
                <span className="text-sm">Delivery available for this area</span>
              </div>
            </Card>
          </div>
        )}

        {/* Step 2: Delivery Options */}
        {step === 'delivery' && (
          <div className="space-y-4">
            <RadioGroup value={deliveryType} onValueChange={setDeliveryType}>
              <Card className={`p-4 cursor-pointer ${deliveryType === 'standard' ? 'border-primary' : ''}`}>
                <div className="flex items-start gap-3">
                  <RadioGroupItem value="standard" id="standard" />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Truck className="w-5 h-5" />
                        <span className="font-medium">Standard Delivery</span>
                      </div>
                      <span className={subtotal >= 5000 ? 'text-green-600 font-medium' : ''}>
                        {subtotal >= 5000 ? 'FREE' : '₹99'}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">24-48 hours</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Delivery by {new Date(Date.now() + 48 * 60 * 60 * 1000).toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' })}
                    </p>
                  </div>
                </div>
              </Card>

              <Card className={`p-4 cursor-pointer border-2 ${deliveryType === 'fast_track' ? 'border-primary' : 'border-primary/30'}`}>
                <div className="flex items-start gap-3">
                  <RadioGroupItem value="fast_track" id="fast_track" />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Zap className="w-5 h-5 text-primary" />
                        <span className="font-medium">Fast Track Delivery</span>
                        <span className="text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded">Popular</span>
                      </div>
                      <div className="text-right">
                        <span className="font-medium">₹499</span>
                        <span className="text-xs text-muted-foreground line-through ml-1">₹899</span>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">4-8 hours</p>
                    <p className="text-xs text-primary mt-1 font-medium">
                      By {new Date(Date.now() + 8 * 60 * 60 * 1000).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })} Today
                    </p>
                  </div>
                </div>
              </Card>

              <Card className={`p-4 cursor-pointer ${deliveryType === 'scheduled' ? 'border-primary' : ''}`}>
                <div className="flex items-start gap-3">
                  <RadioGroupItem value="scheduled" id="scheduled" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-5 h-5" />
                      <span className="font-medium">Schedule for Later</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">Pick a date and time</p>
                  </div>
                </div>
              </Card>
            </RadioGroup>
          </div>
        )}

        {/* Step 3: Payment */}
        {step === 'payment' && (
          <div className="space-y-4">
            <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
              <Card className={`p-4 cursor-pointer ${paymentMethod === 'upi' ? 'border-primary' : ''}`}>
                <div className="flex items-start gap-3">
                  <RadioGroupItem value="upi" id="upi" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Smartphone className="w-5 h-5" />
                      <span className="font-medium">UPI</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">Google Pay, PhonePe, Paytm</p>
                  </div>
                </div>
              </Card>

              <Card className={`p-4 cursor-pointer ${paymentMethod === 'card' ? 'border-primary' : ''}`}>
                <div className="flex items-start gap-3">
                  <RadioGroupItem value="card" id="card" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <CreditCard className="w-5 h-5" />
                      <span className="font-medium">Credit/Debit Card</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">Visa, Mastercard, Rupay</p>
                  </div>
                </div>
              </Card>

              <Card className={`p-4 cursor-pointer ${paymentMethod === 'netbanking' ? 'border-primary' : ''}`}>
                <div className="flex items-start gap-3">
                  <RadioGroupItem value="netbanking" id="netbanking" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Building2 className="w-5 h-5" />
                      <span className="font-medium">Net Banking</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">All major banks supported</p>
                  </div>
                </div>
              </Card>

              <Card className={`p-4 cursor-pointer ${paymentMethod === 'wallet' ? 'border-primary' : ''}`}>
                <div className="flex items-start gap-3">
                  <RadioGroupItem value="wallet" id="wallet" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Wallet className="w-5 h-5" />
                      <span className="font-medium">Wallet</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">Amazon Pay, Paytm Wallet</p>
                  </div>
                </div>
              </Card>

              <Card className={`p-4 cursor-pointer ${paymentMethod === 'cod' ? 'border-primary' : ''}`}>
                <div className="flex items-start gap-3">
                  <RadioGroupItem value="cod" id="cod" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Banknote className="w-5 h-5" />
                      <span className="font-medium">Cash on Delivery</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">Pay when you receive</p>
                  </div>
                </div>
              </Card>
            </RadioGroup>

            <Card className="p-4">
              <div className="flex items-center gap-2 text-sm">
                <div className="w-4 h-4 bg-green-500 rounded flex items-center justify-center">
                  <Check className="w-3 h-3 text-white" />
                </div>
                <span>🔒 Secured with SSL encryption</span>
              </div>
            </Card>
          </div>
        )}

        {/* Step 4: Review */}
        {step === 'review' && (
          <div className="space-y-4">
            <Card className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Delivery Address</span>
                <Button variant="link" size="sm" onClick={() => setStep('address')}>Edit</Button>
              </div>
              {selectedAddress && (
                <div>
                  <p className="font-medium">{selectedAddress.label}</p>
                  <p className="text-sm text-muted-foreground">{selectedAddress.full_address}</p>
                  <p className="text-sm text-muted-foreground">{selectedAddress.city}, {selectedAddress.state} - {selectedAddress.pincode}</p>
                </div>
              )}
            </Card>

            <Card className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Delivery Option</span>
                <Button variant="link" size="sm" onClick={() => setStep('delivery')}>Edit</Button>
              </div>
              <div className="flex items-center gap-2">
                {deliveryType === 'fast_track' ? <Zap className="w-4 h-4 text-primary" /> : <Truck className="w-4 h-4" />}
                <span className="font-medium">
                  {deliveryType === 'fast_track' ? 'Fast Track (4-8 hours)' : 'Standard (24-48 hours)'}
                </span>
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Payment Method</span>
                <Button variant="link" size="sm" onClick={() => setStep('payment')}>Edit</Button>
              </div>
              <span className="font-medium capitalize">{paymentMethod.replace('_', ' ')}</span>
            </Card>

            <Card className="p-4">
              <h3 className="font-medium mb-3">Order Items ({cartProducts.length})</h3>
              <div className="space-y-3">
                {cartProducts.slice(0, 3).map(({ productId, quantity, product }) => (
                  <div key={productId} className="flex items-center gap-3">
                    <img src={product?.image} alt="" className="w-12 h-12 rounded bg-muted" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium line-clamp-1">{product?.name}</p>
                      <p className="text-xs text-muted-foreground">Qty: {quantity}</p>
                    </div>
                    <span className="text-sm font-medium">₹{((product?.price || 0) * quantity).toLocaleString()}</span>
                  </div>
                ))}
                {cartProducts.length > 3 && (
                  <p className="text-sm text-muted-foreground">+{cartProducts.length - 3} more items</p>
                )}
              </div>
            </Card>

            <Card className="p-4 bg-primary/5">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-primary" />
                <span className="text-sm">Genuine ACE Parts ensure reliability & longevity</span>
              </div>
            </Card>

            <div className="flex items-start gap-2">
              <Checkbox 
                id="terms" 
                checked={agreedToTerms}
                onCheckedChange={(checked) => setAgreedToTerms(checked as boolean)}
              />
              <label htmlFor="terms" className="text-sm text-muted-foreground leading-tight">
                I agree to the <span className="text-primary underline">terms and conditions</span>
              </label>
            </div>
          </div>
        )}
      </div>

      {/* Fixed Bottom */}
      <div className="fixed bottom-0 left-0 right-0 bg-background border-t shadow-lg z-50 p-4">
        {step !== 'review' ? (
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total</p>
              <p className="text-lg font-bold">₹{total.toFixed(0)}</p>
            </div>
            <Button 
              size="lg"
              className="px-8"
              disabled={step === 'address' && !selectedAddressId && addresses.length > 0}
              onClick={() => {
                if (step === 'address') setStep('delivery');
                else if (step === 'delivery') setStep('payment');
                else if (step === 'payment') setStep('review');
              }}
            >
              Continue
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span>Subtotal</span>
              <span>₹{subtotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>GST (18%)</span>
              <span>₹{gst.toFixed(0)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Delivery</span>
              <span className={deliveryFee === 0 ? 'text-green-600' : ''}>
                {deliveryFee === 0 ? 'FREE' : `₹${deliveryFee}`}
              </span>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <span className="text-lg font-bold">₹{total.toFixed(0)}</span>
              <Button 
                size="lg"
                className="px-8"
                disabled={!agreedToTerms || isLoading}
                onClick={handlePlaceOrder}
              >
                {isLoading ? 'Placing Order...' : 'Place Order'}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
