import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CartItemWithDetails } from './types';

interface CartStore {
  items: CartItemWithDetails[];
  isOpen: boolean;
  addItem: (item: CartItemWithDetails) => void;
  removeItem: (id: number) => void;
  updateQuantity: (id: number, quantity: number) => void;
  clearCart: () => void;
  toggleCart: () => void;
  setCartOpen: (open: boolean) => void;
  getTotal: () => number;
  getItemCount: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      
      addItem: (newItem) => {
        set((state) => {
          const existingItem = state.items.find(
            (item) => item.productId === newItem.productId
          );
          
          if (existingItem) {
            return {
              items: state.items.map((item) =>
                item.productId === newItem.productId
                  ? { ...item, quantity: item.quantity + newItem.quantity }
                  : item
              ),
            };
          }
          
          return {
            items: [...state.items, newItem],
          };
        });
      },
      
      removeItem: (id) => {
        set((state) => ({
          items: state.items.filter((item) => item.id !== id),
        }));
      },
      
      updateQuantity: (id, quantity) => {
        if (quantity <= 0) {
          get().removeItem(id);
          return;
        }
        
        set((state) => ({
          items: state.items.map((item) =>
            item.id === id ? { ...item, quantity } : item
          ),
        }));
      },
      
      clearCart: () => {
        set({ items: [] });
      },
      
      toggleCart: () => {
        set((state) => ({ isOpen: !state.isOpen }));
      },
      
      setCartOpen: (open) => {
        set({ isOpen: open });
      },
      
      getTotal: () => {
        const { items } = get();
        return items.reduce((total, item) => {
          const price = item.product.salePrice || item.product.price;
          return total + (parseFloat(price) * item.quantity);
        }, 0);
      },
      
      getItemCount: () => {
        const { items } = get();
        return items.reduce((count, item) => count + item.quantity, 0);
      },
    }),
    {
      name: 'cart-storage',
      partialize: (state) => ({ items: state.items }),
    }
  )
);
