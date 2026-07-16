"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, Package, ShoppingBag, CreditCard } from "lucide-react";

const navItems = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { name: "Users", href: "/admin/users", icon: Users },
  { name: "Products", href: "/admin/products", icon: Package },
  { name: "Orders", href: "/admin/orders", icon: ShoppingBag }, 
  { name: "Transactions", href: "/admin/transactions", icon: CreditCard },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed top-0 left-0 h-screen w-64 bg-white/95 backdrop-blur-xl border-r border-gray-200 hidden md:flex flex-col z-50">
      {/* Logo / Header */}
      <div className="p-6 border-b border-gray-200">
        <Link href="/admin" className="group flex items-center gap-2.5">
          <p className="text-base font-semibold tracking-tight text-gray-900 group-hover:opacity-80 transition-opacity">Admin Panel</p>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/admin" && pathname?.startsWith(item.href + "/"));
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`
                flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200
                ${
                  isActive
                    ? "bg-blue-100/60 text-blue-500"
                    : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                }
              `}
            >
              <Icon className={`h-4.5 w-4.5 ${isActive ? "text-blue-500" : "text-gray-400"}`} />
              <span>{item.name}</span>
              {isActive && (
                <span className="ml-auto h-2 w-2 rounded-full bg-blue-500" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-6 border-t border-gray-200">
        <p className="text-xs text-gray-400">&copy; 2026 GetGadget</p>
      </div>
    </aside>
  );
}