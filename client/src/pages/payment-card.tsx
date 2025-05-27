import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CreditCard, ArrowLeft, Lock } from "lucide-react";
import { useCartStore } from "@/lib/cart-store";
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

// Initialize Stripe
if (!import.meta.env.VITE_STRIPE_PUBLIC_KEY) {
  throw new Error('Missing required Stripe key: VITE_STRIPE_PUBLIC_KEY');
}
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

function CheckoutForm() {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const { getTotal, clearCart } = useCartStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);

    try {
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: window.location.origin + "/",
        },
      });

      if (error) {
        toast({
          title: "Payment Failed",
          description: error.message,
          variant: "destructive",
        });
      } else {
        // Payment succeeded
        clearCart();
        toast({
          title: "Payment Successful!",
          description: "Thank you for your purchase. Your order has been confirmed.",
        });
        window.location.href = "/";
      }
    } catch (error) {
      toast({
        title: "Payment Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
        <div className="flex items-center gap-2 mb-2">
          <Lock className="h-4 w-4 text-blue-600" />
          <h3 className="font-semibold text-blue-800">Secure Payment</h3>
        </div>
        <p className="text-sm text-blue-700">
          Your payment information is encrypted and processed securely by Stripe.
        </p>
      </div>

      <PaymentElement />
      
      <div className="flex justify-between items-center pt-4 border-t">
        <Button 
          type="button"
          variant="outline" 
          onClick={() => window.history.back()}
          className="flex items-center gap-2"
          disabled={isProcessing}
        >
          <ArrowLeft className="h-4 w-4" />
          Go Back
        </Button>
        
        <Button 
          type="submit"
          disabled={!stripe || isProcessing}
          className="bg-blue-600 hover:bg-blue-700 min-w-[150px]"
        >
          {isProcessing ? (
            <div className="flex items-center gap-2">
              <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
              Processing...
            </div>
          ) : (
            `Pay $${getTotal().toFixed(2)}`
          )}
        </Button>
      </div>
    </form>
  );
}

export default function PaymentCardPage() {
  const [clientSecret, setClientSecret] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const { getTotal } = useCartStore();
  const { toast } = useToast();

  useEffect(() => {
    const createPaymentIntent = async () => {
      try {
        const response = await apiRequest("POST", "/api/create-payment-intent", {
          amount: getTotal()
        });
        const data = await response.json();
        setClientSecret(data.clientSecret);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to initialize payment. Please try again.",
          variant: "destructive",
        });
        console.error("Error creating payment intent:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (getTotal() > 0) {
      createPaymentIntent();
    } else {
      setIsLoading(false);
    }
  }, [getTotal, toast]);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardContent className="flex items-center justify-center py-12">
              <div className="text-center space-y-4">
                <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto" />
                <p className="text-gray-600">Setting up secure payment...</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!clientSecret) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardContent className="text-center py-12">
              <CreditCard className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">No Items to Pay For</h2>
              <p className="text-gray-600 mb-6">Your cart appears to be empty.</p>
              <Button onClick={() => window.location.href = "/products"}>
                Continue Shopping
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <CreditCard className="h-16 w-16 text-blue-600" />
            </div>
            <CardTitle className="text-2xl">Secure Card Payment</CardTitle>
            <p className="text-gray-600">
              Total: ${getTotal().toFixed(2)}
            </p>
          </CardHeader>
          <CardContent>
            <Elements 
              stripe={stripePromise} 
              options={{ 
                clientSecret,
                appearance: {
                  theme: 'stripe',
                  variables: {
                    colorPrimary: '#2563eb',
                  },
                },
              }}
            >
              <CheckoutForm />
            </Elements>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}