import { useState } from "react";
import { X, Minus, Plus, Heart, ShoppingCart, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useCartStore } from "@/lib/cart-store";
import type { ProductWithDetails } from "@/lib/types";

interface ProductModalProps {
  product: ProductWithDetails | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ProductModal({ product, isOpen, onClose }: ProductModalProps) {
  const [quantity, setQuantity] = useState(1);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { addItem } = useCartStore();

  const addToCartMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", "/api/cart", {
        productId: product!.id,
        quantity,
      });
    },
    onSuccess: () => {
      // Add to local cart store
      if (product) {
        addItem({
          id: Date.now(),
          userId: "",
          productId: product.id,
          quantity,
          createdAt: new Date(),
          product: product,
        });
      }
      
      toast({
        title: "Added to cart",
        description: `${quantity} x ${product?.name} has been added to your cart.`,
      });
      
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
      onClose();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add item to cart. Please try again.",
        variant: "destructive",
      });
    },
  });

  if (!product) return null;

  const currentPrice = product.salePrice || product.price;
  const originalPrice = product.salePrice ? product.price : null;
  const discountPercent = originalPrice 
    ? Math.round(((parseFloat(originalPrice) - parseFloat(currentPrice)) / parseFloat(originalPrice)) * 100)
    : 0;

  const rating = parseFloat(product.rating || "0");
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 !== 0;

  // Get product images (main image + additional images from imageUrls)
  const images = [product.imageUrl, ...(product.imageUrls as string[] || [])].filter(Boolean);

  const handleAddToCart = () => {
    addToCartMutation.mutate();
  };

  const incrementQuantity = () => {
    if (quantity < (product.stock || 0)) {
      setQuantity(quantity + 1);
    }
  };

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="aspect-square overflow-hidden rounded-lg bg-gray-100">
              {images[selectedImageIndex] ? (
                <img
                  src={images[selectedImageIndex]}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="text-gray-400 text-center">
                    <ShoppingCart className="h-16 w-16 mx-auto mb-2" />
                    <p>No Image Available</p>
                  </div>
                </div>
              )}
            </div>
            
            {/* Thumbnail Gallery */}
            {images.length > 1 && (
              <div className="flex space-x-2 overflow-x-auto">
                {images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`flex-shrink-0 w-16 h-16 rounded border-2 overflow-hidden ${
                      selectedImageIndex === index ? "border-primary" : "border-gray-200"
                    }`}
                  >
                    <img
                      src={image}
                      alt={`${product.name} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Details */}
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                {product.name}
              </h1>
              <p className="text-sm text-gray-600 mb-4">
                by {product.vendor?.firstName} {product.vendor?.lastName}
              </p>
              
              {/* Rating */}
              <div className="flex items-center space-x-2 mb-4">
                <div className="flex items-center star-rating">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${
                        i < fullStars
                          ? "fill-current"
                          : i === fullStars && hasHalfStar
                          ? "fill-current opacity-50"
                          : "text-gray-300"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm text-gray-600">
                  {rating.toFixed(1)} ({product.reviewCount || 0} reviews)
                </span>
              </div>
            </div>

            {/* Price */}
            <div className="space-y-2">
              <div className="flex items-center space-x-4">
                <span className="text-3xl font-bold text-gray-900">
                  ${parseFloat(currentPrice).toFixed(2)}
                </span>
                {originalPrice && (
                  <span className="text-xl text-gray-500 line-through">
                    ${parseFloat(originalPrice).toFixed(2)}
                  </span>
                )}
                {discountPercent > 0 && (
                  <Badge variant="destructive">
                    {discountPercent}% OFF
                  </Badge>
                )}
              </div>
              
              {product.description && (
                <p className="text-gray-600 leading-relaxed">
                  {product.description}
                </p>
              )}
            </div>

            {/* Stock Status */}
            <div>
              {product.stock && product.stock > 0 ? (
                <p className="text-sm text-green-600">
                  ✓ In stock ({product.stock} available)
                </p>
              ) : (
                <p className="text-sm text-red-600">
                  ✗ Out of stock
                </p>
              )}
            </div>

            <Separator />

            {/* Quantity Selection */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quantity
                </label>
                <div className="flex items-center space-x-3">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={decrementQuantity}
                    disabled={quantity <= 1}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="w-12 text-center font-medium">
                    {quantity}
                  </span>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={incrementQuantity}
                    disabled={quantity >= (product.stock || 0)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <Button
                className="w-full"
                size="lg"
                onClick={handleAddToCart}
                disabled={addToCartMutation.isPending || product.stock === 0}
              >
                {addToCartMutation.isPending ? (
                  "Adding to Cart..."
                ) : product.stock === 0 ? (
                  "Out of Stock"
                ) : (
                  <>
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    Add to Cart
                  </>
                )}
              </Button>
              
              <Button variant="outline" className="w-full" size="lg">
                <Heart className="mr-2 h-4 w-4" />
                Add to Wishlist
              </Button>
            </div>

            {/* Product Features */}
            {product.category && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Category</h3>
                <Badge variant="secondary">{product.category.name}</Badge>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
