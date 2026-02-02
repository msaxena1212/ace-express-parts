-- Create app_role enum for dealers
CREATE TYPE public.app_role AS ENUM ('admin', 'dealer', 'customer');

-- Create user_roles table for proper RBAC
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Products table with full model spec
CREATE TABLE public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    part_number TEXT NOT NULL UNIQUE,
    sku TEXT,
    description TEXT,
    category TEXT NOT NULL,
    subcategory TEXT,
    brand TEXT DEFAULT 'ACE Official',
    
    -- Specifications (JSONB for flexibility)
    specifications JSONB DEFAULT '{}',
    compatibility JSONB DEFAULT '[]',
    
    -- Pricing
    mrp NUMERIC NOT NULL,
    selling_price NUMERIC NOT NULL,
    discount_percentage NUMERIC DEFAULT 0,
    discount_type TEXT DEFAULT 'percentage',
    offer_end_date TIMESTAMP WITH TIME ZONE,
    
    -- Inventory
    stock_quantity INTEGER DEFAULT 0,
    stock_status TEXT DEFAULT 'in_stock',
    low_stock_threshold INTEGER DEFAULT 5,
    reorder_quantity INTEGER DEFAULT 50,
    
    -- Delivery
    standard_delivery_days TEXT DEFAULT '2-3',
    fast_track_available BOOLEAN DEFAULT false,
    fast_track_hours TEXT DEFAULT '4-8',
    fast_track_fee NUMERIC DEFAULT 499,
    free_shipping_threshold NUMERIC DEFAULT 5000,
    
    -- Ratings
    average_rating NUMERIC DEFAULT 0,
    total_reviews INTEGER DEFAULT 0,
    rating_distribution JSONB DEFAULT '{"5_star": 0, "4_star": 0, "3_star": 0, "2_star": 0, "1_star": 0}',
    
    -- Images
    images JSONB DEFAULT '[]',
    
    -- Seller
    seller_id UUID,
    seller_name TEXT DEFAULT 'ACE Official Store',
    seller_verified BOOLEAN DEFAULT true,
    
    -- Badges
    badges TEXT[] DEFAULT '{}',
    
    -- Policies
    return_policy TEXT DEFAULT 'Easy 7-day returns',
    warranty_info TEXT DEFAULT '1 Year manufacturer warranty',
    
    -- SEO
    slug TEXT,
    keywords TEXT[],
    
    -- Metadata
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Products are readable by everyone (public catalog)
CREATE POLICY "Products are viewable by everyone"
ON public.products FOR SELECT
USING (is_active = true);

-- Only admins/dealers can modify products
CREATE POLICY "Dealers can manage products"
ON public.products FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'dealer') OR public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'dealer') OR public.has_role(auth.uid(), 'admin'));

-- Product reviews table
CREATE TABLE public.product_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
    user_id UUID NOT NULL,
    user_name TEXT NOT NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    helpful_count INTEGER DEFAULT 0,
    verified_purchase BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.product_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Reviews are viewable by everyone"
ON public.product_reviews FOR SELECT
USING (true);

CREATE POLICY "Users can create their own reviews"
ON public.product_reviews FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reviews"
ON public.product_reviews FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

-- Dealer inventory (separate stock per dealer)
CREATE TABLE public.dealer_inventory (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    dealer_id UUID REFERENCES public.dealers(id) ON DELETE CASCADE NOT NULL,
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
    stock_quantity INTEGER DEFAULT 0,
    min_threshold INTEGER DEFAULT 5,
    reorder_quantity INTEGER DEFAULT 50,
    last_restocked TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE (dealer_id, product_id)
);

ALTER TABLE public.dealer_inventory ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Dealers can view their inventory"
ON public.dealer_inventory FOR SELECT
TO authenticated
USING (
    EXISTS (SELECT 1 FROM public.dealers WHERE id = dealer_id AND user_id = auth.uid())
    OR public.has_role(auth.uid(), 'admin')
);

CREATE POLICY "Dealers can manage their inventory"
ON public.dealer_inventory FOR ALL
TO authenticated
USING (
    EXISTS (SELECT 1 FROM public.dealers WHERE id = dealer_id AND user_id = auth.uid())
    OR public.has_role(auth.uid(), 'admin')
)
WITH CHECK (
    EXISTS (SELECT 1 FROM public.dealers WHERE id = dealer_id AND user_id = auth.uid())
    OR public.has_role(auth.uid(), 'admin')
);

