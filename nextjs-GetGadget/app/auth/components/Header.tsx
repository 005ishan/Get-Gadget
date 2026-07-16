"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useCartFav } from "@/context/CartFavContext";
import { usePathname } from "next/navigation";
import axios from "@/lib/api/axios";
import { createPortal } from "react-dom";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { Menu, X, ShoppingBag, Heart } from "lucide-react";

const NAV_LINKS = [
  { id: "home", label: "Home", href: "/auth/dashboard" },
  { id: "audio", label: "Audio", href: "/auth/category/audio" },
  { id: "accessories", label: "Accessories", href: "/auth/category/accessories" },
  { id: "charging", label: "Charging", href: "/auth/category/charging" },
  { id: "orders", label: "Orders", href: "/auth/orders" },
  { id: "settings", label: "Settings", href: "/auth/settings" },
];

interface ProductSuggestion {
  _id: string;
  name: string;
  imageUrl?: string;
  category: "audio" | "accessories" | "charging";
}

interface CartItem {
  quantity: number;
}

interface FavouriteItem {
  _id: string;
}

function LogoutModal({
  isOpen,
  onClose,
  onConfirm,
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!isOpen || !mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      ></div>
      <div className="relative bg-white border border-gray-200 rounded-xl p-6 w-80 shadow-lg z-10">
        <h3 className="text-lg font-semibold mb-3 text-gray-900">Confirm Logout</h3>
        <p className="text-sm text-gray-500 mb-6">Are you sure you want to logout?</p>
        <div className="flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 rounded-md bg-gray-100 text-gray-700 hover:bg-gray-200 transition cursor-pointer">Cancel</button>
          <button onClick={onConfirm} className="px-4 py-2 rounded-md bg-red-500 hover:bg-red-600 text-white transition cursor-pointer">Logout</button>
        </div>
      </div>
    </div>,
    document.body,
  );
}

