import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Navigation } from "@/components/navigation";
import { ProductCard } from "@/components/product-card";
import { ProductModal } from "@/components/product-modal";
import { CartSlider } from "@/components/cart-slider";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Store, Laptop, Shirt, Home, Dumbbell, Book, Gamepad2 } from "lucide-react";
import type { ProductWithDetails, Category } from "@/lib/types";

const categoryIcons = {
  "electronics": Laptop,
  "fashion": Shirt,
  "home": Home,
  "sports": Dumbbell,
  "books": Book,
  "gaming": Gamepad2,
};

export default function HomePage() {
  const [selectedProduct, setSelectedProduct] = useState<ProductWithDetails | null>(null);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);

  const { data: categories, isLoading: categoriesLoading } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  const { data: featuredProducts, isLoading: productsLoading } = useQuery<ProductWithDetails[]>({
    queryKey: ["/api/products/featured"],
  });

  const handleProductClick = (product: ProductWithDetails) => {
    setSelectedProduct(product);
    setIsProductModalOpen(true);
  };

  const handleCloseProductModal = () => {
    setIsProductModalOpen(false);
    setSelectedProduct(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <CartSlider />

      {/* Hero Section */}
      <section className="hero-gradient text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl lg:text-5xl font-bold mb-6">
                Discover Amazing Products
              </h2>
              <p className="text-xl mb-8 text-blue-100">
                Shop from thousands of vendors and find exactly what you're looking for 
                with our curated marketplace.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button asChild size="lg" className="bg-white text-primary hover:bg-gray-100">
                  <Link href="/products">Shop Now</Link>
                </Button>
                <Button 
                  asChild 
                  variant="outline" 
                  size="lg" 
                  className="border-white text-white hover:bg-white hover:text-primary"
                >
                  <Link href="/vendor/register">Become a Vendor</Link>
                </Button>
              </div>
            </div>
            <div className="relative">
              <div className="w-full h-96 bg-white bg-opacity-10 rounded-2xl backdrop-blur-sm flex items-center justify-center">
                <div className="text-center">
                  <Store className="h-24 w-24 text-white opacity-50 mx-auto mb-4" />
                  <p className="text-white text-lg">Premium Shopping Experience</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Category Navigation */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center space-x-8 py-4 overflow-x-auto">
            {categoriesLoading ? (
              // Loading skeletons
              [...Array(6)].map((_, i) => (
                <Skeleton key={i} className="h-6 w-24 flex-shrink-0" />
              ))
            ) : (
              categories?.map((category) => {
                const IconComponent = categoryIcons[category.slug as keyof typeof categoryIcons] || Store;
                return (
                  <Link
                    key={category.id}
                    href={`/products?category=${category.id}`}
                    className="flex-shrink-0 text-gray-700 hover:text-primary transition-colors font-medium flex items-center space-x-2"
                  >
                    <IconComponent className="h-4 w-4" />
                    <span>{category.name}</span>
                  </Link>
                );
              })
            )}
          </div>
        </div>
      </nav>

      {/* Featured Products */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Featured Products</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Discover our handpicked selection of the best products from trusted vendors
            </p>
          </div>

          {productsLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-white rounded-xl shadow-sm overflow-hidden">
                  <Skeleton className="w-full h-48" />
                  <div className="p-4 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                    <Skeleton className="h-6 w-1/3" />
                    <Skeleton className="h-8 w-full" />
                  </div>
                </div>
              ))}
            </div>
          ) : featuredProducts && featuredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onProductClick={handleProductClick}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Store className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No featured products yet</h3>
              <p className="text-gray-500">Check back later for amazing deals and products!</p>
            </div>
          )}

          <div className="text-center mt-12">
            <Button asChild variant="outline" size="lg">
              <Link href="/products">View All Products</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Vendor Section */}
      <section className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="vendor-gradient rounded-2xl p-8 lg:p-12 text-white">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <div>
                <h2 className="text-3xl lg:text-4xl font-bold mb-4">Start Selling Today</h2>
                <p className="text-emerald-100 text-lg mb-6">
                  Join thousands of successful vendors on our platform. Easy setup, 
                  powerful tools, and a global customer base.
                </p>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-emerald-200 rounded-full mr-3"></div>
                    <span>Easy product management dashboard</span>
                  </li>
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-emerald-200 rounded-full mr-3"></div>
                    <span>Secure payment processing</span>
                  </li>
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-emerald-200 rounded-full mr-3"></div>
                    <span>Marketing and analytics tools</span>
                  </li>
                </ul>
                <Button asChild size="lg" className="bg-white text-secondary hover:bg-gray-100">
                  <Link href="/vendor/register">Register as Vendor</Link>
                </Button>
              </div>
              <div className="relative">
                <div className="w-full h-64 bg-white bg-opacity-10 rounded-xl backdrop-blur-sm flex items-center justify-center">
                  <div className="text-center">
                    <Store className="h-16 w-16 text-white opacity-50 mx-auto mb-4" />
                    <p className="text-white">Vendor Dashboard Preview</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">ShopCraft</h3>
              <p className="text-gray-400 mb-4">
                Your trusted marketplace for quality products from verified vendors worldwide.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/" className="hover:text-white">Home</Link></li>
                <li><Link href="/products" className="hover:text-white">Products</Link></li>
                <li><a href="#" className="hover:text-white">About Us</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">For Vendors</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/vendor/register" className="hover:text-white">Sell on ShopCraft</Link></li>
                <li><a href="#" className="hover:text-white">Vendor Guidelines</a></li>
                <li><a href="#" className="hover:text-white">Support</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Customer Service</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">Contact Us</a></li>
                <li><a href="#" className="hover:text-white">FAQ</a></li>
                <li><a href="#" className="hover:text-white">Shipping Info</a></li>
                <li><a href="#" className="hover:text-white">Returns</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 ShopCraft. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Product Modal */}
      <ProductModal
        product={selectedProduct}
        isOpen={isProductModalOpen}
        onClose={handleCloseProductModal}
      />
    </div>
  );
}
