import { Button } from "@/components/ui/button";
import { ShoppingBag, Store, Star, Users } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <h1 className="text-2xl font-bold text-primary">Goshopping</h1>
            <Button asChild>
              <a href="/login">Sign In</a>
            </Button>
          </div>
        </div>
      </header>

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
                  <a href="/login">Shop Now</a>
                </Button>
                <Button 
                  asChild 
                  variant="outline" 
                  size="lg" 
                  className="border-white text-white hover:bg-white hover:text-primary"
                >
                  <a href="/register">Become a Vendor</a>
                </Button>
              </div>
            </div>
            <div className="relative">
              <div className="w-full h-96 bg-white bg-opacity-10 rounded-2xl backdrop-blur-sm flex items-center justify-center">
                <div className="text-center">
                  <ShoppingBag className="h-24 w-24 text-white opacity-50 mx-auto mb-4" />
                  <p className="text-white text-lg">Premium Shopping Experience</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Why Choose ShopCraft?
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Experience the best online shopping with our innovative features and trusted vendors
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Store className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Trusted Vendors
              </h3>
              <p className="text-gray-600">
                All our vendors are verified and rated by our community to ensure quality and reliability.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="h-8 w-8 text-secondary" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Quality Products
              </h3>
              <p className="text-gray-600">
                Discover high-quality products across multiple categories with detailed reviews and ratings.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-accent" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Community Driven
              </h3>
              <p className="text-gray-600">
                Join a vibrant community of shoppers and vendors working together for the best experience.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Vendor CTA Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="vendor-gradient rounded-2xl p-8 lg:p-12 text-white">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <div>
                <h2 className="text-3xl lg:text-4xl font-bold mb-4">
                  Start Selling Today
                </h2>
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
                  <a href="/api/login">Register as Vendor</a>
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
      <footer className="bg-gray-900 text-white">
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
                <li><a href="#" className="hover:text-white">Home</a></li>
                <li><a href="#" className="hover:text-white">Products</a></li>
                <li><a href="#" className="hover:text-white">Categories</a></li>
                <li><a href="#" className="hover:text-white">About Us</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">For Vendors</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">Sell on ShopCraft</a></li>
                <li><a href="#" className="hover:text-white">Vendor Guidelines</a></li>
                <li><a href="#" className="hover:text-white">Support</a></li>
                <li><a href="#" className="hover:text-white">Resources</a></li>
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
    </div>
  );
}
