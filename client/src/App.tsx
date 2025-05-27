import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import { Footer } from "@/components/footer";
import Landing from "@/pages/landing";
import Login from "@/pages/login";
import Register from "@/pages/register";
import Home from "@/pages/home";
import Products from "@/pages/products";
import Cart from "@/pages/cart";
import Checkout from "@/pages/checkout";
import PaymentCard from "@/pages/payment-card";
import PaymentFlutterwave from "@/pages/payment-flutterwave";
import PaymentBank from "@/pages/payment-bank";
import Profile from "@/pages/profile";
import VendorDashboard from "@/pages/vendor-dashboard";
import VendorRegister from "@/pages/vendor-register";
import AdminDashboard from "@/pages/admin-dashboard";
import NotFound from "@/pages/not-found";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <Switch>
      {isLoading || !isAuthenticated ? (
        <>
          <Route path="/" component={Landing} />
          <Route path="/login" component={Login} />
          <Route path="/register" component={Register} />
        </>
      ) : (
        <>
          <Route path="/" component={Home} />
          <Route path="/products" component={Products} />
          <Route path="/cart" component={Cart} />
          <Route path="/checkout" component={Checkout} />
          <Route path="/payment/card" component={PaymentCard} />
          <Route path="/payment/flutterwave" component={PaymentFlutterwave} />
          <Route path="/payment/bank-transfer" component={PaymentBank} />
          <Route path="/profile" component={Profile} />
          <Route path="/vendor/dashboard" component={VendorDashboard} />
          <Route path="/vendor/register" component={VendorRegister} />
          <Route path="/admin" component={AdminDashboard} />
        </>
      )}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="min-h-screen pb-16">
          <Toaster />
          <Router />
        </div>
        <Footer />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
