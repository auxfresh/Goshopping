import { Link, useLocation } from "wouter";
import { Home, Package, ShoppingCart, User } from "lucide-react";
import { useCartStore } from "@/lib/cart-store";

export function Footer() {
  const [location] = useLocation();
  const { getItemCount } = useCartStore();
  const itemCount = getItemCount();

  const navItems = [
    {
      name: "Home",
      path: "/",
      icon: Home,
    },
    {
      name: "Products", 
      path: "/products",
      icon: Package,
    },
    {
      name: "Cart",
      path: "/cart",
      icon: ShoppingCart,
      badge: itemCount > 0 ? itemCount : undefined,
    },
    {
      name: "Account",
      path: "/profile",
      icon: User,
    },
  ];

  return (
    <footer className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
      <div className="grid grid-cols-4 h-16">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location === item.path;
          
          return (
            <Link key={item.name} href={item.path}>
              <div className={`flex flex-col items-center justify-center h-full relative transition-colors ${
                isActive 
                  ? 'text-blue-600 bg-blue-50' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}>
                <div className="relative">
                  <Icon className="h-5 w-5" />
                  {item.badge && (
                    <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center min-w-[20px]">
                      {item.badge > 99 ? '99+' : item.badge}
                    </div>
                  )}
                </div>
                <span className="text-xs mt-1 font-medium">{item.name}</span>
              </div>
            </Link>
          );
        })}
      </div>
    </footer>
  );
}