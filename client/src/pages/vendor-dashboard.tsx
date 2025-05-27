import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { 
  Plus, 
  Package, 
  DollarSign, 
  ShoppingBag, 
  TrendingUp, 
  Edit, 
  Trash2,
  Eye,
  MoreHorizontal
} from "lucide-react";
import { Navigation } from "@/components/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";
import { insertProductSchema } from "@shared/schema";
import type { ProductWithDetails, Category, OrderWithDetails } from "@/lib/types";

const productFormSchema = insertProductSchema.extend({
  price: z.string().min(1, "Price is required"),
  salePrice: z.string().optional(),
  stock: z.string().min(1, "Stock quantity is required"),
});

type ProductFormData = z.infer<typeof productFormSchema>;

export default function VendorDashboard() {
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductWithDetails | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Redirect non-vendors
  if (user && !user.isVendor) {
    window.location.href = "/vendor/register";
    return null;
  }

  const { data: vendorProducts, isLoading: productsLoading } = useQuery<ProductWithDetails[]>({
    queryKey: ["/api/vendor/products"],
  });

  const { data: vendorOrders, isLoading: ordersLoading } = useQuery<OrderWithDetails[]>({
    queryKey: ["/api/vendor/orders"],
  });

  const { data: categories } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  const productForm = useForm<ProductFormData>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      name: "",
      description: "",
      price: "",
      salePrice: "",
      imageUrl: "",
      categoryId: undefined,
      stock: "",
    },
  });

  const createProductMutation = useMutation({
    mutationFn: async (data: ProductFormData) => {
      const payload = {
        ...data,
        price: parseFloat(data.price),
        salePrice: data.salePrice ? parseFloat(data.salePrice) : null,
        stock: parseInt(data.stock),
        categoryId: data.categoryId ? parseInt(data.categoryId.toString()) : null,
      };
      return apiRequest("POST", "/api/products", payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/vendor/products"] });
      productForm.reset();
      setIsAddProductOpen(false);
      toast({
        title: "Product created",
        description: "Your product has been successfully created.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create product. Please try again.",
        variant: "destructive",
      });
    },
  });

  const updateProductMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<ProductFormData> }) => {
      const payload = {
        ...data,
        price: data.price ? parseFloat(data.price) : undefined,
        salePrice: data.salePrice ? parseFloat(data.salePrice) : null,
        stock: data.stock ? parseInt(data.stock) : undefined,
        categoryId: data.categoryId ? parseInt(data.categoryId.toString()) : undefined,
      };
      return apiRequest("PATCH", `/api/products/${id}`, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/vendor/products"] });
      setEditingProduct(null);
      toast({
        title: "Product updated",
        description: "Your product has been successfully updated.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update product. Please try again.",
        variant: "destructive",
      });
    },
  });

  const deleteProductMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest("DELETE", `/api/products/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/vendor/products"] });
      toast({
        title: "Product deleted",
        description: "Your product has been successfully deleted.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete product. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ProductFormData) => {
    if (editingProduct) {
      updateProductMutation.mutate({ id: editingProduct.id, data });
    } else {
      createProductMutation.mutate(data);
    }
  };

  const handleEditProduct = (product: ProductWithDetails) => {
    setEditingProduct(product);
    productForm.reset({
      name: product.name,
      description: product.description || "",
      price: product.price,
      salePrice: product.salePrice || "",
      imageUrl: product.imageUrl || "",
      categoryId: product.categoryId?.toString(),
      stock: product.stock?.toString() || "0",
    });
    setIsAddProductOpen(true);
  };

  const handleDeleteProduct = (id: number) => {
    if (confirm("Are you sure you want to delete this product?")) {
      deleteProductMutation.mutate(id);
    }
  };

  // Calculate stats
  const totalProducts = vendorProducts?.length || 0;
  const totalOrders = vendorOrders?.length || 0;
  const totalSales = vendorOrders?.reduce((sum, order) => sum + parseFloat(order.total), 0) || 0;
  const monthlyRevenue = vendorOrders
    ?.filter(order => {
      const orderDate = new Date(order.createdAt);
      const now = new Date();
      return orderDate.getMonth() === now.getMonth() && orderDate.getFullYear() === now.getFullYear();
    })
    ?.reduce((sum, order) => sum + parseFloat(order.total), 0) || 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Vendor Dashboard</h1>
          <p className="text-gray-600">Manage your products, orders, and business analytics</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Sales</p>
                  <p className="text-2xl font-bold text-gray-900">${totalSales.toFixed(2)}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <DollarSign className="h-6 w-6 text-green-600" />
                </div>
              </div>
              <p className="text-sm text-green-600 mt-2">
                +12% from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Orders</p>
                  <p className="text-2xl font-bold text-gray-900">{totalOrders}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <ShoppingBag className="h-6 w-6 text-blue-600" />
                </div>
              </div>
              <p className="text-sm text-blue-600 mt-2">
                +8% from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Products</p>
                  <p className="text-2xl font-bold text-gray-900">{totalProducts}</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Package className="h-6 w-6 text-purple-600" />
                </div>
              </div>
              <p className="text-sm text-purple-600 mt-2">
                Active listings
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Monthly Revenue</p>
                  <p className="text-2xl font-bold text-gray-900">${monthlyRevenue.toFixed(2)}</p>
                </div>
                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
              <p className="text-sm text-yellow-600 mt-2">
                This month
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Product Management */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Products</CardTitle>
                <Dialog open={isAddProductOpen} onOpenChange={setIsAddProductOpen}>
                  <DialogTrigger asChild>
                    <Button onClick={() => {
                      setEditingProduct(null);
                      productForm.reset();
                    }}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Product
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>
                        {editingProduct ? "Edit Product" : "Add New Product"}
                      </DialogTitle>
                    </DialogHeader>
                    <Form {...productForm}>
                      <form onSubmit={productForm.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                          control={productForm.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Product Name</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={productForm.control}
                          name="description"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Description</FormLabel>
                              <FormControl>
                                <Textarea {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={productForm.control}
                            name="price"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Price</FormLabel>
                                <FormControl>
                                  <Input type="number" step="0.01" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={productForm.control}
                            name="salePrice"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Sale Price (Optional)</FormLabel>
                                <FormControl>
                                  <Input type="number" step="0.01" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <FormField
                          control={productForm.control}
                          name="categoryId"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Category</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select a category" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {categories?.map((category) => (
                                    <SelectItem key={category.id} value={category.id.toString()}>
                                      {category.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={productForm.control}
                          name="stock"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Stock Quantity</FormLabel>
                              <FormControl>
                                <Input type="number" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={productForm.control}
                          name="imageUrl"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Image URL (Optional)</FormLabel>
                              <FormControl>
                                <Input type="url" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <div className="flex justify-end space-x-4">
                          <Button 
                            type="button" 
                            variant="outline" 
                            onClick={() => setIsAddProductOpen(false)}
                          >
                            Cancel
                          </Button>
                          <Button 
                            type="submit" 
                            disabled={createProductMutation.isPending || updateProductMutation.isPending}
                          >
                            {createProductMutation.isPending || updateProductMutation.isPending 
                              ? "Saving..." 
                              : editingProduct 
                                ? "Update Product" 
                                : "Add Product"
                            }
                          </Button>
                        </div>
                      </form>
                    </Form>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                {productsLoading ? (
                  <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg">
                        <Skeleton className="w-15 h-15" />
                        <div className="flex-1 space-y-2">
                          <Skeleton className="h-4 w-3/4" />
                          <Skeleton className="h-3 w-1/2" />
                        </div>
                        <Skeleton className="h-8 w-20" />
                      </div>
                    ))}
                  </div>
                ) : vendorProducts && vendorProducts.length > 0 ? (
                  <div className="space-y-4">
                    {vendorProducts.map((product) => (
                      <div key={product.id} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg">
                        <div className="flex-shrink-0">
                          {product.imageUrl ? (
                            <img
                              src={product.imageUrl}
                              alt={product.name}
                              className="w-15 h-15 object-cover rounded"
                            />
                          ) : (
                            <div className="w-15 h-15 bg-gray-200 rounded flex items-center justify-center">
                              <Package className="h-6 w-6 text-gray-400" />
                            </div>
                          )}
                        </div>
                        
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900">{product.name}</h3>
                          <p className="text-sm text-gray-600">
                            ${parseFloat(product.salePrice || product.price).toFixed(2)}
                            {product.salePrice && (
                              <span className="ml-2 text-gray-400 line-through">
                                ${parseFloat(product.price).toFixed(2)}
                              </span>
                            )}
                          </p>
                        </div>
                        
                        <div className="text-right">
                          <p className="text-sm font-medium text-gray-900">
                            {product.stock || 0} in stock
                          </p>
                          <Badge variant={product.isActive ? "default" : "secondary"}>
                            {product.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                        
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEditProduct(product)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleDeleteProduct(product.id)}
                              className="text-red-600"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No products yet</h3>
                    <p className="text-gray-500 mb-4">Start by adding your first product to the marketplace.</p>
                    <Button onClick={() => setIsAddProductOpen(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Your First Product
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Recent Orders */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Recent Orders</CardTitle>
              </CardHeader>
              <CardContent>
                {ordersLoading ? (
                  <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="border-l-4 border-secondary pl-4 py-2">
                        <Skeleton className="h-4 w-24 mb-1" />
                        <Skeleton className="h-3 w-32 mb-1" />
                        <Skeleton className="h-4 w-16" />
                      </div>
                    ))}
                  </div>
                ) : vendorOrders && vendorOrders.length > 0 ? (
                  <div className="space-y-4">
                    {vendorOrders.slice(0, 5).map((order) => (
                      <div key={order.id} className="border-l-4 border-secondary pl-4 py-2">
                        <p className="font-medium text-gray-900">Order #{order.id}</p>
                        <p className="text-sm text-gray-600">Customer order</p>
                        <p className="text-sm font-medium text-secondary">
                          ${parseFloat(order.total).toFixed(2)}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <ShoppingBag className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No orders yet</h3>
                    <p className="text-gray-500">Orders from customers will appear here.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
