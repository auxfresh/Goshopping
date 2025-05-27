import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Navigation } from "@/components/navigation";
import { ProductCard } from "@/components/product-card";
import { ProductModal } from "@/components/product-modal";
import { CartSlider } from "@/components/cart-slider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, SortAsc, Package } from "lucide-react";
import type { ProductWithDetails, Category } from "@/lib/types";

export default function ProductsPage() {
  const [location] = useLocation();
  const [selectedProduct, setSelectedProduct] = useState<ProductWithDetails | null>(null);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [sortBy, setSortBy] = useState("newest");
  
  // Parse URL parameters
  useEffect(() => {
    const urlParams = new URLSearchParams(location.split('?')[1] || '');
    const search = urlParams.get('search');
    const category = urlParams.get('category');
    
    if (search) setSearchQuery(search);
    if (category) setSelectedCategory(category);
  }, [location]);

  const { data: categories } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  const { data: products, isLoading: productsLoading } = useQuery<ProductWithDetails[]>({
    queryKey: ["/api/products", { 
      search: searchQuery || undefined,
      category: selectedCategory || undefined 
    }],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchQuery) params.append('search', searchQuery);
      if (selectedCategory) params.append('category', selectedCategory);
      
      const response = await fetch(`/api/products?${params.toString()}`, {
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }
      
      return response.json();
    },
  });

  const handleProductClick = (product: ProductWithDetails) => {
    setSelectedProduct(product);
    setIsProductModalOpen(true);
  };

  const handleCloseProductModal = () => {
    setIsProductModalOpen(false);
    setSelectedProduct(null);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Update URL with search params
    const params = new URLSearchParams();
    if (searchQuery) params.append('search', searchQuery);
    if (selectedCategory) params.append('category', selectedCategory);
    
    window.history.pushState({}, '', `/products${params.toString() ? '?' + params.toString() : ''}`);
  };

  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategory(categoryId);
    const params = new URLSearchParams();
    if (searchQuery) params.append('search', searchQuery);
    if (categoryId) params.append('category', categoryId);
    
    window.history.pushState({}, '', `/products${params.toString() ? '?' + params.toString() : ''}`);
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCategory("");
    window.history.pushState({}, '', '/products');
  };

  // Sort products
  const sortedProducts = products ? [...products].sort((a, b) => {
    switch (sortBy) {
      case 'price-low':
        return parseFloat(a.salePrice || a.price) - parseFloat(b.salePrice || b.price);
      case 'price-high':
        return parseFloat(b.salePrice || b.price) - parseFloat(a.salePrice || a.price);
      case 'rating':
        return parseFloat(b.rating || "0") - parseFloat(a.rating || "0");
      case 'newest':
      default:
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
  }) : [];

  const activeFiltersCount = [searchQuery, selectedCategory].filter(Boolean).length;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <CartSlider />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Products</h1>
          
          {/* Search and Filters */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <form onSubmit={handleSearch} className="mb-4">
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              </div>
            </form>
            
            <div className="flex flex-wrap gap-4 items-center">
              <div className="flex items-center space-x-2">
                <Filter className="h-4 w-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">Filters:</span>
              </div>
              
              <Select value={selectedCategory} onValueChange={handleCategoryChange}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Categories</SelectItem>
                  {categories?.map((category) => (
                    <SelectItem key={category.id} value={category.id.toString()}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="price-low">Price: Low to High</SelectItem>
                  <SelectItem value="price-high">Price: High to Low</SelectItem>
                  <SelectItem value="rating">Highest Rated</SelectItem>
                </SelectContent>
              </Select>
              
              {activeFiltersCount > 0 && (
                <div className="flex items-center space-x-2">
                  <Badge variant="secondary">
                    {activeFiltersCount} filter{activeFiltersCount > 1 ? 's' : ''} active
                  </Badge>
                  <Button variant="outline" size="sm" onClick={clearFilters}>
                    Clear All
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Products Grid */}
        {productsLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(12)].map((_, i) => (
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
        ) : sortedProducts.length > 0 ? (
          <>
            <div className="mb-6 flex justify-between items-center">
              <p className="text-gray-600">
                Showing {sortedProducts.length} product{sortedProducts.length !== 1 ? 's' : ''}
                {searchQuery && ` for "${searchQuery}"`}
              </p>
              <div className="flex items-center space-x-2">
                <SortAsc className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-700">Sort by: {
                  sortBy === 'newest' ? 'Newest First' :
                  sortBy === 'price-low' ? 'Price: Low to High' :
                  sortBy === 'price-high' ? 'Price: High to Low' :
                  'Highest Rated'
                }</span>
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {sortedProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onProductClick={handleProductClick}
                />
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No products found
            </h3>
            <p className="text-gray-500 mb-4">
              {searchQuery || selectedCategory 
                ? "Try adjusting your search or filters to find what you're looking for."
                : "No products are available at the moment."
              }
            </p>
            {(searchQuery || selectedCategory) && (
              <Button onClick={clearFilters}>
                Clear filters
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Product Modal */}
      <ProductModal
        product={selectedProduct}
        isOpen={isProductModalOpen}
        onClose={handleCloseProductModal}
      />
    </div>
  );
}
