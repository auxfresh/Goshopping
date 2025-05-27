import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import { Store, CheckCircle, ArrowLeft } from "lucide-react";
import { Navigation } from "@/components/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";

export default function VendorRegister() {
  const [isRegistering, setIsRegistering] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // If already a vendor, redirect to dashboard
  if (user?.isVendor) {
    window.location.href = "/vendor/dashboard";
    return null;
  }

  const becomeVendorMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", "/api/users/become-vendor");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      toast({
        title: "Welcome to the vendor program!",
        description: "You can now start selling products on ShopCraft.",
      });
      // Redirect to vendor dashboard
      setTimeout(() => {
        window.location.href = "/vendor/dashboard";
      }, 2000);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to register as vendor. Please try again.",
        variant: "destructive",
      });
      setIsRegistering(false);
    },
  });

  const handleRegister = () => {
    setIsRegistering(true);
    becomeVendorMutation.mutate();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <div className="mb-8">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Link>
          </Button>
        </div>

        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="w-20 h-20 vendor-gradient rounded-full flex items-center justify-center mx-auto mb-6">
            <Store className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Become a ShopCraft Vendor
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Join thousands of successful vendors on our platform. Easy setup, 
            powerful tools, and a global customer base.
          </p>
        </div>

        {/* Benefits Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <Card>
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Store className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Easy Setup
              </h3>
              <p className="text-gray-600">
                Get started in minutes with our intuitive vendor dashboard and product management tools.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-6 w-6 text-secondary" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Secure Payments
              </h3>
              <p className="text-gray-600">
                Secure payment processing with fast payouts and detailed transaction tracking.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-6 w-6 text-accent" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Global Reach
              </h3>
              <p className="text-gray-600">
                Access customers worldwide with our international shipping and marketing support.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Features List */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle className="text-center">What You Get as a Vendor</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <ul className="space-y-4">
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-secondary mr-3" />
                  <span>Product management dashboard</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-secondary mr-3" />
                  <span>Order tracking and management</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-secondary mr-3" />
                  <span>Sales analytics and reporting</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-secondary mr-3" />
                  <span>Customer communication tools</span>
                </li>
              </ul>
              <ul className="space-y-4">
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-secondary mr-3" />
                  <span>Marketing and promotion tools</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-secondary mr-3" />
                  <span>Inventory management system</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-secondary mr-3" />
                  <span>24/7 vendor support</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-secondary mr-3" />
                  <span>Competitive fee structure</span>
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Registration Card */}
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle className="text-center">Ready to Start Selling?</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            {user ? (
              <div className="space-y-6">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>Account:</strong> {user.firstName} {user.lastName}<br />
                    <strong>Email:</strong> {user.email}
                  </p>
                </div>
                
                <div className="space-y-4">
                  <p className="text-gray-600">
                    By becoming a vendor, you agree to our terms of service and vendor guidelines.
                  </p>
                  
                  <Button 
                    className="w-full" 
                    size="lg"
                    onClick={handleRegister}
                    disabled={isRegistering || becomeVendorMutation.isPending}
                  >
                    {isRegistering || becomeVendorMutation.isPending ? (
                      "Registering..."
                    ) : (
                      "Become a Vendor"
                    )}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-gray-600">
                  You need to sign in to become a vendor.
                </p>
                <Button asChild size="lg" className="w-full">
                  <a href="/api/login">Sign In to Continue</a>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* FAQ Section */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">
            Frequently Asked Questions
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">
                How much does it cost to become a vendor?
              </h3>
              <p className="text-gray-600 mb-4">
                It's free to become a vendor on ShopCraft. We only charge a small commission on successful sales.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">
                How long does vendor approval take?
              </h3>
              <p className="text-gray-600 mb-4">
                Vendor registration is instant! You can start adding products immediately after signing up.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">
                What products can I sell?
              </h3>
              <p className="text-gray-600 mb-4">
                You can sell most legal products. Check our vendor guidelines for specific restrictions and policies.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">
                How do I get paid?
              </h3>
              <p className="text-gray-600 mb-4">
                Payments are processed weekly to your connected bank account or digital wallet.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