-- Dealer offers table
CREATE TABLE public.dealer_offers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    dealer_id UUID REFERENCES public.dealers(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    discount_type TEXT NOT NULL DEFAULT 'percentage',
    discount_value NUMERIC NOT NULL,
    min_order_value NUMERIC,
    applicable_products UUID[],
    applicable_categories TEXT[],
    start_date TIMESTAMP WITH TIME ZONE NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE NOT NULL,
    max_redemptions INTEGER,
    current_redemptions INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    terms_conditions TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.dealer_offers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Active offers are viewable by everyone"
ON public.dealer_offers FOR SELECT
USING (is_active = true AND end_date > now());

CREATE POLICY "Dealers can manage their offers"
ON public.dealer_offers FOR ALL
TO authenticated
USING (
    EXISTS (SELECT 1 FROM public.dealers WHERE id = dealer_id AND user_id = auth.uid())
    OR public.has_role(auth.uid(), 'admin')
)
WITH CHECK (
    EXISTS (SELECT 1 FROM public.dealers WHERE id = dealer_id AND user_id = auth.uid())
    OR public.has_role(auth.uid(), 'admin')
);

-- Dealer performance metrics table
CREATE TABLE public.dealer_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    dealer_id UUID REFERENCES public.dealers(id) ON DELETE CASCADE NOT NULL,
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    total_orders INTEGER DEFAULT 0,
    total_revenue NUMERIC DEFAULT 0,
    average_order_value NUMERIC DEFAULT 0,
    on_time_delivery_rate NUMERIC DEFAULT 0,
    customer_satisfaction_rating NUMERIC DEFAULT 0,
    new_customers INTEGER DEFAULT 0,
    repeat_customers INTEGER DEFAULT 0,
    orders_cancelled INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE (dealer_id, period_start, period_end)
);

ALTER TABLE public.dealer_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Dealers can view their metrics"
ON public.dealer_metrics FOR SELECT
TO authenticated
USING (
    EXISTS (SELECT 1 FROM public.dealers WHERE id = dealer_id AND user_id = auth.uid())
    OR public.has_role(auth.uid(), 'admin')
);

-- Dealer-customer assignments
CREATE TABLE public.dealer_customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    dealer_id UUID REFERENCES public.dealers(id) ON DELETE CASCADE NOT NULL,
    customer_id UUID NOT NULL,
    customer_name TEXT,
    customer_phone TEXT,
    total_orders INTEGER DEFAULT 0,
    lifetime_value NUMERIC DEFAULT 0,
    last_order_date TIMESTAMP WITH TIME ZONE,
    status TEXT DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE (dealer_id, customer_id)
);

ALTER TABLE public.dealer_customers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Dealers can view their customers"
ON public.dealer_customers FOR SELECT
TO authenticated
USING (
    EXISTS (SELECT 1 FROM public.dealers WHERE id = dealer_id AND user_id = auth.uid())
    OR public.has_role(auth.uid(), 'admin')
);

CREATE POLICY "Dealers can manage their customers"
ON public.dealer_customers FOR ALL
TO authenticated
USING (
    EXISTS (SELECT 1 FROM public.dealers WHERE id = dealer_id AND user_id = auth.uid())
    OR public.has_role(auth.uid(), 'admin')
)
WITH CHECK (
    EXISTS (SELECT 1 FROM public.dealers WHERE id = dealer_id AND user_id = auth.uid())
    OR public.has_role(auth.uid(), 'admin')
);

-- User roles policies
CREATE POLICY "Users can view their own roles"
ON public.user_roles FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all roles"
ON public.user_roles FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Triggers for updated_at
CREATE TRIGGER update_products_updated_at
    BEFORE UPDATE ON public.products
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_product_reviews_updated_at
    BEFORE UPDATE ON public.product_reviews
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_dealer_inventory_updated_at
    BEFORE UPDATE ON public.dealer_inventory
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_dealer_offers_updated_at
    BEFORE UPDATE ON public.dealer_offers
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_dealer_customers_updated_at
    BEFORE UPDATE ON public.dealer_customers
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for performance
CREATE INDEX idx_products_category ON public.products(category);
CREATE INDEX idx_products_part_number ON public.products(part_number);
CREATE INDEX idx_products_stock_status ON public.products(stock_status);
CREATE INDEX idx_products_fast_track ON public.products(fast_track_available);
CREATE INDEX idx_product_reviews_product ON public.product_reviews(product_id);
CREATE INDEX idx_dealer_inventory_dealer ON public.dealer_inventory(dealer_id);
CREATE INDEX idx_dealer_offers_dealer ON public.dealer_offers(dealer_id);
CREATE INDEX idx_dealer_offers_active ON public.dealer_offers(is_active, end_date);
CREATE INDEX idx_dealer_customers_dealer ON public.dealer_customers(dealer_id);