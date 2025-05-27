import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import { Minus, Plus, Trash2, ShoppingBag, ArrowLeft, CreditCard } from "lucide-react";
import { Navigation } from "@/components/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useCartStore } from "@/lib/cart-store";
import type { CartItemWithDetails } from "@/lib/types";

export default function CartPage() {
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { updateQuantity, removeItem, clearCart } = useCartStore();

  const { data: cartItems, isLoading } = useQuery<CartItemWithDetails[]>({
    queryKey: ["/api/cart"],
  });

  const updateQuantityMutation = useMutation({
    mutationFn: async ({ id, quantity }: { id: number; quantity: number }) => {
      return apiRequest("PATCH", `/api/cart/${id}`, { quantity });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update item quantity.",
        variant: "destructive",
      });
    },
  });

  const removeItemMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest("DELETE", `/api/cart/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to remove item from cart.",
        variant: "destructive",
      });
    },
  });

  const clearCartMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("DELETE", "/api/cart");
    },
    onSuccess: () => {
      clearCart();
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
      toast({
        title: "Cart cleared",
        description: "All items have been removed from your cart.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to clear cart.",
        variant: "destructive",
      });
    },
  });

  const handleUpdateQuantity = (id: number, newQuantity: number) => {
    updateQuantity(id, newQuantity);
    updateQuantityMutation.mutate({ id, quantity: newQuantity });
  };

  const handleRemoveItem = (id: number) => {
    removeItem(id);
    removeItemMutation.mutate(id);
  };

  const handleProceedToCheckout = () => {
    setIsCheckingOut(true);
    // In a real app, this would redirect to a payment processor
    setTimeout(() => {
      toast({
        title: "Checkout started",
        description: "You would be redirected to payment processing.",
      });
      setIsCheckingOut(false);
    }, 2000);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <Skeleton className="h-6 w-32" />
                </CardHeader>
                <CardContent className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg">
                      <Skeleton className="w-20 h-20" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-3 w-1/2" />
                        <Skeleton className="h-6 w-1/4" />
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
            <div>
              <Card>
                <CardHeader>
                  <Skeleton className="h-6 w-32" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-32 w-full" />
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const items = cartItems || [];
  const subtotal = items.reduce((total, item) => {
    const price = parseFloat(item.product.salePrice || item.product.price);
    return total + (price * item.quantity);
  }, 0);

  const shipping = subtotal > 50 ? 0 : 9.99;
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-4">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/products">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Continue Shopping
              </Link>
            </Button>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Shopping Cart</h1>
          <p className="text-gray-600 mt-2">
            {items.length} {items.length === 1 ? 'item' : 'items'} in your cart
          </p>
        </div>

        {items.length === 0 ? (
          <div className="text-center py-16">
            <ShoppingBag className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
            <p className="text-gray-600 mb-8">Add some products to get started!</p>
            <Button asChild size="lg">
              <Link href="/products">Browse Products</Link>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Cart Items</CardTitle>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => clearCartMutation.mutate()}
                    disabled={clearCartMutation.isPending}
                  >
                    Clear Cart
                  </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                  {items.map((item) => (
                    <div key={item.id} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg">
                      <div className="flex-shrink-0">
                        {item.product.imageUrl ? (
                          <img
                            src={item.product.imageUrl}
                            alt={item.product.name}
                            className="w-20 h-20 object-cover rounded-lg"
                          />
                        ) : (
                          <div className="w-20 h-20 bg-gray-200 rounded-lg flex items-center justify-center">
                            <ShoppingBag className="h-8 w-8 text-gray-400" />
                          </div>
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 mb-1">{item.product.name}</h3>
                        <p className="text-sm text-gray-600 mb-2">
                          by {item.product.vendor?.firstName} {item.product.vendor?.lastName}
                        </p>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                              disabled={item.quantity <= 1 || updateQuantityMutation.isPending}
                            >
                              <Minus className="h-4 w-4" />
                            </Button>
                            
                            <span className="w-12 text-center font-medium">
                              {item.quantity}
                            </span>
                            
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                              disabled={updateQuantityMutation.isPending}
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                          
                          <div className="flex items-center space-x-4">
                            <div className="text-right">
                              <p className="font-semibold text-gray-900">
                                ${(parseFloat(item.product.salePrice || item.product.price) * item.quantity).toFixed(2)}
                              </p>
                              <p className="text-sm text-gray-600">
                                ${parseFloat(item.product.salePrice || item.product.price).toFixed(2)} each
                              </p>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-gray-400 hover:text-accent"
                              onClick={() => handleRemoveItem(item.id)}
                              disabled={removeItemMutation.isPending}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Order Summary */}
            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Subtotal</span>
                      <span className="font-medium">${subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Shipping</span>
                      <span className="font-medium">
                        {shipping === 0 ? (
                          <span className="text-green-600">Free</span>
                        ) : (
                          `$${shipping.toFixed(2)}`
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Tax</span>
                      <span className="font-medium">${tax.toFixed(2)}</span>
                    </div>
                    
                    {subtotal < 50 && (
                      <div className="p-3 bg-blue-50 rounded-lg">
                        <p className="text-sm text-blue-800">
                          Add ${(50 - subtotal).toFixed(2)} more to get free shipping!
                        </p>
                      </div>
                    )}
                    
                    <Separator />
                    
                    <div className="flex justify-between text-lg font-semibold">
                      <span>Total</span>
                      <span>${total.toFixed(2)}</span>
                    </div>
                  </div>
                  
                  <div className="space-y-3 pt-4">
                    <Button 
                      className="w-full" 
                      size="lg"
                      onClick={handleProceedToCheckout}
                      disabled={isCheckingOut}
                    >
                      {isCheckingOut ? (
                        "Processing..."
                      ) : (
                        <>
                          <CreditCard className="mr-2 h-4 w-4" />
                          Proceed to Checkout
                        </>
                      )}
                    </Button>
                    
                    <Button variant="outline" className="w-full" asChild>
                      <Link href="/products">Continue Shopping</Link>
                    </Button>
                  </div>
                  
                  <div className="pt-4 text-center">
                    <p className="text-xs text-gray-500">
                      Secure checkout powered by industry-standard encryption
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
