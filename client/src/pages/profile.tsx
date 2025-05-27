import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { User, Package, MapPin, Settings } from "lucide-react";
import { Navigation } from "@/components/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";
import type { User as UserType, OrderWithDetails, Address } from "@/lib/types";

const profileSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
});

const addressSchema = z.object({
  name: z.string().min(1, "Name is required"),
  street: z.string().min(1, "Street address is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  zipCode: z.string().min(1, "ZIP code is required"),
  country: z.string().min(1, "Country is required"),
  isDefault: z.boolean().default(false),
});

type ProfileFormData = z.infer<typeof profileSchema>;
type AddressFormData = z.infer<typeof addressSchema>;

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState("profile");
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: orders, isLoading: ordersLoading } = useQuery<OrderWithDetails[]>({
    queryKey: ["/api/orders"],
  });

  const { data: addresses, isLoading: addressesLoading } = useQuery<Address[]>({
    queryKey: ["/api/addresses"],
  });

  const profileForm = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      email: user?.email || "",
      phone: user?.phone || "",
    },
  });

  const addressForm = useForm<AddressFormData>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      name: "",
      street: "",
      city: "",
      state: "",
      zipCode: "",
      country: "United States",
      isDefault: false,
    },
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (data: ProfileFormData) => {
      return apiRequest("PATCH", "/api/users/profile", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      toast({
        title: "Profile updated",
        description: "Your profile has been successfully updated.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    },
  });

  const addAddressMutation = useMutation({
    mutationFn: async (data: AddressFormData) => {
      return apiRequest("POST", "/api/addresses", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/addresses"] });
      addressForm.reset();
      setIsAddingAddress(false);
      toast({
        title: "Address added",
        description: "Your address has been successfully added.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add address. Please try again.",
        variant: "destructive",
      });
    },
  });

  const deleteAddressMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest("DELETE", `/api/addresses/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/addresses"] });
      toast({
        title: "Address deleted",
        description: "The address has been successfully deleted.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete address. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onProfileSubmit = (data: ProfileFormData) => {
    updateProfileMutation.mutate(data);
  };

  const onAddressSubmit = (data: AddressFormData) => {
    addAddressMutation.mutate(data);
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'shipped':
        return 'bg-purple-100 text-purple-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Header */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-8">
          <div className="hero-gradient px-6 py-8 text-white">
            <div className="flex items-center space-x-6">
              <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center">
                {user?.profileImageUrl ? (
                  <img
                    src={user.profileImageUrl}
                    alt="Profile"
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <User className="h-10 w-10 text-white" />
                )}
              </div>
              <div>
                <h1 className="text-2xl font-bold">
                  {user?.firstName} {user?.lastName}
                </h1>
                <p className="text-blue-100">{user?.email}</p>
                <div className="flex items-center space-x-4 mt-2">
                  <p className="text-blue-200 text-sm">Member since 2024</p>
                  {user?.isVendor && (
                    <Badge className="bg-white/20 text-white">Vendor</Badge>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="profile" className="flex items-center space-x-2">
              <User className="h-4 w-4" />
              <span>Profile</span>
            </TabsTrigger>
            <TabsTrigger value="orders" className="flex items-center space-x-2">
              <Package className="h-4 w-4" />
              <span>Orders</span>
            </TabsTrigger>
            <TabsTrigger value="addresses" className="flex items-center space-x-2">
              <MapPin className="h-4 w-4" />
              <span>Addresses</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center space-x-2">
              <Settings className="h-4 w-4" />
              <span>Settings</span>
            </TabsTrigger>
          </TabsList>

          {/* Profile Information Tab */}
          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
              </CardHeader>
              <CardContent>
                <Form {...profileForm}>
                  <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={profileForm.control}
                        name="firstName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>First Name</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={profileForm.control}
                        name="lastName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Last Name</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={profileForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input type="email" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={profileForm.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Phone (Optional)</FormLabel>
                            <FormControl>
                              <Input type="tel" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div className="flex justify-end space-x-4">
                      <Button type="button" variant="outline" onClick={() => profileForm.reset()}>
                        Cancel
                      </Button>
                      <Button type="submit" disabled={updateProfileMutation.isPending}>
                        {updateProfileMutation.isPending ? "Saving..." : "Save Changes"}
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Orders Tab */}
          <TabsContent value="orders">
            <Card>
              <CardHeader>
                <CardTitle>Order History</CardTitle>
              </CardHeader>
              <CardContent>
                {ordersLoading ? (
                  <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="border border-gray-200 rounded-lg p-4">
                        <Skeleton className="h-4 w-32 mb-2" />
                        <Skeleton className="h-3 w-48 mb-2" />
                        <Skeleton className="h-6 w-24" />
                      </div>
                    ))}
                  </div>
                ) : orders && orders.length > 0 ? (
                  <div className="space-y-4">
                    {orders.map((order) => (
                      <div key={order.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h3 className="font-semibold text-gray-900">Order #{order.id}</h3>
                            <p className="text-sm text-gray-600">
                              {new Date(order.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="text-right">
                            <Badge className={getStatusColor(order.status)}>
                              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                            </Badge>
                            <p className="text-lg font-semibold text-gray-900 mt-1">
                              ${parseFloat(order.total).toFixed(2)}
                            </p>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          {order.orderItems?.map((item) => (
                            <div key={item.id} className="flex justify-between text-sm">
                              <span>{item.product?.name} x{item.quantity}</span>
                              <span>${parseFloat(item.price).toFixed(2)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No orders yet</h3>
                    <p className="text-gray-500">When you place orders, they'll appear here.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Addresses Tab */}
          <TabsContent value="addresses">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Shipping Addresses</CardTitle>
                <Button onClick={() => setIsAddingAddress(true)}>
                  Add Address
                </Button>
              </CardHeader>
              <CardContent>
                {isAddingAddress && (
                  <div className="border border-gray-200 rounded-lg p-4 mb-6">
                    <h3 className="font-semibold text-gray-900 mb-4">Add New Address</h3>
                    <Form {...addressForm}>
                      <form onSubmit={addressForm.handleSubmit(onAddressSubmit)} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={addressForm.control}
                            name="name"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Full Name</FormLabel>
                                <FormControl>
                                  <Input {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={addressForm.control}
                            name="street"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Street Address</FormLabel>
                                <FormControl>
                                  <Input {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={addressForm.control}
                            name="city"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>City</FormLabel>
                                <FormControl>
                                  <Input {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={addressForm.control}
                            name="state"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>State</FormLabel>
                                <FormControl>
                                  <Input {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={addressForm.control}
                            name="zipCode"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>ZIP Code</FormLabel>
                                <FormControl>
                                  <Input {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={addressForm.control}
                            name="country"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Country</FormLabel>
                                <FormControl>
                                  <Input {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        
                        <div className="flex justify-end space-x-4">
                          <Button 
                            type="button" 
                            variant="outline" 
                            onClick={() => {
                              setIsAddingAddress(false);
                              addressForm.reset();
                            }}
                          >
                            Cancel
                          </Button>
                          <Button type="submit" disabled={addAddressMutation.isPending}>
                            {addAddressMutation.isPending ? "Adding..." : "Add Address"}
                          </Button>
                        </div>
                      </form>
                    </Form>
                  </div>
                )}

                {addressesLoading ? (
                  <div className="space-y-4">
                    {[...Array(2)].map((_, i) => (
                      <Skeleton key={i} className="h-24 w-full" />
                    ))}
                  </div>
                ) : addresses && addresses.length > 0 ? (
                  <div className="space-y-4">
                    {addresses.map((address) => (
                      <div key={address.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="flex items-center space-x-2 mb-2">
                              <h3 className="font-semibold text-gray-900">{address.name}</h3>
                              {address.isDefault && (
                                <Badge variant="secondary">Default</Badge>
                              )}
                            </div>
                            <p className="text-gray-600">
                              {address.street}<br />
                              {address.city}, {address.state} {address.zipCode}<br />
                              {address.country}
                            </p>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => deleteAddressMutation.mutate(address.id)}
                            disabled={deleteAddressMutation.isPending}
                          >
                            Delete
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No addresses saved</h3>
                    <p className="text-gray-500">Add an address to make checkout faster.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>Account Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">Account Type</h3>
                  <p className="text-gray-600 mb-4">
                    You are currently a {user?.isVendor ? "vendor" : "customer"} account.
                  </p>
                  {!user?.isVendor && (
                    <Button variant="outline" asChild>
                      <a href="/vendor/register">Become a Vendor</a>
                    </Button>
                  )}
                </div>
                
                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">Account Security</h3>
                  <p className="text-gray-600 mb-4">
                    Your account is secured through Replit authentication.
                  </p>
                  <Button variant="outline" onClick={() => window.location.href = "/api/logout"}>
                    Sign Out
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
