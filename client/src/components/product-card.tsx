import { useState } from "react";
import { ShoppingCart, Heart, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useCartStore } from "@/lib/cart-store";
import type { ProductWithDetails } from "@/lib/types";

interface ProductCardProps {
  product: ProductWithDetails;
  onProductClick?: (product: ProductWithDetails) => void;
}

export function ProductCard({ product, onProductClick }: ProductCardProps) {
  const [imageError, setImageError] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { addItem } = useCartStore();

  const addToCartMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", "/api/cart", {
        productId: product.id,
        quantity: 1,
      });
    },
    onSuccess: () => {
      // Add to local cart store immediately for better UX
      addItem({
        id: Date.now(), // Temporary ID
        userId: "", // Will be filled by server
        productId: product.id,
        quantity: 1,
        createdAt: new Date(),
        product: product,
      });
      
      toast({
        title: "Added to cart",
        description: `${product.name} has been added to your cart.`,
      });
      
      // Invalidate cart query to sync with server
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to add item to cart. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCartMutation.mutate();
  };

  const handleProductClick = () => {
    if (onProductClick) {
      onProductClick(product);
    }
  };

  const currentPrice = product.salePrice || product.price;
  const originalPrice = product.salePrice ? product.price : null;
  const discountPercent = originalPrice 
    ? Math.round(((parseFloat(originalPrice) - parseFloat(currentPrice)) / parseFloat(originalPrice)) * 100)
    : 0;

  const rating = parseFloat(product.rating || "0");
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 !== 0;

  return (
    <Card className="product-card overflow-hidden group cursor-pointer hover:shadow-lg transition-all duration-300">
      <div className="relative" onClick={handleProductClick}>
        <div className="aspect-square overflow-hidden">
          {!imageError && product.imageUrl ? (
            <img
              src={product.imageUrl}
              alt={product.name}
              className="product-image w-full h-full object-cover"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
              <div className="text-gray-400 text-center">
                <ShoppingCart className="h-12 w-12 mx-auto mb-2" />
                <p className="text-sm">No Image</p>
              </div>
            </div>
          )}
        </div>
        
        {/* Discount Badge */}
        {discountPercent > 0 && (
          <Badge className="absolute top-3 left-3 bg-accent text-accent-foreground">
            {discountPercent}% OFF
          </Badge>
        )}
        
        {/* Wishlist Button */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-3 right-3 bg-white/80 hover:bg-white opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={(e) => e.stopPropagation()}
        >
          <Heart className="h-4 w-4" />
        </Button>
      </div>
      
      <CardContent className="p-4">
        <div className="space-y-2">
          <h3 className="font-semibold text-gray-900 line-clamp-2" title={product.name}>
            {product.name}
          </h3>
          
          <p className="text-sm text-gray-600">
            by {product.vendor?.firstName || "Unknown"} {product.vendor?.lastName || "Vendor"}
          </p>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-lg font-bold text-gray-900">
                ${parseFloat(currentPrice).toFixed(2)}
              </span>
              {originalPrice && (
                <span className="text-sm text-gray-500 line-through">
                  ${parseFloat(originalPrice).toFixed(2)}
                </span>
              )}
            </div>
            
            <div className="flex items-center space-x-1">
              <div className="flex items-center star-rating">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-3 w-3 ${
                      i < fullStars
                        ? "fill-current"
                        : i === fullStars && hasHalfStar
                        ? "fill-current opacity-50"
                        : "text-gray-300"
                    }`}
                  />
                ))}
              </div>
              <span className="text-xs text-gray-500">
                ({product.reviewCount || 0})
              </span>
            </div>
          </div>
          
          <Button
            className="w-full"
            onClick={handleAddToCart}
            disabled={addToCartMutation.isPending || product.stock === 0}
          >
            {addToCartMutation.isPending ? (
              "Adding..."
            ) : product.stock === 0 ? (
              "Out of Stock"
            ) : (
              <>
                <ShoppingCart className="mr-2 h-4 w-4" />
                Add to Cart
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
