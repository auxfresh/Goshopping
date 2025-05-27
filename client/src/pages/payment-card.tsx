import { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CreditCard, ArrowLeft } from "lucide-react";

export default function PaymentCardPage() {
  useEffect(() => {
    // Redirect to external card payment processor
    const timer = setTimeout(() => {
      // Replace with your actual card payment processor URL
      window.location.href = "https://payment.example.com/card-payment";
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <CreditCard className="h-16 w-16 text-blue-600" />
            </div>
            <CardTitle className="text-2xl">Card Payment</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-6">
            <div>
              <p className="text-lg text-gray-600 mb-4">
                Redirecting you to our secure payment processor...
              </p>
              <div className="animate-pulse">
                <div className="h-2 bg-blue-200 rounded-full">
                  <div className="h-2 bg-blue-600 rounded-full animate-pulse"></div>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">Secure Payment Processing</h3>
              <p className="text-sm text-gray-600">
                Your payment will be processed securely through our trusted payment partner. 
                All card details are encrypted and secure.
              </p>
            </div>

            <div className="flex justify-center space-x-4">
              <Button 
                variant="outline" 
                onClick={() => window.history.back()}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Go Back
              </Button>
              <Button 
                onClick={() => window.location.href = "https://payment.example.com/card-payment"}
              >
                Continue to Payment
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}