-- ============================================
-- MAINTENANCE SCHEDULING TABLES
-- ============================================

-- Maintenance Plans (templates for scheduled maintenance)
CREATE TABLE public.maintenance_plans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  scope TEXT NOT NULL DEFAULT 'model-level' CHECK (scope IN ('model-level', 'machine-level')),
  equipment_type TEXT,
  model_ids TEXT[] DEFAULT '{}',
  interval_type TEXT NOT NULL DEFAULT 'time-based' CHECK (interval_type IN ('time-based', 'meter-based', 'combined')),
  interval_days INTEGER,
  interval_hours INTEGER,
  grace_window_days INTEGER DEFAULT 7,
  grace_window_hours INTEGER DEFAULT 50,
  required_tasks JSONB DEFAULT '[]',
  required_parts JSONB DEFAULT '[]',
  default_assignee TEXT DEFAULT 'dealer' CHECK (default_assignee IN ('ACE', 'dealer', 'internal', 'self')),
  criticality TEXT DEFAULT 'medium' CHECK (criticality IN ('low', 'medium', 'high', 'critical')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Maintenance Tasks (instances of maintenance work)
CREATE TABLE public.maintenance_tasks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  machine_id UUID NOT NULL REFERENCES public.user_equipment(id) ON DELETE CASCADE,
  plan_id UUID REFERENCES public.maintenance_plans(id) ON DELETE SET NULL,
  user_id UUID NOT NULL,
  due_date DATE,
  due_hours INTEGER,
  status TEXT NOT NULL DEFAULT 'planned' CHECK (status IN ('planned', 'due', 'overdue', 'scheduled', 'in_progress', 'completed', 'skipped', 'cancelled')),
  scheduled_date DATE,
  scheduled_time_slot TEXT,
  assignee_type TEXT CHECK (assignee_type IN ('dealer', 'technician', 'self')),
  assignee_id UUID,
  origin TEXT DEFAULT 'manual' CHECK (origin IN ('OEM_plan', 'manual', 'SR_converted')),
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  notes TEXT,
  completed_at TIMESTAMP WITH TIME ZONE,
  actual_hours INTEGER,
  parts_used JSONB DEFAULT '[]',
  labor_time INTEGER,
  total_cost NUMERIC DEFAULT 0,
  service_request_id UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- ============================================
-- SERVICE REQUEST TABLES (Enhanced)
-- ============================================

-- Update service_requests table with new fields
ALTER TABLE public.service_requests 
  ADD COLUMN IF NOT EXISTS code TEXT,
  ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'app' CHECK (source IN ('app', 'dealer_manual', 'call_center')),
  ADD COLUMN IF NOT EXISTS dealer_id UUID,
  ADD COLUMN IF NOT EXISTS channel TEXT DEFAULT 'app' CHECK (channel IN ('app', 'phone', 'email', 'walk_in')),
  ADD COLUMN IF NOT EXISTS symptoms JSONB DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS attachments JSONB DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS sla_target_time TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS sla_breach_time TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS sla_status TEXT DEFAULT 'on_track' CHECK (sla_status IN ('on_track', 'at_risk', 'breached')),
  ADD COLUMN IF NOT EXISTS linked_maintenance_task_id UUID,
  ADD COLUMN IF NOT EXISTS linked_order_ids TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS estimated_cost NUMERIC DEFAULT 0,
  ADD COLUMN IF NOT EXISTS technician_id UUID,
  ADD COLUMN IF NOT EXISTS scheduled_date DATE,
  ADD COLUMN IF NOT EXISTS scheduled_time_slot TEXT,
  ADD COLUMN IF NOT EXISTS completion_notes TEXT,
  ADD COLUMN IF NOT EXISTS customer_signature TEXT,
  ADD COLUMN IF NOT EXISTS before_photos JSONB DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS after_photos JSONB DEFAULT '[]';

-- Service Request Work Logs
CREATE TABLE public.service_request_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  service_request_id UUID NOT NULL REFERENCES public.service_requests(id) ON DELETE CASCADE,
  actor_type TEXT NOT NULL CHECK (actor_type IN ('dealer', 'technician', 'customer', 'system')),
  actor_id UUID,
  action TEXT NOT NULL,
  old_status TEXT,
  new_status TEXT,
  notes TEXT,
  attachments JSONB DEFAULT '[]',
  cost_update NUMERIC,
  visibility TEXT DEFAULT 'internal' CHECK (visibility IN ('internal', 'customer-facing')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Dealer Technicians
CREATE TABLE public.dealer_technicians (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  dealer_id UUID NOT NULL REFERENCES public.dealers(id) ON DELETE CASCADE,
  user_id UUID,
  name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  specializations TEXT[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  daily_capacity INTEGER DEFAULT 8,
  current_workload INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Dealer Calendar Slots
CREATE TABLE public.dealer_calendar_slots (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  dealer_id UUID NOT NULL REFERENCES public.dealers(id) ON DELETE CASCADE,
  technician_id UUID REFERENCES public.dealer_technicians(id) ON DELETE CASCADE,
  slot_date DATE NOT NULL,
  time_slot TEXT NOT NULL,
  is_available BOOLEAN DEFAULT true,
  booked_service_request_id UUID,
  booked_maintenance_task_id UUID,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- ============================================
-- LOYALTY & REFERRAL TABLES
-- ============================================

-- Loyalty Tiers
CREATE TABLE public.loyalty_tiers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  min_points INTEGER NOT NULL DEFAULT 0,
  max_points INTEGER,
  multiplier NUMERIC DEFAULT 1.0,
  benefits JSONB DEFAULT '[]',
  badge_color TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- User Loyalty Accounts
CREATE TABLE public.loyalty_accounts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  current_tier_id UUID REFERENCES public.loyalty_tiers(id),
  total_points_earned INTEGER DEFAULT 0,
  total_points_redeemed INTEGER DEFAULT 0,
  available_points INTEGER DEFAULT 0,
  lifetime_value NUMERIC DEFAULT 0,
  referral_code TEXT UNIQUE,
  referred_by_user_id UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Loyalty Transactions
CREATE TABLE public.loyalty_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  loyalty_account_id UUID NOT NULL REFERENCES public.loyalty_accounts(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('earn', 'redeem', 'expire', 'bonus', 'adjustment')),
  points INTEGER NOT NULL,
  balance_after INTEGER NOT NULL,
  source TEXT,
  reference_type TEXT,
  reference_id UUID,
  description TEXT,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Referral Tracking
CREATE TABLE public.referrals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  referrer_user_id UUID NOT NULL,
  referred_user_id UUID,
  referral_code TEXT NOT NULL,
  channel TEXT,
  campaign TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'registered', 'qualified', 'rewarded', 'rejected')),
  qualification_event TEXT,
  first_order_id UUID,
  referrer_reward_points INTEGER DEFAULT 0,
  referred_reward_discount NUMERIC DEFAULT 0,
  rewarded_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- ============================================
-- ANALYTICS TABLES
-- ============================================

-- Machine Cost of Ownership
CREATE TABLE public.machine_costs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  machine_id UUID NOT NULL REFERENCES public.user_equipment(id) ON DELETE CASCADE,
  cost_type TEXT NOT NULL CHECK (cost_type IN ('parts', 'labor', 'travel', 'consumables', 'other')),
  amount NUMERIC NOT NULL,
  reference_type TEXT,
  reference_id UUID,
  operating_hours_at_time INTEGER,
  description TEXT,
  incurred_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Machine Downtime Records
CREATE TABLE public.machine_downtime (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  machine_id UUID NOT NULL REFERENCES public.user_equipment(id) ON DELETE CASCADE,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE,
  duration_hours NUMERIC,
  reason TEXT,
  service_request_id UUID REFERENCES public.service_requests(id),
  maintenance_task_id UUID REFERENCES public.maintenance_tasks(id),
  is_planned BOOLEAN DEFAULT false,
  impact_level TEXT DEFAULT 'medium' CHECK (impact_level IN ('low', 'medium', 'high', 'critical')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Dealer Performance Metrics (Enhanced)
ALTER TABLE public.dealer_metrics
  ADD COLUMN IF NOT EXISTS quote_to_order_rate NUMERIC DEFAULT 0,
  ADD COLUMN IF NOT EXISTS parts_attach_rate NUMERIC DEFAULT 0,
  ADD COLUMN IF NOT EXISTS first_time_fix_rate NUMERIC DEFAULT 0,
  ADD COLUMN IF NOT EXISTS avg_response_time_hours NUMERIC DEFAULT 0,
  ADD COLUMN IF NOT EXISTS sla_compliance_rate NUMERIC DEFAULT 0,
  ADD COLUMN IF NOT EXISTS inventory_turns NUMERIC DEFAULT 0,
  ADD COLUMN IF NOT EXISTS dead_stock_value NUMERIC DEFAULT 0;

-- ============================================
-- DEALER PORTAL ENHANCEMENTS
-- ============================================

-- Dealer Quotes
CREATE TABLE public.dealer_quotes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  dealer_id UUID NOT NULL REFERENCES public.dealers(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL,
  quote_number TEXT NOT NULL,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'viewed', 'accepted', 'rejected', 'expired')),
  items JSONB DEFAULT '[]',
  subtotal NUMERIC DEFAULT 0,
  discount_amount NUMERIC DEFAULT 0,
  tax_amount NUMERIC DEFAULT 0,
  total_amount NUMERIC DEFAULT 0,
  valid_until DATE,
  notes TEXT,
  terms_conditions TEXT,
  version INTEGER DEFAULT 1,
  accepted_at TIMESTAMP WITH TIME ZONE,
  converted_order_id UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Dealer Price Overrides (Customer-level pricing)
CREATE TABLE public.dealer_price_overrides (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  dealer_id UUID NOT NULL REFERENCES public.dealers(id) ON DELETE CASCADE,
  customer_id UUID,
  product_id UUID REFERENCES public.products(id),
  category TEXT,
  discount_type TEXT DEFAULT 'percentage' CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value NUMERIC NOT NULL,
  min_quantity INTEGER DEFAULT 1,
  valid_from DATE,
  valid_until DATE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Dealer Internal Notes
CREATE TABLE public.dealer_notes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  dealer_id UUID NOT NULL REFERENCES public.dealers(id) ON DELETE CASCADE,
  reference_type TEXT NOT NULL CHECK (reference_type IN ('order', 'service_request', 'customer', 'quote')),
  reference_id UUID NOT NULL,
  author_id UUID NOT NULL,
  content TEXT NOT NULL,
  mentioned_user_ids UUID[] DEFAULT '{}',
  is_internal BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Dealer Tasks (Internal workflow items)
CREATE TABLE public.dealer_tasks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  dealer_id UUID NOT NULL REFERENCES public.dealers(id) ON DELETE CASCADE,
  assigned_to UUID,
  title TEXT NOT NULL,
  description TEXT,
  reference_type TEXT,
  reference_id UUID,
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
  due_date TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all new tables
ALTER TABLE public.maintenance_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.maintenance_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_request_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dealer_technicians ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dealer_calendar_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loyalty_tiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loyalty_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loyalty_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.machine_costs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.machine_downtime ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dealer_quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dealer_price_overrides ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dealer_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dealer_tasks ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Maintenance Plans (public read, admin/dealer write)
CREATE POLICY "Maintenance plans viewable by all authenticated users" ON public.maintenance_plans
  FOR SELECT USING (is_active = true);

CREATE POLICY "Dealers and admins can manage maintenance plans" ON public.maintenance_plans
  FOR ALL USING (has_role(auth.uid(), 'dealer') OR has_role(auth.uid(), 'admin'))
  WITH CHECK (has_role(auth.uid(), 'dealer') OR has_role(auth.uid(), 'admin'));

-- RLS Policies for Maintenance Tasks
CREATE POLICY "Users can view their own maintenance tasks" ON public.maintenance_tasks
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create maintenance tasks for their machines" ON public.maintenance_tasks
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own maintenance tasks" ON public.maintenance_tasks
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Dealers can view assigned maintenance tasks" ON public.maintenance_tasks
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM dealers WHERE dealers.id = maintenance_tasks.assignee_id AND dealers.user_id = auth.uid())
    OR has_role(auth.uid(), 'admin')
  );

-- RLS Policies for Service Request Logs
CREATE POLICY "Users can view logs for their service requests" ON public.service_request_logs
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM service_requests WHERE service_requests.id = service_request_logs.service_request_id AND service_requests.user_id = auth.uid())
    AND visibility = 'customer-facing'
  );

CREATE POLICY "Dealers can manage logs for their service requests" ON public.service_request_logs
  FOR ALL USING (has_role(auth.uid(), 'dealer') OR has_role(auth.uid(), 'admin'))
  WITH CHECK (has_role(auth.uid(), 'dealer') OR has_role(auth.uid(), 'admin'));

-- RLS Policies for Dealer Technicians
CREATE POLICY "Dealers can manage their technicians" ON public.dealer_technicians
  FOR ALL USING (
    EXISTS (SELECT 1 FROM dealers WHERE dealers.id = dealer_technicians.dealer_id AND dealers.user_id = auth.uid())
    OR has_role(auth.uid(), 'admin')
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM dealers WHERE dealers.id = dealer_technicians.dealer_id AND dealers.user_id = auth.uid())
    OR has_role(auth.uid(), 'admin')
  );

