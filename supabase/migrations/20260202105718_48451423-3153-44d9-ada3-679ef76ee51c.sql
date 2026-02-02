-- Create profiles table for additional user information
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    full_name TEXT,
    phone TEXT,
    email TEXT,
    role TEXT CHECK (role IN ('equipment_owner', 'operator', 'dealer')) DEFAULT 'equipment_owner',
    location TEXT,
    pincode TEXT,
    avatar_url TEXT,
    is_profile_complete BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create dealers table for dealer-specific information
CREATE TABLE public.dealers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    dealer_code TEXT UNIQUE,
    firm_name TEXT NOT NULL,
    gst_number TEXT,
    contact_person TEXT,
    phone TEXT,
    email TEXT,
    location TEXT,
    status TEXT CHECK (status IN ('pending', 'approved', 'rejected')) DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user equipment table
CREATE TABLE public.user_equipment (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    model TEXT NOT NULL,
    serial_number TEXT,
    equipment_type TEXT,
    status TEXT CHECK (status IN ('active', 'maintenance', 'inactive')) DEFAULT 'active',
    last_service_date DATE,
    next_service_due DATE,
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create wishlist table
CREATE TABLE public.wishlists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    product_id TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(user_id, product_id)
);

-- Create cart table
CREATE TABLE public.cart_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    product_id TEXT NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(user_id, product_id)
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dealers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_equipment ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wishlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for dealers
CREATE POLICY "Users can view own dealer info" ON public.dealers
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own dealer info" ON public.dealers
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own dealer info" ON public.dealers
    FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for user_equipment
CREATE POLICY "Users can view own equipment" ON public.user_equipment
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own equipment" ON public.user_equipment
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own equipment" ON public.user_equipment
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own equipment" ON public.user_equipment
    FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for wishlists
CREATE POLICY "Users can view own wishlist" ON public.wishlists
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert to own wishlist" ON public.wishlists
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete from own wishlist" ON public.wishlists
    FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for cart_items
CREATE POLICY "Users can view own cart" ON public.cart_items
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert to own cart" ON public.cart_items
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own cart" ON public.cart_items
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete from own cart" ON public.cart_items
    FOR DELETE USING (auth.uid() = user_id);

-- Create function to handle profile creation on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (user_id, email)
    VALUES (NEW.id, NEW.email);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for new user profile
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_dealers_updated_at
    BEFORE UPDATE ON public.dealers
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_equipment_updated_at
    BEFORE UPDATE ON public.user_equipment
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_cart_items_updated_at
    BEFORE UPDATE ON public.cart_items
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();