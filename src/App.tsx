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

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/splash" element={<SplashScreen />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/auth/phone" element={<PhoneAuthPage />} />
          <Route path="/auth/otp" element={<OTPVerificationPage />} />
          <Route path="/auth/profile-setup" element={<ProfileSetupPage />} />
          <Route path="/auth/email" element={<EmailAuthPage />} />
          <Route path="/auth/dealer" element={<DealerRegistrationPage />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
