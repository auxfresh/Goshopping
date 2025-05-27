export interface CartState {
  items: CartItemWithDetails[];
  isOpen: boolean;
  total: number;
  itemCount: number;
}

export interface ProductFilters {
  category?: number;
  vendor?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
}

export interface SearchState {
  query: string;
  filters: ProductFilters;
  results: ProductWithDetails[];
  isLoading: boolean;
}

export interface VendorStats {
  totalSales: number;
  totalOrders: number;
  totalProducts: number;
  monthlyRevenue: number;
}

import type { 
  User, 
  Product, 
  ProductWithDetails, 
  CartItemWithDetails, 
  OrderWithDetails,
  Category,
  Address 
} from "@shared/schema";

export type {
  User,
  Product,
  ProductWithDetails,
  CartItemWithDetails,
  OrderWithDetails,
  Category,
  Address
};
