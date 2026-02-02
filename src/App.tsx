import { useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import CartPage from "./pages/CartPage";
import CheckoutPage from "./pages/CheckoutPage";
import OrderConfirmationPage from "./pages/OrderConfirmationPage";
import MyOrdersPage from "./pages/MyOrdersPage";
import OrderDetailsPage from "./pages/OrderDetailsPage";
import OrderTrackingPage from "./pages/OrderTrackingPage";
import MyMachinesPage from "./pages/MyMachinesPage";
import AddMachinePage from "./pages/AddMachinePage";
import MachineDetailsPage from "./pages/MachineDetailsPage";
import CategoriesPage from "./pages/CategoriesPage";
import CategoryProductsPage from "./pages/CategoryProductsPage";
import ProductDetailsPage from "./pages/ProductDetailsPage";
import AccountPage from "./pages/AccountPage";
import WishlistPage from "./pages/WishlistPage";
// Dealer Portal
import DealerDashboard from "./pages/dealer/DealerDashboard";
import DealerOrders from "./pages/dealer/DealerOrders";
import DealerInventory from "./pages/dealer/DealerInventory";
import DealerAnalytics from "./pages/dealer/DealerAnalytics";
import DealerOffers from "./pages/dealer/DealerOffers";
import DealerCustomers from "./pages/dealer/DealerCustomers";
import DealerServiceQueue from "./pages/dealer/DealerServiceQueue";
import DealerCalendar from "./pages/dealer/DealerCalendar";
import DealerQuotes from "./pages/dealer/DealerQuotes";
import DealerTechnicians from "./pages/dealer/DealerTechnicians";
// Customer Modules
import MaintenanceDashboard from "./pages/maintenance/MaintenanceDashboard";
import MaintenanceTaskDetail from "./pages/maintenance/MaintenanceTaskDetail";
import ScheduleMaintenance from "./pages/maintenance/ScheduleMaintenance";
import ServiceRequestPage from "./pages/service/ServiceRequestPage";
import ServiceRequestsList from "./pages/service/ServiceRequestsList";
import LoyaltyDashboard from "./pages/loyalty/LoyaltyDashboard";
import FleetAnalytics from "./pages/analytics/FleetAnalytics";

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
            
            {/* Cart & Checkout Routes */}
            <Route path="/cart" element={<CartPage cart={cart} setCart={setCart} />} />
            <Route path="/checkout" element={<CheckoutPage cart={cart} setCart={setCart} />} />
            <Route path="/order-confirmation/:orderId" element={<OrderConfirmationPage />} />
            
            {/* Orders Routes */}
            <Route path="/orders" element={<MyOrdersPage />} />
            <Route path="/orders/:orderId" element={<OrderDetailsPage />} />
            <Route path="/orders/:orderId/track" element={<OrderTrackingPage />} />
            
            {/* Wishlist */}
            <Route path="/wishlist" element={<WishlistPage onAddToCart={handleAddToCart} />} />
            
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
            
            {/* Dealer Routes */}
            <Route path="/dealer" element={<DealerDashboard />} />
            <Route path="/dealer/orders" element={<DealerOrders />} />
            <Route path="/dealer/inventory" element={<DealerInventory />} />
            <Route path="/dealer/analytics" element={<DealerAnalytics />} />
            <Route path="/dealer/offers" element={<DealerOffers />} />
            <Route path="/dealer/customers" element={<DealerCustomers />} />
            <Route path="/dealer/service" element={<DealerServiceQueue />} />
            <Route path="/dealer/calendar" element={<DealerCalendar />} />
            <Route path="/dealer/quotes" element={<DealerQuotes />} />
            <Route path="/dealer/technicians" element={<DealerTechnicians />} />
            
            {/* Maintenance Routes */}
            <Route path="/maintenance" element={<MaintenanceDashboard />} />
            <Route path="/maintenance/:id" element={<MaintenanceTaskDetail />} />
            <Route path="/maintenance/:id/schedule" element={<ScheduleMaintenance />} />
            
            {/* Service Request Routes */}
            <Route path="/service/requests" element={<ServiceRequestsList />} />
            <Route path="/service/new" element={<ServiceRequestPage />} />
            
            {/* Loyalty Routes */}
            <Route path="/loyalty" element={<LoyaltyDashboard />} />
            
            {/* Analytics Routes */}
            <Route path="/analytics" element={<FleetAnalytics />} />
            
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
