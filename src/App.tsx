import { useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import SplashScreen from "./pages/SplashScreen";
import AuthPage from "./pages/auth/AuthPage";
import PhoneAuthPage from "./pages/auth/PhoneAuthPage";
import OTPVerificationPage from "./pages/auth/OTPVerificationPage";
import ProfileSetupPage from "./pages/auth/ProfileSetupPage";
import EmailAuthPage from "./pages/auth/EmailAuthPage";
import DealerRegistrationPage from "./pages/auth/DealerRegistrationPage";
import CartPage from "./pages/CartPage";
import CheckoutPage from "./pages/CheckoutPage";
import OrderConfirmationPage from "./pages/OrderConfirmationPage";
import MyOrdersPage from "./pages/MyOrdersPage";
import OrderDetailsPage from "./pages/OrderDetailsPage";
import MyMachinesPage from "./pages/MyMachinesPage";
import AddMachinePage from "./pages/AddMachinePage";
import MachineDetailsPage from "./pages/MachineDetailsPage";
import CategoriesPage from "./pages/CategoriesPage";
import CategoryProductsPage from "./pages/CategoryProductsPage";
import ProductDetailsPage from "./pages/ProductDetailsPage";
import AccountPage from "./pages/AccountPage";

const queryClient = new QueryClient();

interface CartItem {
  productId: string;
  quantity: number;
}

const App = () => {
  const [cart, setCart] = useState<CartItem[]>([]);

  const handleAddToCart = (productId: string) => {
    setCart(prev => {
      const existing = prev.find(item => item.productId === productId);
      if (existing) {
        return prev.map(item => 
          item.productId === productId 
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { productId, quantity: 1 }];
    });
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index cart={cart} setCart={setCart} onAddToCart={handleAddToCart} />} />
            <Route path="/splash" element={<SplashScreen />} />
            
            {/* Auth Routes */}
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/auth/phone" element={<PhoneAuthPage />} />
            <Route path="/auth/otp" element={<OTPVerificationPage />} />
            <Route path="/auth/profile-setup" element={<ProfileSetupPage />} />
            <Route path="/auth/email" element={<EmailAuthPage />} />
            <Route path="/auth/dealer" element={<DealerRegistrationPage />} />
            
            {/* Cart & Checkout Routes */}
            <Route path="/cart" element={<CartPage cart={cart} setCart={setCart} />} />
            <Route path="/checkout" element={<CheckoutPage cart={cart} setCart={setCart} />} />
            <Route path="/order-confirmation/:orderId" element={<OrderConfirmationPage />} />
            
            {/* Orders Routes */}
            <Route path="/orders" element={<MyOrdersPage />} />
            <Route path="/orders/:orderId" element={<OrderDetailsPage />} />
            
            {/* Machines Routes */}
            <Route path="/machines" element={<MyMachinesPage />} />
            <Route path="/machines/add" element={<AddMachinePage />} />
            <Route path="/machines/:machineId" element={<MachineDetailsPage />} />
            
            {/* Categories & Products Routes */}
            <Route path="/categories" element={<CategoriesPage />} />
            <Route path="/categories/:categoryId" element={<CategoryProductsPage onAddToCart={handleAddToCart} />} />
            <Route path="/products/:productId" element={<ProductDetailsPage onAddToCart={handleAddToCart} />} />
            
            {/* Account Routes */}
            <Route path="/account" element={<AccountPage />} />
            
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