-- RLS Policies for Dealer Calendar Slots
CREATE POLICY "Dealers can manage their calendar slots" ON public.dealer_calendar_slots
  FOR ALL USING (
    EXISTS (SELECT 1 FROM dealers WHERE dealers.id = dealer_calendar_slots.dealer_id AND dealers.user_id = auth.uid())
    OR has_role(auth.uid(), 'admin')
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM dealers WHERE dealers.id = dealer_calendar_slots.dealer_id AND dealers.user_id = auth.uid())
    OR has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Authenticated users can view available slots" ON public.dealer_calendar_slots
  FOR SELECT USING (is_available = true);

-- RLS Policies for Loyalty Tiers (public read)
CREATE POLICY "Loyalty tiers viewable by all" ON public.loyalty_tiers
  FOR SELECT USING (is_active = true);

-- RLS Policies for Loyalty Accounts
CREATE POLICY "Users can view their own loyalty account" ON public.loyalty_accounts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can manage loyalty accounts" ON public.loyalty_accounts
  FOR ALL USING (has_role(auth.uid(), 'admin'))
  WITH CHECK (has_role(auth.uid(), 'admin'));

-- RLS Policies for Loyalty Transactions
CREATE POLICY "Users can view their own loyalty transactions" ON public.loyalty_transactions
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM loyalty_accounts WHERE loyalty_accounts.id = loyalty_transactions.loyalty_account_id AND loyalty_accounts.user_id = auth.uid())
  );

