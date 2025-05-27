import { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Smartphone, ArrowLeft } from "lucide-react";

export default function PaymentFlutterwavePage() {
  useEffect(() => {
    // Redirect to Flutterwave checkout
    const timer = setTimeout(() => {
      // Replace with your actual Flutterwave checkout URL
      window.location.href = "https://checkout.flutterwave.com/pay";
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <Smartphone className="h-16 w-16 text-orange-600" />
            </div>
            <CardTitle className="text-2xl">Flutterwave Payment</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-6">
            <div>
              <p className="text-lg text-gray-600 mb-4">
                Redirecting you to Flutterwave secure checkout...
              </p>
              <div className="animate-pulse">
                <div className="h-2 bg-orange-200 rounded-full">
                  <div className="h-2 bg-orange-600 rounded-full animate-pulse"></div>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">Multiple Payment Options</h3>
              <p className="text-sm text-gray-600 mb-3">
                Pay with your preferred method through Flutterwave:
              </p>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>• Debit/Credit Cards</div>
                <div>• Mobile Money</div>
                <div>• Bank Transfer</div>
                <div>• USSD</div>
              </div>
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
                onClick={() => window.location.href = "https://checkout.flutterwave.com/pay"}
                className="bg-orange-600 hover:bg-orange-700"
              >
                Continue to Flutterwave
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}