export default function Header() {
  const { logout, user } = useAuth();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isLogoutOpen, setIsLogoutOpen] = useState(false);
  const router = useRouter();

  // Search
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<ProductSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Cart & Favourites badges
  const [cart, setCart] = useState<CartItem[]>([]);
  const [favourites, setFavourites] = useState<FavouriteItem[]>([]);
  const { cartVersion, favVersion } = useCartFav();

  // Fetch cart — re-fetches only when user or cartVersion changes
  useEffect(() => {
    if (!user?._id) return;

    const fetchCart = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`/api/users/${user._id}/cart`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCart(res.data);
      } catch (error) {
        console.error("Failed to fetch cart for header", error);
      }
    };

    fetchCart();
  }, [user?._id, cartVersion]);

  // Fetch favourites — re-fetches only when user or favVersion changes
  useEffect(() => {
    if (!user?._id) return;

    const fetchFavourites = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`/api/users/${user._id}/favourite`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setFavourites(res.data);
      } catch (error) {
        console.error("Failed to fetch favourites for header", error);
      }
    };

    fetchFavourites();
  }, [user?._id, favVersion]);

  const totalCartQuantity = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Debounced search
  useEffect(() => {
    if (!searchQuery) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const delayDebounce = setTimeout(async () => {
      try {
        const res = await axios.get(
          `/admin/products/search?query=${searchQuery}`,
        );
        setSuggestions(res.data.data || []);
        setShowSuggestions(true);
      } catch (error) {
        console.error("Search error:", error);
        setSuggestions([]);
      }
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [searchQuery]);

  // Click outside to close search suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const handleLogout = () => {
    try {
      logout();
      toast.success("Logged out successfully");
      router.push("/login");
    } catch {
      toast.error("Failed to logout");
    } finally {
      setIsLogoutOpen(false);
    }
  };

  const isActive = (href: string) => pathname === href;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white/95 backdrop-blur-xl">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/auth/dashboard" className="group flex items-center gap-1.5">
          <div className="flex items-center">
            <span className="text-xl font-extrabold tracking-tight text-gray-900">
              Get
            </span>
            <span className="text-xl font-light tracking-tight text-blue-500">
              Gadget
            </span>
          </div>
          <span className="ml-1 rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-blue-500 transition group-hover:bg-blue-100">
            Store
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.id}
              href={link.href}
              className={`relative rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                isActive(link.href)
                  ? "text-blue-500"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              {link.label}
              {isActive(link.href) && (
                <span className="absolute bottom-0 left-1/2 h-0.5 w-6 -translate-x-1/2 rounded-full bg-blue-500" />
              )}
            </Link>
          ))}
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-2 relative">
          {/* Search */}
          <div className="relative hidden md:block" ref={searchRef}>
            <div className="relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-4 py-2 text-sm bg-gray-100 text-gray-900 placeholder-gray-400 outline-none focus:ring-2 focus:ring-blue-500/30 focus:bg-white rounded-full w-48 lg:w-56 transition-all"
              />
            </div>

            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-xl mt-2 shadow-lg max-h-72 overflow-y-auto z-50">
                {suggestions.map((product) => {
                  const imageUrl = product.imageUrl
                    ? product.imageUrl.startsWith("http")
                      ? product.imageUrl
                      : `${process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") || "http://localhost:5050"}${product.imageUrl}`
                    : "/images/no-image.png";

                  return (
                    <Link
                      key={product._id}
                      href={`/auth/product/${product._id}`}
                      onClick={() => setShowSuggestions(false)}
                      className="flex items-center gap-3 p-3 hover:bg-gray-50 transition rounded-lg"
                    >
                      <img
                        src={imageUrl}
                        alt={product.name}
                        className="w-10 h-10 object-cover rounded-lg"
                      />
                      <div className="flex flex-col">
                        <p className="text-sm font-medium text-gray-900 truncate">{product.name}</p>
                        <p className="text-xs text-gray-400 capitalize">{product.category}</p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          {/* Favourites */}
          <Link
            href="/auth/favourites"
            className="relative flex h-9 w-9 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-red-50 hover:text-red-500"
          >
            <Heart className="h-4 w-4" />
            {favourites.length > 0 && (
              <span className="absolute -top-0.5 -right-0.5 text-[10px] bg-red-500 text-white rounded-full h-4 w-4 flex items-center justify-center font-bold">
                {favourites.length}
              </span>
            )}
          </Link>

          {/* Cart */}
          <Link
            href="/auth/Cart"
            className="relative flex h-9 w-9 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-cyan-50 hover:text-cyan-600"
          >
            <ShoppingBag className="h-4 w-4" />
            {totalCartQuantity > 0 && (
              <span className="absolute -top-0.5 -right-0.5 text-[10px] bg-blue-500 text-white rounded-full h-4 w-4 flex items-center justify-center font-bold">
                {totalCartQuantity}
              </span>
            )}
          </Link>

          {/* User Section */}
          <div className="hidden sm:flex items-center gap-3 pl-3 border-l border-gray-200 text-sm text-gray-500">
            <span className="max-w-[120px] truncate">{user?.email}</span>
            <button
              onClick={() => setIsLogoutOpen(true)}
              className="rounded-full bg-blue-500 px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-blue-500/25 transition-all hover:bg-blue-600 hover:shadow-blue-600/30 cursor-pointer"
            >
              Logout
            </button>
          </div>

          {/* Mobile Toggle */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-700 md:hidden"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </nav>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <div className="fixed right-0 top-0 h-full w-72 border-l border-gray-200 bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-8">
              <span className="text-lg font-bold text-gray-900">Menu</span>
              <button onClick={() => setMobileOpen(false)} className="text-gray-400 hover:text-gray-900">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex flex-col gap-1">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.id}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={`rounded-lg px-4 py-3 text-sm font-medium transition-colors ${
                    isActive(link.href)
                      ? "bg-blue-50 text-blue-500"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
            <div className="mt-8 flex flex-col gap-3 border-t border-gray-200 pt-8">
              <Link
                href="/auth/favourites"
                onClick={() => setMobileOpen(false)}
                className="rounded-full border border-gray-300 py-3 text-center text-sm font-semibold text-gray-700 transition-all hover:border-blue-300 hover:text-blue-500 hover:bg-blue-50/50"
              >
                Favourites
              </Link>
              <Link
                href="/auth/Cart"
                onClick={() => setMobileOpen(false)}
                className="rounded-full border border-gray-300 py-3 text-center text-sm font-semibold text-gray-700 transition-all hover:border-blue-300 hover:text-blue-500 hover:bg-blue-50/50"
              >
                Cart
              </Link>
              <button
                onClick={() => {
                  setMobileOpen(false);
                  setIsLogoutOpen(true);
                }}
                className="rounded-full bg-blue-500 py-3 text-center text-sm font-semibold text-white shadow-lg shadow-blue-500/25 transition-all hover:bg-blue-600 cursor-pointer"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
      <LogoutModal
        isOpen={isLogoutOpen}
        onClose={() => setIsLogoutOpen(false)}
        onConfirm={handleLogout}
      />
    </header>
  );
}