-- RLS Policies for Referrals
CREATE POLICY "Users can view their own referrals" ON public.referrals
  FOR SELECT USING (auth.uid() = referrer_user_id OR auth.uid() = referred_user_id);

CREATE POLICY "Users can create referrals" ON public.referrals
  FOR INSERT WITH CHECK (auth.uid() = referrer_user_id);

-- RLS Policies for Machine Costs
CREATE POLICY "Users can view costs for their machines" ON public.machine_costs
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM user_equipment WHERE user_equipment.id = machine_costs.machine_id AND user_equipment.user_id = auth.uid())
  );

CREATE POLICY "Dealers can manage machine costs" ON public.machine_costs
  FOR ALL USING (has_role(auth.uid(), 'dealer') OR has_role(auth.uid(), 'admin'))
  WITH CHECK (has_role(auth.uid(), 'dealer') OR has_role(auth.uid(), 'admin'));

-- RLS Policies for Machine Downtime
CREATE POLICY "Users can view downtime for their machines" ON public.machine_downtime
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM user_equipment WHERE user_equipment.id = machine_downtime.machine_id AND user_equipment.user_id = auth.uid())
  );

CREATE POLICY "Users can record downtime for their machines" ON public.machine_downtime
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM user_equipment WHERE user_equipment.id = machine_downtime.machine_id AND user_equipment.user_id = auth.uid())
  );

-- RLS Policies for Dealer Quotes
CREATE POLICY "Dealers can manage their quotes" ON public.dealer_quotes
  FOR ALL USING (
    EXISTS (SELECT 1 FROM dealers WHERE dealers.id = dealer_quotes.dealer_id AND dealers.user_id = auth.uid())
    OR has_role(auth.uid(), 'admin')
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM dealers WHERE dealers.id = dealer_quotes.dealer_id AND dealers.user_id = auth.uid())
    OR has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Customers can view their quotes" ON public.dealer_quotes
  FOR SELECT USING (auth.uid() = customer_id);

-- RLS Policies for Dealer Price Overrides
CREATE POLICY "Dealers can manage their price overrides" ON public.dealer_price_overrides
  FOR ALL USING (
    EXISTS (SELECT 1 FROM dealers WHERE dealers.id = dealer_price_overrides.dealer_id AND dealers.user_id = auth.uid())
    OR has_role(auth.uid(), 'admin')
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM dealers WHERE dealers.id = dealer_price_overrides.dealer_id AND dealers.user_id = auth.uid())
    OR has_role(auth.uid(), 'admin')
  );

-- RLS Policies for Dealer Notes
CREATE POLICY "Dealers can manage their notes" ON public.dealer_notes
  FOR ALL USING (
    EXISTS (SELECT 1 FROM dealers WHERE dealers.id = dealer_notes.dealer_id AND dealers.user_id = auth.uid())
    OR has_role(auth.uid(), 'admin')
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM dealers WHERE dealers.id = dealer_notes.dealer_id AND dealers.user_id = auth.uid())
    OR has_role(auth.uid(), 'admin')
  );

-- RLS Policies for Dealer Tasks
CREATE POLICY "Dealers can manage their tasks" ON public.dealer_tasks
  FOR ALL USING (
    EXISTS (SELECT 1 FROM dealers WHERE dealers.id = dealer_tasks.dealer_id AND dealers.user_id = auth.uid())
    OR has_role(auth.uid(), 'admin')
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM dealers WHERE dealers.id = dealer_tasks.dealer_id AND dealers.user_id = auth.uid())
    OR has_role(auth.uid(), 'admin')
  );

-- Create triggers for updated_at
CREATE TRIGGER update_maintenance_plans_updated_at BEFORE UPDATE ON public.maintenance_plans
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_maintenance_tasks_updated_at BEFORE UPDATE ON public.maintenance_tasks
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_dealer_technicians_updated_at BEFORE UPDATE ON public.dealer_technicians
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_loyalty_accounts_updated_at BEFORE UPDATE ON public.loyalty_accounts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_referrals_updated_at BEFORE UPDATE ON public.referrals
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_dealer_quotes_updated_at BEFORE UPDATE ON public.dealer_quotes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_dealer_tasks_updated_at BEFORE UPDATE ON public.dealer_tasks
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default loyalty tiers
INSERT INTO public.loyalty_tiers (name, min_points, max_points, multiplier, benefits, badge_color) VALUES
  ('Bronze', 0, 999, 1.0, '["Basic support", "Standard delivery"]', '#CD7F32'),
  ('Silver', 1000, 4999, 1.25, '["Priority support", "Free standard delivery", "5% extra discount"]', '#C0C0C0'),
  ('Gold', 5000, 14999, 1.5, '["VIP support", "Free fast track delivery", "10% extra discount", "Early access to offers"]', '#FFD700'),
  ('Platinum', 15000, NULL, 2.0, '["Dedicated account manager", "Free all deliveries", "15% extra discount", "Exclusive deals", "Priority service slots"]', '#E5E4E2');

-- Function to generate referral code
CREATE OR REPLACE FUNCTION public.generate_referral_code()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.referral_code IS NULL THEN
    NEW.referral_code := 'ACE' || UPPER(SUBSTRING(MD5(NEW.user_id::text || NOW()::text) FROM 1 FOR 6));
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER generate_loyalty_referral_code
  BEFORE INSERT ON public.loyalty_accounts
  FOR EACH ROW
  EXECUTE FUNCTION public.generate_referral_code();

-- Function to auto-create loyalty account for new users
CREATE OR REPLACE FUNCTION public.create_loyalty_account_for_user()
RETURNS TRIGGER AS $$
DECLARE
  bronze_tier_id UUID;
BEGIN
  SELECT id INTO bronze_tier_id FROM public.loyalty_tiers WHERE name = 'Bronze' LIMIT 1;
  
  INSERT INTO public.loyalty_accounts (user_id, current_tier_id)
  VALUES (NEW.user_id, bronze_tier_id)
  ON CONFLICT (user_id) DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER create_loyalty_on_profile
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.create_loyalty_account_for_user();